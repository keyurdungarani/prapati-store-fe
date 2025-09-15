import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, PlusCircle, Building2 } from "lucide-react";
import {
    useAddCompanyMutation,
    useListCompaniesQuery,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} from "../../API/companyApi";

const PLATFORMS = ["Amazon", "Flipkart", "Meesho"];

export default function CompanyManager() {
    const { data, refetch } = useListCompaniesQuery();
    const companies = data?.data || [];
    const [addCompany] = useAddCompanyMutation();
    const [updateCompany] = useUpdateCompanyMutation();
    const [deleteCompany] = useDeleteCompanyMutation();

    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { name: "", platforms: [] },
    });

    // Handle add or update
    const onSubmit = async (data) => {
        setError("");
        try {
            if (editing) {
                await updateCompany({ id: editing._id, ...data }).unwrap();
                setEditing(null);
            } else {
                await addCompany(data).unwrap();
            }
            reset();
            refetch();
        } catch (e) {
            setError(e?.data?.message || "Operation failed!");
        }
    };

    // Handle edit
    const handleEdit = (company) => {
        setEditing(company);
        setValue("name", company.name);
        setValue("platforms", company.platforms);
    };

    // Handle delete
    const handleDelete = async (id) => {
        setError("");
        try {
            await deleteCompany(id).unwrap();
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

    return (
        <section className="flex items-center justify-center bg-white p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="text-[#008080] w-10 h-10" />
                    <h1 className="text-2xl font-bold text-[#008080]">Company Management</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-600 text-sm text-center mb-2 font-medium">{error}</div>
                )}

                {/* Add/Edit Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Company Name</label>
                        <input
                            type="text"
                            {...register("name", { required: "Name is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] ${errors.name ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter company name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
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
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-[#008080] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#006666] transition shadow-md cursor-pointer"
                        >
                            <PlusCircle size={18} />
                            {editing ? "Update Company" : "Add Company"}
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

                {/* Company List */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Companies</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-[#f1f5f9] text-gray-700">
                                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                                    <th className="py-3 px-4 text-left font-semibold">Platforms</th>
                                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-gray-500 text-center py-6">
                                            No companies found.
                                        </td>
                                    </tr>
                                ) : (
                                    companies.map((company, idx) => (
                                        <tr key={company._id} className={idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                                            <td className="py-3 px-4">{company.name}</td>
                                            <td className="py-3 px-4">{company.platforms.join(", ")}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="inline-flex items-center p-2 rounded hover:bg-gray-100 text-[#008080] cursor-pointer mr-2"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company._id)}
                                                    className="inline-flex items-center p-2 rounded hover:bg-gray-100 text-red-600 cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}