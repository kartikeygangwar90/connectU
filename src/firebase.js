import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAasYCNXsU5crty70JX26xFm-GDX3BADeI",
  authDomain: "connectu-nitp.firebaseapp.com",
  projectId: "connectu-nitp",
  storageBucket: "connectu-nitp.appspot.com",
  messagingSenderId: "895731121952",
  appId: "1:895731121952:web:f6d00f1364675455abe145"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export auth
export const auth = getAuth(app);