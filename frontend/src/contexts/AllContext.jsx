import React from "react";

// Define the list of providers as functions that take children
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { ThemeProvider } from "./ThemeContext";
import { SensorDataProvider } from "./SensorDataContext";

const providers = [ThemeProvider, AuthProvider, ToastProvider, SensorDataProvider];

export const AllContext = ({ children }) => {
    // eslint-disable-next-line
    return providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
    }, children);
};
