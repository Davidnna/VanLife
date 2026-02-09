import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser, isUsernameAvailable } from "../api"
import { useAuth } from "../context/AuthContext"

export default function SignUp() {
    const [signUpFormData, setSignUpFormData] = React.useState({ 
        email: "", 
        password: "", 
        confirmPassword: "",
        username: "",
        userType: "user"
    })
    const [status, setStatus] = React.useState("idle")
    const [usernameStatus, setUsernameStatus] = React.useState(null)
    const [usernameError, setUsernameError] = React.useState("")
    const [checking, setChecking] = React.useState(false)
    const [error, setError] = React.useState(null)

    const navigate = useNavigate()
    const { refreshUserProfile } = useAuth()

    React.useEffect(() => {
        if (signUpFormData.username.length < 3) return

        const timeout = setTimeout(async () => {
            setChecking(true)
            const available = await isUsernameAvailable(signUpFormData.username)
            setUsernameStatus(available ? "available" : "taken")
            setChecking(false)
        }, 400)

        return () => clearTimeout(timeout)
    }, [signUpFormData.username])

    function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (usernameError) {
            setError({ message: usernameError })
            return
        }

        if (usernameStatus !== "available") {
            setError({ message: "Username is not available" })
            return
        }

        if (signUpFormData.password !== signUpFormData.confirmPassword) {
            setError({ message: "Passwords do not match" })
            return
        }

        if (signUpFormData.password.length < 6) {
            setError({ message: "Password must be at least 6 characters" })
            return
        }

        setStatus("submitting")
        registerUser({
            email: signUpFormData.email,
            password: signUpFormData.password,
            username: signUpFormData.username,
            userType: signUpFormData.userType
        })
            .then(async data => {
                await refreshUserProfile(data)
                navigate(signUpFormData.userType === "host" ? "/host" : "/vans", { replace: true })
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

    function handleUsernameChange(e) {
        handleChange(e)
        const { value } = e.target
        if (!value) {
            setUsernameError("Username is required")
            setUsernameStatus(null)
            return
        }
        if (value.includes(" ")) {
            setUsernameError("Username cannot contain spaces")
            setUsernameStatus(null)
            return
        }
        if (!/^[a-z0-9_]+$/.test(value)) {
            setUsernameError("Only lowercase letters, numbers, and underscores are allowed")
            setUsernameStatus(null)
            return
        }
        if (value.length < 3) {
            setUsernameError("Username must be at least 3 characters long")
            setUsernameStatus(null)
            return
        }
        setUsernameError("")
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
                    name="username"
                    onChange={handleUsernameChange}
                    type="text"
                    placeholder="Username"
                    value={signUpFormData.username}
                    required
                />
                {usernameError && <p className="username-error">{usernameError}</p>}
                {checking && <p className="username-checking">Checking username availability...</p>}
                {usernameStatus === "available" && <p className="username-available">Username is available</p>}
                {usernameStatus === "taken" && <p className="username-taken">Username is already taken</p>}
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

                <div className="signup-user-type">
                    <label>Account Type</label>
                    <div className="radio-group-inline">
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value="user"
                                checked={signUpFormData.userType === "user"}
                                onChange={handleChange}
                            />
                            <span>Regular User</span>
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value="host"
                                checked={signUpFormData.userType === "host"}
                                onChange={handleChange}
                            />
                            <span>Host</span>
                        </label>
                    </div>
                </div>

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