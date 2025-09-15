import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../API/authApi";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [loginUser, { isLoading }] = useLoginUserMutation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/order", { replace: true });
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setErrorMessage("");
        try {
            const response = await loginUser(data).unwrap();
            if (response.statusCode === 200) {
                localStorage.setItem("token", response.data.token);
                navigate("/order");
            } else if (response.statusCode === 401) {
                setErrorMessage(response.message);
            } else {
                setErrorMessage("Login failed!");
            }
        } catch (error) {
            setErrorMessage(error?.data?.message || "Login failed!");
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
                        Login to buy and sell products online!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Show error message */}
                    {errorMessage && (
                        <div className="text-red-600 text-sm text-center mb-2 font-medium">
                            {errorMessage}
                        </div>
                    )}
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

                    {/* Remember Me */}
                    <div className="flex items-center text-sm">
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                            <input type="checkbox" className="accent-[#008080] cursor-pointer" /> Remember Me
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-[#008080] text-white py-2.5 rounded-lg font-semibold 
                            hover:bg-[#006666] transition shadow-md cursor-pointer"
                    >
                        Login
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-[#008080] font-medium hover:underline cursor-pointer">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}