import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyATZrjho4ZMTkBk2ME9Ccm2Gh3wmdZtvuQ",
  authDomain: "algo-trading-fiuba.firebaseapp.com",
  projectId: "algo-trading-fiuba",
  storageBucket: "algo-trading-fiuba.appspot.com",
  messagingSenderId: "94154853416",
  appId: "1:94154853416:web:2c777c0a53423691bdb91d",
  measurementId: "G-BZL1XB13DL",
};

export default firebaseConfig;

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const createUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered successfully!");
  } catch (error) {
    console.error("Error registering user:", error.message);
  }
};

export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully!");
  } catch (error) {
    console.error("Error logging in:", error.message);
  }
};
