import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import HomeScreen from "./components/landing/HomeScreen";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import CompanyScreen from "./components/company/CompanyScreen";
import OrderScreen from "./components/Order/OrderScreen";
import ReturnOrderScreen from "./components/ReturnOrder/ReturnOrderScreen";
import TapeRollScreen from "./components/TapRoll/TapeRollScreen";
import KraftMailerScreen from "./components/KraftMailer/KraftMailerScreen";

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/app" element={<LoginForm />} />
                <Route path="/app/register" element={<RegisterForm />} />
                <Route
                    path="/app/home"
                    element={
                        <ProtectedRoutes>
                            <HomeScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/app/company"
                    element={
                        <ProtectedRoutes>
                            <CompanyScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/app/order"
                    element={
                        <ProtectedRoutes>
                            <OrderScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/app/return-order"
                    element={
                        <ProtectedRoutes>
                            <ReturnOrderScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/app/kraftmailer-screen"
                    element={
                        <ProtectedRoutes>
                            <KraftMailerScreen />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="/app/taperoll-screen"
                    element={
                        <ProtectedRoutes>
                            <TapeRollScreen />
                        </ProtectedRoutes>
                    }
                />
            </Routes>
        </Router>
    );
}