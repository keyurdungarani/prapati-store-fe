import { useLoginUserMutation } from "../API/authApi";
import { useNavigate } from "react-router-dom";

export default function AuthContainer({ children }) {
    const [loginUser] = useLoginUserMutation();
    const navigate = useNavigate();

    const handleLogin = async (data) => {
        try {
            const response = await loginUser(data).unwrap();
            if (response.statusCode === 200) {
                localStorage.setItem("token", response.data.token);
                navigate("/order");
            } else {
            }
        } catch (error) {
        }
    };
    return <>{children}</>;
}