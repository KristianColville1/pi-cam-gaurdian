import React, { createContext, useState, useCallback } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
// Create the ToastContext
export const ToastContext = createContext();



// ToastProvider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Function to show the toast with a message
    const triggerToast = useCallback((variant, title, message) => {
        const id = Date.now(); // Unique ID for each toast
        setToasts((prevToasts) => [
            ...prevToasts,
            { id, variant: variant.toLowerCase(), title, message },
        ]);
        setTimeout(() => {
            setToasts((prevToasts) =>
                prevToasts.filter((toast) => toast.id !== id)
            );
        }, 5500);
    }, []);

    return (
        <ToastContext.Provider value={{ triggerToast }}>
            {children}
            {/* Bootstrap ToastContainer for positioning the toasts */}
            <ToastContainer
                position="top-end"
                className="p-3 position-fixed mt-4"
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        bg={toast.variant}
                        onClose={() =>
                            setToasts((prevToasts) =>
                                prevToasts.filter((t) => t.id !== toast.id)
                            )
                        }
                        show={true}
                        delay={4000}
                        autohide
                    >
                        <Toast.Header>
                            <strong className="me-auto">{toast.title}</strong>
                        </Toast.Header>
                        <Toast.Body
                            className={`${
                                toast.variant === "dark" ||
                                toast.variant === "success"
                                    ? "text-white"
                                    : ""
                            } text-center`}
                        >
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};
