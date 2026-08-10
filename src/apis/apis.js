import axios from "axios";
import axiosInstance from "./axiosInstance";

const BASE_URL = "https://kanban-backend-zl54.onrender.com/kanban"

// Login Register and USER APIs
export const loginUser = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, formData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Login failed. Please try again.";
        throw new Error(message);
    }
}

export const registerUser = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, formData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Registration failed. Please try again.";
        throw new Error(message);
    }
}

export const getUsersOnSearch = async(value) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/getUser?firstName=${value}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Registration failed. Please try again.";
        throw new Error(message);
    }
}


// Board APIs

// Create Board
export const createBoard = async (formData) => {
    try {
        const response = await axiosInstance.post(`/boards`, formData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Board creation failed.";
        throw new Error(message);
    }
}

// Get Boards
export const getBoards = async () => {
    try {
        const response = await axiosInstance.get(`/boards`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Board fetching failed.";
        throw new Error(message);
    }
}

// Get Board By Id
export const getBoardById = async (boardId) => {
    try {
        const response = await axiosInstance.get(`/boards/${boardId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Board fetching failed.";
        throw new Error(message);
    }
}

// Add Member
export const addBoardMember = async (boardId, member, role) => {
    try {
        const response = await axiosInstance.post(
            `/boards/member/${boardId}`,
            null, // no request body needed since you're using @RequestParam
            { params: { emailId: member, role } }
        );
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Could not add member to board.";
        throw new Error(message);
    }
}

// Remove member from Board
export const removeBoardMember = async (boardId, emailId) => {
    try {
        const response = await axiosInstance.delete(`/boards/${boardId}/members`, {
            params: { emailId },
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Could not remove member from board.";
        throw new Error(message);
    }
}

// Edit Board
export const updateBoard = async(boardId, payload) => {
    try {
        const response = await axiosInstance.put(`/boards/${boardId}`, payload);
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Board Update Failed";
        throw new Error(message);
    }
}

// Delete Board
export const deleteBoard = async (boardId) => {
    try {
        const response = await axiosInstance.delete(`/boards/${boardId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Board deletion failed.";
        throw new Error(message);
    }
}


// Column APIs

// Create Column
export const createColumn = async (boardId, payload) => {
    try {
        const response = await axiosInstance.post(`/columns/${boardId}`, payload);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Column creation failed.";
        throw new Error(message);
    }
}

// Fetch all columns for a board
export const fetchAllColumns = async (boardId) => {
    try {
        const response = await axiosInstance.get(`/columns/all/${boardId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Column fetching failed";
        throw new Error(message);
    }
}

// Delete Column
export const deleteColumn = async (columnId) => {
    try {
        const response = await axiosInstance.delete(`/columns/${columnId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Column deletion failed";
        throw new Error(message);
    }
}

// Task APIs
// Create Task
export const createTask = async (columnId, payload) => {
    try {
        const response = await axiosInstance.post(`/tasks/${columnId}`, payload);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Task creation failed.";
        throw new Error(message);
    }
}

// Fetch all tasks for a column
export const fetchAllTasksForCol = async (columnId) => {
    try {
        const response = await axiosInstance.get(`/tasks/column/${columnId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Tasks fetching failed";
        throw new Error(message);
    }
}

// Update Task
export const updateTask = async (taskId, payload) => {
    try {
        const response = await axiosInstance.put(`/tasks/${taskId}`, payload);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Tasks Update failed";
        throw new Error(message);
    }
}

// Delete Task
export const deleteTask = async (taskId) => {
    try {
        const response = await axiosInstance.delete(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Tasks delete failed";
        throw new Error(message);
    }
}

// Assign / reassign a user to a task
export const assignTaskUser = async (taskId, emailId) => {
    try {
        const response = await axiosInstance.put(`/tasks/${taskId}/assignee`, { emailId });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Tasks delete failed";
        throw new Error(message);
    }
}

// Unassign a user from a task
export const removeTaskAssignee = async (taskId, emailId) => {
    try {
        const response = await axiosInstance.delete(`/tasks/${taskId}/assignee`, { params: { emailId } });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Tasks delete failed";
        throw new Error(message);
    }
}
    
// Display Shared with me Boards
export const getSharedBoards = async () => {
    try {
        const response = await axiosInstance.get(`/boards/sharedBoards`);
        return response.data;
    } catch (err) {
        throw err;
    }
}

// Update To Favorite Boards
export const markFavBoard = async (boardId) => {
    try {
        const response = await axiosInstance.put(`/boards/favorite/${boardId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
}

// Get Favorite Boards
export const getFavBoards = async () => {
    try {
        const response = await axiosInstance.get(`/boards/favorites`);
        return response.data;
    } catch (err) { 
        throw err;
    }
}

// Archive a board
export const archiveBoard = async (boardId) => {
    try {
        const response = await axiosInstance.put(`/boards/${boardId}/archive`);
        return response.data;
    } catch (err) {
        throw err;
    }
}

// Unarchive a board
export const unarchiveBoard = async (boardId) => {
    try {
        const response = await axiosInstance.put(`/boards/${boardId}/unarchive`);
        return response.data;
    } catch (err) {
        throw err;
    }
}

// Get Archived Boards
export const getArchivedBoards = async () => {
    try {
        const response = await axiosInstance.get(`/boards/archived`);
        return response.data;
    } catch (err) {
        throw err;
    }
}

// Get Recently Opened Boards
export const getRecentBoards = async () => {
    try {
        const response = await axiosInstance.get(`/boards/recent`);
        return response.data;
    } catch (err) {
        throw err;
    }
}