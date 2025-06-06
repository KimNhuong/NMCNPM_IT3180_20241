import React, { useState, useEffect } from "react";
import { useAuth } from "../introduce/useAuth";
import { useLoading } from "../introduce/Loading";
import { FaRegBell } from "react-icons/fa"; // Import đúng biểu tượng
import "./noti.css";

const Notification = () => {
  const { startLoading, stopLoading } = useLoading();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Hàm để lấy sản phẩm
  const fetchProducts = async () => {
    if (loading || !user) return;

    setIsFetching(true);
    startLoading();

    try {
      const response = await fetch("http://localhost:5000/products/show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const filteredProducts = data.filter(
        (product) => product.stock_in_Warehouse < product.reorderLevel
      );

      setProducts(filteredProducts);
      setHasUnreadNotifications(filteredProducts.length > 0);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      stopLoading();
      setIsFetching(false);
    }
  };

  // Cập nhật sản phẩm mỗi khi có thay đổi hoặc theo chu kỳ
  useEffect(() => {
    if (user && !loading) {
      fetchProducts(); // Lần đầu tiên gọi hàm để lấy dữ liệu sản phẩm
      const interval = setInterval(fetchProducts, 6000000); // Cập nhật mỗi phút

      // Cleanup interval khi component bị unmount
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  // Hiển thị thông báo khi click vào chuông
  const handleBellClick = () => {
    if (isFetching) return; // Tránh gọi API nếu đang tải dữ liệu
    setIsVisible((prev) => !prev);
    if (!isVisible) {
      fetchProducts();
      setHasUnreadNotifications(false);
    }
  };
  

  return (
    <div className="notification-container">
      <FaRegBell
        className="notification-bell"
        onClick={handleBellClick}
        style={{
          cursor: "pointer",
          color: hasUnreadNotifications ? "black" : "gray",
          fontSize: "24px",
        }}
      />
      
      {/* Hiển thị hình tròn đỏ nếu có thông báo */}
      {hasUnreadNotifications && (
        <div className="notification-badge">{products.length}</div>
      )}

      {/* Hiển thị popup thông báo */}
      <div className={`notification-popup ${isVisible ? "show" : ""}`}>
        <div className="notification-header">
          <h4>Bạn có tin nhắn mới</h4>
        </div>
        <div className="notification-content">
          {isFetching ? (
            <p>Đang tải...</p>
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div className="notification-item" key={index}>
                <img
                  src={product.image?.secure_url || "https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"}
                  alt="Product"
                  style={{ width: "30px", height: "30px" }}
                />
                <div className="notification-details">
                  <p className="notification-name">{product.name}</p>
                  <p className="notification-stock">
                    {`Số lượng trong kho: ${product.stock_in_Warehouse}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>Không có thông báo nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;