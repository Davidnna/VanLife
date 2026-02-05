import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../api"
import { getUserProfile, createUserProfile } from "../api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const refreshUserProfile = async (userId) => {
        try {
            const profile = await getUserProfile(userId)
            setUserProfile(profile)
        } catch (err) {
            console.error("Error refreshing user profile:", err)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)
            if (user) {
                try {
                    let profile = await getUserProfile(user.uid)
                    if (!profile) {
                        profile = { userId: user.uid, userType: "user", email: user.email }
                        await createUserProfile(user.uid, profile)
                    }
                    setUserProfile(profile)
                } catch (err) {
                    console.error("Error loading user profile:", err)
                    setUserProfile({ userId: user.uid, userType: "user", email: user.email })
                }
            } else {
                setUserProfile(null)
            }
            setLoading(false)
        })

        return unsubscribe
    }, [])

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
