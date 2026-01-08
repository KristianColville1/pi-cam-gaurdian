import React from "react";

// Define the list of providers as functions that take children
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { ThemeProvider } from "./ThemeContext";
import { SensorDataProvider } from "./SensorDataContext";
import { ApiDocsProvider } from "./ApiDocsContext";
import { HistoricalMetricsProvider } from "./HistoricalMetricsContext";
import { StorageProvider } from "./StorageContext";

const providers = [
    ThemeProvider,
    AuthProvider,
    ToastProvider,
    SensorDataProvider,
    ApiDocsProvider,
    HistoricalMetricsProvider,
    StorageProvider,
];

/**
 * AllContext component
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides all the contexts to the application.
 */
export const AllContext = ({ children }) => {
    // eslint-disable-next-line
    return providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
    }, children);
};
