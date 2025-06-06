import React, { useState, useRef, useEffect } from "react";
import "./main.css";
import History from "./history";
import Quagga from "quagga";
import { useLoading } from "../introduce/Loading";
import { useAuth } from "../introduce/useAuth";
import PaymentComponent from "./thanh_toan";
import CustomerInfo from "./form_show";
import { notify } from "../../components/Notification/notification";
const Billing = () => {
  const { startLoading, stopLoading } = useLoading();
  const [invoices, setInvoices] = useState([{ products: [] }]);
  const [currentInvoice, setCurrentInvoice] = useState(0);
  const [productCode, setProductCode] = useState("");
  const [tax, setTax] = useState(0);
  const [taxall, setTaxAll] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [camera, setCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { user, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [form, setForm] = useState(false);
  const [formcustomer, setFormcustomer] = useState(false);
  const [form_history, setForm_history] = useState(false);
  useEffect(() => {
    const a = async () => {
      if (loading || !user) {
        return;
      }
      console.log("user", user);
      let body = {
        user: user,
      };
      let response = await fetch("http://localhost:8080/api/sell/findCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      let datas = await response.json();
      console.log(datas.message);
      if (datas.message === "Success") {
        // Map lại trường purchasePrice thành price cho mỗi sản phẩm
        const mappedProducts = (datas.products || []).map((prd) => ({
          ...prd,
          price: prd.purchasePrice || "0",
        }));
        setData(mappedProducts);
      } else {
        notify(2, "Load sản phẩm thất bại", "Thất bại");
      }
      response = await fetch("http://localhost:8080/api/sell/getCustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      datas = await response.json();
      if (datas.message === "Success") {
        setCustomers(datas.customers);
      } else {
        notify(2, "Load sản phẩm thất bại", "Thất bại");
      }
    };
    a();
  }, [loading, user]);
  const addProduct = async (code = "") => {
    let i = "";
    if (code !== "") {
      i = code;
    }
    if (productCode !== "") i = productCode;
    if (i === "") return;
    const updatedInvoices = [...invoices];
    const searchValue = i.toLowerCase();
    // Tìm sản phẩm theo sku hoặc name (không phân biệt hoa thường)
    const result = Array.from(data || []).find(
      (element) =>
        (element.sku && element.sku.toLowerCase() === searchValue) ||
        (element.name && element.name.toLowerCase() === searchValue)
    );
    // Kiểm tra đã có trong hóa đơn chưa
    const existedIndex = updatedInvoices[currentInvoice].products.findIndex(
      (element) =>
        (element.sku && element.sku.toLowerCase() === searchValue) ||
        (element.name && element.name.toLowerCase() === searchValue)
    );
    if (existedIndex !== -1) {
      const element = updatedInvoices[currentInvoice].products[existedIndex];
      element.quantity++;
      element.total =
        element.quantity *
        parseInt(element.price.replace(/\./g, ""), 10) *
        (1 - element.discount / 100);
      setInvoices(updatedInvoices);
    } else if (result) {
      const priceString = (result.price || "0").toString();
      const newProduct = {
        ...result,
        quantity: 1,
        discount: 0,
        total: parseInt(priceString.replace(/\./g, ""), 10),
      };
      updatedInvoices[currentInvoice].products.push(newProduct);
      setInvoices(updatedInvoices);
    } else {
      notify(2, "Sản phẩm không tồn tại", "Thất bại");
    }
  };
  const adds = (x) => {
    console.log(x);
    setCustomers((a) => [...a, x]);
  };
  const addInvoice = () => {
    setInvoices([...invoices, { products: [] }]);
    setCurrentInvoice(invoices.length);
  };

  const removeInvoice = (index) => {
    if (index == 0) {
      return;
    }
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    setCurrentInvoice((prev) =>
      prev === index ? 0 : prev - (prev > index ? 1 : 0)
    );
  };

  const handleDoubleClick = (index) => {
    setEditingIndex(index);
  };

  const handleBlur = () => {
    setEditingIndex(null);
  };

  const handleChangeProduct = (index, field, value) => {
    const updatedInvoices = [...invoices];
    const product = updatedInvoices[currentInvoice].products[index];

    product[field] = value;
    // Đảm bảo price luôn là string hợp lệ
    const priceString =
      product.price !== undefined && product.price !== null
        ? product.price.toString()
        : "0";
    product.total =
      product.quantity *
      parseInt(priceString.replace(/\./g, ""), 10) *
      (1 - product.discount / 100);
    setInvoices(updatedInvoices);
  };
  const delete_prd = (index) => {
    console.log(index);
    const updatedInvoices = [...invoices];
    let update = invoices[currentInvoice].products;
    update = update.filter((_, i) => i != index);
    invoices[currentInvoice].products = update;
    setInvoices(updatedInvoices);
  };
  const calculateTotal = () => {
    return invoices[currentInvoice].products.reduce(
      (total, product) => total + product.total,
      0
    );
  };
  const deleteAllProducts = () => {
    const updatedInvoices = [...invoices];
    updatedInvoices[currentInvoice].products = []; // Xóa tất cả sản phẩm
    setInvoices(updatedInvoices); // Cập nhật lại state
  };
  const totalBeforeTax =
    invoices[currentInvoice].products.reduce(
      (acc, product) => acc + product.total,
      0
    ) *
    (1 - taxall / 100);

  const totalTax = totalBeforeTax * (tax / 100);
  const total = Math.round(totalBeforeTax + totalTax);
  const startCamera = async () => {
    try {
      // Bật trạng thái camera và chuẩn bị
      setCamera(true);
      setIsProcessing(false);

      // Yêu cầu truy cập camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      // Dừng Quagga nếu đã khởi tạo
      if (Quagga.initialized) {
        Quagga.stop();
      }

      // Khởi tạo QuaggaJS để quét mã vạch
      if (videoRef.current) {
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: videoRef.current, // Sử dụng video từ camera
              constraints: {
                facingMode: "environment", // Camera sau
              },
              willReadFrequently: true,
            },
            decoder: {
              readers: [
                "code_128_reader",
                "ean_reader",
                "upc_reader",
                "code_39_reader",
              ], // Các loại mã vạch cần quét
            },
          },
          function (err) {
            if (err) {
              console.error("Quagga init error:", err);
              notify(
                2,
                "Không thể khởi động quét mã vạch. Vui lòng thử lại!",
                "Thất bại"
              );
              return;
            }
            Quagga.initialized = true; // Đánh dấu đã khởi tạo
            Quagga.start();
          }
        );
      }

      // Xử lý sự kiện khi phát hiện mã vạch
      Quagga.offDetected(); // Xóa sự kiện trước đó
      Quagga.onDetected(async function (result) {
        if (isProcessing) return; // Nếu đang xử lý thì bỏ qua
        setIsProcessing(true); // Đặt trạng thái xử lý

        const code = result.codeResult.code;
        stopCamera(); // Dừng camera sau khi quét
        try {
          await addProduct(code); // Gọi hàm thêm sản phẩm
          setProductCode(code); // Lưu mã sản phẩm
        } catch (error) {
          console.error("Error in addProduct:", error);
        } finally {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error("Camera error:", error);
      notify(
        2,
        "Không thể mở camera. Vui lòng kiểm tra cài đặt quyền hoặc thiết bị!",
        "Thất bại"
      );
    }
  };

  const stopCamera = () => {
    try {
      // Kiểm tra và dừng stream nếu có
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        if (Array.isArray(tracks)) {
          tracks.forEach((track) => {
            if (track && typeof track.stop === "function") {
              track.stop(); // Dừng track
            }
          });
        }
        // Gỡ liên kết stream khỏi video
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        streamRef.current = null; // Đặt lại tham chiếu stream
      }

      // Dừng Quagga nếu đã khởi tạo
      if (Quagga && typeof Quagga.stop === "function") {
        Quagga.stop();
        Quagga.initialized = false; // Đặt lại trạng thái Quagga
      }

      // Cập nhật trạng thái camera
      setCamera(false);
    } catch (error) {
      setCamera(false);
      console.error("Error stopping camera:", error);
      notify(2, "Không thể dừng camera. Vui lòng thử lại!", "Thật bại");
    }
  };

  const onform = () => {
    if (total > 0) {
      setForm(true);
    } else {
      notify(2, "Chưa có sản phẩm để thanh toán");
    }
  };
  const onclose = () => {
    setForm(false);
  };
  const onformcustomer = () => {
    setFormcustomer(true);
  };
  const onclosecustomer = () => {
    setFormcustomer(false);
  };
  const onclosehistory = () => {
    setForm_history(false);
  };
  const onform_history = () => {
    setForm_history(true);
  };
  // Thêm hàm này để xóa hóa đơn hiện tại sau khi thanh toán thành công
  const handleInvoicePaid = () => {
    // Nếu chỉ còn 1 hóa đơn thì reset về hóa đơn rỗng
    if (invoices.length === 1) {
      setInvoices([{ products: [] }]);
      setCurrentInvoice(0);
    } else {
      const updatedInvoices = invoices.filter((_, i) => i !== currentInvoice);
      setInvoices(updatedInvoices);
      setCurrentInvoice((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };
  return (
    <>
      {form_history && <History turnoff={onclosehistory} />}
      {formcustomer && (
        <CustomerInfo
          turnoff={onclosecustomer}
          customer={customers}
          adds={adds}
          supplier={false}
        />
      )}
      {form && (
        <PaymentComponent
          close={onclose}
          totalAmount={total}
          products={invoices[currentInvoice].products}
          customers={customers}
          discount={taxall}
          vat={tax}
          onPaid={handleInvoicePaid}
        />
      )}
      {camera && (
        <div className="camera-sell">
          <video ref={videoRef} autoPlay width="400px" height="300px" />

          <button
            className="button-capture-sell button-sell"
            onClick={stopCamera}
            style={{ backgroundColor: "red", color: "white" }}
          >
            Hủy
          </button>
        </div>
      )}
      <div className="billing-container">
        <div className="invoice-bar">
          {invoices.map((_, index) => (
            <div key={index} className="invoice-tab">
              <button
                className={
                  index === currentInvoice
                    ? "active button-sell"
                    : "button-sell"
                }
                onClick={() => {
                  setCurrentInvoice(index);
                  setEditingIndex(null);
                }}
              >
                Hóa đơn {index + 1}
              </button>
              <button
                className="button-sell"
                onClick={() => removeInvoice(index)}
              >
                X
              </button>
            </div>
          ))}
          <button onClick={addInvoice} className="button-sell">
            Thêm Hóa Đơn
          </button>
        </div>
        <div className="top-bar">
          <div className="form-group-sell">
            <label className="label-sell">Mã sản phẩm (F1): </label>
            <input
              className="input-sell"
              type="text"
              value={productCode}
              onChange={(e) => {
                setProductCode(e.target.value);
                if (e.target.value !== "") {
                  const searchValue = e.target.value.toLowerCase();
                  const x = Array.from(data || []).filter((product) =>
                    product.sku.toLowerCase().includes(searchValue) ||
                    (product.name && product.name.toLowerCase().includes(searchValue))
                  );
                  setSuggestion(x);
                } else {
                  setSuggestion([]);
                }
              }}
            />
            <ul id="suggestions-sell">
              {suggestion.map((product, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => {
                      setProductCode(product.sku);
                      setSuggestion([]);
                    }}
                  >
                    {product.sku}
                  </li>
                );
              })}
            </ul>
            <button
              style={{ marginTop: "10px", color: "white" }}
              onClick={startCamera}
              className="button-sell"
            >
              Quét mã
            </button>
            <button
              onClick={() => addProduct()}
              style={{ color: "white", marginLeft: "10px" }}
              className="button-sell"
            >
              Thêm sản phẩm
            </button>
          </div>
          <div className="xx">
            <button className="history" onClick={onform_history}>
              Lịch sử
            </button>
            <br />
            <button className="create_user" onClick={onformcustomer}>
              Danh sách khách hàng
            </button>
          </div>
        </div>
        <div className="product-list">
          <h2>Danh sách sản phẩm</h2>
          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá bán</th>
                <th>Giảm giá (%)</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoices[currentInvoice].products.map((product, index) => (
                <tr key={index} onDoubleClick={() => handleDoubleClick(index)}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        className="input-sell"
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleChangeProduct(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        onBlur={handleBlur}
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td>{product.price}</td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        className="input-sell"
                        type="number"
                        value={product.discount}
                        onChange={(e) =>
                          handleChangeProduct(
                            index,
                            "discount",
                            Number(e.target.value)
                          )
                        }
                        onBlur={handleBlur}
                      />
                    ) : (
                      product.discount
                    )}
                  </td>
                  <td>{product.total.toLocaleString("vi-VN")}</td>
                  <td
                    className="delete_prd"
                    onClick={() => {
                      delete_prd(index);
                    }}
                  >
                    x
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} style={{ textAlign: "right" }}>
                  <strong>Tổng cộng:</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  {calculateTotal().toLocaleString("vi-VN")}
                </td>
                <td className="delete_prd" onClick={deleteAllProducts}>
                  Xóa hết
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="summary">
          <div className="form-group-sell">
            <label className="label-sell">Thuế suất (%): </label>
            <input
              className="input-sell"
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
            />
            <label className="label-sell" style={{ marginTop: "10px" }}>
              Giảm giá cho toàn bộ sản phẩm (%):{" "}
            </label>
            <input
              className="input-sell"
              type="number"
              value={taxall}
              onChange={(e) => setTaxAll(Number(e.target.value))}
            />
          </div>
          <div className="result">
            <h2 style={{ marginTop: "10px" }}>
              Tổng hóa đơn: {total.toLocaleString("vi-VN")}
            </h2>
          </div>
          <button
            className="button-sell"
            style={{ color: "white", marginTop: "10px" }}
            onClick={onform}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </>
  );
};

export default Billing;
