import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { updateUserProfile } from "../api"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Profile() {
    const { currentUser, userProfile, refreshUserProfile } = useAuth()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: userProfile?.name || "",
        phone: userProfile?.phone || "",
        bio: userProfile?.bio || "",
        instagram: userProfile?.instagram || "",
        twitter: userProfile?.twitter || "",
        website: userProfile?.website || ""
    })
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [success, setSuccess] = React.useState(false)

    if (!currentUser) {
        navigate("/login")
        return null
    }

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await updateUserProfile(currentUser.uid, formData)
            await refreshUserProfile(currentUser.uid)
            setSuccess(true)
            setIsEditing(false)
            setTimeout(() => setSuccess(false), 3000)
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
                        <p><strong>Username:</strong> {userProfile?.username || "Not set"}</p>
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <p><strong>Account Type:</strong> {userProfile?.userType === "host" ? "Host" : "Regular User"}</p>
                        <p><strong>Account Created:</strong> {new Date(currentUser.metadata?.creationTime).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Profile Settings</h2>
                    {success && <p className="success-message">Profile updated successfully!</p>}
                    {error?.message && <p className="error-message">{error.message}</p>}
                    
                    {!isEditing ? (
                        <div className="profile-details">
                            <div className="detail-item">
                                <strong>Name:</strong> {userProfile?.name || "Not set"}
                            </div>
                            <div className="detail-item">
                                <strong>Phone:</strong> {userProfile?.phone || "Not set"}
                            </div>
                            <div className="detail-item">
                                <strong>Bio:</strong> {userProfile?.bio || "Not set"}
                            </div>
                            {(userProfile?.instagram || userProfile?.twitter || userProfile?.website) && (
                                <div className="social-media">
                                    <strong>Social Media:</strong>
                                    {userProfile?.instagram && <p>Instagram: {userProfile.instagram}</p>}
                                    {userProfile?.twitter && <p>Twitter: {userProfile.twitter}</p>}
                                    {userProfile?.website && <p>Website: {userProfile.website}</p>}
                                </div>
                            )}
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="primary-button"
                            >
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="profile-edit-form">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Your phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Instagram</label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="@username"
                                />
                            </div>
                            <div className="form-group">
                                <label>Twitter</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="@username"
                                />
                            </div>
                            <div className="form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="primary-button"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="secondary-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
