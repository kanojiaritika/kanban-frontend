import { useEffect, useState, useCallback } from "react";
import {
    createTask,
    fetchAllTasksForCol,
    updateTask,
    deleteTask,
    getUsersOnSearch,
    assignTaskUser,
    removeTaskAssignee,
} from "../../apis/apis";
import { Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import TaskModal from "./TaskModal";

const emptyForm = {
    title: "",
    content: "",
    status: "",
};

const columnAccents = [
    { header: "bg-indigo-600", body: "bg-indigo-50/50", border: "border-indigo-100" },
    { header: "bg-emerald-600", body: "bg-emerald-50/50", border: "border-emerald-100" },
    { header: "bg-amber-600", body: "bg-amber-50/50", border: "border-amber-100" },
    { header: "bg-rose-600", body: "bg-rose-50/50", border: "border-rose-100" },
    { header: "bg-sky-600", body: "bg-sky-50/50", border: "border-sky-100" },
    { header: "bg-violet-600", body: "bg-violet-50/50", border: "border-violet-100" },
];

const getColumnAccent = (column) => {
    const key = String(column?.id ?? column?.name ?? "");
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return columnAccents[Math.abs(hash) % columnAccents.length];
};

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
};

const statusStyles = {
    PENDING: {
        label: "Pending",
        badge: "bg-amber-100 text-amber-700",
        badgeDark: "bg-amber-500/15 text-amber-400",
        dot: "bg-amber-500",
    },
    IN_PROGRESS: {
        label: "In Progress",
        badge: "bg-orange-100 text-orange-700",
        badgeDark: "bg-orange-500/15 text-orange-400",
        dot: "bg-orange-500",
    },
    COMPLETED: {
        label: "Completed",
        badge: "bg-emerald-100 text-emerald-700",
        badgeDark: "bg-emerald-500/15 text-emerald-400",
        dot: "bg-emerald-500",
    },
};

const getStatusStyle = (status) =>
    statusStyles[status] || {
        label: status || "Unknown",
        badge: "bg-slate-100 text-slate-600",
        badgeDark: "bg-white/10 text-white/50",
        dot: "bg-slate-400",
    };

const Columns = ({ column, onDelete, theme, tasks, refetchTasks, currentUserRole }) => {
    const [formData, setFormData] = useState(emptyForm);
    // const [tasks, setTasks] = useState([]);
    const [addTaskClick, setAddTaskClick] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [deleteColModal, setDeleteColModal] = useState(false);
    const [errors, setErrors] = useState({});

    const [selectedUser, setSelectedUser] = useState(null);
    const [initialAssigneeEmail, setInitialAssigneeEmail] = useState(null);

    const isEditMode = selectedTask !== null;
    const accent = getColumnAccent(column);
    const isDark = theme === "dark";

    const loadUserOptions = useCallback(async (inputValue) => {
        if (!inputValue || !inputValue.trim()) return [];
        try {
            const response = await getUsersOnSearch(inputValue);
            const users = response?.data ?? response ?? [];
            return users.map((u) => ({
                value: u.emailId,
                label: u.name ? `${u.name} (${u.emailId})` : u.emailId,
            }));
        } catch (err) {
            console.log(err);
            return [];
        }
    }, []);

    const handleCreateTask = async () => {
        if (!validateTaskForm()) return;
        try {
            const created = await createTask(column?.id, formData);
            if (selectedUser) {
                try {
                    await assignTaskUser(created.id, selectedUser.value);
                } catch (err) {
                    console.log(err);
                    toast.error("Task created, but assigning the user failed");
                }
            }
            setAddTaskClick(false);
            // handleFetchAllTasks();
            refetchTasks();
            toast.success("Task created successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error creating task");
        }
    };

    const handleUpdateTask = async () => {
        if (!validateTaskForm()) return;
        try {
            await updateTask(selectedTask.id, formData);

            const newEmail = selectedUser?.value ?? null;
            if (newEmail !== initialAssigneeEmail) {
                try {
                    if (newEmail) {
                        await assignTaskUser(selectedTask.id, newEmail);
                    } else if (initialAssigneeEmail) {
                        await removeTaskAssignee(selectedTask.id, initialAssigneeEmail);
                    }
                } catch (err) {
                    console.log(err);
                    toast.error("Assigning Failed");
                }
            }

            // handleFetchAllTasks();
            refetchTasks();
            setAddTaskClick(false);
            toast.success("Task updated successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error updating task");
        }
    };

    // const handleFetchAllTasks = async () => {
    //     try {
    //         const res = await fetchAllTasksForCol(column?.id);
    //         setTasks(res);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    const handleDeleteTask = async () => {
        try {
            await deleteTask(deleteTaskId);
            // handleFetchAllTasks();
            refetchTasks();
            setDeleteTaskModal(false);
            setDeleteTaskId(null);
            toast.success("Task deleted successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error deleting task");
        }
    };

    const handleQuickUnassign = async (task, e) => {
        e.stopPropagation();
        const email = task.userDTO?.emailId;
        if (!email) return;
        try {
            await removeTaskAssignee(task.id, email);
            // handleFetchAllTasks();
            refetchTasks();
            toast.success("User unassigned");
        } catch (err) {
            console.log(err);
            toast.error("Error unassigning user");
        }
    };

    const handleDeleteColumn = () => {
        onDelete?.(column?.id);
        setDeleteColModal(false);
    };

    // useEffect(() => {
    //     handleFetchAllTasks();
    // }, []);

    const handleOpenCreate = () => {
        setSelectedTask(null);
        setFormData(emptyForm);
        setSelectedUser(null);
        setInitialAssigneeEmail(null);
        setAddTaskClick(true);
    };

    const handleOpenUpdate = (task) => {
        setSelectedTask(task);
        setFormData({
            title: task.title ?? "",
            content: task.content ?? "",
            status: task.status ?? "",
        });
        const assignee = task.userDTO;
        if (assignee?.emailId) {
            setSelectedUser({
                value: assignee.emailId,
                label: assignee.name ? `${assignee.name} (${assignee.emailId})` : assignee.emailId,
            });
            setInitialAssigneeEmail(assignee.emailId);
        } else {
            setSelectedUser(null);
            setInitialAssigneeEmail(null);
        }
        setAddTaskClick(true);
    };

    const handleCloseModal = () => {
        setAddTaskClick(false);
        setSelectedTask(null);
        setFormData(emptyForm);
        setSelectedUser(null);
        setInitialAssigneeEmail(null);
        setErrors({});
    };

    const handleDeleteModal = (taskId) => {
        setDeleteTaskModal(true);
        setDeleteTaskId(taskId);
    };

    const validateTaskForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Enter title";
        if (!formData.content.trim()) newErrors.content = "Enter content";
        if (!formData.status) newErrors.status = "Select status";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className={`w-80 shrink-0 rounded-xl border shadow-sm ${
            isDark ? "bg-neutral-900 border-neutral-800" : `bg-white ${accent.border}`
        }`}>
            <Toaster position="right-bottom" toastOptions={{ duration: 3500 }} />

            <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${accent.header}`}>
                <h1 className="text-md font-semibold text-white truncate pr-2">{column.name}</h1>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={handleOpenCreate} className="rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/30 cursor-pointer">
                        Add Task
                    </button>
                    {currentUserRole !== "MEMBER" && (
                        <button onClick={() => setDeleteColModal(true)} className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer" title="Delete column">
                            <Trash2 className="h-3.5 w-3.5 cursor-pointer" />
                        </button>
                    )}
                </div>
            </div>

            {addTaskClick && (
                <TaskModal
                    isEditMode={isEditMode}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    loadUserOptions={loadUserOptions}
                    onSubmit={isEditMode ? handleUpdateTask : handleCreateTask}
                    onClose={handleCloseModal}
                    isDark={isDark}
                    currentUserRole={currentUserRole}
                />
            )}

            {deleteTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? "bg-neutral-900" : "bg-white"}`}>
                        <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Delete Task</h3>
                        <p className={`mt-2 text-md ${isDark ? "text-white/50" : "text-slate-500"}`}>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => setDeleteTaskModal(false)}
                                className={`flex-1 cursor-pointer rounded-md border px-4 py-2 text-md font-medium transition-colors ${
                                    isDark ? "border-neutral-700 text-white/60 hover:bg-white/5" : "border-slate-300 text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                Cancel
                            </button>
                            <button onClick={handleDeleteTask} className="flex-1 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteColModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? "bg-neutral-900" : "bg-white"}`}>
                        <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Delete Column</h3>
                        <p className={`mt-2 text-md ${isDark ? "text-white/50" : "text-slate-500"}`}>
                            Are you sure you want to delete "{column?.name}"? This will remove the column and cannot be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => setDeleteColModal(false)}
                                className={`flex-1 cursor-pointer rounded-md border px-4 py-2 text-md font-medium transition-colors ${
                                    isDark ? "border-neutral-700 text-white/60 hover:bg-white/5" : "border-slate-300 text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                Cancel
                            </button>
                            <button onClick={handleDeleteColumn} className="flex-1 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`px-4 py-3 rounded-b-xl ${isDark ? "bg-neutral-900" : accent.body}`}>
                <h2 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/30" : "text-slate-400"}`}>Tasks</h2>
                <div className="flex flex-col gap-3">
                    {tasks.map((task) => {
                        const statusStyle = getStatusStyle(task.status);
                        const assignee = task.userDTO;

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleOpenUpdate(task)}
                                className={`group relative cursor-pointer rounded-xl border p-4 shadow-sm transition-colors ${
                                    isDark
                                        ? "border-neutral-800 bg-neutral-800/60 hover:border-indigo-500/40 hover:bg-neutral-800"
                                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                                }`}
                            >
                                {currentUserRole !== "MEMBER" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteModal(task.id);
                                        }}
                                        className={`absolute right-3 top-3 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                                            isDark ? "text-white/30 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                                        }`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                <p className={`pr-6 text-md font-semibold leading-snug ${isDark ? "text-white" : "text-slate-800"}`}>{task.title}</p>
                                <p className={`mt-1.5 text-md leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>{task.content}</p>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                        isDark ? statusStyle.badgeDark : statusStyle.badge
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                                        {statusStyle.label}
                                    </span>
                                </div>

                                {assignee?.emailId && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                                            isDark ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {assignee.name ?? assignee.emailId}
                                        </span>
                                        <button
                                            onClick={(e) => handleQuickUnassign(task, e)}
                                            className={`rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                                                isDark ? "text-white/30 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                                            }`}
                                            title="Unassign"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Columns;