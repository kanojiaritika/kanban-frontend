import { LayoutGrid, Star, MoreVertical, UserPlus, Pencil, Eye, Archive, ArchiveRestore, Trash2, Users } from "lucide-react";
import { getAccent, getCurrentUserRole, getMemberName, getMemberRole, getUserRoleOnBoard } from "../../utils/boardHelpers";

const BoardCard = ({
    board,
    isDark,
    activeMenu,
    isMenuOpen,
    isExpanded,
    currentUserEmail,
    onNavigate,
    onToggleFavorite,
    onToggleMenu,
    onCloseMenu,
    onEditMembers,
    onEditBoard,
    onToggleArchive,
    onDeleteBoard,
    onToggleExpand,
}) => {
    const accent = getAccent(board);
    const memberCount = Array.isArray(board?.members) ? board.members.length : null;
    const isOwner = getCurrentUserRole(board) === "OWNER";

    return (
        <div
            onClick={() => onNavigate(board.id)}
            className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
                isDark ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600" : "bg-white border-neutral-200 hover:border-neutral-300"
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.soft} ${accent.text}`}>
                    <LayoutGrid className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => onToggleFavorite(e, board)}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors duration-300 ease-in-out ${isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
                        title={board.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className={`w-4 h-4 transition-colors duration-300 ease-in-out ${board.isFavorite ? "fill-amber-400 text-amber-400" : isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={(e) => onToggleMenu(e, board.id)}
                            className={`p-1.5 rounded-md cursor-pointer transition-colors duration-300 ease-in-out ${
                                isDark ? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                            }`}
                            title="Board options"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-lg py-1 z-20 ${
                                    isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
                                }`}
                            >
                                {/* Owner-only actions */}
                                {isOwner && (
                                    <button
                                        onClick={(e) => onEditMembers(e, board)}
                                        className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"}`}
                                    >
                                        <UserPlus className="w-3.5 h-3.5" /> Edit Members
                                    </button>
                                )}

                                <button
                                    onClick={(e) => onEditBoard(e, board)}
                                    className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"}`}
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit Board Details
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onCloseMenu(); onNavigate(board.id); }}
                                    className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"}`}
                                >
                                    <Eye className="w-3.5 h-3.5" /> View Board
                                </button>

                                <button
                                    onClick={(e) => onToggleArchive(e, board)}
                                    className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-50"}`}
                                >
                                    {activeMenu === "archived" ? (
                                        <><ArchiveRestore className="w-3.5 h-3.5" /> Unarchive</>
                                    ) : (
                                        <><Archive className="w-3.5 h-3.5" /> Archive Board</>
                                    )}
                                </button>

                                {isOwner && (
                                    <button
                                        onClick={(e) => onDeleteBoard(e, board)}
                                        className={`w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-md text-left ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Board
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="font-semibold text-base truncate mb-1">{board.title}</p>
            <p className={`text-md line-clamp-2 min-h-[2.5rem] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {board.description || "No description yet."}
            </p>

            <div className={`mt-4 pt-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                {memberCount ? (
                    <>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>Members</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {(isExpanded ? board.members : board.members.slice(0, 2)).map((member, idx) => (
                                <div key={member.id ?? idx} className="flex items-center justify-between gap-2 text-xs">
                                    <span className={`truncate ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>{getMemberName(member)}</span>
                                    <span className={`shrink-0 font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{getMemberRole(member)}</span>
                                </div>
                            ))}
                        </div>
                        {memberCount > 2 && (
                            <button onClick={(e) => onToggleExpand(e, board.id)} className={`mt-2 cursor-pointer text-xs font-medium hover:underline ${accent.text}`}>
                                {isExpanded ? "View Less" : `View More (${memberCount - 2})`}
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
};

export default BoardCard;