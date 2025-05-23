import React, { useState, useEffect } from "react";
import '../Manage_product/history.css';
import { useAuth } from "../introduce/useAuth";
import {useLoading} from '../introduce/Loading'
import CustomerForm from "./formcustomer"
import { notify } from '../../components/Notification/notification';
import { default as HistoryComponent } from "../Manage_product/history.js";
import DeleteProductModal from "../Manage_product/Form_delete.js"
const History = ({turnoff,supplier}) => {
  const {startLoading,stopLoading}=useLoading();
    const [initialOrders,setInitialOrders]=useState([])
    const [formcustomer,setFormcustomer]=useState(false)
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedOrder, setEditedOrder] = useState(null);
    const [deletedOrder, setdeletedOrder] = useState(null);
    const {user} =useAuth()
    const [x,setX]=useState(true)
    const [showhistory,Setshowhistory]=useState(false)
    const [showdelete,Setshowdelete]=useState(false)
useEffect(()=>{
  let body={
    user: user
        }
    const responses =async ()=>{
      startLoading()
      let response;
      if(!supplier){
        response = await fetch('http://localhost:5000/sell/get_customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      }else{
        response = await fetch('http://localhost:5000/products/get_supplier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      }
      
      let datas = await response.json();
      console.log(datas)
      stopLoading();
      if(!supplier){
setInitialOrders(datas.customers)
      }else{
        setInitialOrders(datas.suppliers)
      }
      
}
responses();
},[x]) 
const change=()=>{
  setX(!x)
}
  // const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
//   Lọc các đơn hàng theo tìm kiếm
const filteredOrders = initialOrders.filter(order => 
    (order.name && order.name.includes(searchTerm)) ||
    (order.email && order.email.includes(searchTerm)) ||
    (order.phone && order.phone.includes(searchTerm)) ||
    (order.money && order.money.includes(searchTerm))
  );
  
  // Cập nhật selectedOrders mỗi khi filteredOrders thay đổi
  useEffect(() => {
    setSelectedOrders(new Array(filteredOrders.length).fill(false));
  }, [filteredOrders.length]); // Chỉ theo dõi độ dài của filteredOrders

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const onclosecustomer=()=>{
    setFormcustomer(false)
  }
  const onformcustomer=()=>{
    setFormcustomer(true)
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
const handleEditClick = (index, order) => {
  setEditingIndex(index);
  setEditedOrder({ ...order });
};
let count=0;
const isPhoneValid = (phone) => {
  const regex = /^[0-9]+$/;  // Kiểm tra chuỗi có 10 chữ số
  return regex.test(phone);
};
const handleSaveClick =async () => {
  if (!isPhoneValid(editedOrder.phone)) {
              stopLoading();
              notify(2, "Số điện thoại không hợp lệ", "Thất bại");
              return;
          }
  startLoading()
    let url='http://localhost:5000/sell/edit_customer'
  if(supplier){url='http://localhost:5000/products/edit_supplier'}
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user:user,
        ...(supplier ? { supplier_edit: editedOrder } : { customer_edit: editedOrder })
      }),
    });
    const data = await response.json();
    if(data.message=="success"){
      if(supplier) notify(1,"supplier đã được cập nhật","Thành công");else{
        notify(1,"khách hàng đã được cập nhật","Thành công")
      }
      const updatedOrders = [...initialOrders];
  updatedOrders[editingIndex] = editedOrder;
  setInitialOrders(updatedOrders);
  setEditingIndex(null); // Thoát khỏi chế độ chỉnh sửa
    }else{
      notify(2,data.message,"Thất bại")
    };
    stopLoading()
  

};

const handleCancelClick = () => {
  setEditingIndex(null); // Hủy chỉnh sửa
};
const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditedOrder(prevOrder => ({ ...prevOrder, [name]: value }));
};
const handleEditmoneyChange = (e) => {
  const { name, value } = e.target;
  if(value==""){setEditedOrder(prevOrder => ({ ...prevOrder, [name]: 0 }));return}
  let x=value.replace(/,/g,'').replace(/\./g, '')
  x=parseFloat(x).toLocaleString("vi-VN")
  setEditedOrder(prevOrder => ({ ...prevOrder, [name]: x }));
};
const delete_action=async(supplier,reason)=>{
  startLoading()
  let url='http://localhost:5000/sell/delete_customer'
if(supplier){url='http://localhost:5000/products/delete_supplier'}
console.log(url)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
   },
    body: JSON.stringify({
      user:user,
      ...(supplier ? { supplier_delete: initialOrders[deletedOrder] } : { customer_delete: initialOrders[deletedOrder] }),
      detail:reason,
    }),
  });
  const data = await response.json();
  if(data.message=="success"){
    if(supplier) notify(1,"supplier đã xóa","Thành công");else{
      notify(1,"khách hàng đã xóa","Thành công")
    }
    let updatedOrders = [...initialOrders];
  updatedOrders=updatedOrders.filter((item,index)=>index!=deletedOrder);
  setInitialOrders(updatedOrders);
  }else{
    notify(2,data.message,"Thất bại")
  };
  stopLoading()
}
  return (<>
  {showdelete&&<DeleteProductModal supplier={supplier ? showdelete : undefined} customer={supplier ? undefined : showdelete}  onClose2={()=>{Setshowdelete(false)}} onDelete={delete_action}/>}
{showhistory && <HistoryComponent turnoff={()=>{Setshowhistory(false)}} supplier={supplier ? supplier : undefined} customer={supplier ? undefined : true}   />}
    {formcustomer&&<CustomerForm close={onclosecustomer} change={change} supplier={supplier}/>}
    <div className="history-mgmt-main" style={{zIndex:999}}>
    <div className="history-mgmt-container">
    <div className="close" onClick={turnoff}>x</div>
      <div className="history-mgmt-header">
        <h2 className="history-mgmt-title">{!supplier?"Khách hàng":"Nhà cung cấp"}</h2>
        <div className="history-mgmt-header-controls">
          <input
            type="text"
            className="history-mgmt-search"
            placeholder="Search for..."
            value={searchTerm}
            onChange={handleSearch}
          />
                    <button className="order-mgmt-history-btn" style={{marginLeft:"0px",marginRight:"20px"}} onClick={()=>{Setshowhistory(true)}}>Lịch sử thay đối</button>
          <button className="order-mgmt-create-btn" style={{marginLeft:"0px",marginRight:"20px"}} onClick={onformcustomer}>{!supplier?"Create customer":"Create supplier"}</button>
        </div>
        
      </div>

      <table className="history-mgmt-table">
        <thead>
          <tr>
            <th>Tên người tạo</th>
            <th>Date</th>
            <th>{!supplier?"Tên khách hàng":"Tên nhà cung cấp"}</th>
            <th>phone</th>
            {!supplier?(<><th>rate</th>
                       <th>money</th></>):(<></>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={index}>
              <td>{order.creater.name}<br /> <small>{order.creater.email}</small>
                </td>
              <td>{formatDateTime(order.createdAt)}</td>
              <td>
              {editingIndex === index ? (
                 <div>
                 <input
                   type="text"
                   name="name"
                   value={editedOrder.name}
                   onChange={handleEditChange}
                 />
                 <input
                   type="text"
                   name="email"
                   value={editedOrder.email}
                   onChange={handleEditChange}
                 />
               </div>
             ) : (<div>{order.name} <br /> <small>{order.email}</small></div>)}</td>
              <td>
                <span className={`history-mgmt-status ${order.action}`}>
                {editingIndex === index ? (
                 <div>
                 <input
                   type="text"
                   name="phone"
                   value={editedOrder.phone}
                   onChange={handleEditChange}
                 />
               </div>
             ) : (<div>{order.phone}</div>)}
                </span>
              </td>
              {!supplier?(<><td>
                {editingIndex === index ? (
                 <div>
                 <input
                   type="text"
                   name="rate"
                   value={editedOrder.rate}
                   onChange={handleEditChange}
                 />
               </div>
             ) : (<div>
                {order.rate}</div>)}
                </td>
              <td>
              {editingIndex === index ? (
                 <div>
                 <input
                   type="text"
                   name="money"
                   value={editedOrder.money}
                   onChange={handleEditmoneyChange}
                 />
               </div>
             ) : (<div>
                {order.money}</div>)}
              </td></>):(<></>)}
              <td>
                {editingIndex === index ? (
                  <>
                    <button className="order-mgmt-button save" onClick={handleSaveClick}>Save</button>
                    <button className="order-mgmt-button cancel" onClick={handleCancelClick}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="order-mgmt-button edit" onClick={() => handleEditClick(index, order)}>✏️</button>
                    <button className="order-mgmt-button delete" onClick={()=>{Setshowdelete(order);setdeletedOrder(index)}}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></div></>
  );
};

export default History;
