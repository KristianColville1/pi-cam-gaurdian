import React from "react";

// Define the list of providers as functions that take children
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { ThemeProvider } from "./ThemeContext";

const providers = [ThemeProvider, AuthProvider, ToastProvider];

export const AllContext = ({ children }) => {
    // eslint-disable-next-line
    return providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
    }, children);
};
