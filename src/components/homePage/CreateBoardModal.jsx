import { useState } from "react";
import { X, Users, Trash2 } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import { createBoard, addBoardMember, getUsersOnSearch } from "../../apis/apis";
import { getSelectStyles, roleOptions } from "../../utils/boardHelpers";

const emptyBoard = { title: "", description: "" };

const CreateBoardModal = ({ isDark, onClose, onCreated }) => {
    const [step, setStep] = useState("first");
    const [boardDTO, setBoardDTO] = useState(emptyBoard);
    const [errors, setErrors] = useState({});
    const [userOptions, setUserOptions] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const selectStyles = getSelectStyles(isDark);

    const validateFirstSec = () => {
        const newErrors = {};
        if (!boardDTO.title?.trim()) newErrors.title = "Enter title";
        if (!boardDTO.description?.trim()) newErrors.description = "Enter description";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFetchUsers = async (value) => {
        try {
            const response = await getUsersOnSearch(value);
            setUserOptions(response.map((u) => ({ ...u, value: String(u.emailId ?? ""), label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() })));
        } catch (err) {
            console.log(err);
        }
    };

    const handleRoleChange = (memberValue, newRole) => {
        setMembersList((prev) => prev.map((m) => (m.value === memberValue ? { ...m, role: newRole } : m)));
    };

    const handleCreateBoard = async () => {
        try {
            const created = await createBoard(boardDTO);
            await Promise.all(membersList.map((m) => addBoardMember(created.id, m.value, m.role).catch((err) => console.log(err))));
            toast.success("Board created successfully!");
            onCreated(created);
            onClose();
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Board creation failed.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className={`rounded-xl shadow-2xl w-full max-w-2xl mx-4 border flex flex-col ${isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">{step === "first" ? "Create Board" : "Invite Members"}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-6 rounded-full ${step === "first" ? "bg-blue-600" : (isDark ? "bg-neutral-700" : "bg-neutral-200")}`} />
                            <span className={`h-1.5 w-6 rounded-full ${step === "second" ? "bg-blue-600" : (isDark ? "bg-neutral-700" : "bg-neutral-200")}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-md transition-colors duration-300 ease-in-out ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-8 py-6">
                    {step === "first" ? (
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Title</label>
                                <input
                                    className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out ${
                                        isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                                    } ${errors.title ? "border-red-500" : ""}`}
                                    value={boardDTO.title}
                                    onChange={(e) => setBoardDTO((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter Board Title"
                                />
                                {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Description</label>
                                <input
                                    className={`w-full rounded-lg border px-3 py-2.5 text-md focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out ${
                                        isDark ? "bg-neutral-800 border-neutral-700 focus:ring-blue-600 placeholder:text-neutral-500" : "bg-neutral-50 border-neutral-200 focus:ring-blue-500 placeholder:text-neutral-400"
                                    } ${errors.description ? "border-red-500" : ""}`}
                                    value={boardDTO.description}
                                    onChange={(e) => setBoardDTO((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter Board Description"
                                />
                                {errors.description && <p className="text-red-500 mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className={`block text-md font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>Add people to this board</label>
                                <Select
                                    options={userOptions}
                                    onInputChange={(value) => { handleFetchUsers(value); return value; }}
                                    onChange={(selectedOption) => {
                                        if (membersList.find((m) => m.value === selectedOption.value)) return;
                                        setMembersList((prev) => [...prev, { ...selectedOption, role: "MEMBER" }]);
                                    }}
                                    placeholder="Search by name or email"
                                    styles={selectStyles}
                                    menuPortalTarget={document.body}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                                        Members {membersList.length > 0 && `(${membersList.length})`}
                                    </h3>
                                </div>
                                {membersList.length === 0 ? (
                                    <div className={`text-xs rounded-lg border border-dashed py-4 text-center ${isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200 text-neutral-400"}`}>
                                        No members added yet
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {membersList.map((member) => (
                                            <div key={member.value} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${isDark ? "bg-neutral-800/60 border-neutral-700" : "bg-neutral-50 border-neutral-200"}`}>
                                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                                                    {(member.label || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <p className="flex-1 text-md truncate">{member.label}</p>
                                                <div className="w-36 shrink-0">
                                                    <Select
                                                        options={roleOptions}
                                                        value={roleOptions.find((opt) => opt.value === member.role)}
                                                        onChange={(selectedRole) => handleRoleChange(member.value, selectedRole.value)}
                                                        styles={selectStyles}
                                                        menuPortalTarget={document.body}
                                                        menuPlacement="auto"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setMembersList((prev) => prev.filter((m) => m.value !== member.value))}
                                                    className={`shrink-0 p-2 rounded-md transition-colors duration-300 ease-in-out ${isDark ? "text-neutral-500 hover:bg-red-500/10 hover:text-red-400" : "text-neutral-400 hover:bg-red-50 hover:text-red-500"}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex justify-end gap-2 px-8 py-5 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    {step === "first" ? (
                        <>
                            <button onClick={onClose} className={`px-4 py-2 text-md rounded-md cursor-pointer transition-colors duration-300 ease-in-out ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>Cancel</button>
                            <button className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-300 ease-in-out shadow-sm" onClick={() => { if (validateFirstSec()) setStep("second"); }}>Next</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setStep("first")} className={`px-4 py-2 text-md rounded-md cursor-pointer transition-colors duration-300 ease-in-out ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>Back</button>
                            <button onClick={handleCreateBoard} className="px-4 py-2 text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-300 ease-in-out shadow-sm">Create</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBoardModal;