import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCoNSt4XX4RmQoeVfKphjdl1ioBhlyj9pw",
  authDomain: "easydine-7d8b7.firebaseapp.com",
  projectId: "easydine-7d8b7",
  storageBucket: "easydine-7d8b7.firebasestorage.app",
  messagingSenderId: "133003843831",
  appId: "1:133003843831:web:7e238044cb01cf3f279bf2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function createRecaptchaVerifier(containerId: string) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
  });
  return verifier;
}
