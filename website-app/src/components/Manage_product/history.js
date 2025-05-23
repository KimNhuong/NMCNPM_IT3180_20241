import React, { useState, useEffect } from "react";
import '../Manage_product/history.css';
import { useAuth } from "../../components/introduce/useAuth";
import {useLoading} from '../introduce/Loading'
const History = ({turnoff,customer,supplier}) => {
  const {startLoading,stopLoading}=useLoading();
    const [initialOrders,setInitialOrders]=useState([])
    const {user} =useAuth()
useEffect(()=>{
    const response =async ()=>{
        try{startLoading();
          let url='http://localhost:5000/products/history'
          if(customer){
            url='http://localhost:5000/sell/get_history_customer'
          }else if(supplier){
            url='http://localhost:5000/products/get_history_supplier'
          }
          
           const response= await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        user:user
        }),
      })
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setInitialOrders(data);
      stopLoading()
      ;}catch(error){
console.log(error)
      } 
      
}
response();
},[])    
  // const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
//   Lọc các đơn hàng theo tìm kiếm
  const filteredOrders = initialOrders.filter(order => {
    if(supplier){
return order.employee.name.toLowerCase().includes(searchTerm) ||
order.supplier.toLowerCase().includes(searchTerm) ||
order.action.toLowerCase().includes(searchTerm)
    }
    if(customer){
      return order.employee.name.toLowerCase().includes(searchTerm) ||
order.customer.toLowerCase().includes(searchTerm) ||
order.action.toLowerCase().includes(searchTerm)
    }
    return order.employee.name.toLowerCase().includes(searchTerm) ||
    order.product.toLowerCase().includes(searchTerm) ||
    order.action.toLowerCase().includes(searchTerm)
 } );
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
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng tính từ 0 nên phải +1
    const day = date.getDate().toString().padStart(2, '0');
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}, ngày ${day}/${month}/${year}`;
}
  return (
    <div className="history-mgmt-main">
    <div className="history-mgmt-container">
    <div className="close" onClick={turnoff}>x</div>
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
            <th>Status</th>
            {!supplier&&!customer?<th>Product</th>:(!supplier?<th>customer</th>:<th>supplier</th>)}
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={index}>
              <td>{order.employee.name} <br /> <small>{order.employee.email}</small></td>
              <td>{formatDateTime(order.timestamp)}</td>
              <td>
                <span className={`history-mgmt-status ${order.action}`}>
                  {order.action}
                </span>
              </td>
              {!supplier&&!customer?<td>{order.product}</td>:(!supplier?<td>{order.customer}</td>:<td>{order.supplier}</td>)}
              <td>
              {order.details}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></div>
  );
};

export default History;
