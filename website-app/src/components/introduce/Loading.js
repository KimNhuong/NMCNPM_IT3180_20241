import React, { createContext, useState, useContext } from 'react';
import './loading.css'
// Tạo LoadingContext
const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Hàm để kích hoạt loading
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Component Loading hiển thị
export const Loading = () => {
  const { loading } = useLoading();
  
  return (
    loading ? (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    ) : null
  );
};
