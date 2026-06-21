// auth-guard.js
// Se incluye en TODAS las páginas protegidas de Relectrónica (index.html,
// fallas.html, notas.html, etc). Si no hay sesión válida con perfil
// completo en Firestore, redirige a login.html. Si la hay, expone los
// datos del usuario en window.relectronicaUser y muestra una insignia
// con botón de cerrar sesión.

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

function hideOverlay() {
  const overlay = document.getElementById("rl-auth-overlay");
  if (overlay) overlay.style.display = "none";
}

function setOverlayMessage(msg) {
  const p = document.querySelector("#rl-auth-overlay p");
  if (p) p.textContent = msg;
}

function injectUserBadge(profile) {
  if (document.getElementById("rl-user-badge")) return;

  const wrap = document.createElement("div");
  wrap.id = "rl-user-badge";
  wrap.title = "Cerrar sesión";
  wrap.style.cssText = [
    "position:fixed", "top:10px", "right:10px", "z-index:99998",
    "display:flex", "align-items:center", "gap:7px",
    "background:#111c2c", "border:1px solid #22344d",
    "padding:5px 12px 5px 5px", "border-radius:30px",
    "box-shadow:0 2px 10px rgba(0,0,0,.5)", "cursor:pointer",
    "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif",
    "max-width:62vw"
  ].join(";");

  const initial = (profile.username || "U").trim().charAt(0).toUpperCase() || "U";
  const roleLabel = profile.role && profile.role !== "Ninguna" ? profile.role : "";

  wrap.innerHTML = `
    <span style="width:26px;height:26px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#7928ca,#a855f7);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;">${initial}</span>
    <span style="font-size:.76rem;color:#e2e8f0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${roleLabel ? roleLabel + " " : ""}${profile.username || ""}</span>
    <span style="font-size:.95rem;color:#ef4444;line-height:1;flex-shrink:0;">⏻</span>
  `;

  wrap.addEventListener("click", async () => {
    if (confirm("¿Cerrar sesión de Relectrónica?")) {
      try {
        await signOut(auth);
      } finally {
        localStorage.removeItem("relectronica_profile");
        window.location.href = "login.html";
      }
    }
  });

  document.body.appendChild(wrap);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    localStorage.removeItem("relectronica_profile");
    window.location.href = "login.html";
    return;
  }

  try {
    let profile = null;
    const cachedRaw = localStorage.getItem("relectronica_profile");
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        if (cached && cached.uid === user.uid && cached.username && cached.role) {
          profile = cached;
        }
      } catch (_) { /* cache corrupto, ignorar */ }
    }

    if (!profile) {
      setOverlayMessage("Cargando tu perfil...");
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        // Cuenta de Google autenticada pero registro de perfil incompleto.
        window.location.href = "login.html";
        return;
      }
      const data = snap.data();
      profile = {
        uid: user.uid,
        email: user.email || "",
        username: data.username || "Usuario",
        role: data.role || "Ninguna",
        photoURL: user.photoURL || ""
      };
      localStorage.setItem("relectronica_profile", JSON.stringify(profile));
    }

    window.relectronicaUser = profile;
    injectUserBadge(profile);
    hideOverlay();
    window.dispatchEvent(new CustomEvent("relectronica-auth-ready", { detail: profile }));
  } catch (err) {
    console.error("Error verificando la sesión de Relectrónica:", err);
    setOverlayMessage("Error verificando la sesión. Reintentando...");
    setTimeout(() => window.location.reload(), 2000);
  }
});

// Disponible globalmente por si alguna página quiere ofrecer su propio
// botón de "Cerrar sesión" en vez de (o además de) la insignia flotante.
window.relectronicaLogout = async function () {
  try {
    await signOut(auth);
  } finally {
    localStorage.removeItem("relectronica_profile");
    window.location.href = "login.html";
  }
};
