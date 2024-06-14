import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeHU_yismJQ_1gXXTRcP7_64Z8Uzl4n84",
  authDomain: "hardware-swap-exam-project.firebaseapp.com",
  databaseURL:
    "https://hardware-swap-exam-project-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hardware-swap-exam-project",
  storageBucket: "hardware-swap-exam-project.appspot.com",
  messagingSenderId: "326033678530",
  appId: "1:326033678530:web:0f3a10f5ce0b0148025b5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Sign-in function
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    throw new Error(`Error ${errorCode}: ${errorMessage}`);
  }
};

export { app, auth, database, signIn };
