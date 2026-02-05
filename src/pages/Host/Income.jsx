import React from "react"
import { getHostVans } from "../../api"
import imageUrl from "../../assets/images/income-graph.png"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Income() {
    const [totalIncome, setTotalIncome] = React.useState(0)
    const [vans, setVans] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function loadIncome() {
            setLoading(true)
            try {
                const hostVans = await getHostVans()
                setVans(hostVans)
                const income = hostVans.reduce((sum, van) => sum + (van.price * 30), 0)
                setTotalIncome(income)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadIncome()
    }, [])

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    const transactionsData = vans.map((van, index) => ({
        amount: van.price * 30,
        date: `Month ${index + 1}`,
        id: van.id,
        vanName: van.name
    }))
    
    return (
        <section className="host-income">
            <h1>Income</h1>
            <p>
                Last <span>30 days</span>
            </p>
            <h2>${totalIncome.toLocaleString()}</h2>
            <img
                className="graph"
                src={imageUrl}
                alt="Income graph"
            />
            <div className="info-header">
                <h3>Your transactions ({transactionsData.length})</h3>
                <p>
                    Last <span>30 days</span>
                </p>
            </div>
            <div className="transactions">
                {transactionsData.length > 0 ? (
                    transactionsData.map((item) => (
                        <div key={item.id} className="transaction">
                            <div className="transaction-info">
                                <h3>${item.amount}</h3>
                                <p>{item.vanName}</p>
                            </div>
                            <p className="transaction-date">{item.date}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-transactions">No transactions yet</p>
                )}
            </div>
        </section>
    )
}