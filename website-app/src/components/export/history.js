import React, { useState, useEffect } from "react";
import "./history.css";
import { useAuth } from "../introduce/useAuth";
import { useLoading } from "../introduce/Loading";
import CustomerForm from "./formcustomer";
const History = ({ turnoff }) => {
  const { startLoading, stopLoading } = useLoading();
  const [showcustomer, FormShowcustomer] = useState(false);
  const [showBill, FormShowbill] = useState(false);
  const [initialOrders, setInitialOrders] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    const response = async () => {
      try {
        startLoading();
        const response = await fetch(
          "http://localhost:8080/api/sell/getHistory",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data);
        // Xử lý dữ liệu trả về từ API: nếu có data.data thì lấy data.data, nếu là mảng thì lấy luôn
        let orders = [];
        if (Array.isArray(data)) {
          orders = data;
        } else if (data && Array.isArray(data.data)) {
          orders = data.data;
        }
        setInitialOrders(orders);
        stopLoading();
      } catch (error) {
        console.log(error);
      }
    };
    response();
  }, []);
  // const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  //   Lọc các đơn hàng theo tìm kiếm
  const filteredOrders = initialOrders.filter((order) => {
    // Sử dụng creator thay vì creater, và kiểm tra null an toàn
    const ownerName = order.owner?.name?.toLowerCase() || "";
    const creatorName = order.creator?.name?.toLowerCase() || "";
    const orderDate = formatDateTime(order.orderDate || order.createdAt || "").toLowerCase();
    const customerPhone = order.customerId?.phone?.toLowerCase() || "";
    if (customerPhone) {
      return (
        ownerName.includes(searchTerm) ||
        creatorName.includes(searchTerm) ||
        orderDate.includes(searchTerm) ||
        customerPhone.includes(searchTerm)
      );
    } else {
      return (
        ownerName.includes(searchTerm) ||
        creatorName.includes(searchTerm) ||
        orderDate.includes(searchTerm)
      );
    }
  });
  // Cập nhật selectedOrders mỗi khi filteredOrders thay đổi
  useEffect(() => {
    setSelectedOrders(new Array(filteredOrders.length).fill(false));
  }, [filteredOrders.length]); // Chỉ theo dõi độ dài của filteredOrders

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const show_bill = (a) => {
    FormShowbill(a);
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
  function show_customer(a) {
    FormShowcustomer(a);
  }
  return (
    <>
      {showBill && (
        <CustomerForm
          show_bill={showBill}
          close={() => {
            FormShowbill(false);
          }}
        />
      )}
      {showcustomer && (
        <CustomerForm
          show_customer={showcustomer}
          close={() => {
            FormShowcustomer(false);
          }}
        />
      )}
      <div className="history-mgmt-main">
        <div className="history-mgmt-container">
          <div className="close" onClick={turnoff}>
            x
          </div>
          <div className="history-mgmt-header">
            <h2 className="history-mgmt-title">History</h2>
            <div className="history-mgmt-header-controls">
              <input
                type="text"
                className="history-mgmt-search"
                placeholder="Search for..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {/* <input
            type="month"
            className="history-mgmt-date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          /> */}
            </div>
          </div>

          <table className="history-mgmt-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Money</th>
                <th>Product</th>
                <th>customer</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order._id || index}>
                  <td>
                    {/* Ưu tiên creator, fallback creater */}
                    {(order.creator?.name || order.creater?.name) || ""} <br />
                    <small>{(order.creator?.email || order.creater?.email) || ""}</small>
                  </td>
                  <td>{formatDateTime(order.orderDate || order.createdAt || "")}</td>
                  <td>
                    <span
                      className={`history-mgmt-status`}
                      style={{ display: "block" }}
                    >
                      {(order.totalAmount || "") + " đồng"}
                    </span>
                    <span
                      className={`history-mgmt-status`}
                      style={{ display: "block" }}
                    >
                      {"discount : " + (order.discount || "0") + " % "}
                    </span>
                    <span
                      className={`history-mgmt-status`}
                      style={{ display: "block" }}
                    >
                      {"vat : " + (order.vat || "0") + " % "}
                    </span>
                  </td>
                  <td
                    className="have_phone"
                    onClick={() => {
                      show_bill(order.items);
                    }}
                  >
                    Click để xem chi tiết{" "}
                  </td>
                  <td
                    onClick={() => {
                      show_customer(order.customerId);
                    }}
                    className={
                      order.customerId && order.customerId.phone
                        ? "have_phone"
                        : ""
                    }
                  >
                    {order.customerId && order.customerId.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default History;
