import axios from "axios";

const BASE_URL = "https://kanban-backend-zl54.onrender.com/kanban";

const axiosInstance = axios.create({
    baseURL : BASE_URL,
})

// So when we call say, axios.get("/boards")
// Axios internally creates a config object
// config = {
//     url : "/boards",
//     method : "get",
//     baseURL : "http://localhost:8085/kanban",
//     headers : {
//         "Content-Type" : "application-json", // This sets mostly when we are sending a JS object 
//                                                 eg. axios.post("/boards", boardObj);
//     }
// }

// Axios passes this config into your interceptor function automatically: 
// interceptors is a middleware that runs before every request is sent
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;  // return config back to axios
})

// After we return config we get :
// config = {
//     url : "/boards",
//     method : "get",
//     baseURL : "http://localhost:8085/kanban",
//     headers : {
//         "Content-Type" : "application-json",
//         "Authorization" : "Bearer fjdskjf...." // We added in the above function 
//     }
// }

// Finally axios sends http request with modified headers

export default axiosInstance;