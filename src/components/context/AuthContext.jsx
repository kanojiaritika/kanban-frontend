import { jwtDecode } from "jwt-decode";
import { useState, useContext, createContext } from "react";

const AuthContext = createContext(null);

const decodeUser = (token) => {
    try {
        const decoded = jwtDecode(token);
        return {
            email: decoded.sub,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            exp: decoded.exp,
        };
    } catch {
        return null;
    }
};

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        return token ? decodeUser(token) : null;
    })

    const login = (token) => {
        localStorage.setItem("token", token);
        setUser(decodeUser(token));
    }

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);