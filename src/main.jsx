import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import AppRoutes from "./routes";
import store from "./store";
import { ToasterProvider } from "./context/ToasterContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ToasterProvider>
      <AppRoutes />
    </ToasterProvider>
  </Provider>
);
