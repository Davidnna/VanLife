import React from "react"
import { Link } from "react-router-dom"
import { getHostVans } from "../../api"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function HostVans() {
    const [vans, setVans] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function loadVans() {
            setLoading(true)
            try {
                const data = await getHostVans()
                data.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate())
                setVans(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadVans()
    }, [])

    const hostVansEls = vans.map(van => (
        <Link
            to={van.id}
            key={van.id}
            className="host-van-link-wrapper"
        >
            <div className="host-van-single" key={van.id}>
                <img src={van.imageUrl} alt={`Photo of ${van.name}`} />
                <div className="host-van-info">
                    <h3>{van.name}</h3>
                    <p>${van.price}/day</p>
                </div>
            </div>
        </Link>
    ))

    if (loading) {
        return <LoadingSpinner />
    }
    
    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    return (
        <section>
            <h1 className="host-vans-title">Your listed vans</h1>
            <Link to="new" className="link-button">+ Add a new van</Link>
            <div className="host-vans-list">
                {
                    vans.length > 0 ? (
                        <section>
                            {hostVansEls}
                        </section>
                    ) : (
                        <div className="no-vans-container">
                            <h2>You haven't listed any vans yet</h2>
                            <p>Start by adding your first van to begin earning!</p>
                            <Link to="new" className="primary-button">Add Your First Van</Link>
                        </div>
                    )
                }
            </div>
        </section>
    )
}