import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getHostMessages } from "../../api"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Messages() {
    const { currentUser, userProfile } = useAuth()
    const [messages, setMessages] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        if (!currentUser || userProfile?.userType !== "host") {
            return
        }

        async function loadMessages() {
            setLoading(true)
            try {
                const data = await getHostMessages(currentUser.uid)
                
                data.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                setMessages(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        loadMessages()
    }, [currentUser, userProfile])

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <h1 aria-live="assertive">There was an error: {error.message}</h1>
    }

    return (
        <section className="messages-container">
            <h1>Messages from Customers</h1>
            <p className="messages-subtitle">Total messages: {messages.length}</p>

            <div className="messages-list">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <div key={message.id} className="message-item">
                            <div className="message-header">
                                <div className="message-sender-info">
                                    <Link to={`/user/${message.userUsername}`}>{message.userName}</Link>
                                    <Link to={`/vans/${message.vanID}`}>
                                        <p className="message-name">For: {message.vanName}</p>
                                    </Link>
                                </div>
                                <p className="message-date">
                                    {message.createdAt.toDate().toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            <div className="message-body">
                                <p>{message.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-messages">
                        <h2>No messages yet</h2>
                        <p>When customers contact you about your vans, their messages will appear here.</p>
                    </div>
                )}
            </div>
        </section>
    )
}