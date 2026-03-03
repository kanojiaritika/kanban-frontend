import React from "react";
import { useState, useEffect } from "react";
import { loginUser } from "../apis/LoginReg";
import { Link } from "react-router-dom";
import Register from "./Register";

const Login = () => {

    const [formData, setFormData] = useState({
        emailId: "", 
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [serverMsg, setServerMsg] = useState({
        message: "",
        type: ""
    })

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

        try {
            const response = await loginUser(formData);
            setServerMsg({
                message: response || "Login Successful",
                type: "success"
            })
        } catch (error) {
            
            setServerMsg({
                message: error.response || "Server Error. Please try later.",
                type: "error"
            })
        }
    }

    const validateForm = (formData) => {

        let newErrors = {};

        if (formData.emailId.trim() === "" || formData.emailId === null) {
            newErrors.emailId = "Email ID cannot be empty";
        }

        if (formData.password.trim() === "" || formData.password === null) {
            newErrors.password = "Password cannot be empty";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
            onSubmit={submitForm}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
            >
            <div className="mb-6 text-center">
                <p className="text-2xl font-bold">Login</p>
                <p className="text-sm text-slate-500">
                Welcome back! Please enter your details
                </p>
            </div>

            <div className="mb-4">
                <label
                htmlFor="emailId"
                className="block text-base font-medium text-gray-700 mb-2"
                >
                Email Address
                </label>

                <input
                id="emailId"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={onChange}
                placeholder="Enter email..."
                className={`w-full px-3 py-2 border rounded-xl shadow-sm outline-none transition-all duration-300
                    ${errors.emailId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"}`}
                />
                {errors.emailId && (
                    <p className="text-red-500 text-sm mt-1">{errors.emailId}</p>
                )}
            </div>

            <div className="mb-4">
                <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-2"
                >
                Password
                </label>

                <input
                name="password"
                type="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Enter password..."
                className={`w-full px-3 py-2 border rounded-xl shadow-sm outline-none transition-all duration-300
                    ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"}`}
                />
                {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
            </div>

            {serverMsg.message && (
                <p className={`text-center text-sm mt-3 ${serverMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {serverMsg.message}
                </p>
            )}
            <button 
            className="w-full py-3 mt-2 cursor-pointer rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                Login
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
                Do not have an account?{" "}
                <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                Register
                </Link>
            </p>
            </form>
        </div>
        );
}

export default Login;