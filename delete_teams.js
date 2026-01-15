/* global process */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAasYCNXsU5crty70JX26xFm-GDX3BADeI",
    authDomain: "connectu-nitp.firebaseapp.com",
    projectId: "connectu-nitp",
    storageBucket: "connectu-nitp.appspot.com",
    messagingSenderId: "895731121952",
    appId: "1:895731121952:web:f6d00f1364675455abe145"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteTeams() {
    console.log("Fetching teams to delete...");
    const colRef = collection(db, "teams");
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
        console.log("No teams found to delete.");
        return;
    }

    console.log(`Found ${snapshot.size} teams. Deleting...`);

    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "teams", d.id)));
    await Promise.all(deletePromises);

    console.log("All teams deleted successfully.");
}

deleteTeams().then(() => process.exit(0)).catch(e => {
    console.error("Error deleting teams:", e);
    process.exit(1);
});
