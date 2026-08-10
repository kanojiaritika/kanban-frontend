import { useLocation, useNavigate, useParams } from "react-router-dom";
import SideBar from "../homePage/SideBar";
import { useEffect, useState } from "react";
import { createColumn, deleteColumn, fetchAllColumns, getBoardById, fetchAllTasksForCol } from "../../apis/apis";
import { getCurrentUserRole, getUserRoleOnBoard } from "../../utils/boardHelpers";
import Columns from "./Columns";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const colForm = {
    name : "",
    position : ""
}

const Board = ({ theme, toggleTheme }) => {

    const { user } = useAuth();

    const { boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [colData, setColData] = useState(colForm);
    const [addColClick, setAddColClick] = useState(false);
    const [err, setErr] = useState({});
    const [columns, setColumns] = useState([]);

    const [tasksByColumn, setTasksByColumn] = useState({});

    const currentUserRole = getCurrentUserRole(board);

    const isDark = theme === "dark";

    useEffect(() => {
        const fetchBoardById = async () => {
            try {
                const res = await getBoardById(boardId);
                setBoard(res);
            } catch (err) {
                console.log(err);
            }
        }

        fetchBoardById();
    }, [boardId])

    useEffect(() => {
        handleFetchAllColumns();
    }, [boardId])

    // once columns arrive, fetch tasks for each one
    useEffect(() => {
        columns.forEach((col) => {
            fetchTasksForColumn(col.id);
        });
    }, [columns]);

    // fetch (or refetch) tasks for a single column
    const fetchTasksForColumn = async (columnId) => {
        try {
            const res = await fetchAllTasksForCol(columnId);
            setTasksByColumn((prev) => ({ ...prev, [columnId]: res }));
        } catch (err) {
            console.log(err);
        }
    };

    const handleColCreate = async () => {
        if (!colData.name.trim()) {
            setErr((prev) => ({...prev, name : "Enter column name"}))
            return;
        }

        try {
            const response = await createColumn(boardId, colData);
            setColumns(prev => {
                return [...prev, response];
            });
            setColData(colForm);
            setAddColClick(false);
            toast.success("Column created successfully");
            setErr({});
        } catch (err) {
            console.log(err);
            toast.error("Error while Creating Board");
        }
    }

    const handleFetchAllColumns = async () => {
        try {
            const response = await fetchAllColumns(boardId);
            setColumns(response);
        } catch (err) {
            console.log(err);
        }
    }

    const handleDeleteColumn = async (columnId) => {
        try {
            await deleteColumn(columnId);
            setColumns((prev) => prev.filter((c) => c.id !== columnId));
            setTasksByColumn((prev) => {
                const next = { ...prev };
                delete next[columnId];
                return next;
            });
            toast.success("Column deleted successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error deleting column");
        }
    }

    const goToMenu = (menu) => {
        navigate("/kanban/home", { state: { activeMenu: menu } });
    };

    return (
        <div className={`flex flex-col md:flex-row min-h-screen transition-colors ${isDark ? "bg-gray-950" : "bg-slate-50"}`}>
            <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
            <SideBar
                theme={theme}
                toggleTheme={toggleTheme}
                activeMenu={null}
                setActiveMenu={goToMenu}
            />
            {/* board title */}
            <div className="flex-1 px-8 py-6 min-w-0">
                <div className={`mb-6 border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                        Board Title : <span className={isDark ? "font-semibold text-indigo-400" : "font-semibold text-indigo-600"}>{board?.title}</span>
                    </h1>
                    <p className={`mt-1 text-md ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Board Description : {board?.description}
                    </p>
                </div>

                {/* Add Column button */}
                {addColClick && (
                    <div className={`mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 shadow-sm ${
                        isDark ? "border-white/10 bg-gray-900" : "border-slate-200 bg-white"
                    }`}>

                        <div className="flex-1">
                            <input
                                value={colData.name}
                                onChange={(e) =>
                                    setColData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className={`w-full rounded-md border px-3 py-2 text-md outline-none 
                                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                    ${isDark ? "bg-gray-950 text-white placeholder:text-white/30" : "text-slate-700"}
                                    ${err.name ? "border-red-500" : (isDark ? "border-white/15" : "border-slate-300")}`}
                                placeholder="Column name"
                            />

                            {err.name && (
                                <p className="text-red-500 mt-1">
                                    {err.name}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleColCreate}
                            className="rounded-md cursor-pointer bg-indigo-600 px-4 py-2 text-md font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800"
                        >
                            Create Column
                        </button>

                        <button
                            onClick={() => {
                                setAddColClick(false);
                                setErr({});
                            }}
                            className={`rounded-md cursor-pointer border px-4 py-2 text-md font-medium transition-colors ${
                                isDark
                                    ? "border-white/15 text-white/60 hover:bg-white/5"
                                    : "border-slate-300 text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            Cancel
                        </button>
                    </div>
                )}


                <button
                    onClick={() => setAddColClick((prev) => !prev)}
                    disabled={addColClick}
                    className={`mt-5 cursor-pointer rounded-md border px-4 py-2 text-md font-medium transition-colors disabled:cursor-not-allowed ${
                        isDark
                            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:border-white/10 disabled:bg-white/5 disabled:text-white/30"
                            : "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    }`}
                >
                    Add Column
                </button>

                {/* Fetch all columns of the board — overflow-x-auto here keeps the scroll contained to this row */}
                <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                    {/* {columns.map((col) => {
                        return (
                        <div key={col.id} className="shrink-0">
                            <Columns 
                                column={col}
                                onDelete={() => handleDeleteColumn(col?.id)}
                                theme={theme}
                            />
                        </div>
                    )
                    })} */}
                    {columns.map((col) => (
                        <div key={col.id} className="shrink-0">
                            <Columns
                                column={col}
                                onDelete={() => handleDeleteColumn(col?.id)}
                                theme={theme}
                                tasks={tasksByColumn[col.id] ?? []}                         
                                refetchTasks={() => fetchTasksForColumn(col.id)}   
                                currentUserRole={currentUserRole}         
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default Board;