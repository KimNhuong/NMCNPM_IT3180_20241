import React, { useState, useEffect, useCallback,useContext,useImperativeHandle, forwardRef } from "react";
import '../test/index.css';
import { AuthContext } from "../../components/introduce/AuthContext";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import {useAuth} from "../../components/introduce/useAuth"
import { useLoading } from "../../components/introduce/Loading";
import { notify } from "../../components/Notification/notification";
let apiFetchOrderHistory; 

const OrderManagement = forwardRef(({ onCreateOrder, onHistory,openModalDetail,setIdOrder,refOrder,setView,setLoadOrder,setLoadLog,loadOrder })=> {
  const [orders, setOrders] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [noteDetail, setNoteDetail] = useState(null); // Thay đổi state để theo dõi chỉ số đơn hàng đang chỉnh sửa
  const {startLoading,stopLoading} = useLoading
  // const {user} = useContext(AuthContext)
  const {user,loading} = useAuth()
  
  const createorder = (order) => {
    return {
      id: order._id,
      tax:order.tax,
      client: order.nameSupplier,
      email: order.emailSupplier,
      status: order.generalStatus,
      date: order.updatedAt,
      country: 'vn',
      total: order.amount,
      notes: order.notes || '', // Giả sử có trường "notes" trong dữ liệu đơn hàng
    };
  };


   const fetchOrder = async (keyword) => {
    try {
      const apiUrl = `http://localhost:5000/import/orderHistory/getOrder?search=${keyword}&ownerId=${user.id_owner}&userId=${user._id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch the order');
      }

      const data = await response.json();
      console.log(data,"new data")
      const regurlizationData = data.map(item => createorder(item));
      setOrders((prev)=>{
        const newData = [...regurlizationData]
        
        return newData;
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useImperativeHandle(refOrder,()=>({
    fetchOrder
  }))
  const updateData = async ( newData) => {
    try {
      newData.ownerId= user.id_owner;
      newData.user=user;
      const response = await fetch(`http://localhost:5000/import/orderHistory/updateOrderhistory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(newData),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
        return 0;
      }

      const data = await response.json(); // Đọc phản hồi trả về
      console.log('Update successful:', data);
      return 1;
    } catch (error) {
      console.error('Error during update:', error);
      return 0;
    }
  };
  apiFetchOrderHistory = fetchOrder;
  const debouncedFetchSuggestions = useCallback(
    debounce((keyword) => {
      fetchOrder(keyword);
    }, 500),
    [user,loading]
  );
  useEffect(() => {
    if(loading)return
      console.log("debub")
      debouncedFetchSuggestions(searchTerm.trim());
    }, [loading,loadOrder,user]);
  useEffect(() => {
    debouncedFetchSuggestions(searchTerm.trim());
  }, [searchTerm]);  

  const handleSaveClick = async () => {
    try {
      const updatedOrders = [...orders];
      const newOrder = { ...editedOrder, userid: user._id, userName: user.name };
      newOrder.date = new Date().toISOString();
  
      console.log(loadOrder);
      console.log("Đơn hàng mới:", newOrder);
  
    let i= await updateData(newOrder);
  
      updatedOrders[editingIndex] = editedOrder;
      setOrders(updatedOrders);
      setEditingIndex(null);
      setNoteDetail(null);
      if(i){
       notify(1, "you've updated importing goods", "Successfully!"); 
      }else{
        notify(2, "Error updating data", "Failed to update!"); 
      }
      setLoadOrder((prev) => !prev);
      setLoadLog((prev) => !prev);
    } catch (error) {
      console.error("Error in handleSaveClick:", error);
      notify(0, "Error updating data", "Failed to update!");
    }
  };

  const handleCancelClick = () => {
    setEditingIndex(null); // Hủy chế độ chỉnh sửa
    setNoteDetail(null);  // Ẩn ghi chú khi hủy
  };

  const handleEditClick = (index, order) => {
    setEditingIndex(index);
    setEditedOrder({ ...order });
    setNoteDetail(index); // Hiển thị ghi chú khi nhấn "Edit" vào đơn hàng cụ thể
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prevOrder => ({ ...prevOrder, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const transfer = (date) => {
    const date2 = new Date(date);
    if (isNaN(date2)) {
      return 'Invalid date';
    }
    return date2.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };
  return (
    <div className="order-mgmt-container">
      <div className="order-mgmt-header">
        <h2 className="order-mgmt-title">Order Status</h2>
        <div className="order-mgmt-header-controls">
          <input
            type="text"
            className="order-mgmt-search"
            placeholder="Search for..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="order-mgmt-create-btn" onClick={onCreateOrder}>Create Order</button>
          <button className="order-mgmt-history-btn" onClick={onHistory}>Lịch sử</button>
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
        <tbody >
          {orders.map((order, index) => (
            <React.Fragment key={order.id}>
              <tr >
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
                    transfer(order.date)
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <select
                      name="status"
                      value={editedOrder.status}
                      onChange={handleEditChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="deliveried">Deliveried</option>
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
                      type="number"
                      name="total"
                      style={{width:'100%'}}
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
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <button className="order-mgmt-button edit" onClick={() => handleEditClick(index, order) } style={{margin:0}}>✏️</button>
                      <FontAwesomeIcon icon={faCircleInfo} onClick={()=>{
                        setView(true)
                        openModalDetail();
                        setIdOrder(order.id)
                      }}
                       style={{height: '24px', witdh: '24px', padding:'8px'}} className="infoDetail"/>
                      </div>
                    </>
                  )}
                </td>
              </tr>

              {/* Render dòng ghi chú dưới mỗi đơn hàng khi nhấn Edit */}
              {editingIndex === index && noteDetail === index && (
                <tr>
                  <td colSpan="7">
                    <input
                      style={{outline:'none',border:'none'}}
                      type="text"
                      name="notes"
                      value={editedOrder.notes}
                      onChange={handleEditChange}
                      placeholder="Add your notes here"
                      className="note-input"
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
  
    </div>
  );
});

export default OrderManagement;

export {apiFetchOrderHistory}