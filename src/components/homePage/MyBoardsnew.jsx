import { Plus, Search, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { getBoards, getSharedBoards, getFavBoards, getArchivedBoards, archiveBoard, unarchiveBoard, markFavBoard, getRecentBoards } from "../../apis/apis";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import BoardCard from "./BoardCard";
import RecentlyOpenedSection from "./RecentlyOpenedSection";
import CreateBoardModal from "./CreateBoardModal";
import DeleteBoardModal from "./DeleteBoardModal";
import EditBoardModal from "./EditBoardModal";
import EditMembersModal from "./EditMembersModal";

const MyBoardsnew = ({ theme, toggleTheme, activeMenu }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === "dark";

    const [boards, setBoards] = useState([]);
    const [recentBoards, setRecentBoards] = useState([]);
    const [searchBoard, setSearchBoard] = useState("");
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [expandedBoards, setExpandedBoards] = useState({});

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editBoardTarget, setEditBoardTarget] = useState(null);
    const [editMembersTarget, setEditMembersTarget] = useState(null);

    const sectionConfig = {
        myBoards: { title: "Your Boards", fetcher: getBoards, showCreate: true, emptyText: "Create your first board to start organizing work." },
        shared: { title: "Shared with me", fetcher: getSharedBoards, showCreate: false, emptyText: "No boards have been shared with you yet." },
        favorites: { title: "Favorites", fetcher: getFavBoards, showCreate: false, emptyText: "You haven't favorited any boards yet." },
        archived: { title: "Archived", fetcher: getArchivedBoards, showCreate: false, emptyText: "No archived boards." },
    };
    const currentSection = sectionConfig[activeMenu] ?? sectionConfig.myBoards;

    useEffect(() => {
        handleFetchBoards();
        if (activeMenu === "myBoards") handleFetchRecentBoards();
    }, [activeMenu]);

    useEffect(() => {
        if (!menuOpenFor) return;
        const closeMenu = () => setMenuOpenFor(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [menuOpenFor]);

    const handleFetchBoards = async () => {
        try {
            setBoards(await currentSection.fetcher());
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to load boards.");
        }
    };

    const handleFetchRecentBoards = async () => {
        try {
            setRecentBoards(await getRecentBoards());
        } catch (err) {
            console.log(err);
        }
    };

    const handleToggleFavorite = async (e, board) => {
        e.stopPropagation();
        const previousBoards = boards;
        setBoards((prev) => prev.map((b) => (b.id === board.id ? { ...b, isFavorite: !b.isFavorite } : b)));
        try {
            await markFavBoard(board.id);
            if (activeMenu === "favorites" && board.isFavorite) {
                setBoards((prev) => prev.filter((b) => b.id !== board.id));
            }
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to update favorite.");
            setBoards(previousBoards);
        }
    };

    const handleToggleArchive = async (e, board) => {
        e.stopPropagation();
        setMenuOpenFor(null);
        try {
            if (activeMenu === "archived") {
                await unarchiveBoard(board.id);
                toast.success("Board unarchived.");
            } else {
                await archiveBoard(board.id);
                toast.success("Board archived.");
            }
            setBoards((prev) => prev.filter((b) => b.id !== board.id));
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to update archive status.");
        }
    };

    const handleDeleted = (boardId) => {
        setBoards((prev) => prev.filter((b) => b.id !== boardId));
        setRecentBoards((prev) => prev.filter((b) => b.id !== boardId));
    };

    const handleBoardUpdated = (boardId, updated) => {
        setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, ...updated } : b)));
    };

    const toggleCardMenu = (e, boardId) => {
        e?.stopPropagation();
        setMenuOpenFor((prev) => (prev === boardId ? null : boardId));
    };

    const toggleBoardExpand = (e, boardId) => {
        e.stopPropagation();
        setExpandedBoards((prev) => ({ ...prev, [boardId]: !prev[boardId] }));
    };

    const filteredBoards = boards.filter((board) => board?.title.toLowerCase().includes(searchBoard.toLowerCase()));

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className={`flex-1 w-full min-w-0 min-h-screen px-6 py-8 transition-colors duration-300 ease-in-out ${isDark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-900"}`}>
            <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />

            <div className="flex items-center justify-between mb-8 w-full">
                <div>
                    <h1 className="text-2xl font-semibold">{getGreeting()}, {user?.firstName || "there"} 👋</h1>
                    <p className={`text-md mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Here's what's happening across your boards.</p>
                </div>
            </div>

            <div className="flex items-start gap-8 w-full">
                <div className="flex-1 min-w-0">
                    <div className="relative mb-6 max-w-md">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                        <input
                            type="text"
                            placeholder="Search boards, tasks..."
                            onChange={(e) => setSearchBoard(e.target.value)}
                            value={searchBoard}
                            className={`w-full pl-9 pr-3 py-2 rounded-md text-md border focus:outline-none focus:ring-2 ${
                                isDark ? "bg-neutral-900 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500" : "bg-white border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                            }`}
                        />
                    </div>

                    {activeMenu === "myBoards" && (
                        <RecentlyOpenedSection recentBoards={recentBoards} isDark={isDark} onNavigate={(id) => navigate(`/kanban/board/${id}`)} />
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">
                            {currentSection.title}
                            {boards.length > 0 && <span className={`ml-2 text-md font-normal ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>({filteredBoards.length})</span>}
                        </h2>
                        {currentSection.showCreate && (
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-md font-medium cursor-pointer transition-colors duration-300 ease-in-out shadow-sm bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCreateModalOpen(true)}>
                                <Plus className="w-4 h-4" /> Create Board
                            </button>
                        )}
                    </div>

                    {filteredBoards.length === 0 && boards.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-neutral-900 text-neutral-500" : "bg-neutral-100 text-neutral-400"}`}>
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-md font-medium">No boards yet</p>
                                <p className={`text-xs mt-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{currentSection.emptyText}</p>
                            </div>
                            {currentSection.showCreate && (
                                <button onClick={() => setCreateModalOpen(true)} className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-md text-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 ease-in-out shadow-sm">
                                    <Plus className="w-4 h-4" /> Create Board
                                </button>
                            )}
                        </div>
                    ) : filteredBoards.length === 0 ? (
                        <div className={`text-md rounded-md border border-dashed p-8 text-center ${isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200 text-neutral-400"}`}>
                            No boards match "{searchBoard}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {filteredBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    isDark={isDark}
                                    activeMenu={activeMenu}
                                    isMenuOpen={menuOpenFor === board.id}
                                    isExpanded={!!expandedBoards[board.id]}
                                    currentUserEmail={user?.email}
                                    onNavigate={(id) => navigate(`/kanban/board/${id}`)}
                                    onToggleFavorite={handleToggleFavorite}
                                    onToggleMenu={toggleCardMenu}
                                    onCloseMenu={() => setMenuOpenFor(null)}
                                    onEditMembers={(e, b) => { e.stopPropagation(); setMenuOpenFor(null); setEditMembersTarget(b); }}
                                    onEditBoard={(e, b) => { e.stopPropagation(); setMenuOpenFor(null); setEditBoardTarget(b); }}
                                    onToggleArchive={handleToggleArchive}
                                    onDeleteBoard={(e, b) => { e.stopPropagation(); setMenuOpenFor(null); setDeleteTarget(b); }}
                                    onToggleExpand={toggleBoardExpand}
                                />
                            ))}

                            {currentSection.showCreate && (
                                <button
                                    onClick={() => setCreateModalOpen(true)}
                                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-5 min-h-[168px] transition-colors duration-300 ease-in-out cursor-pointer ${
                                        isDark ? "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300" : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
                                    }`}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="text-md font-medium">New board</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {createModalOpen && <CreateBoardModal isDark={isDark} onClose={() => setCreateModalOpen(false)} onCreated={(newBoard) => setBoards((prev) => [...prev, newBoard])} />}
            {deleteTarget && <DeleteBoardModal board={deleteTarget} isDark={isDark} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />}
            {editBoardTarget && <EditBoardModal board={editBoardTarget} isDark={isDark} onClose={() => setEditBoardTarget(null)} onUpdated={handleBoardUpdated} />}
            {editMembersTarget && <EditMembersModal board={editMembersTarget} isDark={isDark} onClose={() => setEditMembersTarget(null)} onMembersUpdated={handleFetchBoards} />}
        </div>
    );
};

export default MyBoardsnew;