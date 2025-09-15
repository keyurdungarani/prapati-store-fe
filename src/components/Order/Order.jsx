import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, PlusCircle, PackageOpen, Download, ChevronLeft, ChevronRight, Filter, Building2, BarChart3 } from "lucide-react";
import {
    useAddOrderMutation,
    useListOrdersQuery,
    useListOrdersByCompanyQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} from "../../API/orderApi";
import { useListCompaniesQuery } from "../../API/companyApi";

const PLATFORMS = ["Amazon", "Flipkart", "Meesho"];

export default function OrderManager() {
    // API hooks
    const { data: companiesData } = useListCompaniesQuery();
    const companies = companiesData?.data || [];
    
    const { data, refetch } = useListOrdersQuery();
    const orders = data?.data || [];
    
    const [addOrder] = useAddOrderMutation();
    const [updateOrder] = useUpdateOrderMutation();
    const [deleteOrder] = useDeleteOrderMutation();
    
    // Enhanced state management
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState("all"); // "all" or "company"
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [expandedCompanies, setExpandedCompanies] = useState({});
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
            product: "",
            qty: "",
            price: "",
            company: "",
            platforms: [],
        },
    });

    // Filter orders based on selected company
    const filteredOrders = selectedCompany === "all" 
        ? orders 
        : orders.filter(order => order.company === selectedCompany);
    
    // Calculate paginated orders
    const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

    // Group orders by company for company view
    const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.company]) {
            acc[order.company] = {
                orders: [],
                totalQty: 0,
                totalAmount: 0,
                orderCount: 0
            };
        }
        acc[order.company].orders.push(order);
        acc[order.company].totalQty += order.qty;
        acc[order.company].totalAmount += order.qty * order.price;
        acc[order.company].orderCount += 1;
        return acc;
    }, {});

    // Toggle company expansion in company view
    const toggleCompany = (companyName) => {
        setExpandedCompanies(prev => ({
            ...prev,
            [companyName]: !prev[companyName]
        }));
    };

    // Handle add or update
    const onSubmit = async (data) => {
        setError("");
        try {
            if (editing) {
                await updateOrder({ id: editing._id, ...data }).unwrap();
                setEditing(null);
            } else {
                await addOrder(data).unwrap();
            }
            reset();
            refetch();
        } catch (e) {
            setError(e?.data?.message || "Operation failed!");
        }
    };

    // Handle edit
    const handleEdit = (order) => {
        setEditing(order);
        setValue("date", order.date);
        setValue("product", order.product);
        setValue("qty", order.qty);
        setValue("price", order.price);
        setValue("company", order.company);
        setValue("platforms", order.platforms);
    };

    // Handle delete
    const handleDelete = async (id) => {
        setError("");
        try {
            await deleteOrder(id).unwrap();
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

    // Enhanced download handler with company filter
    const handleExport = async (exportCompany = null) => {
        setError("");
        setDownloading(true);
        try {
            const bodyData = {};
            
            if (startDate && endDate) {
                bodyData.startDate = startDate;
                bodyData.endDate = endDate;
            }
            
            if (exportCompany && exportCompany !== 'all') {
                bodyData.company = exportCompany;
            }

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/order/generate-order-report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(bodyData),
                }
            );
            if (!res.ok) throw new Error("Export failed!");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            // Dynamic filename based on export type
            const filename = exportCompany && exportCompany !== 'all' 
                ? `${exportCompany.replace(/[^a-zA-Z0-9]/g, '_')}_orders_report.xlsx`
                : "all_companies_orders_report.xlsx";
            
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setError("Export failed!");
        }
        setDownloading(false);
    };

    return (
        <section className="bg-white p-4 w-full flex flex-col max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6">
                <PackageOpen className="text-[#008080] w-10 h-10" />
                <h1 className="text-2xl font-bold text-[#008080]">Admin Order Management</h1>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("all")}
                            className={`px-3 py-2 text-sm font-medium transition ${
                                viewMode === "all" 
                                    ? "bg-[#008080] text-white" 
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Filter size={16} className="inline mr-1" />
                            All Orders
                        </button>
                        <button
                            onClick={() => setViewMode("company")}
                            className={`px-3 py-2 text-sm font-medium transition ${
                                viewMode === "company" 
                                    ? "bg-[#008080] text-white" 
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Building2 size={16} className="inline mr-1" />
                            Company View
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters and Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Date Range:</label>
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

                {/* Company Filter */}
                {viewMode === "all" && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Company:</label>
                        <select
                            value={selectedCompany}
                            onChange={e => {
                                setSelectedCompany(e.target.value);
                                setPage(1); // Reset pagination
                            }}
                            className="border px-2 py-1 rounded-lg text-sm"
                        >
                            <option value="all">All Companies</option>
                            {companies.map(company => (
                                <option key={company._id} value={company.name}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Export Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={() => handleExport('all')}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
                        title="Export All Companies"
                    >
                        <Download size={16} />
                        Export All
                    </button>
                    
                    {selectedCompany !== "all" && viewMode === "all" && (
                        <button
                            onClick={() => handleExport(selectedCompany)}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-[#008080] text-white py-2 px-3 rounded-lg font-medium hover:bg-[#006666] transition shadow-sm text-sm"
                            title={`Export ${selectedCompany}`}
                        >
                            <Download size={16} />
                            Export {selectedCompany}
                        </button>
                    )}
                    
                    {downloading && (
                        <span className="text-sm text-gray-600">Exporting...</span>
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
                        <label className="block text-gray-700 font-medium mb-1">Order Date</label>
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
                        <label className="block text-gray-700 font-medium mb-1">Product</label>
                        <input
                            type="text"
                            {...register("product", { required: "Product is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.product ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter product name"
                        />
                        {errors.product && (
                            <p className="text-red-500 text-xs mt-1">{errors.product.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            {...register("qty", { required: "Quantity is required", min: 1 })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.qty ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter quantity"
                        />
                        {errors.qty && (
                            <p className="text-red-500 text-xs mt-1">{errors.qty.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Price</label>
                        <input
                            type="number"
                            {...register("price", { required: "Price is required", min: 0 })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.price ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter price"
                        />
                        {errors.price && (
                            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Company</label>
                        <select
                            {...register("company", { required: "Company is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.company ? "border-red-500" : "border-gray-300"}`}
                            onChange={e => {
                                setValue("company", e.target.value);
                                // Set platforms based on selected company
                                const selected = companies.find(company => company.name === e.target.value);
                                setValue("platforms", selected ? selected.platforms : []);
                            }}
                        >
                            <option value="">Select company</option>
                            {companies.map(company => (
                                <option key={company._id} value={company.name}>{company.name}</option>
                            ))}
                        </select>
                        {errors.company && (
                            <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Platforms</label>
                        <div className="flex gap-4 flex-wrap">
                            {PLATFORMS.map((platform) => (
                                <label key={platform} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={platform}
                                        {...register("platforms")}
                                        className="accent-[#008080] cursor-pointer"
                                    />
                                    {platform}
                                </label>
                            ))}
                        </div>
                        {errors.platforms && (
                            <p className="text-red-500 text-xs mt-1">{errors.platforms.message}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-[#008080] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#006666] transition shadow-md cursor-pointer"
                    >
                        <PlusCircle size={18} />
                        {editing ? "Update Order" : "Add Order"}
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

            {/* Order List */}
            <div>
                {viewMode === "all" ? (
                    /* Regular Order List */
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Orders {selectedCompany !== "all" && `- ${selectedCompany}`}
                            </h2>
                            <span className="text-sm text-gray-600">
                                {filteredOrders.length} orders found
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-white">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Order Date</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Product Name</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Quantity</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Price</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Total</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Company</th>
                                        <th className="px-6 py-2 text-left text-[15px] font-medium text-[#008080]">Platform</th>
                                        <th className="px-6 py-2 text-center text-[15px] font-medium text-[#008080]">Edit</th>
                                        <th className="px-6 py-2 text-center text-[15px] font-medium text-[#008080]">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-gray-500 text-center py-6 text-[15px] font-medium">No orders found.</td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map((order, idx) => (
                                            <tr
                                                key={order._id}
                                                className={`border-t ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}
                                            >
                                                <td className="px-6 py-2 text-[15px] font-medium">{order.date ? order.date.slice(0, 10) : ""}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">{order.product}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">{order.qty}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">₹{order.price}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">₹{order.qty * order.price}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">{order.company}</td>
                                                <td className="px-6 py-2 text-[15px] font-medium">{order.platforms.join(", ")}</td>
                                                <td className="px-6 py-2 text-center">
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        className="p-2 rounded hover:bg-[#e0f2f1] text-[#008080] cursor-pointer transition"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
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
                                        <td colSpan={2} className="px-6 py-2 text-[15px] font-semibold text-[#008080] text-right">Total:</td>
                                        <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                            {filteredOrders.reduce((sum, order) => sum + order.qty, 0)}
                                        </td>
                                        <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                            ₹{filteredOrders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-2 text-[15px] font-semibold text-[#008080]">
                                            ₹{filteredOrders.reduce((sum, order) => sum + order.qty * order.price, 0).toFixed(2)}
                                        </td>
                                        <td colSpan={4}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                ) : (
                    /* Company-Grouped View */
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-700">
                                <BarChart3 className="inline mr-2" size={20} />
                                Company-wise Orders
                            </h2>
                            <span className="text-sm text-gray-600">
                                {Object.keys(groupedOrders).length} companies
                            </span>
                        </div>
                        
                        {Object.keys(groupedOrders).length === 0 ? (
                            <div className="text-gray-500 text-center py-6 text-[15px] font-medium bg-gray-50 rounded-lg">
                                No orders found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedOrders).map(([companyName, companyData]) => (
                                    <div key={companyName} className="border rounded-lg overflow-hidden">
                                        {/* Company Header */}
                                        <div 
                                            className="bg-gradient-to-r from-[#008080] to-[#20b2aa] text-white p-4 cursor-pointer hover:from-[#006666] hover:to-[#1e9a7a] transition"
                                            onClick={() => toggleCompany(companyName)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Building2 size={20} />
                                                    <h3 className="text-lg font-semibold">{companyName}</h3>
                                                    <span className="bg-white/20 px-2 py-1 rounded text-sm">
                                                        {companyData.orderCount} orders
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-sm opacity-90">Total Quantity: {companyData.totalQty}</div>
                                                        <div className="font-semibold">Total Amount: ₹{companyData.totalAmount.toFixed(2)}</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExport(companyName);
                                                        }}
                                                        className="bg-white/20 hover:bg-white/30 p-2 rounded transition"
                                                        title={`Export ${companyName} orders`}
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                    <ChevronRight 
                                                        size={20} 
                                                        className={`transform transition-transform ${expandedCompanies[companyName] ? 'rotate-90' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Orders - Expandable */}
                                        {expandedCompanies[companyName] && (
                                            <div className="bg-white">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Qty</th>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                                                            <th className="px-6 py-2 text-left text-sm font-medium text-gray-700">Platforms</th>
                                                            <th className="px-6 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {companyData.orders.map((order, idx) => (
                                                            <tr key={order._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                <td className="px-6 py-2 text-sm">{order.date ? order.date.slice(0, 10) : ""}</td>
                                                                <td className="px-6 py-2 text-sm">{order.product}</td>
                                                                <td className="px-6 py-2 text-sm">{order.qty}</td>
                                                                <td className="px-6 py-2 text-sm">₹{order.price}</td>
                                                                <td className="px-6 py-2 text-sm font-medium">₹{order.qty * order.price}</td>
                                                                <td className="px-6 py-2 text-sm">{order.platforms.join(", ")}</td>
                                                                <td className="px-6 py-2 text-center">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button
                                                                            onClick={() => handleEdit(order)}
                                                                            className="p-1 rounded hover:bg-[#e0f2f1] text-[#008080] transition"
                                                                            title="Edit"
                                                                        >
                                                                            <Pencil size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(order._id)}
                                                                            className="p-1 rounded hover:bg-red-100 text-red-600 transition"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination Controls - Only for "all" view mode */}
            {viewMode === "all" && totalPages > 1 && (
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