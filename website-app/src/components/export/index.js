import React, { useState,useEffect } from "react";
import '../export/index.css';

const initialOrders = [
  { id: 1532, client: "John Carter", email: "hello@johncarter.com", date: "2024-01-30", status: "Delivered", country: "United States", total: 1099.24 },
  { id: 1531, client: "Sophie Moore", email: "contact@sophiemoore.com", date: "2024-01-27", status: "Canceled", country: "United Kingdom", total: 5870.32 },
  { id: 1530, client: "Matt Cannon", email: "info@mattcannon.com", date: "2024-01-24", status: "Delivered", country: "Australia", total: 13899.48 },
  { id: 1529, client: "Graham Hills", email: "hi@grahamhills.com", date: "2024-01-21", status: "Pending", country: "India", total: 1569.12 },
  { id: 1528, client: "Sandy Houston", email: "contact@sandyhouston.com", date: "2024-01-18", status: "Delivered", country: "Canada", total: 899.16 },
  { id: 1527, client: "Andy Smith", email: "hello@andysmith.com", date: "2024-01-15", status: "Pending", country: "United States", total: 2449.64 },
];

const OrderManagement = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const handleEditClick = (index, order) => {
    setEditingIndex(index);
    setEditedOrder({ ...order });
  };
  let count=0;
  const handleSaveClick = () => {
    const updatedOrders = [...orders];
    updatedOrders[editingIndex] = editedOrder;
    setOrders(updatedOrders);
    setEditingIndex(null); // Thoát khỏi chế độ chỉnh sửa
  };

  const handleCancelClick = () => {
    setEditingIndex(null); // Hủy chỉnh sửa
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prevOrder => ({ ...prevOrder, [name]: value }));
  };
  const filteredOrders = orders.filter(order => 
    order.client.toLowerCase().includes(searchTerm) ||
    order.email.toLowerCase().includes(searchTerm) ||
    order.country.toLowerCase().includes(searchTerm)
  );


  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  return (
    <div className="order-mgmt-container">
      <div className="order-mgmt-header">
        <h2 className="order-mgmt-title">Quản lý đơn hàng</h2>
        <div className="order-mgmt-header-controls">
        <input
            type="text"
            className="order-mgmt-search"
            placeholder="Search for..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="order-mgmt-create-btn">Create Order</button>
          <button className="order-mgmt-history-btn">Lịch sử</button>
        </div>
      </div>

      <table className="order-mgmt-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Client</th>
            <th>Date</th>
            <th>Status</th>
            <th>Country</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                {editingIndex === index ? (
                 <div>
                 <input
                   type="text"
                   name="client"
                   value={editedOrder.client}
                   onChange={handleEditChange}
                 />
                 <input
                   type="email"
                   name="email"
                   value={editedOrder.email}
                   onChange={handleEditChange}
                 />
               </div>
             ) : (
               <div>
                 {order.client} <br />
                 <small>{order.email}</small>
               </div>
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="date"
                    name="date"
                    value={editedOrder.date}
                    onChange={handleEditChange}
                  />
                ) : (
                  order.date
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <select
                    name="status"
                    value={editedOrder.status}
                    onChange={handleEditChange}
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                ) : (
                  <span className={`order-mgmt-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="text"
                    name="country"
                    value={editedOrder.country}
                    onChange={handleEditChange}
                  />
                ) : (
                  order.country
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="String"
                    name="total"
                    value={editedOrder.total}
                    onChange={handleEditChange}
                    step="0.01"
                  />
                ) : (
                  `$${order.total}`
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <>
                    <button className="order-mgmt-button save" onClick={handleSaveClick}>Save</button>
                    <button className="order-mgmt-button cancel" onClick={handleCancelClick}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="order-mgmt-button edit" onClick={() => handleEditClick(index, order)}>✏️</button>
                    <button className="order-mgmt-button delete">🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;
