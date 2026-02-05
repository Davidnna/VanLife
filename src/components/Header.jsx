import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { logoutUser } from "../api"
import { useAuth } from "../context/AuthContext"
import imageUrl from "../assets/images/avatar-icon.png"

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser, userProfile } = useAuth()

    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    const isHost = userProfile?.userType === "host"

    async function handleLogout() {
        try {
            if (location.pathname === "/profile" || isHost) {
                navigate("/")
            }
            await logoutUser()
            navigate("/")
        } catch (error) {
            console.error("Error logging out:", error)
        }
    }

    return (
        <header>
            <Link className="site-logo" to="/">#VanLife</Link>
            <nav>
                {isHost && (
                    <NavLink 
                        to="/host"
                        style={({ isActive }) => isActive ? activeStyles : null}
                    >
                        Host
                    </NavLink>
                )}
                <NavLink 
                    to="/about"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    About
                </NavLink>
                <NavLink 
                    to="/vans"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Vans
                </NavLink>
                {currentUser ? (
                    <>
                        <Link to="/profile" className="profile-link">
                            <img
                                src={imageUrl}
                                className="login-icon"
                                title={currentUser.email}
                            />
                        </Link>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <NavLink to="/login" 
                        className="login-button" 
                        state={{
                            from: location.pathname
                        }} 
                    >
                        Login
                    </NavLink>
                )}
            </nav>
        </header>
    )
}