
import React, { createContext, useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// Tạo Context
export const AuthContext = createContext();

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái tải dữ liệu người dùng
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      try {
        const decodedString = decodeURIComponent(storedUser);
        const userData = JSON.parse(decodedString);
        console.log("User data from cookie:", userData);
        setUser( userData);
      } catch (error) {
        console.error("Không thể giải mã hoặc phân tích dữ liệu người dùng:", error);
      }
    }
    setLoading(false); // Đánh dấu đã tải xong
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
