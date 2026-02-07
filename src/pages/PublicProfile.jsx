import React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getUserProfile, getVans, getUserId } from "../api"
import LoadingSpinner from "../components/LoadingSpinner"

export default function PublicProfile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const [userProfile, setUserProfile] = React.useState(null)
    const [hostVans, setHostVans] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            try {
                const userId = await getUserId(username)
                const profile = await getUserProfile(userId)
                if (!profile) {
                    setError({ message: "User not found" })
                } else {
                    setUserProfile(profile)
                    
                    if (profile.userType === "host") {
                        const allVans = await getVans()
                        const userVans = allVans.filter(van => van.hostId === userId)
                        setHostVans(userVans)
                    }
                }
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [username])

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        setTimeout(() => {
            navigate("/not-found", { replace: true })
        }, 1)
        return (
            <div className="public-profile-container">
                <h1 aria-live="assertive">User not found</h1>
                <p>{error.message}</p>
                <Link to="/vans">Back to vans</Link>
            </div>
        )
    }

    return (
        <div className="public-profile-container">
            <div className="profile-header">
                <h1>{userProfile?.name || "User"}</h1>
                <p className="user-type-badge">
                    {userProfile?.userType === "host" ? "🏠 Host" : "👤 Member"}
                </p>
            </div>

            <div className="profile-card">
                {userProfile?.bio && (
                    <div className="profile-section">
                        <h3>About</h3>
                        <p>{userProfile.bio}</p>
                    </div>
                )}

                <div className="profile-section">
                    <h3>Contact Information</h3>
                    {userProfile?.phone && <p><strong>Phone:</strong> {userProfile.phone}</p>}
                    <div className="social-links">
                        {userProfile?.website && (
                            <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                                🌐 Website
                            </a>
                        )}
                        {userProfile?.instagram && (
                            <a href={`https://instagram.com/${userProfile.instagram}`} target="_blank" rel="noopener noreferrer">
                                📷 Instagram
                            </a>
                        )}
                        {userProfile?.twitter && (
                            <a href={`https://twitter.com/${userProfile.twitter}`} target="_blank" rel="noopener noreferrer">
                                𝕏 Twitter
                            </a>
                        )}
                    </div>
                </div>

                {userProfile?.userType === "host" && hostVans.length > 0 && (
                    <div className="profile-section">
                        <h3>Vans</h3>
                        <div className="vans-grid">
                            {hostVans.map(van => (
                                <Link 
                                    key={van.id} 
                                    to={`/vans/${van.id}`}
                                    className="van-card-link"
                                >
                                    <img src={van.imageUrl} alt={van.name} />
                                    <h4>{van.name}</h4>
                                    <p className="van-type-badge">{van.type}</p>
                                    <p className="van-price">${van.price}/day</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
