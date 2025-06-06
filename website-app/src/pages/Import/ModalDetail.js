import "./ModalHistory.css";
import Modal from "./../../components/ComponentExport/Modal";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../components/introduce/AuthContext";
import { useAuth } from "../../components/introduce/useAuth";
import { notify } from "../../components/Notification/notification";

const ModalDetail = ({
  isOpen,
  onClose,
  idOrder,
  view,
  setLoadLog,
  setLoadOrder,
}) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierName, setSupplierName] = useState({});
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [filter, setFilter] = useState([]);
  const dropdownRef = useRef(null);
  const { user, loading } = useAuth();
  const [myTax, setMyTax] = useState(0);
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
        `http://localhost:8080/api/import/orderHistory/supplierName?orderId=${idOrder}&ownerId=${user.id_owner}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json(); // Phân tích dữ liệu JSON từ response
        if (data.tax) setMyTax(Number(data.tax));
        setSupplierName(data);
      } else {
        setSupplierName({});
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      setSupplierName({});
      console.error("Fetch error:", error);
    }
  };
  const getData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/import/orderDetail/listOrder?idOrder=${idOrder}`
      );
      if (!response.ok) {
        setProducts([]);
        setFilter([]);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        setProducts([]);
        setFilter([]);
        return;
      }
      const updatedData = data.map((product) => ({
        ...product,
        note: "",
      }));
      setProducts(updatedData);
      setFilter(updatedData.map((_, index) => index));
    } catch (error) {
      setProducts([]);
      setFilter([]);
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    if (loading) return;
    if (idOrder) {
      getSupplierByOrderId(idOrder); // Gọi hàm khi component mount hoặc khi idOrder thay đổi
      getData();
    }
  }, [idOrder, loading]);
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
    const url = "http://localhost:8080/api/import/orderDetail/updateDetail";
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
    data.total = Math.floor((amountBill() * (100 + myTax)) / 100)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    data.userName = user.name;
    data.userId = user._id;
    data.ownerId = user.id_owner;
    data.user = user;
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
        notify(2, "You don't have right to do this!", "Fail!");
        throw new Error(
          `Failed to submit data: ${response.status} ${response.statusText}`
        );
      } else {
        notify(1, "you've updated importing goods", "Successfully!");
      }

      const responseData = await response.json();
      setLoadLog((prev) => !prev);
      setLoadOrder((prev) => !prev);
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
      <div
        className="Modal-title"
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#1e88e5',
          textAlign: 'center',
          marginBottom: 8,
          letterSpacing: 1,
          textShadow: '0 2px 8px #b3c6ff',
        }}
      >
        Order #{idOrder}
      </div>
      <div className="divide" style={{ margin: '0 0 18px 0', borderBottom: '2px solid #e3e8ee' }}></div>
      <div className="header-order" style={{ marginBottom: 18 }}>
        <div className="search-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="supplier2" style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px #e3e8ee', padding: '10px 24px', gap: 16 }}>
            <div style={{ alignItems: 'flex-start', fontWeight: 500, color: '#888', fontSize: 16 }}>
              Code order or Date :
            </div>
            <div>
              <input
                type="text"
                className="order-mgmt-search"
                placeholder="Search for..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  borderRadius: 16,
                  border: '1.5px solid #b3c6ff',
                  padding: '8px 16px',
                  fontSize: 16,
                  outline: 'none',
                  boxShadow: '0 1px 4px #e3e8ee',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  background: '#f5f7fa',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="containerKhoe"
        style={{
          maxHeight: '480px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          paddingBottom: '20px',
          background: '#fff',
          borderRadius: 32,
          boxShadow: '0 4px 32px #e3e8ee',
          margin: '0 0 0 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '10px 0',
            fontWeight: 700,
            fontSize: 24,
            justifyContent: 'center',
            color: '#1e88e5',
            letterSpacing: 1,
            textShadow: '0 2px 8px #b3c6ff',
            marginBottom: 8,
          }}
        >
          Danh sách đơn hàng
        </div>
        <div style={{ fontWeight: 500, color: '#43cea2', marginLeft: 24 }}>
          Sản phẩm đến từ nhà cung cấp: <span style={{ color: '#1e88e5' }}>{supplierName.supplierName}</span>
        </div>
        <div style={{ margin: '5px 0 16px 232px', color: '#888', fontSize: 15 }}>
          {supplierName.supplierEmail}
        </div>
        <div className="productTable-container" style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px #e3e8ee', background: '#f5f7fa', margin: '0 16px' }}>
          <table className="product-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 16, background: '#fff' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #b3c6ff 0%, #43cea2 100%)', color: '#fff', fontWeight: 600, fontSize: 17 }}>
                <th style={{ padding: '12px 8px', borderTopLeftRadius: 16, maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Id Detail</th>
                <th>Ảnh mô tả</th>
                <th>Tên sản phẩm</th>
                <th>Last Update</th>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                {view && <th style={{ borderTopRightRadius: 16 }}>Note</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(
                (product, index) =>
                  filter.includes(index) && (
                    <tr key={product._id} style={{ background: index % 2 === 0 ? '#f5f7fa' : '#fff', transition: 'background 0.2s' }}>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ maxWidth: '100px', textAlign: 'center', fontWeight: 500, color: '#1e88e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{product._id}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div
                            className="body-container-img-description"
                            style={{
                              backgroundImage: `url(${product.image ? product.image.secure_url : 'https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg'})`,
                              minWidth: '80px',
                              minHeight: '80px',
                              width: 80,
                              height: 80,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '50%',
                              boxShadow: '0 2px 8px #b3c6ff',
                              border: '3px solid #fff',
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div className="modal-body-product-name" style={{ fontWeight: 600, color: '#1e88e5', fontSize: 17 }}>{product.name}</div>
                        <div className="modal-body-product-description" style={{ color: '#888', fontSize: 14 }}>{product.description}</div>
                      </td>
                      <td style={{ color: '#888', fontWeight: 500 }}>{transfer(product.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div
                            className={`product-status ${products[index].status}`}
                            onClick={() => handleStatusClick(index)}
                            style={{
                              position: 'relative',
                              cursor: view ? 'pointer' : 'default',
                              width: 90,
                              borderRadius: 16,
                              padding: '6px 0',
                              fontWeight: 600,
                              background:
                                product.status === 'pending'
                                  ? 'linear-gradient(90deg, #b3c6ff 0%, #43cea2 100%)'
                                  : product.status === 'deliveried'
                                  ? 'linear-gradient(90deg, #43cea2 0%, #1e88e5 100%)'
                                  : 'linear-gradient(90deg, #ff5858 0%, #ffc371 100%)',
                              color: '#fff',
                              boxShadow: '0 2px 8px #e3e8ee',
                              transition: 'background 0.2s',
                              border: 'none',
                              outline: 'none',
                            }}
                          >
                            {product.status}
                            {dropdownOpenIndex === index && view && (
                              <div
                                ref={dropdownRef}
                                className="dropdown"
                                style={{
                                  position: 'absolute',
                                  top: 38,
                                  left: 0,
                                  width: 120,
                                  background: '#fff',
                                  borderRadius: 16,
                                  boxShadow: '0 2px 16px #e3e8ee',
                                  zIndex: 10,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  className="dropdown-item"
                                  style={{ padding: '10px 16px', cursor: 'pointer', color: '#1e88e5', fontWeight: 600, transition: 'background 0.2s' }}
                                  onClick={() => handleStatusChange(index, 'pending')}
                                >
                                  Pending
                                </div>
                                <div
                                  className="dropdown-item"
                                  style={{ padding: '10px 16px', cursor: 'pointer', color: '#43cea2', fontWeight: 600, transition: 'background 0.2s' }}
                                  onClick={() => handleStatusChange(index, 'deliveried')}
                                >
                                  Delivered
                                </div>
                                <div
                                  className="dropdown-item"
                                  style={{ padding: '10px 16px', cursor: 'pointer', color: '#ff5858', fontWeight: 600, transition: 'background 0.2s' }}
                                  onClick={() => handleStatusChange(index, 'canceled')}
                                >
                                  Canceled
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="Quantity" style={{ maxWidth: 100, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {view ? (
                              <>
                                <button
                                  className="Quantity-button"
                                  onClick={() => decrease(index)}
                                  style={{
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#b3c6ff',
                                    color: '#fff',
                                    fontWeight: 700,
                                    width: 28,
                                    height: 28,
                                    fontSize: 18,
                                    boxShadow: '0 1px 4px #e3e8ee',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer',
                                  }}
                                >
                                  -
                                </button>
                                <input
                                  value={product.quantity}
                                  className="Quantity-input"
                                  onChange={(e) => handleInputQuantitty(index, e)}
                                  style={{
                                    borderRadius: 10,
                                    border: '1.5px solid #b3c6ff',
                                    width: 40,
                                    textAlign: 'center',
                                    fontSize: 16,
                                    padding: '4px 0',
                                    outline: 'none',
                                    background: '#f5f7fa',
                                    boxShadow: '0 1px 4px #e3e8ee',
                                    margin: '0 4px',
                                  }}
                                />
                                <button
                                  className="Quantity-button"
                                  onClick={() => increase(index)}
                                  style={{
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#43cea2',
                                    color: '#fff',
                                    fontWeight: 700,
                                    width: 28,
                                    height: 28,
                                    fontSize: 18,
                                    boxShadow: '0 1px 4px #e3e8ee',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer',
                                  }}
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <div style={{ fontWeight: 600, color: '#1e88e5' }}>{product.quantity}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#43cea2' }}>
                        {(product.price.replace(/\./g, '') * product.quantity)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
                        VND
                      </td>
                      {view && (
                        <td>
                          <input
                            type="text"
                            value={product.note}
                            onChange={(event) => handleChangeNote(event, index)}
                            placeholder="Nhập ghi chú"
                            style={{
                              borderRadius: 12,
                              border: '1.5px solid #b3c6ff',
                              padding: '6px 12px',
                              fontSize: 15,
                              background: '#f5f7fa',
                              outline: 'none',
                              boxShadow: '0 1px 4px #e3e8ee',
                              transition: 'border 0.2s, box-shadow 0.2s',
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
        <div className="order-tax" style={{ margin: '24px 0 0 0', padding: '16px 24px', background: '#f5f7fa', borderRadius: 20, boxShadow: '0 2px 8px #e3e8ee', fontWeight: 600, color: '#1e88e5', fontSize: 17, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span>{`Tax : ${myTax} %`}</span>
          <div style={{ paddingTop: '10px', color: '#43cea2', fontWeight: 700, fontSize: 18 }}>
            Tổng tiền: <span style={{ fontSize: 20, fontWeight: 700, color: '#1e88e5' }}>
              {(
                (amountBill().toString().replace(/\./g, '') * (100 + myTax)) /
                100
              )
                .toFixed(0)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
              VND
            </span>
          </div>
        </div>
        <div className="complete-order" style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 0 0' }}>
          {view && (
            <button
              onClick={() => handleSubmit()}
              style={{
                borderRadius: 20,
                background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 48px',
                border: 'none',
                boxShadow: '0 2px 16px #b3c6ff',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                letterSpacing: 1,
              }}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalDetail;
