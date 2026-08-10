import AsyncSelect from "react-select/async";
import Select from "react-select";
import { getUserRoleOnBoard } from "../../utils/boardHelpers";
import { useAuth } from "../context/AuthContext";

const taskStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
];

const TaskModal = ({
    isEditMode,
    formData,
    setFormData,
    errors,
    selectedUser,
    setSelectedUser,
    loadUserOptions,
    onSubmit,
    onClose,
    isDark,
    currentUserRole,
}) => {
    const selectClassNames = {
        control: () =>
            `!rounded-md !text-md ${
                isDark
                    ? "!bg-neutral-800 !border-neutral-700"
                    : "!border-slate-300"
            }`,
        menu: () => (isDark ? "!bg-neutral-800 !border !border-neutral-700" : ""),
        option: ({ isFocused }) =>
            isDark
                ? `${isFocused ? "!bg-neutral-700" : "!bg-neutral-800"} !text-white`
                : "",
        singleValue: () => (isDark ? "!text-white" : ""),
        input: () => (isDark ? "!text-white" : ""),
        placeholder: () => (isDark ? "!text-white/30" : ""),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? "bg-neutral-900" : "bg-white"}`}>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                        {isEditMode ? "Update Task" : "Add Task"}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`rounded-md p-1 transition-colors ${
                            isDark ? "text-white/40 hover:bg-white/10 hover:text-white/70" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        }`}
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className={`text-xs font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>Title</label>
                        <input
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            className={`rounded-md border px-3 py-1.5 text-md outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                                isDark ? "bg-neutral-800 text-white placeholder:text-white/30" : "text-slate-700"
                            } ${errors.title ? "border-red-500" : (isDark ? "border-neutral-700" : "border-slate-300")}`}
                        />
                        {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={`text-xs font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>Content</label>
                        <input
                            value={formData.content}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                            className={`rounded-md border px-3 py-1.5 text-md outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                                isDark ? "bg-neutral-800 text-white placeholder:text-white/30" : "text-slate-700"
                            } ${errors.content ? "border-red-500" : (isDark ? "border-neutral-700" : "border-slate-300")}`}
                        />
                        {errors.content && <p className="text-red-500 mt-1">{errors.content}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={`text-xs font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>Status</label>
                        <Select
                            options={taskStatusOptions}
                            value={taskStatusOptions.find((option) => option.value === formData.status)}
                            onChange={(selectedOption) => setFormData((prev) => ({ ...prev, status: selectedOption.value }))}
                            classNames={selectClassNames}
                        />
                        {errors.status && <p className="text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    {currentUserRole !== "MEMBER" && (
                        <div className="flex flex-col gap-1">
                            <label className={`text-xs font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>Assign user (optional)</label>
                            <AsyncSelect
                                cacheOptions
                                isClearable
                                defaultOptions={false}
                                value={selectedUser}
                                loadOptions={loadUserOptions}
                                onChange={(option) => setSelectedUser(option)}
                                placeholder="Search by name or email..."
                                noOptionsMessage={({ inputValue }) =>
                                    inputValue ? "No users found" : "Type to search users"
                                }
                                classNames={selectClassNames}
                            />
                            <p className={`text-[11px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
                                You can leave this empty and assign someone later from update.
                            </p>
                        </div>
                    )}

                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={onSubmit}
                            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-emerald-700 cursor-pointer"
                        >
                            {isEditMode ? "Update Task" : "Create Task"}
                        </button>
                        <button
                            onClick={onClose}
                            className={`flex-1 rounded-md border px-4 py-2 text-md font-medium transition-colors cursor-pointer ${
                                isDark ? "border-neutral-700 text-white/60 hover:bg-white/5" : "border-slate-300 text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;