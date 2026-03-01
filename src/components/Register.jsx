import React from "react";
import { useState, useEffect } from "react";
import { registerUser } from "../apis/LoginReg";

const Register = () => {

    const [formData, setFormData] = useState({
        emailId : "",
        password: ""
    })

    const handleChange = (e) => {

        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await registerUser(formData)
            console.log(`Response: ${response}`)
        } catch(error) {
            console.log(error.response);
        }
    }

    return (
        
        <form onSubmit={handleSubmit}>

            <h1>Register</h1>
            <label>EmailID</label>
            <input 
                type="email"
                name="emailId"
                placeholder="Enter emailId..."
                value={formData.emailId}
                onChange={handleChange}
            />

            <label>Password</label>
            <input 
                type="password"
                name="password"
                placeholder="Enter password..."
                value={formData.password}
                onChange={handleChange}
            />

            <button>Register</button>
        </form>
    )

}

export default Register;