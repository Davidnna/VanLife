import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../api"

export default function SignUp() {
    const [signUpFormData, setSignUpFormData] = React.useState({ email: "", password: "", confirmPassword: "" })
    const [status, setStatus] = React.useState("idle")
    const [error, setError] = React.useState(null)

    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        // Validate passwords match
        if (signUpFormData.password !== signUpFormData.confirmPassword) {
            setError({ message: "Passwords do not match" })
            return
        }

        // Validate password length
        if (signUpFormData.password.length < 6) {
            setError({ message: "Password must be at least 6 characters" })
            return
        }

        setStatus("submitting")
        registerUser({
            email: signUpFormData.email,
            password: signUpFormData.password
        })
            .then(() => {
                navigate("/host", { replace: true })
            })
            .catch(err => {
                setError(err)
            })
            .finally(() => {
                setStatus("idle")
            })
    }

    function handleChange(e) {
        const { name, value } = e.target
        setSignUpFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="login-container">
            <h1>Create an account</h1>
            {
                error?.message &&
                    <h3 className="login-error">{error.message}</h3>
            }

            <form onSubmit={handleSubmit} className="login-form">
                <input
                    name="email"
                    onChange={handleChange}
                    type="email"
                    placeholder="Email address"
                    value={signUpFormData.email}
                    required
                />
                <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={signUpFormData.password}
                    required
                />
                <input
                    name="confirmPassword"
                    onChange={handleChange}
                    type="password"
                    placeholder="Confirm password"
                    value={signUpFormData.confirmPassword}
                    required
                />
                <button type="submit"
                    disabled={status === "submitting"}
                >
                    {status === "submitting"
                        ? "Creating account..."
                        : "Sign up"
                    }
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
    )
}
