import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import { addBoardMember, removeBoardMember, getUsersOnSearch } from "../../apis/apis";
import { getSelectStyles, roleOptions } from "../../utils/boardHelpers";

const EditMembersModal = ({ board, isDark, onClose, onMembersUpdated }) => {
    const [userOptions, setUserOptions] = useState([]);
    const [membersList, setMembersList] = useState(
        (board.members || []).map((m) => ({
            value: m.emailId,
            label: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
            role: m.role,
            isExisting: true,
            memberId: m.id,
        }))
    );
    const selectStyles = getSelectStyles(isDark);

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

    const handleRemove = async (member) => {
        if (member.isExisting) {
            try {
                await removeBoardMember(board.id, member.value);
                toast.success("Member removed.");
            } catch (err) {
                toast.error(err.message || "Failed to remove member.");
                return;
            }
        }
        setMembersList((prev) => prev.filter((m) => m.value !== member.value));
    };

    const handleSubmit = async () => {
        const newMembers = membersList.filter((m) => !m.isExisting);
        try {
            if (newMembers.length > 0) {
                await Promise.all(newMembers.map((m) => addBoardMember(board.id, m.value, m.role).catch((err) => console.log(err))));
            }
            toast.success("Members updated.");
            onMembersUpdated();
            onClose();
        } catch (err) {
            console.log(err);
            toast.error(err.message || "Failed to update members.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 border ${isDark ? "bg-neutral-900 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"}`} onClick={(e) => e.stopPropagation()}>
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    <h2 className="text-lg font-semibold">Add or remove members from "{board?.title}"</h2>
                    <button onClick={onClose} className={`p-1.5 rounded-md ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
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
                    <div className="flex flex-col gap-2">
                        {membersList.map((member) => (
                            <div key={member.value} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${isDark ? "bg-neutral-800/60 border-neutral-700" : "bg-neutral-50 border-neutral-200"}`}>
                                <p className="flex-1 text-md truncate">{member.label}</p>
                                <div className="w-36 shrink-0">
                                    <Select
                                        options={roleOptions}
                                        value={roleOptions.find((opt) => opt.value === member.role)}
                                        onChange={(selectedRole) => handleRoleChange(member.value, selectedRole.value)}
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                                <button onClick={() => handleRemove(member)} className={`shrink-0 p-2 rounded-md ${isDark ? "text-neutral-500 hover:bg-red-500/10 hover:text-red-400" : "text-neutral-400 hover:bg-red-50 hover:text-red-500"}`}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`flex justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                    <button onClick={onClose} className={`px-4 py-2 cursor-pointer text-md rounded-md ${isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}>Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 cursor-pointer text-md rounded-md bg-blue-600 hover:bg-blue-700 text-white">Save Members</button>
                </div>
            </div>
        </div>
    );
};

export default EditMembersModal;