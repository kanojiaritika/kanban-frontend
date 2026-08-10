import { Archive, Bell, Home, LayoutGrid, Menu, Moon, Settings, SquareKanban, Star, Sun, Users, X } from "lucide-react";
import NavItem from "./NavItem";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const SideBar = ({ toggleTheme, theme, activeMenu, setActiveMenu }) => {

    const {user} = useAuth();
    const [selectedMenuItem, setSelectedMenuItem] = useState("");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleNavClick = (menu) => {
        setActiveMenu(menu);
        setIsMobileOpen(false); // close drawer after picking a menu item on mobile
    };

    return (
        <>
            {/* Mobile top bar with hamburger — only visible below md */}
            <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/5">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-1.5 rounded-md text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                    <Menu size={18} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500">
                        <SquareKanban size={13} className="text-white" />
                    </div>
                    <span className="text-md font-semibold text-gray-900 dark:text-white tracking-tight">
                        KanbanApp
                    </span>
                </div>
            </div>

            {/* Backdrop mobile only, shown when drawer is open */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                />
            )}

            {/* Sidebar fixed drawer on mobile, static column on md+ */}
            <div
                className={`flex flex-col w-56 h-screen overflow-y-auto bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/5 shrink-0
                    fixed top-0 left-0 z-50 transition-transform duration-200
                    md:sticky md:translate-x-0
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500">
                            <SquareKanban size={15} className="text-white" />
                        </div>
                        <span className="text-md font-semibold text-gray-900 dark:text-white tracking-tight">
                            KanbanApp
                        </span>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* <nav className="flex flex-col gap-0.5 px-3 py-4">
                    <NavItem 
                        icon={<Home size={15} />} 
                        label="Home"
                        active={activeMenu === "myBoards"}
                        onClick={() => handleNavClick("myBoards")}
                    />
                    <NavItem icon={<Bell size={15} />} label="Notifications" badge={2} />
                </nav> */}

                <div className="px-3 pb-4">
                    <p className="px-2 mb-2 mt-4 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-white/25">
                        My Workspace
                    </p>
                    <div className="flex flex-col gap-0.5">
                        <NavItem
                            icon={<LayoutGrid size={15} />}
                            label="My Boards"
                            active={activeMenu === "myBoards"}
                            onClick={() => handleNavClick("myBoards")}
                        />
                        <NavItem
                            icon={<Users size={15} />}
                            label="Shared with me"
                            active={activeMenu === "shared"}
                            onClick={() => handleNavClick("shared")}
                        />
                        <NavItem
                            icon={<Star size={15} />}
                            label="Favorites"
                            active={activeMenu === "favorites"}
                            onClick={() => handleNavClick("favorites")}
                        />
                        <NavItem
                            icon={<Archive size={15} />}
                            label="Archived"
                            active={activeMenu === "archived"}
                            onClick={() => handleNavClick("archived")}
                        />
                    </div>
                </div>

                <div className="mt-auto px-3 py-4 border-t border-gray-200 dark:border-white/5">
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
        </>
    );
};

export default SideBar;