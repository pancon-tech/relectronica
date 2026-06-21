// firebase-init.js
// Inicialización central de Firebase para toda la app Relectrónica.
// Todas las páginas (login.html, index.html, etc.) importan auth y db desde aquí
// para asegurarse de usar siempre la misma instancia.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9tZyOoB0ZIFEy1FR6dkA0zDOrd7-WXfs",
  authDomain: "relectronica-f824f.firebaseapp.com",
  projectId: "relectronica-f824f",
  storageBucket: "relectronica-f824f.firebasestorage.app",
  messagingSenderId: "866839633891",
  appId: "1:866839633891:web:b8a1326299975f2890cad6",
  measurementId: "G-P3M09JQW1J"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// Fuerza la pantalla de selección de cuenta de Google cada vez (evita
// que se cuele automáticamente con la última cuenta usada en el dispositivo).
googleProvider.setCustomParameters({ prompt: "select_account" });
