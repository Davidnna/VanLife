import React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { getVans } from "../../api"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Vans() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [vans, setVans] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    const typeFilter = searchParams.get("type")

    React.useEffect(() => {
        async function loadVans() {
            setLoading(true)
            try {
                const data = await getVans()
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

    const types = ["simple", "luxury", "rugged"]

    const filterButtons = types.map(type => (
        <button 
            type={type}
            onClick={() => handleFilterChange("type", type)}
            className={
                `van-type ${type} 
                ${typeFilter === type ? "selected" : ""}`
            }
        >{type.charAt(0).toUpperCase() + type.slice(1)}</button>
    ))

    const displayedVans = typeFilter
        ? vans.filter(van => van.type === typeFilter)
        : vans

    const vanElements = displayedVans.map(van => (
        <div key={van.id} className="van-tile">
            <Link 
                to={van.id} 
                state={{
                    search: `?${searchParams.toString()}`,
                    type: typeFilter
                }}
            >
                <img src={van.imageUrl} />
                <div className="van-info">
                    <h3>{van.name}</h3>
                    <p>${van.price}<span>/day</span></p>
                </div>
                <i className={`van-type ${van.type} selected`}>{van.type}</i>
            </Link>
        </div>
    ))

    function handleFilterChange(key, value) {
        setSearchParams(prevParams => {
            if (value === null) {
                prevParams.delete(key)
            } else {
                prevParams.set(key, value)
            }
            return prevParams
        })
    }

    if (loading) {
        return <LoadingSpinner />
    }
    
    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    return (
        <div className="van-list-container">
            <h1>Explore our van options</h1>
            <div className="van-list-filter-buttons">
                {filterButtons}

                {typeFilter ? (
                    <button
                        onClick={() => handleFilterChange("type", null)}
                        className="van-type clear-filters"
                    >Clear filter</button>
                ) : null}
            </div>
            <div className="van-list">
                {vanElements.length > 0 ? (
                    vanElements
                ) : (
                    <div className="no-vans-container">
                        <h2>No vans available</h2>
                        {typeFilter ? 
                            <p>There are currently no vans matching your filters. Please try a different filter or check back later.</p>
                            : <p>There are currently no vans available at the time. Please check back later.</p>
                    }
                    </div>
                )}
            </div>
        </div>
    )
}