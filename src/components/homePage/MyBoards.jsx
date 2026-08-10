import { Plus, Search, X, Users, Trash2, LayoutGrid, 
        ArrowUpRight, Sparkles, Clock, MoreVertical, Pencil, 
        Eye, UserPlus, Star, Archive, ArchiveRestore } from "lucide-react";
import { useEffect, useState } from "react";
import { addBoardMember, 
        createBoard, 
        deleteBoard, 
        getBoards, 
        getSharedBoards, 
        getFavBoards, 
        getArchivedBoards, 
        archiveBoard, 
        unarchiveBoard, 
        getUsersOnSearch, 
        updateBoard, markFavBoard, getRecentBoards,
        removeBoardMember } from "../../apis/apis";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const emptyBoard = {
  title: "",
  description: "",
}

// A small fixed palette so each board gets a consistent, deterministic accent
// color (based on its id/title) instead of every card looking identical.
const boardAccents = [
  { bg: "bg-blue-500", soft: "bg-blue-500/10", text: "text-blue-500" },
  { bg: "bg-violet-500", soft: "bg-violet-500/10", text: "text-violet-500" },
  { bg: "bg-teal-500", soft: "bg-teal-500/10", text: "text-teal-500" },
  { bg: "bg-amber-500", soft: "bg-amber-500/10", text: "text-amber-500" },
  { bg: "bg-rose-500", soft: "bg-rose-500/10", text: "text-rose-500" },
  { bg: "bg-emerald-500", soft: "bg-emerald-500/10", text: "text-emerald-500" },
];

const getAccent = (board) => {
  const key = String(board?.id ?? board?.title ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return boardAccents[Math.abs(hash) % boardAccents.length];
};

const MyBoards = ({ theme, toggleTheme, activeMenu }) => {

    const {user} = useAuth();

    const [modal, setModal] = useState(false);
    const [boardDTO, setBoardDTO] = useState(emptyBoard);
    const [board, setBoard] = useState({});
    const [boards, setBoards] = useState([]);
    const [step, setStep] = useState("first");
    const [userOptions, setUserOptions] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const [errors, setErrors] = useState({});
    const [searchBoard, setSearchBoard] = useState("");
    const [deleteBoardModal, setDeleteBoardModal] = useState(false);
    const [deleteBoardTarget, setDeleteBoardTarget] = useState(null);
    const [deletingBoard, setDeletingBoard] = useState(false);
    const [expandedBoards, setExpandedBoards] = useState({});

    const [menuOpenFor, setMenuOpenFor] = useState(null);

    // Edit board details modal
    const [editBoardModal, setEditBoardModal] = useState(false);
    const [editBoardDTO, setEditBoardDTO] = useState(emptyBoard);
    const [editBoardTarget, setEditBoardTarget] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    // Add members to an existing board modal
    const [editMembersModal, setEditMembersModal] = useState(false);
    const [editMembersTarget, setEditMembersTarget] = useState(null);
    const [editMembersList, setEditMembersList] = useState([]); 


    const isDark = theme === "dark";

    const navigate = useNavigate();

    const [recentBoards, setRecentBoards] = useState([]);

    const roleOptions = [
        { value: "MEMBER", label: "MEMBER" },
        { value: "ADMIN", label: "ADMIN" },
        { value: "OWNER", label: "OWNER" },
    ];

    const sectionConfig = {
        myBoards: {
            title: "Your Boards",
            fetcher: getBoards,
            showCreate: true,
            emptyText: "Create your first board to start organizing work.",
        },
        shared: {
            title: "Shared with me",
            fetcher: getSharedBoards,
            showCreate: false,
            emptyText: "No boards have been shared with you yet.",
        },
        favorites: {
            title: "Favorites",
            fetcher: getFavBoards,
            showCreate: false,
            emptyText: "You haven't favorited any boards yet.",
        },
        archived: {
            title: "Archived",
            fetcher: getArchivedBoards,
            showCreate: false,
            emptyText: "No archived boards.",
        },
    };

    const currentSection = sectionConfig[activeMenu] ?? sectionConfig.myBoards;

    useEffect(() => {
        handleFetchBoards();
        if (activeMenu === "myBoards") {
            handleFetchRecentBoards();
        }
    }, [activeMenu]);

    // Close the menu on outside click (Board Card Menu)
    useEffect(() => {
        if (!menuOpenFor) return;
        const closeMenu = () => setMenuOpenFor(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [menuOpenFor]);

    // Open or Close Board Modal
    const handleBoardModal = () => {
        setModal(prev => !prev);
    }

    // Create board
    const handleCreateBoard = async () => {

        // validateBoardForm();

        try {

            // Create Board
            const responseCreateBoard = await createBoard(boardDTO);

            // Newly created board Id
            const boardId = responseCreateBoard?.id;
            

            // Add Board to board list to show on UI
            setBoards(prev => [...prev, responseCreateBoard]);

            setBoardDTO(emptyBoard);   // reset AFTER success

            // Add Members To Board
            await Promise.all(
                membersList.map((member) =>
                    addBoardMember(boardId, member.value, member.role).catch((err) => {
                        console.log(err);
                    })
                )
            );


            setModal(false); // close on success
            toast.success("Board created successfully!");
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board creation failed.");
        }
    }

    // Update Board API
    const handleUpdateBoard = async () => {
        if (!validateEditForm() || !editBoardTarget) return;
        try {
            const updated = await updateBoard(editBoardTarget.id, editBoardDTO);
            setBoards((prev) => prev.map((b) => (b.id === editBoardTarget.id ? { ...b, ...updated } : b)));
            toast.success("Board updated successfully!");
            closeEditBoardModal();
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board update failed.");
        }
    }

    // Fetch Boards
    const handleFetchBoards = async () => {
        try {
            const response = await sectionConfig[activeMenu]?.fetcher
                ? await sectionConfig[activeMenu].fetcher()
                : await getBoards();
            setBoards(response);
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to load boards.");
        }
    }

    // Fetch Recent Boards
    const handleFetchRecentBoards = async () => {
        try {
            const response = await getRecentBoards();
            setRecentBoards(response);
        } catch (err) {
            console.log(err);
        }
    }

    // Fetch users on search when creating board
    const handleFetchUsers = async (value) => {
        try {
            const response = await getUsersOnSearch(value);
            const newArr = response.map((user) => ({
                ...user,
                value : String(user.emailId ?? ""),
                label : `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            }))
            setUserOptions(newArr);
        } catch (err) {
            console.log(err);
        }
    }

    // Handle Changing Role in second part of board create modal
    const makeRoleChangeHandler = (setter) => (memberValue, newRole) => {
        setter((prev) =>
            prev.map((member) =>
                member.value === memberValue
                    ? { ...member, role: newRole }
                    : member
            )
        );
    };

    const handleRoleChange = makeRoleChangeHandler(setMembersList);
    const handleEditMembersRoleChange = makeRoleChangeHandler(setEditMembersList);

    const handleRemoveFromEditList = async (member) => {
        if (member.isExisting) {
            try {
                await removeBoardMember(editMembersTarget.id, member.value);
                toast.success("Member removed.");
            } catch (err) {
                toast.error(err.message);
                return; // don't remove locally if the API call failed
            }
        }
        setEditMembersList((prev) => prev.filter((m) => m.value !== member.value));
    }

    const handleSubmitEditMembers = async () => {
        const newMembers = editMembersList.filter((m) => !m.isExisting);
        if (newMembers.length > 0) {
            await Promise.all(
                newMembers.map((m) =>
                    addBoardMember(editMembersTarget.id, m.value, m.role).catch((err) => console.log(err))
                )
            );
        }
        toast.success("Members updated.");
        // closeEditMembersModal();
        handleFetchBoards();
    }

    // Toggle Favorite Status of a board
    const handleToggleFavorite = async (e, board) => {
        e.stopPropagation(); // don't trigger card navigation
        const previousBoards = boards;

        // optimistic UI update
        setBoards((prev) =>
            prev.map((b) => (b.id === board.id ? { ...b, isFavorite: !b.isFavorite } : b))
        );

        try {
            await markFavBoard(board.id);
            // If we're on the Favorites view, an unfavorite should drop it from the list
            if (activeMenu === "favorites" && board.isFavorite) {
                setBoards((prev) => prev.filter((b) => b.id !== board.id));
            }
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to update favorite.");
            setBoards(previousBoards); // rollback
        }
    };

    // Toggle Archive status of a board
    const handleToggleArchive = async (e, board) => {
        e.stopPropagation();
        setMenuOpenFor(null);
        const isCurrentlyArchived = activeMenu === "archived";

        try {
            if (isCurrentlyArchived) {
                await unarchiveBoard(board.id);
                toast.success("Board unarchived.");
            } else {
                await archiveBoard(board.id);
                toast.success("Board archived.");
            }
            // Board moves lists either way, so drop it from the current view
            setBoards((prev) => prev.filter((b) => b.id !== board.id));
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to update archive status.");
        }
    }

    // Validate First Part of Board Modal (Title and Description)
    const validateFirstSec = () => {
        const newErrors = {};

        if (!boardDTO.title?.trim()) {
            newErrors.title = "Enter title";
        }

        if (!boardDTO.description?.trim()) {
            newErrors.description = "Enter description";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const filteredBoards = boards.filter((board) => 
        board?.title.toLowerCase().includes(searchBoard.toLowerCase())

    )

    // Derived, real numbers for the side rail — only computed from data we actually have.
    const totalMembers = boards.reduce((sum, b) => sum + (Array.isArray(b?.members) ? b.members.length : 0), 0);
    const hasMemberData = boards.some((b) => Array.isArray(b?.members));
    const latestBoard = boards.length > 0 ? boards[boards.length - 1] : null;

    // Open delete board modal
    const openDeleteBoardModal = (board) => {
        setDeleteBoardTarget(board);
        setDeleteBoardModal(true);
    }

    // Close delete board modal
    const closeDeleteBoardModal = () => {
        if (deletingBoard) return; // don't let the modal close mid-request
        setDeleteBoardModal(false);
        setDeleteBoardTarget(null);
    }

    // Delete Board
    const handleDeleteBoard = async () => {
        if (!deleteBoardTarget) return;

        setDeletingBoard(true);
        try {
            await deleteBoard(deleteBoardTarget.id);
            setBoards((prev) => prev.filter((b) => b.id !== deleteBoardTarget.id));
            setRecentBoards((prev) => prev.filter((b) => b.id !== deleteBoardTarget.id));
            toast.success("Board deleted successfully!");
            setDeleteBoardModal(false);
            setDeleteBoardTarget(null);
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board deletion failed.");
        } finally {
            setDeletingBoard(false);
        }
    }

    // Click on board card to open the board
    const toggleBoardExpand = (e, boardId) => {
        e.stopPropagation(); // don't trigger the card's navigate onClick
        setExpandedBoards((prev) => ({ ...prev, [boardId]: !prev[boardId] }));
    }

    // Helper to safely pull a display name + role off a member object.
    // Adjust field names below (firstName/lastName/emailId/role) to match your actual board.members shape.
    const getMemberName = (member) =>
        member?.firstName
            ? `${member.firstName} ${member.lastName || ""}`.trim()
            : member?.emailId || member?.email || "Unknown";

    const getMemberRole = (member) => member?.role || "MEMBER";

    // Toggle three dot menu on board card
    const toggleCardMenu = (e, boardId) => {
        e.stopPropagation();
        setMenuOpenFor((prev) => (prev === boardId ? null : boardId));
    };

    // 1. Edit Board Modal
    const openEditBoardModal = (e, board) => {
        e.stopPropagation();
        setEditBoardTarget(board);
        setEditBoardDTO({ title: board.title, description: board.description });
        setEditErrors({});
        setEditBoardModal(true);
        setMenuOpenFor(null);
    };

    // Close Edit Board Modal
    const closeEditBoardModal = () => {
        setEditBoardModal(false);
        setEditBoardTarget(null);
        setEditBoardDTO(emptyBoard);
    }

    // Validate edit form
    const validateEditForm = () => {
        const newErrors = {};
        if (!editBoardDTO.title?.trim()) newErrors.title = "Enter title";
        if (!editBoardDTO.description?.trim()) newErrors.description = "Enter description";
        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Open Members Modal to add or remove members
    const openEditMembersModal = (e, board) => {
        e.stopPropagation();
        setEditMembersTarget(board);
        const existing = (board.members || []).map((m) => ({
            value: m.emailId,
            label: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
            role: m.role,
            isExisting: true,
            memberId: m.id,
        }));
        setEditMembersList(existing);
        setEditMembersModal(true);
        setMenuOpenFor(null);
    }

    // Close Add Members Modal
    const closeAddMembersModal = () => {
        setEditMembersModal(false);
        setEditMembersTarget(null);
        setEditMembersList([]);
    }

    const handleSubmitAddMembers = async () => {
        if (!editMembersTarget || editMembersList.length === 0) {
            closeAddMembersModal();
            return;
        }
        try {
            await Promise.all(
                editMembersList.map((member) =>
                    addBoardMember(editMembersTarget.id, member.value, member.role).catch((err) => console.log(err))
                )
            );
            toast.success("Members added successfully!");
            closeAddMembersModal();
            handleFetchBoards(); // refresh so the card's member list updates
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to add members.");
        }
    }

    // Shared react-select styling so it matches the theme instead of default white/gray
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDark ? "#171717" : "#f9fafb",
            borderColor: state.isFocused
                ? "#2563eb"
                : isDark ? "#404040" : "#e5e5e5",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(37,99,235,0.3)" : "none",
            borderRadius: "0.5rem",
            minHeight: "40px",
            "&:hover": { borderColor: "#2563eb" },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDark ? "#171717" : "#ffffff",
            border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? (isDark ? "#262626" : "#eff6ff")
                : "transparent",
            color: isDark ? "#e5e5e5" : "#171717",
            cursor: "pointer",
        }),
        singleValue: (base) => ({
            ...base,
            color: isDark ? "#e5e5e5" : "#171717",
        }),
        input: (base) => ({
            ...base,
            color: isDark ? "#e5e5e5" : "#171717",
        }),
        placeholder: (base) => ({
            ...base,
            color: isDark ? "#737373" : "#a3a3a3",
        }),
    };

    // Greeting timings
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className={`flex-1 w-full min-w-0 min-h-screen px-6 py-8 transition-colors ${
            isDark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-900"
        }`}>
            <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 w-full">                
                <div>
                    <h1 className="text-2xl font-semibold">{getGreeting()}, {user?.firstName || "there"} 👋</h1>
                    <p className={`text-md mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                        Here's what's happening across your boards.
                    </p>
                </div>
            </div>

            {/* Main content: board grid (left) + rail (right) so wide screens don't leave dead space */}
            <div className="flex items-start gap-8 w-full">

                <div className="flex-1 min-w-0">

                    {/* Search Bar */}
                    <div className="relative mb-6 max-w-md">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                            isDark ? "text-neutral-500" : "text-neutral-400"
                        }`} />
                        <input
                            type="text"
                            placeholder="Search boards, tasks..."
                            onChange={(e) => setSearchBoard(e.target.value)}
                            value={searchBoard}
                            className={`w-full pl-9 pr-3 py-2 rounded-md text-md border focus:outline-none focus:ring-2 ${
                                isDark
                                    ? "bg-neutral-900 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500"
                                    : "bg-white border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                            }`}
                        />
                    </div>

                    {/* Recently Opened Boards Section */}
                    {activeMenu === "myBoards" && recentBoards.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Clock className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                                <h2 className={`text-xs font-semibold uppercase tracking-wide ${
                                    isDark ? "text-neutral-500" : "text-neutral-400"
                                }`}>
                                    Recently Opened
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentBoards.map((board) => {
                                    const accent = getAccent(board);
                                    return (
                                        <div
                                            key={board.id}
                                            onClick={() => navigate(`/kanban/board/${board.id}`)}
                                            className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                                isDark
                                                    ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600"
                                                    : "bg-white border-neutral-200 hover:border-neutral-300"
                                            }`}
                                        >
                                            <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${accent.soft} ${accent.text}`}>
                                                <LayoutGrid className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-md truncate">{board.title}</p>
                                                <p className={`text-xs truncate ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                                    {board.description || "No description yet."}
                                                </p>
                                            </div>
                                            {board.isFavorite && (
                                                <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-amber-400" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Boards header row */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">
                            {currentSection.title}
                            {boards.length > 0 && (
                                <span className={`ml-2 text-md font-normal ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                    ({filteredBoards.length})
                                </span>
                            )}
                        </h2>
                        {currentSection.showCreate && (
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-md text-md font-medium cursor-pointer transition-colors shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleBoardModal}
                            >
                                <Plus className="w-4 h-4" />
                                Create Board
                            </button>
                        )}
                    </div>
                    

                    {filteredBoards.length === 0 && boards.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center ${
                            isDark ? "border-neutral-800" : "border-neutral-200"
                        }`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                isDark ? "bg-neutral-900 text-neutral-500" : "bg-neutral-100 text-neutral-400"
                            }`}>
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-md font-medium">No boards yet</p>
                                <p className={`text-xs mt-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                    {currentSection.emptyText}
                                </p>
                            </div>
                            {currentSection.showCreate && (
                                <button
                                    onClick={handleBoardModal}
                                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-md text-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Board
                                </button>
                            )}
                        </div>
                    ) : filteredBoards.length === 0 ? (
                        <div className={`text-md rounded-md border border-dashed p-8 text-center ${
                            isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200 text-neutral-400"
                        }`}>
                            No boards match "{searchBoard}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {filteredBoards.map((board) => {
                                const accent = getAccent(board);
                                const memberCount = Array.isArray(board?.members) ? board.members.length : null;

                                return (
                                    <div
                                        key={board.id}
                                        onClick={() => navigate(`/kanban/board/${board.id}`)}
                                        className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
                                            isDark
                                                ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600"
                                                : "bg-white border-neutral-200 hover:border-neutral-300"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.soft} ${accent.text}`}>
                                                <LayoutGrid className="w-5 h-5" />
                                            </div>

                                            <div className="flex items-center gap-1">

                                                {/* Favorite Button on each board */}
                                                <button
                                                    onClick={(e) => handleToggleFavorite(e, board)}
                                                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                                                        isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-100"
                                                    }`}
                                                    title={board.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <Star
                                                        className={`w-4 h-4 transition-colors ${
                                                            board.isFavorite
                                                                ? "fill-amber-400 text-amber-400"
                                                                : isDark ? "text-neutral-500" : "text-neutral-400"
                                                        }`}
                                                    />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => toggleCardMenu(e, board.id)}
                                                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                                                            isDark
                                                                ? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                                                                : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                                                        }`}
                                                        title="Board options"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {menuOpenFor === board.id && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-lg py-1 z-20 ${
                                                                isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={(e) => openEditMembersModal(e, board)}
                                                                className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${
                                                                    isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"
                                                                }`}
                                                            >
                                                                <UserPlus className="w-3.5 h-3.5" /> Edit Members
                                                            </button>
                                                            <button
                                                                onClick={(e) => openEditBoardModal(e, board)}
                                                                className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${
                                                                    isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"
                                                                }`}
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" /> Edit Board Details
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpenFor(null);
                                                                    navigate(`/kanban/board/${board.id}`);
                                                                }}
                                                                className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${
                                                                    isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"
                                                                }`}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View Board
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleToggleArchive(e, board)}
                                                                className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${
                                                                    isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"
                                                                }`}
                                                            >
                                                                {activeMenu === "archived" ? (
                                                                    <>
                                                                        <ArchiveRestore className="w-3.5 h-3.5" /> Unarchive
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Archive className="w-3.5 h-3.5" /> Archive Board
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpenFor(null);
                                                                    openDeleteBoardModal(board);
                                                                }}
                                                                className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${
                                                                    isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                                                                }`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete Board
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="font-semibold text-base truncate mb-1">{board.title}</p>
                                        <p className={`text-md line-clamp-2 min-h-[2.5rem] ${
                                            isDark ? "text-neutral-400" : "text-neutral-500"
                                        }`}>
                                            {board.description || "No description yet."}
                                        </p>

                                            <div className={`mt-4 pt-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                                                {memberCount ? (
                                                    <>
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                                                            <span className={`text-xs font-semibold uppercase tracking-wide ${
                                                                isDark ? "text-neutral-500" : "text-neutral-400"
                                                            }`}>
                                                                Members
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-1.5">
                                                            {(expandedBoards[board.id] ? board.members : board.members.slice(0, 2)).map((member, idx) => (
                                                                <div key={member.id ?? idx} className="flex items-center justify-between gap-2 text-xs">
                                                                    <span className={`truncate ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                                                        {getMemberName(member)}
                                                                    </span>
                                                                    <span className={`shrink-0 font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                                                        {getMemberRole(member)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {memberCount > 2 && (
                                                            <button
                                                                onClick={(e) => toggleBoardExpand(e, board.id)}
                                                                className={`mt-2 cursor-pointer text-xs font-medium hover:underline ${accent.text}`}
                                                            >
                                                                {expandedBoards[board.id] ? "View Less" : `View More (${memberCount - 2})`}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${accent.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${accent.bg}`} />
                                                        Board
                                                    </span>
                                                )}
                                            </div>
                                    </div>
                                );
                            })}

                            {/* Ghost tile, quick way to create a board without scrolling back to the header */}
                            {currentSection.showCreate && (
                            <button
                                onClick={handleBoardModal}
                                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-5 min-h-[168px] transition-colors cursor-pointer ${
                                    isDark
                                        ? "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
                                        : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
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

            {/* Board Modal */}
            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleBoardModal}
                >
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-2xl mx-4 border flex flex-col ${
                            isDark
                                ? "bg-neutral-900 border-neutral-700 text-white"
                                : "bg-white border-neutral-200 text-neutral-900"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className={`flex items-center justify-between px-8 py-5 border-b ${
                            isDark ? "border-neutral-800" : "border-neutral-100"
                        }`}>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold">
                                    {step === "first" ? "Create Board" : "Invite Members"}
                                </h2>
                                <div className="flex items-center gap-1.5">
                                    <span className={`h-1.5 w-6 rounded-full ${
                                        step === "first" ? "bg-blue-600" : (isDark ? "bg-neutral-700" : "bg-neutral-200")
                                    }`} />
                                    <span className={`h-1.5 w-6 rounded-full ${
                                        step === "second" ? "bg-blue-600" : (isDark ? "bg-neutral-700" : "bg-neutral-200")
                                    }`} />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setBoardDTO({
                                        title: "",
                                        description: "",
                                    });
                                    handleBoardModal();
                                    setErrors({});
                                    setStep("first")
                                }}
                                className={`p-1.5 rounded-md transition-colors ${
                                    isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"
                                }`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-8 py-6">
                            {step === "first" ? (
                                <div className="flex flex-col gap-5">

                                    {/* Title Field */}
                                    <div>
                                        <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                                            Title
                                        </label>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 transition-colors ${
                                                isDark
                                                    ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500"
                                                    : "bg-neutral-50 border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                                            } ${errors.title ? "border-red-500" : ""} `}
                                            value={boardDTO.title}
                                            onChange={(e) => setBoardDTO((prev) => ({ ...prev, title: e.target.value }))}
                                            placeholder="Enter Board Title"
                                        />
                                        {errors.title && (<p className="text-red-500 mt-1">{errors.title} </p>)}
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                        <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                                            Description
                                        </label>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 transition-colors ${
                                                isDark
                                                    ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500"
                                                    : "bg-neutral-50 border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                                            } ${errors.description ? "border-red-500" : ""} `}
                                            value={boardDTO.description}
                                            onChange={(e) => setBoardDTO((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Enter Board Description"
                                        />
                                        {errors.description && (<p className="text-red-500 mt-1">{errors.description}</p>)}
                                    </div>

                                </div>
                            ) : 
                                (
                                    <div className="flex flex-col gap-5">

                                        {/* Search field */}
                                        <div>
                                            <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                                                Add people to this board
                                            </label>
                                            <Select
                                                options={userOptions}
                                                onInputChange={(value) => {
                                                    handleFetchUsers(value);
                                                    return value;
                                                }}
                                                onChange={(selectedOption) => {
                                                    const existing = membersList.find(member => member.value === selectedOption.value);
                                                    if (existing) {
                                                        console.log("Member already in list")
                                                        return;
                                                    }
                                                    setMembersList((prev) => [...prev, {...selectedOption, role: "MEMBER"}])
                                                }}
                                                placeholder="Search by name or email"
                                                styles={selectStyles}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>

                                        {/* Selected members list */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                                                <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                                                    isDark ? "text-neutral-500" : "text-neutral-400"
                                                }`}>
                                                    Members {membersList.length > 0 && `(${membersList.length})`}
                                                </h3>
                                            </div>

                                            {membersList.length === 0 ? (
                                                <div className={`text-xs rounded-lg border border-dashed py-4 text-center ${
                                                    isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200 text-neutral-400"
                                                }`}>
                                                    No members added yet
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {membersList.map((member) => (
                                                        <div
                                                            key={member.value}
                                                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                                                                isDark
                                                                    ? "bg-neutral-800/60 border-neutral-700"
                                                                    : "bg-neutral-50 border-neutral-200"
                                                            }`}
                                                        >
                                                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                                                isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                                            }`}>
                                                                {(member.label || "?").charAt(0).toUpperCase()}
                                                            </div>

                                                            <p className="flex-1 text-md truncate">{member.label}</p>

                                                            <div className="w-36 shrink-0">
                                                                <Select
                                                                    options={roleOptions}
                                                                    value={roleOptions.find(opt => opt.value === member.role)}
                                                                    onChange={(selectedRole) => handleRoleChange(member.value, selectedRole.value)}
                                                                    styles={selectStyles}
                                                                    menuPortalTarget={document.body}
                                                                    menuPlacement="auto"
                                                                />
                                                            </div>

                                                            <button
                                                                onClick={() =>
                                                                    setMembersList(prev => prev.filter(m => m.value !== member.value))
                                                                }
                                                                className={`shrink-0 p-2 rounded-md transition-colors ${
                                                                    isDark
                                                                        ? "text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                                                                        : "text-neutral-400 hover:bg-red-50 hover:text-red-500"
                                                                }`}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )
                            }
                        </div>

                        {/* Modal footer */}
                        <div className={`flex justify-end gap-2 px-8 py-5 border-t ${
                            isDark ? "border-neutral-800" : "border-neutral-100"
                        }`}>
                            {step === "first" ? 
                                (
                                    <>
                                        <button
                                            className={`px-4 py-2 text-md rounded-md cursor-pointer transition-colors ${
                                                isDark
                                                    ? "text-neutral-300 hover:bg-neutral-800"
                                                    : "text-neutral-600 hover:bg-neutral-100"
                                            }`}
                                            onClick={handleBoardModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-sm"
                                            onClick={() => {
                                                if (validateFirstSec()) {
                                                    setStep("second");
                                                }
                                            }}
                                        >
                                            Next
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className={`px-4 py-2 text-md rounded-md cursor-pointer transition-colors ${
                                                isDark
                                                    ? "text-neutral-300 hover:bg-neutral-800"
                                                    : "text-neutral-600 hover:bg-neutral-100"
                                            }`}
                                            onClick={() => setStep("first")}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-sm"
                                            onClick={handleCreateBoard}
                                        >
                                            Create
                                        </button>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Board Confirmation Modal */}
            {deleteBoardModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={closeDeleteBoardModal}
                >
                    <div
                        className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border ${
                            isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold">Delete Board</h3>
                        <p className={`mt-2 text-md ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                            Are you sure you want to delete "{deleteBoardTarget?.title}"? This will permanently remove the board and everything in it.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={closeDeleteBoardModal}
                                disabled={deletingBoard}
                                className={`flex-1 rounded-md border px-4 py-2 text-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                                    isDark
                                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBoard}
                                disabled={deletingBoard}
                                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {deletingBoard && (
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                )}
                                {deletingBoard ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Board Details Modal */}
            {editBoardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeEditBoardModal}>
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-md mx-4 border ${
                            isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                            <h2 className="text-lg font-semibold">Edit Board Details</h2>
                            <button onClick={closeEditBoardModal} className={`p-1.5 rounded-md ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-4">
                            <div>
                                <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Title</label>
                                <input
                                    className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 ${
                                        isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500"
                                    } ${editErrors.title ? "border-red-500" : ""}`}
                                    value={editBoardDTO.title}
                                    onChange={(e) => setEditBoardDTO((prev) => ({ ...prev, title: e.target.value }))}
                                />
                                {editErrors.title && <p className="text-red-500 mt-1">{editErrors.title}</p>}
                            </div>
                            <div>
                                <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Description</label>
                                <input
                                    className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 ${
                                        isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500"
                                    } ${editErrors.description ? "border-red-500" : ""}`}
                                    value={editBoardDTO.description}
                                    onChange={(e) => setEditBoardDTO((prev) => ({ ...prev, description: e.target.value }))}
                                />
                                {editErrors.description && <p className="text-red-500 mt-1">{editErrors.description}</p>}
                            </div>
                        </div>
                        <div className={`flex justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                            <button onClick={closeEditBoardModal} className={`px-4 py-2 text-md rounded-md ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>
                                Cancel
                            </button>
                            <button onClick={handleUpdateBoard} className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Members Modal */}
            {editMembersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeAddMembersModal}>
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 border ${
                            isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                            <h2 className="text-lg font-semibold">Add or remove members from "{editMembersTarget?.title}"</h2>
                            <button onClick={closeAddMembersModal} className={`p-1.5 rounded-md ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-4">
                            <Select
                                options={userOptions}
                                onInputChange={(value) => {
                                    handleFetchUsers(value);
                                    return value;
                                }}
                                onChange={(selectedOption) => {
                                    if (editMembersList.find((m) => m.value === selectedOption.value)) return;
                                    setEditMembersList((prev) => [...prev, { ...selectedOption, role: "MEMBER" }]);
                                }}
                                placeholder="Search by name or email"
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                            />
                            <div className="flex flex-col gap-2">
                                {editMembersList.map((member) => (
                                    <div key={member.value} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${isDark ? "bg-neutral-800/60 border-neutral-700" : "bg-neutral-50 border-neutral-200"}`}>
                                        <p className="flex-1 text-md truncate">{member.label}</p>
                                        <div className="w-36 shrink-0">
                                            <Select
                                                options={roleOptions}
                                                value={roleOptions.find((opt) => opt.value === member.role)}
                                                onChange={(selectedRole) => handleEditMembersRoleChange(member.value, selectedRole.value)}
                                                styles={selectStyles}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                        <button
                                            // onClick={() => setEditMembersList((prev) => prev.filter((m) => m.value !== member.value))}
                                            onClick={() => handleRemoveFromEditList(member)}
                                            className={`shrink-0 p-2 rounded-md ${isDark ? "text-neutral-500 hover:bg-red-500/10 hover:text-red-400" : "text-neutral-400 hover:bg-red-50 hover:text-red-500"}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`flex justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                            <button onClick={closeAddMembersModal} className={`px-4 py-2 cursor-pointer text-md rounded-md ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>
                                Cancel
                            </button>
                            <button onClick={handleSubmitEditMembers} className="px-4 py-2 cursor-pointer text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                                Add Members
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MyBoards;