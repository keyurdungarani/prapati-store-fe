import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import HomeScreen from "./components/landing/HomeScreen";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import CompanyScreen from "./components/company/CompanyScreen";
import OrderScreen from "./components/Order/OrderScreen";
import ReturnOrderScreen from "./components/ReturnOrder/ReturnOrderScreen";

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoutes>
                            <HomeScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/company"
                    element={
                        <ProtectedRoutes>
                            <CompanyScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/order"
                    element={
                        <ProtectedRoutes>
                            <OrderScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/return-order"
                    element={
                        <ProtectedRoutes>
                            <ReturnOrderScreen />
                        </ProtectedRoutes>
                    }
                />
            </Routes>
        </Router>
    );
}