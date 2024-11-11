import {
    addDoc, collection, deleteDoc, doc, getDocs, setDoc, query, where
} from "firebase/firestore";
import {auth, database} from "./firebaseSetup";

export async function writeToDB(data, collectionName) {
    console.log( database);
    try {
        await addDoc(collection( database, collectionName), data);
    } catch (err) {
        console.log("writ to db", err);
    }
}
/*delete a document from the database*/
export async function deleteFromDB(id, collectionName) {
    try {
        await deleteDoc(doc( database, collectionName, id));
    } catch (err) {
        console.log("delete from", err);
    }
}
export async function getAllDocs(collectionName) {
    try {
        const querySnapshot = await getDocs(collection( database, collectionName));
        let newArray = [];
        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnapshot) => {
                newArray.push(docSnapshot.data());
            });
            console.log("array from readDocs", newArray);
        }
        return newArray;
    } catch (err) {
        console.log(err);
    }
}
export async function getDocsByQuery(collectionName, field, operator, value) {
    try {
        const q = query(collection(database, collectionName), where(field, operator, value));
        const querySnapshot = await getDocs(q);
        let newArray = [];
        querySnapshot.forEach((docSnapshot) => {
            newArray.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        return newArray;
    } catch (err) {
        console.log("get docs by query", err);
    }
}
export async function updateDocInDB(id, data, collectionName) {
    try {
        const docRef = doc(database, collectionName, id);
        await setDoc(docRef, data, { merge: true });
    } catch (err) {
        console.log("update doc in db", err);
    }
}
