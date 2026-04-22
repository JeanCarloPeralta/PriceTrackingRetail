import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvT2ewzZSGkvMZUZkqpRlmKTltS39esps",
  authDomain: "pulperia-m-9137d.firebaseapp.com",
  projectId: "pulperia-m-9137d",
  storageBucket: "pulperia-m-9137d.appspot.com",
  messagingSenderId: "836194191204",
  appId: "1:836194191204:web:e9b8bc031c4dc99a349c71",
  measurementId: "G-02Z525FNNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
