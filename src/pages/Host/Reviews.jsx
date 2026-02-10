import React from "react"
import { Link } from "react-router-dom"
import { getHostVans, getReviewsForVan } from "../../api"
import { BsStarFill } from "react-icons/bs"
import imageUrl from "../../assets/images/reviews-graph.png"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Reviews() {
    const [allReviews, setAllReviews] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function loadReviews() {
            setLoading(true)
            try {
                const vans = await getHostVans()
                let reviews = []
                for (const van of vans) {
                    const vanReviews = await getReviewsForVan(van.vanId)
                    reviews = [...reviews, ...vanReviews]
                }
                reviews.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                setAllReviews(reviews)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadReviews()
    }, [])

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    const averageRating = allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0
    
    return (
        <section className="host-reviews">
            <div className="top-text">
                <h2>Your reviews</h2>
                <p>
                    Last <span>30 days</span>
                </p>
            </div>
            <img
                className="graph"
                src={imageUrl}
                alt="Review graph"
            />
            <div className="reviews-stats">
                <div className="stat">
                    <p className="stat-label">Average Rating</p>
                    <p className="stat-value">{averageRating} ⭐</p>
                </div>
                <div className="stat">
                    <p className="stat-label">Total Reviews</p>
                    <p className="stat-value">{allReviews.length}</p>
                </div>
            </div>
            <h3>Reviews ({allReviews.length})</h3>
            {allReviews.length > 0 ? (
                allReviews.map((review) => (
                    <div key={review.id}>
                        <div className="review">
                            <div className="stars-container">
                                {[...Array(review.rating)].map((_, i) => (
                                    <BsStarFill className="review-star" key={i} />
                                ))}
                                <Link to={`/vans/${review.vanID}`}>
                                    <p className="van-name">For: {review.vanName}</p>
                                </Link>
                            </div>
                            <div className="info">
                                <Link to={`/user/${review.userUsername}`}>
                                    <p className="name">{review.userName}</p>
                                </Link>
                                <p className="date">{review.createdAt.toDate().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                            </div>
                            <p className="review-text">{review.text}</p>
                        </div>
                        <hr />
                    </div>
                ))
            ) : (
                <p className="no-reviews-message">No reviews yet. Keep up the great work!</p>
            )}
        </section>
    )
}