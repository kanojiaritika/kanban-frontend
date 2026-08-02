import { Archive, Bell, Home, LayoutGrid, Moon, Settings, SquareKanban, Sun, Users } from "lucide-react";
import NavItem from "./NavItem";
import { useAuth } from "../context/AuthContext";

const SideBar = ({ toggleTheme, theme }) => {

    const {user} = useAuth();

    return (
        <div className="flex flex-col w-56 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/5 shrink-0">

            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500">
                    <SquareKanban size={15} className="text-white" />
                </div>
                <span className="text-md font-semibold text-gray-900 dark:text-white tracking-tight">
                    KanbanApp
                </span>
            </div>

            <nav className="flex flex-col gap-0.5 px-3 py-4">
                <NavItem icon={<Home size={15} />} label="Home" active />
                <NavItem icon={<Bell size={15} />} label="Notifications" badge={2} />
            </nav>

            <div className="px-3 pb-4">
                <p className="px-2 mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-white/25">
                    Workspaces
                </p>
                <div className="flex flex-col gap-0.5">
                    <NavItem icon={<LayoutGrid size={15} />} label="My Boards" />
                    <NavItem icon={<Users size={15} />} label="Shared with me" />
                    <NavItem icon={<Archive size={15} />} label="Archived" />
                </div>
            </div>

            <div className="mt-auto px-3 py-4 border-t border-gray-200 dark:border-white/5">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 mb-1 rounded-lg text-md text-gray-500 dark:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                    {theme === "dark"
                        ? <Sun size={15} />
                        : <Moon size={15} />
                    }
                    <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>

                {/* User info */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer group">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500 text-white text-[11px] font-semibold shrink-0">
                        {`${user.firstName[0]}${user.lastName[0]}`}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.firstName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/35">Free plan</p>
                    </div>
                    <Settings size={13} className="text-gray-300 dark:text-white/25 group-hover:text-gray-500 dark:group-hover:text-white/50 transition-colors shrink-0" />
                </div>
            </div>
        </div>
    );
};

export default SideBar;