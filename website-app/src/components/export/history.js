import React, { useState, useEffect } from "react";
import './history.css';
import { useAuth } from "../introduce/useAuth";
import {useLoading} from '../introduce/Loading'
import CustomerForm from "./formcustomer";
const History = ({turnoff}) => {
  const {startLoading,stopLoading}=useLoading();
  const [showcustomer,FormShowcustomer] = useState(false);
  const [showBill,FormShowbill] = useState(false);
    const [initialOrders,setInitialOrders]=useState([])
    const {user} =useAuth()
useEffect(()=>{
    const response =async ()=>{
        try{startLoading();
           const response= await fetch('http://localhost:5000/sell/get_history', {
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
      console.log(data)
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
    if(order.customerId&&order.customerId.phone){
      return order.owner.name.toLowerCase().includes(searchTerm) ||
    formatDateTime(order.orderDate).toLowerCase().includes(searchTerm) ||
    order.customerId.phone.toLowerCase().includes(searchTerm)
    }else{
      return order.owner.name.toLowerCase().includes(searchTerm) ||
    formatDateTime(order.orderDate).toLowerCase().includes(searchTerm) 
    }
  }
    
  );
  // Cập nhật selectedOrders mỗi khi filteredOrders thay đổi
  useEffect(() => {
    setSelectedOrders(new Array(filteredOrders.length).fill(false));
  }, [filteredOrders.length]); // Chỉ theo dõi độ dài của filteredOrders

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const show_bill = (a) => {
    FormShowbill(a)
  }
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
  function show_customer(a){
    FormShowcustomer(a)
  }
  return (
    <>
    {showBill&&<CustomerForm show_bill={showBill} close={()=>{FormShowbill(false)}}/>}
    {showcustomer&&<CustomerForm show_customer={showcustomer} close={()=>{FormShowcustomer(false)}}/>}
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
            <th>Money</th>
            <th>Product</th>
            <th>customer</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={index}>
              <td>{order.creater.name} <br /> <small>{order.creater.email}</small></td>
              <td>{formatDateTime(order.orderDate)}</td>
              <td>
                <span className={`history-mgmt-status`} style={{display:"block"}}>
                  {order.totalAmount+" đồng"} 
                </span>
                 <span className={`history-mgmt-status`} style={{display:"block"}}>{"discount : "+order.discount+" % "}</span>
                 <span className={`history-mgmt-status`} style={{display:"block"}}>{"vat : "+order.vat+" % "}</span>
              </td>
              <td className="have_phone" onClick={()=>{show_bill(order.items)}}>Click để xem chi tiết </td>
              <td onClick={()=>{show_customer(order.customerId)}} className={order.customerId&&order.customerId.phone? "have_phone":""}>
              {order.customerId&&order.customerId.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></div>
    </>
  );
};

export default History;
