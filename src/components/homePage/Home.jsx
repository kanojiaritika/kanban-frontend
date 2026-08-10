import { useState } from "react";
import MyBoardsnew from "./MyBoardsnew";
import SideBar from "./SideBar";
import { useLocation } from "react-router-dom";

const Home = ({ theme, toggleTheme }) => {

    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState(location.state?.activeMenu ?? "myBoards");

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-950">
            <SideBar
                theme={theme}
                toggleTheme={toggleTheme}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
            />
            <MyBoardsnew
                theme={theme} 
                toggleTheme={toggleTheme}
                activeMenu={activeMenu}
            />
        </div>
    );
};

export default Home;