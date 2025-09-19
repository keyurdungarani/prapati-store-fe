import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdCall } from "react-icons/md";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-md font-inter">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Brand Name */}
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-[#008080]">
                            Prapatti Store
                        </Link>
                    </div>

                    {/* Center: Menu */}
                    <nav className="flex-1 flex justify-center items-center gap-8">
                        <Link to="/company" className="text-base font-medium text-gray-700 hover:text-[#008080] transition">
                            Company
                        </Link>
                        <Link to="/order" className="text-base font-medium text-gray-700 hover:text-[#008080] transition">
                            Order
                        </Link>
                        <Link to="/return-order" className="text-base font-medium text-gray-700 hover:text-[#FF6B6B] transition">
                            Return Orders
                        </Link>
                    </nav>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-full bg-white border border-[#008080] text-[#008080] text-sm font-semibold hover:bg-[#008080] hover:text-white transition cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}