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

    const [error, setError] = useState({});

    const onChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const submitForm = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser(formData);
            console.log("Success: " + response);
        } catch (error) {
            console.log("Error:", error);

            if (error.response?.status === 404) {
                alert("User not found please register")
                
            }
        }
    }

    const validateForm = (formData) => {

        if (formData.emailID === "") {
            setError();
            return;
        }

        if (formData.password === "") {
            setError();
            return;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div>Kanban Board</div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <button className="w-full py-3 mt-2 cursor-pointer rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
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