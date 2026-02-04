import { Link, NavLink, useNavigate } from "react-router-dom"
import { logoutUser } from "../api"
import { useAuth } from "../context/AuthContext"
import imageUrl from "../assets/images/avatar-icon.png"

export default function Header() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    async function handleLogout() {
        try {
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
                <NavLink 
                    to="/host"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Host
                </NavLink>
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
                        <Link to="login" className="login-link">
                            <img
                                src={imageUrl}
                                className="login-icon"
                                title={currentUser.email}
                            />
                        </Link>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <Link to="login">Login</Link>
                )}
            </nav>
        </header>
    )
}