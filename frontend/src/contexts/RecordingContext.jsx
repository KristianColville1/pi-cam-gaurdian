import React, { createContext, useState, useContext } from 'react';

export const RecordingContext = createContext();

/**
 * RecordingProvider - manages recording state globally
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides the RecordingContext to track recording state across components.
 */
export const RecordingProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const value = {
    isRecording,
    startRecording,
    stopRecording,
  };

  return <RecordingContext.Provider value={value}>{children}</RecordingContext.Provider>;
};

/**
 * useRecording hook
 * @returns {Object}
 * @description Provides the RecordingContext to the component.
 */
export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }
  return context;
};

