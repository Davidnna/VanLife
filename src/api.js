import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, doc, getDocs, getDoc, query, where, documentId } from "firebase/firestore/lite"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyC_cEplLBMhYRt8iBACkJ1JTErKXKpy_us",
    authDomain: "vanlife-14efd.firebaseapp.com",
    projectId: "vanlife-14efd",
    storageBucket: "vanlife-14efd.firebasestorage.app",
    messagingSenderId: "997195417946",
    appId: "1:997195417946:web:b954d35e5c9105d9818b63",
    measurementId: "G-MPGQWB9284"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
export const auth = getAuth(app)

// Refactoring the fetching functions below
const vansCollectionRef = collection(db, "vans")

export async function getVans() {
    const snapshot = await getDocs(vansCollectionRef)
    const vans = snapshot.docs.map(doc => doc.data())
    return vans
}

export async function getVan(id) {
    const snapshot = await getDocs(vansCollectionRef)
    const vans = snapshot.docs.map(doc => doc.data())
    const van = vans.find(van => van.id === id)
    return van
}

export async function getHostVans() {
    const user = auth.currentUser
    if (!user) {
        throw { message: "User not authenticated" }
    }
    const q = query(vansCollectionRef, where("hostId", "==", user.uid))
    const snapshot = await getDocs(q)
    const vans = snapshot.docs.map(doc => doc.data())
    return vans
}

export async function getHostVan(id) {
    const user = auth.currentUser
    if (!user) {
        throw { message: "User not authenticated" }
    }
    const q = query(
        vansCollectionRef,
        where("hostId", "==", user.uid)
    )
    const snapshot = await getDocs(q)
    const vans = snapshot.docs.map(doc => doc.data())
    return vans.find(van => van.id === id)
}

export async function loginUser(creds) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, creds.email, creds.password)
        return userCredential.user
    } catch (error) {
        throw {
            message: error.message,
            code: error.code
        }
    }
}

export async function registerUser(creds) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, creds.email, creds.password)
        return userCredential.user
    } catch (error) {
        throw {
            message: error.message,
            code: error.code
        }
    }
}

export async function logoutUser() {
    try {
        await signOut(auth)
    } catch (error) {
        throw {
            message: error.message,
            code: error.code
        }
    }
}

export async function addVan(vanData) {
    const user = auth.currentUser
    if (!user) {
        throw { message: "User not authenticated" }
    }

    try {
        const snapshot = await getDocs(vansCollectionRef)
        let maxId = 0
        snapshot.docs.forEach(doc => {
            const docId = parseInt(doc.data().id)
            if (!isNaN(docId) && docId > maxId) {
                maxId = docId
            }
        })

        const newId = (maxId + 1).toString()

        const docRef = await addDoc(vansCollectionRef, {
            id: newId,
            ...vanData,
            hostId: user.uid
        })
        return { id: newId, ...vanData, hostId: user.uid }
    } catch (error) {
        throw { message: error.message, code: error.code }
    }
}