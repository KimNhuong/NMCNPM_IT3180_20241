import "./ModalHistory.css";
import Modal from "./../../components/ComponentExport/Modal";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../components/introduce/AuthContext";
import { useAuth } from "../../components/introduce/useAuth";
import { notify } from "../../components/Notification/notification";

const ModalDetail = ({ isOpen, onClose, idOrder, view ,setLoadLog,setLoadOrder}) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierName, setSupplierName] = useState({});
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [filter, setFilter] = useState([]);
  const dropdownRef = useRef(null);
  const { user,loading } = useAuth();
  const [myTax,setMyTax] = useState(0)
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    let filtered;
    if (!term.trim()) {
      filtered = products;
    } else {
      const regex = new RegExp(term, "i");
      filtered = products.filter((product) => regex.test(product.name));
    }
    const filteredIndexes = filtered.map((product) =>
      products.indexOf(product)
    );
    setFilter(filteredIndexes);
  };
  const handleStatusClick = (index) => {
    setDropdownOpenIndex((prev) => (prev === index ? null : index));
  };
  const handleStatusChange = (index, newStatus) => {
    setProducts((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index].status = newStatus;
      setDropdownOpenIndex(null);
      return updatedProducts;
    });
  };
  const getSupplierByOrderId = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/import/orderHistory/supplierName?orderId=${idOrder}&ownerId=${user.id_owner}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json(); // Phân tích dữ liệu JSON từ response
        if(data.tax)setMyTax(Number(data.tax))
        console.log(data);
        setSupplierName(data);
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  const getData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/import/orderDetail/listorder?idOrder=${idOrder}`
      );
      const data = await response.json();

      const updatedData = data.map((product) => ({
        ...product,
        note: "",
      }));

      setProducts(updatedData);
      setFilter(updatedData.map((_, index) => index));
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    if(loading)return
    if (idOrder) {
      getSupplierByOrderId(idOrder); // Gọi hàm khi component mount hoặc khi idOrder thay đổi
      getData();
    }
  }, [idOrder,loading]);
  const transfer = (date) => {
    const date2 = new Date(date);
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
  const decrease = (index) => {
    setProducts((prev) => {
      const newQuantities = [...prev];
      newQuantities[index].quantity -= 1; // Tăng giá trị
      return newQuantities;
    });
  };
  const increase = (index) => {
    setProducts((prev) => {
      const newQuantities = [...prev];
      newQuantities[index].quantity = Number(newQuantities[index].quantity) + 1; // Tăng giá trị
      return newQuantities;
    });
  };
  const handleInputQuantitty = (index, e) => {
    const inpData = e.target.value;
    setProducts((prev) => {
      const newQuantities = [...prev];
      newQuantities[index].quantity = inpData; // Tăng giá trị
      return newQuantities;
    });
  };
  const amountBill = () => {
    let sum = 0;
    products.forEach((product) => {
      sum += product.price.replace(/\./g, "") * product.quantity;
    });
    return sum;
  };
  const handleSubmit = async () => {
    const url = "http://localhost:5000/import/orderDetail/updateDetail";
    const state = products.some((pro) => pro.status === "pending");

    const data = { formData: products };
    if (!state) {
      if (products.every((pro) => pro.status === "deliveried")) {
        data.status = "deliveried";
      } else if (products.every((pro) => pro.status === "canceled")) {
        data.status = "canceled";
      } else {
        data.status = "deliveried";
      }
    } else {
      data.status = "pending";
    }
   
    // Calculate total amount
    data.total = Math.floor(amountBill()*(100+myTax)/100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    data.userName = user.name;
    data.userId = user._id;
    data.ownerId = user.id_owner;
    data.user=user;
    console.log("Submitting data:", data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        notify(2,"You don't have right to do this!","Fail!")
        throw new Error(
          `Failed to submit data: ${response.status} ${response.statusText}`
        );
      }else{
        notify(1,"you've updated importing goods","Successfully!")
      }

      const responseData = await response.json();
      setLoadLog((prev)=>!prev)
      setLoadOrder((prev)=>!prev)
      console.log("Success:", responseData);

      // Clear products only after successful submission
      // setProducts([]);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleChangeNote = (event, index) => {
    const newValue = event.target.value;
    setProducts((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index] = {
        ...updatedProducts[index],
        note: newValue,
      };
      return updatedProducts;
    });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="Modal-title">Order #{idOrder}</div>
      <div className="divide"></div>
      <div className="header-order">
        <div className="search-container">
          <div className="supplier2">
            <div style={{ alignItems: "flex-start", padding: "12px" }}>
              Code order or Date :
            </div>
            <div>
              <input
                type="text"
                className="order-mgmt-search"
                placeholder="Search for..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="containerKhoe" style={{maxHeight:"480px",overflowY:"auto",scrollbarWidth: "thin",paddingBottom:"20px"}}>
        <div
          style={{
            display: "flex",
            padding: "10px 0",
            fontWeight: 600,
            fontSize: 24,
            justifyContent: "center",
            maxHeight:"600px"
          }}
        >
          Danh sách đơn hàng
        </div>
        <div>Sản phẩm đến từ nhà cung cấp: {supplierName.supplierName}</div>
        <div style={{ margin: "5px 0 16px 232px" }}>
          {supplierName.supplierEmail}
        </div>
        <div className="productTable-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Id Detail</th>
                <th>Ảnh mô tả</th>
                <th>Tên sản phẩm</th>
                <th>Last Update</th>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                {view&&(<th>Note</th>)}
              </tr>
            </thead>
            <tbody>
              {products.map(
                (product, index) =>
                  filter.includes(index) && (
                    <tr key={product._id}>
                      <td>
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <div
                            style={{ maxWidth: "80px", textAlign: "center"}}
                          >
                            #{product._id}
                          </div>
                        </div>
                      </td>
                      <td tyle={{ witdh: "50px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="body-container-img-description"
                            style={{
                              backgroundImage: `url(${product.image?product.image.secure_url:"https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"})`,
                              minWidth: "120px",
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div className="modal-body-product-name">
                          {product.name}
                        </div>
                        <div className="modal-body-product-description">
                          {product.description}
                        </div>
                      </td>
                      <td>{transfer(product.updatedAt)}</td>
                      <td>
                        {" "}
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <div
                            className={`product-status ${products[index].status}`}
                            onClick={() => handleStatusClick(index)}
                            style={{
                              position: "relative",
                              cursor: "pointer",
                              width: "80px",
                            }}
                          >
                            {product.status}
                            {dropdownOpenIndex === index && view && (
                              <div ref={dropdownRef} className="dropdown">
                                <div
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusChange(index, "pending")
                                  }
                                >
                                  Pending
                                </div>
                                <div
                                  className="dropdown-item "
                                  onClick={() =>
                                    handleStatusChange(index, "deliveried")
                                  }
                                >
                                  Delivered
                                </div>
                                <div
                                  className="dropdown-item "
                                  onClick={() =>
                                    handleStatusChange(index, "canceled")
                                  }
                                >
                                  Canceled
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 0 }}>
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <div
                            className="Quantity"
                            style={{
                              maxWidth: "80px",
                              padding: 0,
                            }}
                          >
                            {view ? (
                              // Khi view là true, hiển thị các button và input
                              <>
                                <button
                                  className="Quantity-button"
                                  onClick={() => decrease(index)} // Gọi hàm decrease khi nhấn nút -
                                >
                                  -
                                </button>
                                <input
                                  value={product.quantity} // Hiển thị giá trị quantity hiện tại
                                  className="Quantity-input"
                                  onChange={(e) =>
                                    handleInputQuantitty(index, e)
                                  } // Cập nhật giá trị quantity khi thay đổi
                                />
                                <button
                                  className="Quantity-button"
                                  onClick={() => increase(index)} // Gọi hàm increase khi nhấn nút +
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              // Khi view là false, chỉ hiển thị giá trị quantity
                              <div>{product.quantity}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {(product.price.replace(/\./g, "") * product.quantity)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                        VND
                      </td>
                      {view&&(
                        <td>
                        <input
                          type="text"
                          value={product.note}
                          onChange={(event) => handleChangeNote(event, index)} // Use onChange instead of onchange
                          placeholder="Nhập ghi chú"
                        />
                      </td>)}
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>


        <div className="order-tax">
        <span >{`Tax : ${myTax} %`}</span>
          
          <div style={{paddingTop:"10px" }}>
          Tổng tiền:{" "}
          <span style={{ fontSize: 16, fontWeight: 300 }}>
            {(amountBill().toString().replace(/\./g, "") * (100+myTax)/100)
              .toFixed(0)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
            VND
          </span>      
          </div>
        </div>
        <div className="complete-order">
          {view&&(<button onClick={() => handleSubmit()}>Complete</button>)}
        </div>
      </div>
    </Modal>
  );
};

export default ModalDetail;
