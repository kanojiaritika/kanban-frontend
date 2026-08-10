import { Clock, LayoutGrid, Star } from "lucide-react";
import { getAccent } from "../../utils/boardHelpers";

const RecentlyOpenedSection = ({ recentBoards, isDark, onNavigate }) => {
    if (!recentBoards || recentBoards.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-1.5 mb-3">
                <Clock className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                <h2 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>Recently Opened</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBoards.map((board) => {
                    const accent = getAccent(board);
                    return (
                        <div
                            key={board.id}
                            onClick={() => onNavigate(board.id)}
                            className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                isDark ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600" : "bg-white border-neutral-200 hover:border-neutral-300"
                            }`}
                        >
                            <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${accent.soft} ${accent.text}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-md truncate">{board.title}</p>
                                <p className={`text-xs truncate ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{board.description || "No description yet."}</p>
                            </div>
                            {board.isFavorite && <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentlyOpenedSection;