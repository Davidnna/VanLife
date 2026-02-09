import React from "react"
import { useNavigate } from "react-router-dom"
import { addVan } from "../../api"
import { useAuth } from "../../context/AuthContext"

export default function AddVan() {
    const [formData, setFormData] = React.useState({ 
        name: "", 
        price: "", 
        description: "", 
        imageUrl: "", 
        type: "simple" 
    })
    const [status, setStatus] = React.useState("idle")
    const [error, setError] = React.useState(null)
    const [validationErrors, setValidationErrors] = React.useState({})

    const navigate = useNavigate()

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    function handleNumberInput(e) {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault()
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = "Name is required"
        }
        if (!formData.price || Number(formData.price) <= 0) {
            errors.price = "Valid price is required"
        }
        if (!formData.description.trim()) {
            errors.description = "Description is required"
        }
        if (!formData.imageUrl.trim()) {
            errors.imageUrl = "Image URL is required"
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        setStatus("submitting")
        try {
            await addVan({
                name: formData.name.trim(),
                price: Number(formData.price),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim(),
                type: formData.type
            })
            navigate("/host/vans")
        } catch (err) {
            setError(err)
        } finally {
            setStatus("idle")
        }
    }

    return (
        <section className="add-van-container">
            <h1>Add a new van</h1>
            {error?.message && <h3 className="login-error">{error.message}</h3>}

            <form onSubmit={handleSubmit} className="van-form">
                <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Van name"
                    />
                    {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price per day (USD) *</label>
                    <input
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        onKeyDown={handleNumberInput}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g., 60"
                    />
                    {validationErrors.price && <span className="error-text">{validationErrors.price}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="type">Type *</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange}>
                        <option value="simple">Simple</option>
                        <option value="luxury">Luxury</option>
                        <option value="rugged">Rugged</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL *</label>
                    <input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    {validationErrors.imageUrl && <span className="error-text">{validationErrors.imageUrl}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell guests about your van..."
                        rows="5"
                    />
                    {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
                </div>

                <button type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Adding..." : "Add Van"}
                </button>
            </form>
        </section>
    )
}