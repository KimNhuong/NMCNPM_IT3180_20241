import React, { useState } from 'react';
import './formcustomer.css';
import { useLoading } from '../introduce/Loading';
import { useAuth } from "../introduce/useAuth";
import { notify } from '../../components/Notification/notification';
function CustomerForm({close,show_customer,show_bill,supplier,change}) {
    const { user ,loading} = useAuth();
    const {stopLoading,startLoading} =useLoading();
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const isPhoneValid = (phone) => {
        const regex = /^[0-9]+$/;  // Kiểm tra chuỗi có 10 chữ số
        return regex.test(phone);
      };
      
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isPhoneValid(customer.phone)) {
            stopLoading();
            notify(2, "Số điện thoại không hợp lệ", "Thất bại");
            return;
        }
        startLoading();
        let response;
        if(!supplier){
          response = await fetch('http://localhost:5000/sell/create_customer', {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...customer,user: user}),
      });  
        }else{
            response = await fetch('http://localhost:5000/products/create_supplier', {
                method: 'Post',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({...customer,user: user}),
              });  
        }
      
      const data = await response.json();
      stopLoading();
      if(data.message=="success"){
        notify(1,"thêm supplier thành công","Thành công");
        change()
        close()
      }else {
        notify(2,data.message,"Thất bại");
        change()
      }

    };
    return (
        <div className='customer'>
        <div className="customer-form">
        {!show_customer&&!show_bill ? (!supplier?(<h2>Thêm Khách Hàng Mới</h2>):(<h2>Thêm nhà cung cấp mới</h2>)):(show_customer? <h2>Thông tin khách hàng</h2>:<h2>Thông tin hóa đơn</h2>)}
            <p className='close-customer' onClick={close}>x</p>
            <form onSubmit={handleSubmit}>
                {!show_customer&&!show_bill ? (
                    <>
                   <label>
                    {!supplier ?("Tên khách hàng:"):("Tên nhà cung cấp")}
                    <input
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Số điện thoại * :
                    <input
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">{!supplier ?("Thêm khách hàng"):("Thêm nhà cung cấp")}</button> 
                </>
                ):(
    show_customer ? (
<>  
                   <label>
                    Tên khách hàng:
                    <p style={{display:"inline-block"}}>{show_customer.name}</p>
                </label>
                <label>
                    Email:
                    <p style={{display:"inline-block"}}>{show_customer.email}</p>
                </label>
                <label>
                    Số điện thoại:
                    <p style={{display:"inline-block"}}>{show_customer.phone}</p>
                </label>
                <label>
                    tổng số tiền đã trả :
                    <p style={{display:"inline-block"}}>{show_customer.money + " đồng"}</p>
                </label>
                <label>
                    Rate:
                    <p style={{display:"inline-block"}}>{show_customer.rate}</p>
                </label>
                </>
    ):(  
<>  
{show_bill.map((item,index)=>{
    return(<>
    
            
                   {item.productID?(<img src={item.productID.image.secure_url} height="80px"/>):(<h1></h1>)} 
        <label key={index}>
                    Tên sản phẩm:
                    <p style={{display:"inline-block"}}>{item.name}</p>
                </label>
                <label>
                    Số lượng:
                    <p style={{display:"inline-block"}}>{item.quantity}</p>
                </label>
                <label>
                    Giá tiền/1 sản phẩm:
                    <p style={{display:"inline-block"}}>{item.price}</p>
                </label>
                <label>
                    tổng số tiền  :
                    <p style={{display:"inline-block"}}>{item.totalAmount}</p>
                </label>
                <label style={{borderBottom: "2px solid black", paddingBottom: "5px"}}>
                    discount:
                    <p style={{display:"inline-block"}}>{item.discount}</p>
                </label></>
    )
})}
                
                </>
    )

                )}
                
            </form>
        </div></div>
    );
}

export default CustomerForm;
