import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AuthRequired() {
    const { currentUser, userProfile  } = useAuth()
    const location = useLocation()

    const isHost = userProfile?.userType === "host"

    if (currentUser) {
        return <Outlet />
    }
    
    if (!isHost) {
        return (
            <Navigate 
                to="/login" 
                state={{
                    message: currentUser ? "You must be a host to access this page" : "You must log in first",
                    from: location.pathname
                }} 
                replace
            />
        )
    }
    return <Outlet />
}