import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { updateBoard } from "../../apis/apis";

const EditBoardModal = ({ board, isDark, onClose, onUpdated }) => {
    const [editBoardDTO, setEditBoardDTO] = useState({ title: board.title, description: board.description });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!editBoardDTO.title?.trim()) newErrors.title = "Enter title";
        if (!editBoardDTO.description?.trim()) newErrors.description = "Enter description";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        try {
            const updated = await updateBoard(board.id, editBoardDTO);
            toast.success("Board updated successfully!");
            onUpdated(board.id, updated);
            onClose();
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board update failed.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className={`rounded-xl shadow-2xl w-full max-w-md mx-4 border ${isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"}`} onClick={(e) => e.stopPropagation()}>
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    <h2 className="text-lg font-semibold">Edit Board Details</h2>
                    <button onClick={onClose} className={`p-1.5 rounded-md ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                    <div>
                        <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Title</label>
                        <input
                            className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 ${isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500"} ${errors.title ? "border-red-500" : ""}`}
                            value={editBoardDTO.title}
                            onChange={(e) => setEditBoardDTO((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Description</label>
                        <input
                            className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 ${isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500"} ${errors.description ? "border-red-500" : ""}`}
                            value={editBoardDTO.description}
                            onChange={(e) => setEditBoardDTO((prev) => ({ ...prev, description: e.target.value }))}
                        />
                        {errors.description && <p className="text-red-500 mt-1">{errors.description}</p>}
                    </div>
                </div>
                <div className={`flex justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    <button onClick={onClose} className={`px-4 py-2 text-md rounded-md ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>Cancel</button>
                    <button onClick={handleUpdate} className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditBoardModal;