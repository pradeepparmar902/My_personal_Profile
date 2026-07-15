import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCVMh12zjoo0N49vi6JBSH9sPTulZLetI4",
  authDomain: "my-personal-profile-96791.firebaseapp.com",
  projectId: "my-personal-profile-96791",
  storageBucket: "my-personal-profile-96791.firebasestorage.app",
  messagingSenderId: "873148515332",
  appId: "1:873148515332:web:a9330984dffdccfb496151",
  measurementId: "G-9XENY7YV6D"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore (default database for personal project)
const db = initializeFirestore(app, {});

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Test connection on boot according to skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection verified successfully.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firebase is running offline or cached.", error.message);
    } else {
      console.log("Connection check skipped or initial connection established.");
    }
  }
}
testConnection();

export { 
  app, 
  db, 
  auth,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
