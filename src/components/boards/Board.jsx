import { useParams } from "react-router-dom";
import SideBar from "../homePage/SideBar";
import { useEffect, useState } from "react";
import { createColumn, deleteColumn, fetchAllColumns, getBoardById } from "../../apis/apis";
import Columns from "./Columns";
import toast, { Toaster } from "react-hot-toast";

const colForm = {
    name : "",
    position : ""
}

const Board = () => {

    const { boardId } = useParams();

    const [board, setBoard] = useState(null);
    const [colData, setColData] = useState(colForm);
    const [addColClick, setAddColClick] = useState(false);
    const [err, setErr] = useState({});
    const [columns, setColumns] = useState([]);

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

    const handleColCreate = async () => {
        if (!colData.name.trim()) {
            setErr((prev) => ({...prev, name : "Enter column name"}))
            return;
        }

        try {
            const response = await createColumn(boardId, colData);
            setColumns(prev => {
                console.log([...prev, response]);
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
            console.log(`Column Id : ${columnId}`);
            setColumns((prev) => prev.filter((c) => c.id !== columnId));
            toast.success("Column deleted successfully");
        } catch (err) {
            console.log(err);
            toast.error("Error deleting column");
        }
    }


    return (
        <div className="flex min-h-screen bg-slate-50">
            <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
            <SideBar />
            {/* board title */}
            <div className="flex-1 px-8 py-6 min-w-0">
                <div className="mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Board Title : <span className="font-semibold text-indigo-600">{board?.title}</span>
                    </h1>
                    <p className="mt-1 text-md text-slate-500">
                        Board Description : {board?.description}
                    </p>
                </div>

                {/* Add Column button */}
                {addColClick && (
                    <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="flex-1">
                            <input
                                value={colData.name}
                                onChange={(e) =>
                                    setColData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className={`w-full rounded-md border px-3 py-2 text-md text-slate-700 outline-none 
                                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                    ${err.name ? "border-red-500" : "border-slate-300"}`}
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
                            className="rounded-md cursor-pointer border border-slate-300 px-4 py-2 text-md font-medium text-slate-500 transition-colors hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                    </div>
                )}


                <button
                    onClick={() => setAddColClick((prev) => !prev)}
                    disabled={addColClick}
                    className="mt-5 cursor-pointer rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-md font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                    Add Column
                </button>

                {/* Fetch all columns of the board — overflow-x-auto here keeps the scroll contained to this row */}
                <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                    {columns.map((col) => {
                        
                        return (

                        <div key={col.id} className="shrink-0">
                            <Columns 
                                column={col}
                                onDelete={() => handleDeleteColumn(col?.id)}
                            />
                        </div>
                    )
                        
                    })}
                </div>
            </div>

        </div>
    )
}

export default Board;