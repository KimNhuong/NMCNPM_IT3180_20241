import React, { useState } from "react";
import "./formcustomer.css";
import { useLoading } from "../introduce/Loading";
import { useAuth } from "../introduce/useAuth";
import { notify } from "../../components/Notification/notification";
function CustomerForm({ close, show_customer, show_bill, supplier, change }) {
  const { user, loading } = useAuth();
  const { stopLoading, startLoading } = useLoading();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const isPhoneValid = (phone) => {
    const regex = /^[0-9]+$/; // Kiểm tra chuỗi có 10 chữ số
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
    const now = new Date();
    const customerWithDate = { ...customer, date: now.toISOString() };
    if (!supplier) {
      response = await fetch("http://localhost:8080/api/sell/createCustomer", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...customerWithDate, user: user }),
      });
    } else {
      response = await fetch(
        "http://localhost:8080/api/products/create_supplier",
        {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...customerWithDate, user: user }),
        }
      );
    }

    const data = await response.json();
    stopLoading();
    if (data.message === "success") {
      notify(1, !supplier ? "Thêm khách hàng thành công" : "Thêm supplier thành công", "Thành công");
      if (typeof change === "function") change(); // Gọi lại API cập nhật khách hàng
      close();
    } else {
      notify(2, data.message || "Thất bại", "Thất bại");
    }
  };
  return (
    <div className="customer">
      <div className="customer-form">
        {!show_customer && !show_bill ? (
          !supplier ? (
            <h2>Thêm Khách Hàng Mới</h2>
          ) : (
            <h2>Thêm nhà cung cấp mới</h2>
          )
        ) : show_customer ? (
          <h2>Thông tin khách hàng</h2>
        ) : (
          <h2>Thông tin hóa đơn</h2>
        )}
        <p className="close-customer" onClick={close}>
          x
        </p>
        <form onSubmit={handleSubmit}>
          {!show_customer && !show_bill ? (
            <>
              <label>
                {!supplier ? "Tên khách hàng:" : "Tên nhà cung cấp"}
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
              <button type="submit">
                {!supplier ? "Thêm khách hàng" : "Thêm nhà cung cấp"}
              </button>
            </>
          ) : show_customer ? (
            <>
              <label>
                Tên khách hàng:
                <p style={{ display: "inline-block" }}>{show_customer.name}</p>
              </label>
              <label>
                Email:
                <p style={{ display: "inline-block" }}>{show_customer.email}</p>
              </label>
              <label>
                Số điện thoại:
                <p style={{ display: "inline-block" }}>{show_customer.phone}</p>
              </label>
              <label>
                tổng số tiền đã trả :
                <p style={{ display: "inline-block" }}>
                  {show_customer.money + " đồng"}
                </p>
              </label>
              {/* Bỏ cột rate */}
              <label>
                Date:
                <p style={{ display: "inline-block" }}>{show_customer.date ? new Date(show_customer.date).toLocaleString() : ""}</p>
              </label>
            </>
          ) : (
            <>
              {show_bill.map((item, index) => {
                return (
                  <>
                    {item.productID ? (
                      <img
                        src={item.productID.image.secure_url}
                        height="80px"
                      />
                    ) : (
                      <h1></h1>
                    )}
                    <label key={index}>
                      Tên sản phẩm:
                      <p style={{ display: "inline-block" }}>{item.name}</p>
                    </label>
                    <label>
                      Số lượng:
                      <p style={{ display: "inline-block" }}>{item.quantity}</p>
                    </label>
                    <label>
                      Giá tiền/1 sản phẩm:
                      <p style={{ display: "inline-block" }}>{item.price}</p>
                    </label>
                    <label>
                      tổng số tiền :
                      <p style={{ display: "inline-block" }}>
                        {item.totalAmount}
                      </p>
                    </label>
                    <label
                      style={{
                        borderBottom: "2px solid black",
                        paddingBottom: "5px",
                      }}
                    >
                      discount:
                      <p style={{ display: "inline-block" }}>{item.discount}</p>
                    </label>
                  </>
                );
              })}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;
