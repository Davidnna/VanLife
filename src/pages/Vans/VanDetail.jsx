import React from "react"
import { Link, useParams, useLocation, Navigate } from "react-router-dom"
import { getVan, addReview, getReviewsForVan, sendContactMessage, getUserProfile } from "../../api"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../../components/LoadingSpinner"
import { BsStarFill } from "react-icons/bs"

export default function VanDetail() {
    const [van, setVan] = React.useState(null)
    const [hostProfile, setHostProfile] = React.useState(null)
    const [reviews, setReviews] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [vanNotFound, setVanNotFound] = React.useState(false)
    const [reviewForm, setReviewForm] = React.useState({ rating: 5, text: "" })
    const [reviewSubmitting, setReviewSubmitting] = React.useState(false)
    const [reviewError, setReviewError] = React.useState(null)
    const [contactForm, setContactForm] = React.useState("")
    const [contactSubmitting, setContactSubmitting] = React.useState(false)
    const [contactError, setContactError] = React.useState(null)
    const [contactSuccess, setContactSuccess] = React.useState(false)
    
    const { id } = useParams()
    const location = useLocation()
    const { currentUser, userProfile } = useAuth()

    React.useEffect(() => {
        async function loadVan() {
            setLoading(true)
            try {
                const data = await getVan(id)
                if (!data) {
                    setVanNotFound(true)
                } else {
                    setVan(data)
                    const reviewsData = await getReviewsForVan(data.vanId)
                    reviewsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                    setReviews(reviewsData)
                    
                    // Fetch host profile
                    const hostData = await getUserProfile(data.hostId)
                    setHostProfile(hostData)
                }
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadVan()
    }, [id])

    async function handleReviewSubmit(e) {
        e.preventDefault()
        if (!currentUser) {
            setReviewError({ message: "You must be logged in to leave a review" })
            return
        }
        if (!reviewForm.text.trim()) {
            setReviewError({ message: "Review text is required" })
            return
        }
        setReviewSubmitting(true)
        setReviewError(null)
        try {
            await addReview({ 
                vanId: van.vanId, 
                vanID: van.id, 
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: userProfile.name,
                userUsername: userProfile.username,
                vanName: van.name, 
                rating: reviewForm.rating, 
                text: reviewForm.text 
            })
            const updatedReviews = await getReviewsForVan(van.vanId)
            setReviews(updatedReviews)
            setReviewForm({ rating: 5, text: "" })
        } catch (err) {
            setReviewError(err)
        } finally {
            setReviewSubmitting(false)
        }
    }

    async function handleContactSubmit(e) {
        e.preventDefault()
        if (!currentUser) {
            setContactError({ message: "You must be logged in to contact the host" })
            return
        }
        if (!contactForm.trim()) {
            setContactError({ message: "Message is required" })
            return
        }
        setContactSubmitting(true)
        setContactError(null)
        try {
            await sendContactMessage({ 
                hostId: van.hostId, 
                userName: userProfile.name, 
                userUsername: userProfile.username,
                message: contactForm, 
                vanName: van.name, 
                vanID: van.id, 
                vanId: van.vanId 
            })
            setContactSuccess(true)
            setContactForm("")
            setTimeout(() => setContactSuccess(false), 3000)
        } catch (err) {
            setContactError(err)
        } finally {
            setContactSubmitting(false)
        }
    }

    if (vanNotFound) {
        return <Navigate to="/not-found" />
    }

    if (loading) {
        return <LoadingSpinner />
    }
    
    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    const search = location.state?.search || "";
    const type = location.state?.type || "all";
    
    return (
        <div className="van-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to {type} vans</span></Link>
            
            {van && (
                <div className="van-detail">
                    <img src={van.imageUrl} alt={van.name} />
                    <i className={`van-type ${van.type} selected`}>
                        {van.type}
                    </i>
                    <h2>{van.name}</h2>
                    <p className="van-price"><span>${van.price}</span>/day</p>
                    <p>{van.description}</p>
                    
                    {hostProfile && (
                        <div className="host-profile-section">
                            <h3>About the Host</h3>
                            <div className="host-info">
                                <Link to={`/user/${van.hostUsername}`} className="host-link">
                                    <p className="host-name">{hostProfile.name}</p>
                                </Link>
                                {hostProfile.bio && <p className="host-bio">{hostProfile.bio}</p>}
                            </div>
                        </div>
                    )}
                    
                    {(userProfile || userProfile?.userType !== "host") && (
                        <div className="contact-host-section">
                            <h3>Contact the Host</h3>
                            {contactSuccess && <p className="success-message">Message sent successfully!</p>}
                            {contactError?.message && <p className="error-message">{contactError.message}</p>}
                            <form onSubmit={handleContactSubmit} className="contact-form">
                                <textarea
                                    value={contactForm}
                                    onChange={(e) => setContactForm(e.target.value)}
                                    placeholder="Send a message to the host..."
                                    rows="4"
                                />
                                <button type="submit" disabled={contactSubmitting} className="link-button">
                                    {contactSubmitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    )}
                    
                    <div className="reviews-section">
                        <h3>Guest Reviews</h3>
                        
                        {currentUser && userProfile?.userType === "user" && (
                            <div className="add-review">
                                <h4>Leave a Review</h4>
                                {reviewError?.message && <p className="error-message">{reviewError.message}</p>}
                                <form onSubmit={handleReviewSubmit} className="review-form">
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <select 
                                            value={reviewForm.rating} 
                                            onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                                        >
                                            <option value={5}>5 Stars</option>
                                            <option value={4}>4 Stars</option>
                                            <option value={3}>3 Stars</option>
                                            <option value={2}>2 Stars</option>
                                            <option value={1}>1 Star</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Your Review</label>
                                        <textarea
                                            value={reviewForm.text}
                                            onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                                            placeholder="Share your experience..."
                                            rows="4"
                                        />
                                    </div>
                                    <button type="submit" disabled={reviewSubmitting} className="link-button">
                                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-header">
                                            <div className="stars">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <BsStarFill key={i} className="star-icon" />
                                                ))}
                                            </div>
                                            <Link to={`/user/${review.userUsername}`} className="host-link">
                                                <p className="reviewer-name">{review.userName}</p>
                                            </Link>
                                        </div>
                                        <p className="review-text">{review.text}</p>
                                        <p className="review-date">
                                            {review.createdAt.toDate().toLocaleDateString('en-US', { dateStyle: 'long' })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-reviews">No reviews yet.{userProfile && userProfile.userType === "user" ? " Be the first to review!" : ""}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}