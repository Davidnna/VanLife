import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { updateUserProfile } from "../api"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Profile() {
    const { currentUser, userProfile, refreshUserProfile } = useAuth()
    const navigate = useNavigate()
    const [userType, setUserType] = React.useState(userProfile?.userType || "user")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [success, setSuccess] = React.useState(false)

    if (!currentUser) {
        navigate("/login")
        return null
    }

    async function handleUserTypeChange(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await updateUserProfile(currentUser.uid, { userType })
            await refreshUserProfile(currentUser.uid)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
            setTimeout(() => {
                navigate(userType === "host" ? "/host" : "/vans")
            }, 1500)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            
            <div className="profile-card">
                <div className="profile-section">
                    <h2>Account Information</h2>
                    <div className="profile-info">
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <p><strong>User ID:</strong> {currentUser.uid}</p>
                        <p><strong>Account Created:</strong> {new Date(currentUser.metadata?.creationTime).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Type</h2>
                    {success && <p className="success-message">Account type updated successfully!</p>}
                    {error?.message && <p className="error-message">{error.message}</p>}
                    
                    <form onSubmit={handleUserTypeChange} className="user-type-form">
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="user"
                                    checked={userType === "user"}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                <span>Regular User</span>
                                <small>Browse and rent vans</small>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="host"
                                    checked={userType === "host"}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                <span>Host</span>
                                <small>List and manage your vans</small>
                            </label>
                        </div>
                        <button type="submit" disabled={loading || userType === userProfile?.userType} className="primary-button">
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
