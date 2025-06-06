import React, { useState, useEffect } from "react";
import "../Manage_product/history.css";
import { useAuth } from "../../components/introduce/useAuth";
import { useLoading } from "../introduce/Loading";
const History = ({ turnoff, customer, supplier }) => {
  const { startLoading, stopLoading } = useLoading();
  const [initialOrders, setInitialOrders] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    const response = async () => {
      try {
        startLoading();
        let url = "http://localhost:8080/api/products/history";
        if (customer) {
          url = "http://localhost:8080/api/sell/getHistoryCustomer";
        } else if (supplier) {
          url = "http://localhost:8080/api/products/get_history_supplier";
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Đảm bảo initialOrders luôn là mảng, kể cả khi các trường không tồn tại hoặc không phải mảng
        let arr = [];
        if (Array.isArray(data)) {
          arr = data;
        } else if (data && typeof data === 'object') {
          // Lấy trường đầu tiên là mảng nếu có
          for (const key in data) {
            if (Array.isArray(data[key])) {
              arr = data[key];
              break;
            }
          }
        }
        setInitialOrders(arr);
        stopLoading();
      } catch (error) {
        console.log(error);
      }
    };
    response();
  }, [customer, supplier, user]);
  // const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  //   Lọc các đơn hàng theo tìm kiếm
  const safeOrders = Array.isArray(initialOrders) ? initialOrders : [];
  const filteredOrders = safeOrders.filter((order) => {
    if (supplier) {
      return (
        order.employee?.name?.toLowerCase().includes(searchTerm) ||
        (order.supplier?.toLowerCase?.() || "").includes(searchTerm) ||
        (order.action?.toLowerCase?.() || "").includes(searchTerm)
      );
    }
    if (customer) {
      return (
        order.employee?.name?.toLowerCase().includes(searchTerm) ||
        (order.customer?.toLowerCase?.() || "").includes(searchTerm) ||
        (order.action?.toLowerCase?.() || "").includes(searchTerm)
      );
    }
    return (
      order.employee?.name?.toLowerCase().includes(searchTerm) ||
      (order.product?.toLowerCase?.() || "").includes(searchTerm) ||
      (order.action?.toLowerCase?.() || "").includes(searchTerm)
    );
  });
  // Cập nhật selectedOrders mỗi khi filteredOrders thay đổi
  useEffect(() => {
    setSelectedOrders(new Array(filteredOrders.length).fill(false));
  }, [filteredOrders.length]); // Chỉ theo dõi độ dài của filteredOrders

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng tính từ 0 nên phải +1
    const day = date.getDate().toString().padStart(2, "0");

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}, ngày ${day}/${month}/${year}`;
  }
  return (
    <div className="history-mgmt-main" style={{ background: 'rgba(30, 40, 80, 0.18)', zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
      <div className="history-mgmt-container" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #1e88e522', padding: 36, minWidth: 480, maxWidth: 800, width: '100%', position: 'relative', animation: 'fadeInUp 0.4s', transition: 'box-shadow 0.3s' }}>
        <div className="close" onClick={turnoff} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#1e88e5', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }}>x</div>
        <div className="history-mgmt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="history-mgmt-title" style={{ color: '#1e88e5', fontWeight: 700, letterSpacing: 1, textShadow: '0 2px 8px #b3c6ff' }}>Lịch sử thay đổi</h2>
          <div className="history-mgmt-header-controls" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              className="history-mgmt-search"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ borderRadius: 16, border: '1.5px solid #b3c6ff', padding: '8px 18px', fontSize: 16, minWidth: 220, background: '#fff', boxShadow: '0 1px 4px #b3c6ff22', outline: 'none', transition: 'border 0.3s' }}
              onFocus={e => e.target.style.border = '1.5px solid #1e88e5'}
              onBlur={e => e.target.style.border = '1.5px solid #b3c6ff'}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 18 }}>
          <table className="history-mgmt-table" style={{ width: '100%', borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 24px #b3c6ff33', transition: 'box-shadow 0.3s', marginBottom: 0 }}>
            <thead style={{ background: '#f0f4fa' }}>
              <tr style={{ color: '#1e88e5', fontWeight: 700, fontSize: 16 }}>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
                {!supplier && !customer ? (
                  <th>Product</th>
                ) : !supplier ? (
                  <th>Customer</th>
                ) : (
                  <th>Supplier</th>
                )}
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={index} style={{ transition: 'background 0.2s', background: index % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ fontWeight: 600, color: '#1e88e5' }}>
                    {order.employee.name} <br />
                    <small style={{ color: '#64748b' }}>{order.employee.email}</small>
                  </td>
                  <td style={{ color: '#1e293b', fontWeight: 500 }}>{formatDateTime(order.timestamp)}</td>
                  <td>
                    <span className={`history-mgmt-status ${order.action}`} style={{
                      padding: '4px 14px',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 14,
                      background: order.action === 'update' ? 'linear-gradient(90deg, #ffd200 0%, #f7971e 100%)' : order.action === 'delete' ? 'linear-gradient(90deg, #ff5858 0%, #f857a6 100%)' : 'linear-gradient(90deg, #43cea2 0%, #1e88e5 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 8px #b3c6ff22',
                      transition: 'background 0.3s',
                    }}>{order.action}</span>
                  </td>
                  {!supplier && !customer ? (
                    <td style={{ color: '#1e293b', fontWeight: 500 }}>{order.product}</td>
                  ) : !supplier ? (
                    <td style={{ color: '#1e293b', fontWeight: 500 }}>{order.customer}</td>
                  ) : (
                    <td style={{ color: '#1e293b', fontWeight: 500 }}>{order.supplier}</td>
                  )}
                  <td style={{ color: '#64748b', fontSize: 15 }}>{order.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
