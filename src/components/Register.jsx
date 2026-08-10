import React from "react";
import { useState } from "react";
import { registerUser } from "../apis/apis";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AuthLayout from "./AuthLayout";

const Register = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({firstName : "", lastName : "", emailId : "", password: ""})
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(formData);
        if (!isValid) return;

        setLoading(true);
        try {
            const response = await registerUser(formData)
            toast.success(response || "Registration successful. Please log in.");
            navigate('/kanban/login');
        } catch(error) {
            toast.error(error.response || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const validateForm = (formData) => {

        let newErrors = {};

        if (!formData.firstName || formData.firstName.trim() === "") {
            newErrors.firstName = "First Name is required";
        }

        if (!formData.lastName || formData.lastName.trim() === "") {
            newErrors.lastName = "Last Name is required";
        }

        if (!formData.emailId || formData.emailId.trim() === "") {
            newErrors.emailId = "Email ID is required";
        }

        if (!formData.password || formData.password.trim() === "") {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    return (
        <AuthLayout title="Create your account" subtitle="Set up boards, invite your team, and start shipping.">
            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
            <form onSubmit={handleSubmit} noValidate>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block text-lg font-medium text-[#16213A] mb-1.5">First name</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Jane"
                            className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                                ${errors.firstName ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                        />
                        {errors.firstName && <p className="text-[#FB7367] text-xs mt-1.5">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-[#16213A] mb-1.5">Last name</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Doe"
                            className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                                ${errors.lastName ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                        />
                        {errors.lastName && <p className="text-[#FB7367] text-xs mt-1.5">{errors.lastName}</p>}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="emailId" className="block text-lg font-medium text-[#16213A] mb-1.5">Email address</label>
                    <input
                        id="emailId"
                        name="emailId"
                        type="email"
                        value={formData.emailId}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="you@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                            ${errors.emailId ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                    />
                    {errors.emailId && <p className="text-[#FB7367] text-xs mt-1.5">{errors.emailId}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-lg font-medium text-[#16213A] mb-1.5">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter password..."
                        className={`w-full px-3.5 py-2.5 border rounded-xl shadow-sm outline-none transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-400
                            ${errors.password ? "border-[#FB7367] focus:ring-2 focus:ring-[#FB7367]/30" : "border-gray-200 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"}`}
                    />
                    {errors.password && <p className="text-[#FB7367] text-xs mt-1.5">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#321A52] text-white font-medium tracking-tight hover:bg-[#432467] transition-colors duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer gap-2"
                >
                    {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p className="mt-6 text-center text-md text-[#5B6579]">
                    Already have an account?{" "}
                    <Link to="/kanban/login" className="font-medium text-[#14B8A6] hover:text-[#0F9488] hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Register;