import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apis/apis";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import AuthLayout from "./AuthLayout";

const Login = () => {

    const navigate = useNavigate();
    const {login} = useAuth();

    const [formData, setFormData] = useState({
        emailId: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const submitForm = async (e) => {
        e.preventDefault();

        const isValid = validateForm(formData);
        if (!isValid) return;

        setLoading(true);
        try {
            const response = await loginUser(formData);
            login(response?.token);
            toast.success("Welcome back!");
            navigate('/kanban/home');
        } catch (error) {
            toast.error(error.message || "Login failed. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    }

    const validateForm = (formData) => {

        let newErrors = {};

        if (formData.emailId === null || formData.emailId.trim() === "") {
            newErrors.emailId = "Email ID is required";
        }

        if (formData.password === null || formData.password.trim() === "") {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    return (
        <AuthLayout title="Welcome back" subtitle="Log in to pick up your boards where you left off.">
            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
            <form onSubmit={submitForm} noValidate>

                <div className="mb-4">
                    <label htmlFor="emailId" className="block text-lg font-medium text-[#16213A] mb-1.5">
                        Email address
                    </label>
                    <input
                        id="emailId"
                        name="emailId"
                        type="email"
                        value={formData.emailId}
                        onChange={onChange}
                        disabled={loading}
                        placeholder="you@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                            ${errors.emailId ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                    />
                    {errors.emailId && (
                        <p className="text-[#FB7367] text-xs mt-1.5">{errors.emailId}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-lg font-medium text-[#16213A] mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={onChange}
                        disabled={loading}
                        placeholder="Enter password..."
                        className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                            ${errors.password ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                    />
                    {errors.password && (
                        <p className="text-[#FB7367] text-xs mt-1.5">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#321A52] text-white font-medium tracking-tight hover:bg-[#432467] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer gap-2"
                >
                    {loading && (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    {loading ? "Signing in..." : "Login"}
                </button>

                <p className="mt-6 text-center text-md text-[#5B6579]">
                    Do not have an account?{" "}
                    <Link to="/kanban/register" className="font-medium text-[#14B8A6] hover:text-[#0F9488] hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Login;