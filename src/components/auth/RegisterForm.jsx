import { useState } from "react";
import { useForm } from "react-hook-form";
import { UserRound, Lock, Phone, ShoppingBag, Eye, EyeOff, Mail } from "lucide-react";
import { useToaster } from "../../context/ToasterContext";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../../API/authApi";

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const { showToaster } = useToaster();
    const [registerUser, { isLoading }] = useRegisterUserMutation();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await registerUser(data).unwrap();
            if (response.statusCode === 201) {
                showToaster({ message: response.message, status: "success" });
                navigate("/");
            } else if (response.statusCode === 409) {
                showToaster({ message: response.message, status: "error" });
            } else {
                showToaster({ message: "Registration failed!", status: "error" });
            }
            console.log("Register Response:", response);
        } catch (error) {
            showToaster({ message: error?.data?.message || "Registration failed!", status: "error" });
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#008080]/10 mb-3">
                        <ShoppingBag className="text-[#008080] w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#008080]">Prapatti Store</h1>
                    <p className="text-gray-600 text-sm text-center mt-1">
                        Create your account to start buying & selling products!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Name
                        </label>
                        <div className="relative">
                            <UserRound className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                {...register("name", { required: "Name is required" })}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none 
                                    focus:ring-2 focus:ring-[#008080] focus:border-transparent 
                                    ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter your name"
                            />
                        </div>
                        {errors.name?.message && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none 
                                    focus:ring-2 focus:ring-[#008080] focus:border-transparent 
                                    ${errors.email ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errors.email?.message && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters",
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                                        message:
                                            "Must include uppercase, lowercase, number & special char",
                                    },
                                })}
                                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none 
                                    focus:ring-2 focus:ring-[#008080] focus:border-transparent 
                                    ${errors.password ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-[#008080] cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password.message && String(errors.password.message)}
                            </p>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                {...register("mobile", {
                                    required: "Mobile number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Enter a valid 10-digit mobile number",
                                    },
                                })}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none 
                                    focus:ring-2 focus:ring-[#008080] focus:border-transparent 
                                    ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter your mobile number"
                            />
                        </div>
                        {errors.mobile?.message && (
                            <p className="text-red-500 text-xs mt-1">{String(errors.mobile.message)}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-[#008080] text-white py-2.5 rounded-lg font-semibold 
                            hover:bg-[#006666] transition shadow-md cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Already have an account?{" "}
                        <Link to="/" className="text-[#008080] font-medium hover:underline cursor-pointer">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}