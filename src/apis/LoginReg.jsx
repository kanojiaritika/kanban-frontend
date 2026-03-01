import axios from "axios";

const BASE_URL = "http://localhost:8085/kanban"

export const loginUser = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, formData)
        return response.data;
    } catch (error) {
        throw error.response?.data || "Login error";
    }
}

export const registerUser = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Register error";
    }
}