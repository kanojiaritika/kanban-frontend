import { useState } from "react";
import toast from "react-hot-toast";
import { deleteBoard } from "../../apis/apis";

const DeleteBoardModal = ({ board, isDark, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteBoard(board.id);
            toast.success("Board deleted successfully!");
            onDeleted(board.id);
            onClose();
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board deletion failed.");
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => { if (!deleting) onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleClose}>
            <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border ${isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"}`} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-base font-semibold">Delete Board</h3>
                <p className={`mt-2 text-md ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Are you sure you want to delete "{board?.title}"? This will permanently remove the board and everything in it.
                </p>
                <div className="mt-5 flex gap-2">
                    <button onClick={handleClose} disabled={deleting} className={`flex-1 rounded-md border px-4 py-2 text-md font-medium transition-colors duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed ${isDark ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800" : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"}`}>Cancel</button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors duration-300 ease-in-out hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                        {deleting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteBoardModal;