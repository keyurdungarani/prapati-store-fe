import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, PlusCircle, RotateCcw, Download, ChevronLeft, ChevronRight, Filter, FileSpreadsheet, FileText } from "lucide-react";
import {
    useAddReturnOrderMutation,
    useListReturnOrdersQuery,
    useUpdateReturnOrderMutation,
    useDeleteReturnOrderMutation,
} from "../../API/returnOrderApi";
import { useListCompaniesQuery } from "../../API/companyApi";

const PLATFORMS = ["Amazon", "Flipkart", "Meesho"];
const RETURN_REASONS = ["Damaged", "OK", "Different"];
const RETURN_BY_OPTIONS = ["RTO", "Customer"];

export default function ReturnOrderManager() {
    // API hooks
    const { data: companiesData } = useListCompaniesQuery();
    const companies = companiesData?.data || [];
    
    const { data, refetch } = useListReturnOrdersQuery();
    const returnOrders = data?.data || [];
    
    const [addReturnOrder] = useAddReturnOrderMutation();
    const [updateReturnOrder] = useUpdateReturnOrderMutation();
    const [deleteReturnOrder] = useDeleteReturnOrderMutation();
    
    // State management
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [page, setPage] = useState(1);
    const [reportFormat, setReportFormat] = useState("excel"); // "excel" or "pdf"
    
    // Filter states
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [selectedReturnReason, setSelectedReturnReason] = useState("all");
    const [selectedReturnBy, setSelectedReturnBy] = useState("all");
    
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
            returnReason: "",
            returnBy: "",
        },
    });

    // Filter return orders based on selected filters
    const filteredReturnOrders = returnOrders.filter(order => {
        const companyMatch = selectedCompany === "all" || order.company === selectedCompany;
        const reasonMatch = selectedReturnReason === "all" || order.returnReason === selectedReturnReason;
        const returnByMatch = selectedReturnBy === "all" || order.returnBy === selectedReturnBy;
        
        // Date range filter
        let dateMatch = true;
        if (startDate && endDate) {
            // Parse the date string (DD-MM-YYYY format from backend)
            const orderDateParts = order.date.split('-');
            const orderDate = new Date(orderDateParts[2], orderDateParts[1] - 1, orderDateParts[0]);
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateMatch = orderDate >= start && orderDate <= end;
        }
        
        return companyMatch && reasonMatch && returnByMatch && dateMatch;
    });
    
    // Calculate paginated return orders
    const paginatedReturnOrders = filteredReturnOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filteredReturnOrders.length / PAGE_SIZE);

    // Handle add or update
    const onSubmit = async (data) => {
        setError("");
        try {
            if (editing) {
                await updateReturnOrder({ id: editing._id, ...data }).unwrap();
                setEditing(null);
            } else {
                await addReturnOrder(data).unwrap();
            }
            reset();
            refetch();
        } catch (e) {
            setError(e?.data?.message || "Operation failed!");
        }
    };

    // Handle edit
    const handleEdit = (returnOrder) => {
        setEditing(returnOrder);
        setValue("date", returnOrder.date);
        setValue("product", returnOrder.product);
        setValue("qty", returnOrder.qty);
        setValue("price", returnOrder.price);
        setValue("company", returnOrder.company);
        setValue("platforms", returnOrder.platforms);
        setValue("returnReason", returnOrder.returnReason);
        setValue("returnBy", returnOrder.returnBy);
    };

    // Handle delete
    const handleDelete = async (id) => {
        setError("");
        try {
            await deleteReturnOrder(id).unwrap();
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

    // Enhanced download handler with filters
    const handleExport = async () => {
        setError("");
        setDownloading(true);
        try {
            const bodyData = {};
            
            if (startDate && endDate) {
                bodyData.startDate = startDate;
                bodyData.endDate = endDate;
            }
            
            if (selectedCompany !== "all") {
                bodyData.company = selectedCompany;
            }
            
            if (selectedReturnReason !== "all") {
                bodyData.returnReason = selectedReturnReason;
            }
            
            if (selectedReturnBy !== "all") {
                bodyData.returnBy = selectedReturnBy;
            }

            // Choose the correct endpoint based on format
            const endpoint = reportFormat === 'pdf' 
                ? 'generate-return-order-report-pdf' 
                : 'generate-return-order-report';

            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/return-order/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(bodyData),
                }
            );
            
            if (!res.ok) throw new Error(`${reportFormat.toUpperCase()} export failed!`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            // Dynamic filename based on format
            const extension = reportFormat === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute("download", `return_orders_report.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setError(`${reportFormat.toUpperCase()} export failed!`);
        }
        setDownloading(false);
    };

    return (
        <section className="bg-white p-4 w-full flex flex-col max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="text-[#FF6B6B] w-10 h-10" />
                <h1 className="text-2xl font-bold text-[#FF6B6B]">Return Orders Management</h1>
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
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Company:</label>
                    <select
                        value={selectedCompany}
                        onChange={e => {
                            setSelectedCompany(e.target.value);
                            setPage(1);
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

                {/* Return Reason Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Return Reason:</label>
                    <select
                        value={selectedReturnReason}
                        onChange={e => {
                            setSelectedReturnReason(e.target.value);
                            setPage(1);
                        }}
                        className="border px-2 py-1 rounded-lg text-sm"
                    >
                        <option value="all">All Reasons</option>
                        {RETURN_REASONS.map(reason => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Return By Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Return By:</label>
                    <select
                        value={selectedReturnBy}
                        onChange={e => {
                            setSelectedReturnBy(e.target.value);
                            setPage(1);
                        }}
                        className="border px-2 py-1 rounded-lg text-sm"
                    >
                        <option value="all">All Types</option>
                        {RETURN_BY_OPTIONS.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Format Selection and Export Actions */}
                <div className="flex items-center gap-3 ml-auto">
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
                        title={`Export Return Orders (${reportFormat.toUpperCase()})`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Return Date</label>
                        <input
                            type="date"
                            {...register("date", { required: "Date is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.date ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Product Name</label>
                        <input
                            type="text"
                            {...register("product", { required: "Product is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.product ? "border-red-500" : "border-gray-300"}`}
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
                            step="any"
                            {...register("qty", { 
                                required: "Quantity is required", 
                                min: { value: 0.01, message: "Quantity must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.qty ? "border-red-500" : "border-gray-300"}`}
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
                            step="any"
                            {...register("price", { 
                                required: "Price is required", 
                                min: { value: 0.01, message: "Price must be greater than 0" },
                                valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.price ? "border-red-500" : "border-gray-300"}`}
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
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.company ? "border-red-500" : "border-gray-300"}`}
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
                                        className="accent-[#FF6B6B] cursor-pointer"
                                    />
                                    {platform}
                                </label>
                            ))}
                        </div>
                        {errors.platforms && (
                            <p className="text-red-500 text-xs mt-1">{errors.platforms.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Return Reason</label>
                        <select
                            {...register("returnReason", { required: "Return reason is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.returnReason ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">Select return reason</option>
                            {RETURN_REASONS.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                        {errors.returnReason && (
                            <p className="text-red-500 text-xs mt-1">{errors.returnReason.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Return By</label>
                        <select
                            {...register("returnBy", { required: "Return by is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] ${errors.returnBy ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">Select return type</option>
                            {RETURN_BY_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors.returnBy && (
                            <p className="text-red-500 text-xs mt-1">{errors.returnBy.message}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-[#FF6B6B] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#FF5252] transition shadow-md cursor-pointer"
                    >
                        <PlusCircle size={18} />
                        {editing ? "Update Return Order" : "Add Return Order"}
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

            {/* Return Order Summary - Products with 50+ returns in last 30 days */}
            {(() => {
                // Calculate date 30 days ago
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);

                // Filter return orders from last 30 days
                const last30DaysOrders = returnOrders.filter(order => {
                    // Parse the date string (DD-MM-YYYY format from backend)
                    const orderDateParts = order.date.split('-');
                    const orderDate = new Date(orderDateParts[2], orderDateParts[1] - 1, orderDateParts[0]);
                    return orderDate >= thirtyDaysAgo && orderDate <= today;
                });

                // Group return orders by product name and calculate total quantities
                const productSummary = last30DaysOrders.reduce((acc, order) => {
                    const productName = order.product;
                    if (!acc[productName]) {
                        acc[productName] = {
                            product: productName,
                            totalQty: 0,
                            returnCount: 0,
                            totalAmount: 0,
                            companies: new Set(),
                            reasons: {},
                        };
                    }
                    acc[productName].totalQty += order.qty;
                    acc[productName].returnCount += 1;
                    acc[productName].totalAmount += order.qty * order.price;
                    acc[productName].companies.add(order.company);
                    
                    // Track return reasons
                    if (!acc[productName].reasons[order.returnReason]) {
                        acc[productName].reasons[order.returnReason] = 0;
                    }
                    acc[productName].reasons[order.returnReason]++;
                    
                    return acc;
                }, {});

                // Filter products with total quantity >= 50 and convert to array
                const highReturnProducts = Object.values(productSummary)
                    .filter(item => item.totalQty >= 50)
                    .sort((a, b) => b.totalQty - a.totalQty); // Sort by highest returns first

                return highReturnProducts.length > 0 ? (
                    <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <RotateCcw className="text-red-600 w-6 h-6" />
                            <h2 className="text-lg font-bold text-red-700">
                                High Return Alert - Products with 50+ Returns in Last 30 Days
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {highReturnProducts.map((item) => (
                                <div 
                                    key={item.product} 
                                    className="bg-white rounded-lg p-4 border border-red-300 shadow-sm hover:shadow-md transition"
                                >
                                    <h3 className="text-md font-bold text-gray-900 mb-2">{item.product}</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Qty Returned:</span>
                                            <span className="font-semibold text-red-600">{item.totalQty}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Return Instances:</span>
                                            <span className="font-semibold">{item.returnCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-semibold">₹{item.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t">
                                            <span className="text-gray-600 text-xs">Companies: </span>
                                            <span className="text-xs font-medium">{Array.from(item.companies).join(", ")}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-gray-600 text-xs">Top Reason: </span>
                                            <span className="text-xs font-medium">
                                                {Object.entries(item.reasons)
                                                    .sort((a, b) => b[1] - a[1])[0][0]} 
                                                ({Object.entries(item.reasons)
                                                    .sort((a, b) => b[1] - a[1])[0][1]}x)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            })()}

            {/* Return Orders List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Return Orders
                        {selectedCompany !== "all" && ` - ${selectedCompany}`}
                        {selectedReturnReason !== "all" && ` (${selectedReturnReason})`}
                        {selectedReturnBy !== "all" && ` - ${selectedReturnBy}`}
                    </h2>
                    <span className="text-sm text-gray-600">
                        {filteredReturnOrders.length} return orders found
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 rounded-lg shadow-sm bg-white">
                        <thead className="bg-[#f3f4f6]">
                            <tr>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Return Date</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Product</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Qty</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Price</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Total</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Company</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Platform</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Reason</th>
                                <th className="px-4 py-2 text-left text-[14px] font-medium text-[#FF6B6B]">Return By</th>
                                <th className="px-4 py-2 text-center text-[14px] font-medium text-[#FF6B6B]">Edit</th>
                                <th className="px-4 py-2 text-center text-[14px] font-medium text-[#FF6B6B]">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReturnOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-gray-500 text-center py-6 text-[14px] font-medium">No return orders found.</td>
                                </tr>
                            ) : (
                                paginatedReturnOrders.map((returnOrder, idx) => (
                                    <tr
                                        key={returnOrder._id}
                                        className={`border-t ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}
                                    >
                                        <td className="px-4 py-2 text-[13px] font-medium">{returnOrder.date ? returnOrder.date.slice(0, 10) : ""}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">{returnOrder.product}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">{returnOrder.qty}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">₹{returnOrder.price}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">₹{returnOrder.qty * returnOrder.price}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">{returnOrder.company}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">{returnOrder.platforms.join(", ")}</td>
                                        <td className="px-4 py-2 text-[13px] font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                returnOrder.returnReason === 'Damaged' ? 'bg-red-100 text-red-800' :
                                                returnOrder.returnReason === 'OK' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {returnOrder.returnReason}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-[13px] font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                returnOrder.returnBy === 'RTO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {returnOrder.returnBy}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(returnOrder)}
                                                className="p-2 rounded hover:bg-[#ffe0e0] text-[#FF6B6B] cursor-pointer transition"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleDelete(returnOrder._id)}
                                                className="p-2 rounded hover:bg-[#ffebee] text-red-600 cursor-pointer transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {/* Footer Row */}
                        <tfoot>
                            <tr className="bg-[#f3f4f6]">
                                <td colSpan={2} className="px-4 py-2 text-[13px] font-semibold text-[#FF6B6B] text-right">Total:</td>
                                <td className="px-4 py-2 text-[13px] font-semibold text-[#FF6B6B]">
                                    {filteredReturnOrders.reduce((sum, order) => sum + order.qty, 0)}
                                </td>
                                <td className="px-4 py-2 text-[13px] font-semibold text-[#FF6B6B]">
                                    ₹{filteredReturnOrders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-[13px] font-semibold text-[#FF6B6B]">
                                    ₹{filteredReturnOrders.reduce((sum, order) => sum + order.qty * order.price, 0).toFixed(2)}
                                </td>
                                <td colSpan={6}></td>
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
                            className={`px-3 py-1 mx-1 rounded font-semibold cursor-pointer ${page === idx + 1 ? "bg-[#FF6B6B] text-white" : "bg-gray-100 text-gray-700"}`}
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
