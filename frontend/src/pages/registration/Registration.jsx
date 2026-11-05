
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function Registration() {
    const navigate = useNavigate();

    const [userDetails, setUserDetails] = useState({
        username: "",
        email: "",
        role: "",
        customRole: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    function updateFieldData(fieldName, newValue) {
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [fieldName]: newValue,
        }));
    }

    async function submitUserDetails(e) {
        e.preventDefault();

        const {
            username,
            email,
            role,
            customRole,
            password,
            confirmPassword,
        } = userDetails;

        if (
            !username.trim() ||
            !email.trim() ||
            !role ||
            !password ||
            !confirmPassword
        ) {
            alert("Please fill in all fields.");
            return;
        }

        if (role === "Other" && !customRole.trim()) {
            alert("Please specify your role.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Password and Confirm Password do not match.");
            return;
        }

        const finalRole = role === "Other" ? customRole.trim() : role;

        try {
            setLoading(true);

            await api.post("/users", {
                username: username.trim(),
                email: email.trim(),
                role: finalRole,
                password,
            });

            alert("Registration successful!");
            navigate("/signin");

        } catch (error) {
            console.error("Registration error:", error);

            alert(
                error.response?.data?.error ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen w-full flex-row">

            <div className="flex h-full w-1/2 items-center justify-center overflow-hidden">
                <img
                    src="/register.png"
                    alt="auth-cover"
                    className="h-[70%] w-[70%] object-contain"
                />
            </div>

            <div className="flex h-full w-1/2 items-center justify-center overflow-y-auto py-8">
                <div className="w-3/4">

                    <h1 className="mb-6 text-3xl font-bold">
                        Register
                    </h1>

                    <form onSubmit={submitUserDetails}>

                        {/* Username */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter your username"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.username}
                                onChange={(e) =>
                                    updateFieldData("username", e.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.email}
                                onChange={(e) =>
                                    updateFieldData("email", e.target.value)
                                }
                                required
                            />

                            <p className="mt-1 text-sm text-gray-500">
                                We'll never share your email with anyone else.
                            </p>
                        </div>

                        {/* Role */}
                        <div className="mb-4">
                            <select
                                value={userDetails.role}
                                onChange={(e) => {
                                    updateFieldData("role", e.target.value);
                                    updateFieldData("customRole", "");
                                }}
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select your role</option>
                                <option value="CEO">CEO</option>
                                <option value="Manager">Manager</option>
                                <option value="HR">HR</option>
                                <option value="Employee">Employee</option>
                                <option value="Intern">Intern</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Custom Role */}
                        {userDetails.role === "Other" && (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Specify your role"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={userDetails.customRole}
                                    onChange={(e) =>
                                        updateFieldData("customRole", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.password}
                                onChange={(e) =>
                                    updateFieldData("password", e.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.confirmPassword}
                                onChange={(e) =>
                                    updateFieldData("confirmPassword", e.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>

                    </form>

                    <p className="mt-4 text-sm text-gray-600">
                        Already registered?{" "}
                        <Link to="/signin" className="text-blue-600 underline">
                            Sign In
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}
