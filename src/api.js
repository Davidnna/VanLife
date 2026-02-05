import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, doc, getDocs, getDoc, query, where, updateDoc, setDoc } from "firebase/firestore/lite"
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

// Collections
const vansCollectionRef = collection(db, "vans")
const reviewsCollectionRef = collection(db, "reviews")
const contactsCollectionRef = collection(db, "contacts")
const userProfilesCollectionRef = collection(db, "userProfiles")
const messagesCollectionRef = collection(db, "messages")

export async function getVans() {
    const snapshot = await getDocs(vansCollectionRef)
    const vans = snapshot.docs.map(doc => doc.data())
    return vans
}

export async function getVan(id) {
    const snapshot = await getDocs(vansCollectionRef)
    const vans = snapshot.docs.map(doc => ({vanId: doc.id, ...doc.data()}))
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
    const vans = snapshot.docs.map(doc => ({vanId: doc.id, ...doc.data()}))
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
            hostId: user.uid,
            createdAt: new Date().toISOString()
        })
        return { id: newId, ...vanData, hostId: user.uid, createdAt: new Date().toISOString() }
    } catch (error) {
        throw { message: error.message, code: error.code }
    }
}

export async function addReview(vanId, reviewData) {
    const user = auth.currentUser
    if (!user) {
        throw { message: "You must be logged in to leave a review" }
    }

    try {
        await addDoc(reviewsCollectionRef, {
            vanId,
            userId: user.uid,
            userEmail: user.email,
            ...reviewData,
            createdAt: new Date().toISOString()
        })
    } catch (error) {
        if (error.code === "permission-denied") {
            throw { message: "Reviews collection needs to be set up in Firebase. Ask your admin." }
        }
        throw { message: error.message, code: error.code }
    }
}

export async function getReviewsForVan(vanId) {
    try {
        const q = query(reviewsCollectionRef, where("vanId", "==", vanId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.log("Could not fetch reviews:", error.message)
        return []
    }
}

export async function sendContactMessage(hostId, message) {
    const user = auth.currentUser
    if (!user) {
        throw { message: "You must be logged in to contact the host" }
    }

    try {
        await addDoc(messagesCollectionRef, {
            hostId,
            fromUserId: user.uid,
            fromEmail: user.email,
            message,
            read: false,
            createdAt: new Date().toISOString()
        })
    } catch (error) {
        if (error.code === "permission-denied") {
            throw { message: "Messages collection needs to be set up in Firebase. Ask your admin." }
        }
        throw { message: error.message, code: error.code }
    }
}

export async function getUserProfile(userId) {
    try {
        const docRef = doc(db, "userProfiles", userId)
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() }
        }
        return null
    } catch (error) {
        console.log("Could not fetch user profile:", error.message)
        return null
    }
}

export async function createUserProfile(userId, profileData) {
    try {
        const docRef = doc(db, "userProfiles", userId)
        await setDoc(docRef, { ...profileData, userId })
    } catch (error) {
        console.log("Could not create user profile:", error.message)
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const docRef = doc(db, "userProfiles", userId)
        await updateDoc(docRef, updates)
    } catch (error) {
        throw { message: error.message, code: error.code }
    }
}

export async function getHostMessages(hostId) {
    try {
        const q = query(messagesCollectionRef, where("hostId", "==", hostId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.log("Could not fetch messages:", error.message)
        if (error.code === "permission-denied") {
            console.warn("Messages collection needs read permission in Firestore rules")
        }
        return []
    }
}