import { createContext, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToasterContext = createContext();

export const ToasterProvider = ({ children }) => {
  const showToaster = ({ message, status, autoClose = 2000 }) => {
    if (status === "success") {
      toast.success(message, { autoClose });
    } else if (status === "error") {
      toast.error(message, { autoClose });
    }
  };

  return (
    <ToasterContext.Provider value={{ showToaster }}>
      {children}
      <ToastContainer 
        position="top-right"
        className="!w-full sm:!w-auto"
        toastClassName="!w-full sm:!w-auto !max-w-[300px] sm:!max-w-none !text-sm sm:!text-base"
        bodyClassName="!text-sm sm:!text-base"
      />
    </ToasterContext.Provider>
  );
};

export const useToaster = () => useContext(ToasterContext);