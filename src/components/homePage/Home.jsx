import MyBoards from "./MyBoards";
import SideBar from "./SideBar";

const Home = ({ theme, toggleTheme }) => {
    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-950">
            <SideBar theme={theme} toggleTheme={toggleTheme} />
            <MyBoards theme={theme} toggleTheme={toggleTheme}/>
        </div>
    );
};

export default Home;