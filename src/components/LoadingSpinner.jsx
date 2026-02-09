export default function LoadingSpinner() {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p aria-live="polite">Loading...</p>
        </div>
    )
}