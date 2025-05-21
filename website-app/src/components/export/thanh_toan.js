import React, { useState, useEffect } from "react";
import "./thanh_toan.css";
import { useLoading } from "../introduce/Loading";
import { useAuth } from "../introduce/useAuth";
import { notify } from "../../components/Notification/notification";

function PaymentComponent({ close, products, totalAmount, customers, discount, vat }) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPaid, setCustomerPaid] = useState(0);
  const [change, setChange] = useState(0);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [suggestions, setSuggestion] = useState([]);
  const [banks, setBanks] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const { user, loading } = useAuth();
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        startLoading();
        const response = await fetch("http://localhost:5000/bank/get_bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        });
        const data = await response.json();
        stopLoading();
        if (data) setBanks(data);
      } catch (error) {
        console.error("Error fetching banks:", error);
        stopLoading();
      }
    };
    fetchBanks();
  }, []);

  const handleCustomerPaidChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setCustomerPaid(amount);
    setChange(amount - totalAmount > 0 ? (amount - totalAmount).toLocaleString("vi-VN") : 0);
  };

  const handleBankChange = (e) => {
    const selectedName = e.target.value;
    setSelectedBank(selectedName);
    const bankDetails = banks.find((bank) => bank.name === selectedName);
    setSelectedBankDetails(bankDetails || null);
  };

  const success = async () => {
    try {
      const billData = {
        creater: user._id,
        discount: String(discount),
        vat: String(vat),
        owner: products[0].owner,
        customerId: customerPhone,
        totalAmount: totalAmount.toLocaleString("vi-VN"),
        items: products.map((product) => ({
          productID: product._id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount,
          totalAmount: product.total.toLocaleString("vi-VN"),
        })),
        paymentMethod: selectedBank ? "Ngân hàng" : "Tiền mặt",
        notes: "",
      };
      startLoading();
      const response = await fetch("http://localhost:5000/sell/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });
      stopLoading();
      if (response.ok) {
        notify(1, "Lưu hóa đơn thành công", "Thành công");
        await close();
      } else {
        notify(2, "Không thể lưu hóa đơn", "Thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      notify(2, "", "Có lỗi xảy ra");
    }
  };

  return (
    <div>
      <div className="modal-overlay">
        <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
          <h2>KHÁCH THANH TOÁN</h2>
          <p className="delete_bill" onClick={close}>
            x
          </p>
          <div>
            <label>Chọn máy in</label>
            <select>
              <option>Microsoft Print to PDF</option>
            </select>
          </div>
          <div>
            <label>Mẫu in hóa đơn</label>
            <select>
              <option>Hóa đơn bán hàng</option>
            </select>
          </div>
          <div>
            <label>Khách hàng</label>
            <input
              type="text"
              placeholder="Số điện thoại"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                const filtered = e.target.value
                  ? customers.filter((customer) => customer.phone.includes(e.target.value))
                  : [];
                setSuggestion(filtered);
              }}
            />
            <ul id="suggestions-sell">
              {suggestions.map((customer, index) => (
                <li key={index} onClick={() => { setCustomerPhone(customer.phone); setSuggestion([]); }}>
                  {customer.phone}
                </li>
              ))}
            </ul>
          </div>
          <div className="total-amount">
            <label>Tổng tiền phải trả</label>
            <p style={{ marginTop: "5px" }}>{totalAmount.toLocaleString("vi-VN")} VND</p>
          </div>
          <div>
            <label>Tiền khách đưa</label>
            <input type="number" value={customerPaid} onChange={handleCustomerPaidChange} />
          </div>
          <div>
            <label>Tiền trả lại khách</label>
            <input type="text" value={change} readOnly />
          </div>
          <div>
            <label>Ngân hàng</label>
            <select value={selectedBank} onChange={handleBankChange}>
              <option value="">--Vui lòng chọn Ngân hàng--</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          {selectedBankDetails && (
            <div className="bank-details">
              <h3>Thông tin ngân hàng</h3>
              <p><strong>Tên:</strong> {selectedBankDetails.name}</p>
              <p><strong>Số tài khoản:</strong> {selectedBankDetails.accountNumber}</p>
              <div className="qr-code">
                <h4>Mã QR</h4>
                <img src={`https://img.vietqr.io/image/${selectedBankDetails.bankName}-${selectedBankDetails.accountNumber}-compact.jpg?amount=${totalAmount}`} alt="QR Code" />
              </div>
            </div>
          )}
          <div className="button-group">
            <button onClick={success}>F5 In</button>
            <button className="cancel-button" onClick={close}>
              ESC Bỏ qua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;
