import ProtectedRoutes from "./utils/ProtectedRoutes";
import HomeScreen from "./components/landing/HomeScreen";
import LoginForm from "./components/auth/LoginForm";

function App() {
  return (
    <Routes>
      <Route path="/app" element={<LoginForm />} />
      <Route
        path="/app/home"
        element={
          <ProtectedRoutes>
            <HomeScreen />
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
}

export default App;