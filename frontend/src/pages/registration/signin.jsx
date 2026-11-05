import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function Signin() {
    const [userDetails, setUserDetails] = useState({
        name: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateFieldData(fieldName, newValue) {
        setUserDetails(prevDetails => ({
            ...prevDetails,
            [fieldName]: newValue
        }));
    }

    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");

        if (!userDetails.name.trim() || !userDetails.password) {
            setError("Please enter your username and password");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/users/login", {
                username: userDetails.name.trim(),
                password: userDetails.password
            });

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(response.data.user)
            );

            navigate("/layout");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full flex-row">
            <div className="flex h-full w-1/2 items-center justify-center overflow-hidden">
                <img
                    src="/signin.jpg"
                    alt="auth-cover"
                    className="h-[70%] w-[70%] object-contain"
                />
            </div>

            <div className="flex h-full w-1/2 items-center justify-startt">
                <div className="w-3/4">
                    <h1 className="mb-4 text-3xl font-bold">
                        Sign In
                    </h1>

                    <form onSubmit={handleSignIn}>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.name}
                                onChange={(e) =>
                                    updateFieldData('name', e.target.value)
                                }
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-field w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={userDetails.password}
                                onChange={(e) =>
                                    updateFieldData('password', e.target.value)
                                }
                            />
                        </div>

                        {error && (
                            <p className="mb-3 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p>
                        Not registered? <Link to="/register" className="underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}