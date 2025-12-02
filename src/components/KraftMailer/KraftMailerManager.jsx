import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, PlusCircle, PackageOpen, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText } from "lucide-react";
import {
    useAddKraftMailerMutation,
    useListKraftMailersQuery,
    useUpdateKraftMailerMutation,
    useDeleteKraftMailerMutation,
} from "../../API/kraftMailerApi";

const PLATFORMS = ["Amazon", "Flipkart", "Meesho"];

export default function KraftMailerManager() {
    const { data, refetch } = useListKraftMailersQuery();
    const kraftMailers = data?.data || [];
    const [addKraftMailer] = useAddKraftMailerMutation();
    const [updateKraftMailer] = useUpdateKraftMailerMutation();
    const [deleteKraftMailer] = useDeleteKraftMailerMutation();

    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [reportFormat, setReportFormat] = useState("excel"); // "excel" or "pdf"
    const PAGE_SIZE = 20;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            date: "",
            quantity: 0,
            price: 0,
            size: { width: 0, height: 0, depth: 0 },
        },
    });

    // Calculate paginated kraftMailers
    const paginatedKraftMailers = kraftMailers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(kraftMailers.length / PAGE_SIZE);

    // Handle add or update
    const onSubmit = async (formData) => {
        setError("");
        try {
            const payload = {
                ...formData,
                size: {
                    width: formData.size.width,
                    height: formData.size.height,
                    depth: formData.size.depth,
                },
            };
            if (editing) {
                await updateKraftMailer({ id: editing._id, ...payload }).unwrap();
                setEditing(null);
            } else {
                await addKraftMailer(payload).unwrap();
            }
            reset();
            refetch();
        } catch (e) {
            setError(e?.data?.message || "Operation failed!");
        }
    };

    // Handle edit
    const handleEdit = (kraftMailer) => {
        setEditing(kraftMailer);
        setValue("date", kraftMailer.date.slice(0, 10));
        setValue("quantity", kraftMailer.quantity);
        setValue("price", kraftMailer.price);
        setValue("size.width", kraftMailer.size.width);
        setValue("size.height", kraftMailer.size.height);
        setValue("size.depth", kraftMailer.size.depth);
    };

    // Handle delete
    const handleDelete = async (id) => {
        setError("");
        try {
            await deleteKraftMailer(id).unwrap();
            refetch();
        } catch (e) {
            setError(e?.data?.message || "Delete failed!");
        }
    };

    // Cancel edit
    const handleCancel = () => {
        setEditing(null);
        reset();
    };

    // Enhanced export handler with format selection
    const handleExport = async () => {
        let exportStartDate = startDate;
        let exportEndDate = endDate;

        // If dates are not selected, use current month
        if (!startDate || !endDate) {
            const now = new Date();
            exportStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
            exportEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            setStartDate(exportStartDate);
            setEndDate(exportEndDate);
        }

        setError("");
        setDownloading(true);
        try {
            const token = localStorage.getItem("token");
            
            // Choose the correct endpoint based on format
            const endpoint = reportFormat === 'pdf' 
                ? 'kraftmailer-report-pdf' 
                : 'kraftmailer-report';

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/kraftmailer/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        startDate: exportStartDate,
                        endDate: exportEndDate,
                    }),
                }
            );
            if (!res.ok) throw new Error(`${reportFormat.toUpperCase()} export failed!`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            
            // Dynamic filename based on format
            const extension = reportFormat === 'pdf' ? 'pdf' : 'xlsx';
            a.download = `kraftmailer-report-${exportStartDate}_to_${exportEndDate}.${extension}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setError(e.message || `${reportFormat.toUpperCase()} export failed!`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <section className="bg-white p-4 w-full flex flex-col max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6">
                <PackageOpen className="text-[#008080] w-10 h-10" />
                <h1 className="text-2xl font-bold text-[#008080]">Kraft Mailer Management</h1>
                <div className="flex items-center gap-3 ml-auto">
                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="border px-2 py-1 rounded-lg text-sm"
                            title="Start Date"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="border px-2 py-1 rounded-lg text-sm"
                            title="End Date"
                        />
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Format:</label>
                        <div className="flex border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setReportFormat("excel")}
                                className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1 ${
                                    reportFormat === "excel" 
                                        ? "bg-green-600 text-white" 
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                title="Excel Format"
                            >
                                <FileSpreadsheet size={14} />
                                Excel
                            </button>
                            <button
                                onClick={() => setReportFormat("pdf")}
                                className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1 ${
                                    reportFormat === "pdf" 
                                        ? "bg-red-600 text-white" 
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                title="PDF Format"
                            >
                                <FileText size={14} />
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={downloading}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition shadow-sm text-sm ${
                            reportFormat === 'pdf' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title={`Export Kraft Mailer Report (${reportFormat.toUpperCase()})`}
                    >
                        <Download size={16} />
                        Export ({reportFormat.toUpperCase()})
                    </button>
                    
                    {downloading && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            Generating {reportFormat.toUpperCase()}...
                        </span>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-600 text-sm text-center mb-2 font-medium">{error}</div>
            )}

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Date</label>
                        <input
                            type="date"
                            {...register("date", { required: "Date is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.date ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            step="any"
                            {...register("quantity", { 
                                required: "Quantity is required", 
                                min: { value: 0.01, message: "Quantity must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.quantity ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter quantity"
                        />
                        {errors.quantity && (
                            <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Price</label>
                        <input
                            type="number"
                            step="any"
                            {...register("price", { 
                                required: "Price is required", 
                                min: { value: 0.01, message: "Price must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.price ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter price"
                        />
                        {errors.price && (
                            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Size (Width)</label>
                        <input
                            type="number"
                            step="any"
                            {...register("size.width", { 
                                required: "Width is required", 
                                min: { value: 0.01, message: "Width must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.size?.width ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Width"
                        />
                        {errors.size?.width && (
                            <p className="text-red-500 text-xs mt-1">{errors.size.width.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Size (Height)</label>
                        <input
                            type="number"
                            step="any"
                            {...register("size.height", { 
                                required: "Height is required", 
                                min: { value: 0.01, message: "Height must be greater than 0" }, 
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.size?.height ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Height"
                        />
                        {errors.size?.height && (
                            <p className="text-red-500 text-xs mt-1">{errors.size.height.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Size (Depth)</label>
                        <input
                            type="number"
                            step="any"
                            {...register("size.depth", { 
                                required: "Depth is required", 
                                min: { value: 0.01, message: "Depth must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.size?.depth ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Depth"
                        />
                        {errors.size?.depth && (
                            <p className="text-red-500 text-xs mt-1">{errors.size.depth.message}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-[#008080] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#006666] transition shadow-md cursor-pointer"
                    >
                        <PlusCircle size={18} />
                        {editing ? "Update KraftMailer" : "Add KraftMailer"}
                    </button>
                    {editing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* KraftMailer List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Kraft Mailers</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-white">
                        <thead className="bg-[#f3f4f6]">
                            <tr>
                                <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Date</th>
                                <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Quantity</th>
                                <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Price</th>
                                <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Total</th>
                                <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Size</th>
                                <th className="px-6 py-2 text-center text-[15px] font-medium text-[#008080]">Edit</th>
                                <th className="px-6 py-2 text-center text-[15px] font-medium text-[#008080]">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedKraftMailers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-gray-500 text-center py-6 text-[15px] font-medium">No kraft mailers found.</td>
                                </tr>
                            ) : (
                                paginatedKraftMailers.map((kraftMailer, idx) => (
                                    <tr
                                        key={kraftMailer._id}
                                        className={`border-t ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}
                                    >
                                        <td className="px-6 py-2 text-[15px] font-medium">{kraftMailer.date ? kraftMailer.date.slice(0, 10) : ""}</td>
                                        <td className="px-6 py-2 text-[15px] font-medium">{kraftMailer.quantity}</td>
                                        <td className="px-6 py-2 text-[15px] font-medium">₹{kraftMailer.price}</td>
                                        <td className="px-6 py-2 text-[15px] font-medium">₹{kraftMailer.totalPrice}</td>
                                        <td className="px-6 py-2 text-[15px] font-medium">
                                            {kraftMailer.size
                                                ? `${kraftMailer.size.width} x ${kraftMailer.size.height} x ${kraftMailer.size.depth}`
                                                : ""}
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(kraftMailer)}
                                                className="p-2 rounded hover:bg-[#e0f2f1] text-[#008080] cursor-pointer transition"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <button
                                                onClick={() => handleDelete(kraftMailer._id)}
                                                className="p-2 rounded hover:bg-[#ffebee] text-red-600 cursor-pointer transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {/* Footer Row */}
                        <tfoot>
                            <tr className="bg-[#f3f4f6]">
                                <td className="px-6 py-2 text-[15px] font-semibold text-[#008080] text-right">Total:</td>
                                <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                    {kraftMailers.reduce((sum, k) => sum + k.quantity, 0)}
                                </td>
                                <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                    ₹{kraftMailers.reduce((sum, k) => sum + k.price, 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                    ₹{kraftMailers.reduce((sum, k) => sum + k.totalPrice, 0).toFixed(2)}
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center mt-4">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx + 1)}
                            className={`px-3 py-1 mx-1 rounded font-semibold cursor-pointer ${page === idx + 1 ? "bg-[#008080] text-white" : "bg-gray-100 text-gray-700"}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </section>
    );
}