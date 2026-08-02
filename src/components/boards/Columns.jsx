import { useEffect, useState } from "react";
import { createTask, fetchAllTasksForCol, updateTask, deleteTask } from "../../apis/apis";
import Select from "react-select";
import { Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
    title : "",
    content : "",
    status : "",
}

// Deterministic color per column (hash of id/name into a fixed palette) —
// same pattern used for the board cards, no extra UI or storage needed.
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

// Formats "2026-08-02T22:55:01.293278" -> "2026-08-02"
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
};

const statusStyles = {
    PENDING: { label: "Pending", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    IN_PROGRESS: { label: "In Progress", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    COMPLETED: { label: "Completed", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const getStatusStyle = (status) =>
    statusStyles[status] || { label: status || "Unknown", badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

const Columns = ({column, onDelete}) => {

    const [formData, setFormData] = useState(emptyForm);
    const [tasks, setTasks] = useState([]);
    const [addTaskClick, setAddTaskClick] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [deleteColModal, setDeleteColModal] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = selectedTask !== null;
    const accent = getColumnAccent(column);

    const handleCreateTask = async () => {
        validateTaskForm();
        try {
            console.log(`Column ID : ${column?.id}`);
            const res = await createTask(column?.id, formData);
            setAddTaskClick(false);
            handleFetchAllTasks();
            toast.success("Task created successfully");
        } catch (err) {
            console.log(`Column ID : ${column?.id}`);
            console.log(err);
            toast.error("Error creating task");
        }
    }

    const handleUpdateTask = async () => {
        try {
            const res = await updateTask(selectedTask.id, formData);
            handleFetchAllTasks();
            setAddTaskClick(false);
            toast.success("Task updated successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error updating task");
        }
    }

    const handleFetchAllTasks = async () => {
        try {
            const res = await fetchAllTasksForCol(column?.id);
            setTasks(res);
        } catch (err) {
            console.log(err);
        }
    }

    const handleDeleteTask = async () => {
        try {
            const res = await deleteTask(deleteTaskId);
            handleFetchAllTasks();
            setDeleteTaskModal(false);
            setDeleteTaskId(null);
            toast.success("Task deleted successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error deleting task");
        }
    }

    const handleDeleteColumn = () => {
        onDelete?.(column?.id);
        setDeleteColModal(false);
    }

    useEffect(() => {
        handleFetchAllTasks();
    }, [])

    const taskStatusOptions = [
        {value : "PENDING", label : "Pending"},
        {value : "IN_PROGRESS", label : "In Progress"},
        {value : "COMPLETED", label : "Completed"},
    ]

    const handleOpenCreate = () => {
        setSelectedTask(null);
        setFormData(emptyForm);
        setAddTaskClick(true);
    }

    const handleOpenUpdate = (task) => {
        setSelectedTask(task);
        setFormData({
            title: task.title ?? "",
            content: task.content ?? "",
            status: task.status ?? "",
        });
        setAddTaskClick(true);
    }

    const handleCloseModal = () => {
        setAddTaskClick(false);
        setSelectedTask(null);
        setFormData(emptyForm);
        setErrors({});
    }

    const handleDeleteModal = (taskId) => {
        setDeleteTaskModal(true);
        setDeleteTaskId(taskId);
    }

    const validateTaskForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Enter title";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Enter content";
        }

        if (!formData.status) {
            newErrors.status = "Select status";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    return (
        <div className={`w-80 shrink-0 rounded-xl border ${accent.border} bg-white shadow-sm`}>
            <Toaster position="right-bottom" toastOptions={{ duration: 3500 }} />
            <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${accent.header}`}>
                <h1 className="text-md font-semibold text-white truncate pr-2">{column.name}</h1>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={handleOpenCreate}
                        className="rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/30 cursor-pointer"
                    >
                        Add Task
                    </button>
                    <button
                        onClick={() => setDeleteColModal(true)}
                        className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
                        title="Delete column"
                    >
                        <Trash2 className="h-3.5 w-3.5 cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Task Modal */}
            {addTaskClick && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800">
                                {isEditMode ? "Update Task" : "Add Task"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({...prev, title : e.target.value}))}
                                    className={`rounded-md border px-3 py-1.5 text-md text-slate-700
                                        outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                        ${errors.title ? "border-red-500" : "border-slate-300"}
                                    `}
                                />
                                {errors.title && (<p className="text-red-500 mt-1">{errors.title} </p>)}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">Content</label>
                                <input
                                    value={formData.content}
                                    onChange={(e) => setFormData((prev) => ({...prev, content : e.target.value}))}
                                    className={`rounded-md border px-3 py-1.5 text-md text-slate-700
                                        outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                        ${errors.content ? "border-red-500" : "border-slate-300"}
                                    `}
                                />
                                {errors.content && (<p className="text-red-500 mt-1">{errors.content} </p>)}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">Status</label>
                                <Select
                                    options={taskStatusOptions}
                                    value={taskStatusOptions.find(
                                        option => option.value === formData.status
                                    )}
                                    onChange={(selectedOption) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            status: selectedOption.value
                                        }))
                                    }
                                    classNames={{
                                        control: () => {`!rounded-md !border-slate-300 !text-md ${errors.status ? "border-red-500" : ""}`},
                                    }}
                                />
                                {errors.status && (<p className="text-red-500 mt-1">{errors.status} </p>)}
                            </div>

                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={isEditMode ? handleUpdateTask : handleCreateTask}
                                    className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-emerald-700 cursor-pointer"
                                >
                                    {isEditMode ? "Update Task" : "Create Task"}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-md font-medium text-slate-500 transition-colors hover:bg-slate-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Task Confirmation Modal */}
            {deleteTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-semibold text-slate-800">Delete Task</h3>
                        <p className="mt-2 text-md text-slate-500">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => setDeleteTaskModal(false)}
                                className="flex-1 cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-md font-medium text-slate-500 transition-colors hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                className="flex-1 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Column Confirmation Modal */}
            {deleteColModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-semibold text-slate-800">Delete Column</h3>
                        <p className="mt-2 text-md text-slate-500">
                            Are you sure you want to delete "{column?.name}"? This will remove the column and cannot be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => setDeleteColModal(false)}
                                className="flex-1 cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-md font-medium text-slate-500 transition-colors hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteColumn}
                                className="flex-1 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List of Tasks */}
            <div className={`px-4 py-3 rounded-b-xl ${accent.body}`}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tasks</h2>
                <div className="flex flex-col gap-3">
                    {tasks.map((task) => {
                        const statusStyle = getStatusStyle(task.status);

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleOpenUpdate(task)}
                                className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteModal(task.id);
                                    }}
                                    className="absolute right-3 top-3 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>

                                <p className="pr-6 text-md font-semibold leading-snug text-slate-800">{task.title}</p>
                                <p className="mt-1.5 text-md leading-relaxed text-slate-500">{task.content}</p>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyle.badge}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                                        {statusStyle.label}
                                    </span>
                                    <span className="text-[11px] text-slate-400">{formatDate(task.createdOn)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Columns;