// ProductDetail.js
import React, { useState, useRef, useEffect } from "react";
import "../Manage_product/Product_detail.css";
import { useLoading } from "../introduce/Loading";
import { useAuth } from "../introduce/useAuth";
import { notify } from "../../components/Notification/notification";
const ProductDetail = ({ product, onClose, onUpdate }) => {
  const { startLoading, stopLoading } = useLoading();
  const { user, loading } = useAuth();
  const CLOUD_NAME = "ddgrjo6jr";
  const UPLOAD_PRESET = "my-app";
  const [g, setg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...product });
  const [products, Setproduct] = useState(product);
  const [details, Setdetails] = useState("");
  const [link, SetLink] = useState(
    product.image
      ? product.image.secure_url
      : "https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"
  );
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scrollableRef = useRef(null);
  const [suppliers, setSuppliers] = useState([]); // state for suppliers list
  useEffect(() => {
    const fetchSuppliers = async () => {
      let body = {
        user: user,
      };
      try {
        let response = await fetch(
          "http://localhost:8080/api/products/get_supplier",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
        const data = await response.json();
        console.log(data.suppliers);
        setSuppliers(data.suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);
  const scrollToTop = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const startCamera = async () => {
    setShowCamera(true);
    scrollToTop();
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    videoRef.current.srcObject = streamRef.current;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Xóa dấu phân tách cũ và chuyển thành số
    const numericValue = Number(value.replace(/,/g, "").replace(/\./g, ""));

    // Định dạng lại nếu là số hợp lệ
    const formattedValue = !Number.isNaN(numericValue)
      ? numericValue.toLocaleString("vi-VN")
      : value;

    // Cập nhật formData với giá trị đã chuyển đổi
    setEditData({
      ...editData,
      [name]:
        typeof formattedValue === "string"
          ? formattedValue.toLowerCase().replace(/,/g, ".")
          : value.replace(/,/g, "."),
    });
  };

  const handleChange_link = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
    fileInputRef.current.value = "";
    SetLink(value);
  };
  const handleChangedetail = (e) => {
    const { value } = e.target;
    Setdetails(value);
  };
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let x = { ...editData };
    if (editData.image != product.image && editData.image) {
      const imageData = new FormData();
      imageData.append("file", editData.image);
      imageData.append("upload_preset", UPLOAD_PRESET);
      try {
        startLoading();
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: imageData, // Gửi FormData trực tiếp mà không cần JSON.stringify
          }
        );
        const data = await cloudinaryResponse.json();
        const secure_url = data.secure_url;
        const public_id = data.public_id;
        x = {
          ...x,
          image: { secure_url, public_id }, // Thêm thông tin hình ảnh
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        notify(2, "Đã xảy ra lỗi khi tải lên hình ảnh.", "Thất bại");
      }
    }
    onUpdate(x, details, editData.image != product.image && editData.image);
    Setproduct(editData);
    setIsEditing(false);
  };
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL("image/png");
    SetLink(imageUrl);
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop()); // Dừng từng track trong stream
      videoRef.current.srcObject = null; // Gán srcObject về null
      streamRef.current = null; // Đặt lại tham chiếu stream
    }
    setShowCamera(false); // Đóng camera sau khi chụp
    // Tạo một file blob từ imageUrl và đặt vào input file
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "capture.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setEditData((prevData) => ({
          ...prevData,
          image: file, // Lưu trữ file vào state
        }));
      });
  };
  const handleChangeimage = (e) => {
    setEditData({
      ...editData,
      image: e.target.files[0],
    });
    const imageUrl = URL.createObjectURL(e.target.files[0]);
    console.log("Link ảnh đã được cập nhật:", imageUrl);
    SetLink(imageUrl); // Cập nhật link với URL ngắn hơn
  };
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop()); // Dừng từng track trong stream
      videoRef.current.srcObject = null; // Gán srcObject về null
      streamRef.current = null; // Đặt lại tham chiếu stream
    }
    setShowCamera(false); // Đóng modal hoặc ẩn camera
  };
  const handleNChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value.toLowerCase(),
    });
  };
  return (
    <div className="product-detail-overlay" style={{ background: 'rgba(30, 40, 80, 0.18)', zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
      <div className="product-detail-container" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #1e88e522', padding: 36, minWidth: 420, maxWidth: 540, width: '100%', position: 'relative', animation: 'fadeInUp 0.4s', transition: 'box-shadow 0.3s' }}>
        <span className="close-button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#1e88e5', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }}>&times;</span>
        {!isEditing ? (
          <div className="product-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <img
              src={products.image ? products.image.secure_url : 'https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg'}
              alt="Product Image"
              className="product-image-show"
              style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 18, boxShadow: '0 2px 12px #b3c6ff33', marginBottom: 12, border: '3px solid #e0e7ff' }}
            />
            <div className="product-info-details" style={{ width: '100%', marginBottom: 10 }}>
              {[
                ['Tên', products.name],
                ['Loại', products.category],
                ['Thương hiệu', products.brand],
                ['Mã', products.sku],
                ['Giá bán', `$${products.price}`],
                ['Số lượng trên kệ', products.stock_in_shelf],
                ['Mức độ cần nhập', products.reorderLevel],
                ['Nhà cung cấp', products.supplier ? products.supplier.name : 'nhà cung cấp của sản phẩm này đã bị xóa, hãy thêm nhà cung cấp'],
                ['Ngày nhập', new Date(products.purchaseDate).toLocaleDateString()],
                ['Vị trí', products.location],
                ['Số lượng trong kho', products.stock_in_Warehouse],
                ['Đơn vị', products.unit],
                ['Giá nhập', `$${products.purchasePrice}`],
                ['Notes', products.notes],
                ['Link ảnh', products.image ? products.image.secure_url : '']
              ].map(([label, value]) => (
                <div className="product-info-details-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f4fa', fontSize: 15 }} key={label}>
                  <strong style={{ color: '#1e88e5', minWidth: 110 }}>{label}:</strong>
                  <span style={{ color: '#1e293b', textAlign: 'right', flex: 1, marginLeft: 12, wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
            </div>
            <button className="edit-button-detail" onClick={handleEditToggle} style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16, padding: '10px 36px', marginTop: 10, boxShadow: '0 2px 8px #1e88e522', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Edit</button>
          </div>
        ) : (
          <div className="product-edit-form" style={{ width: '100%' }}>
            <h2 style={{ color: '#1e88e5', fontWeight: 700, textAlign: 'center', marginBottom: 18 }}>Edit Product</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label htmlFor="name">Tên *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editData.name}
                  onChange={handleNChange}
                  required
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Loại *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editData.category}
                  onChange={handleNChange}
                  required
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand">Thương hiệu</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={editData.brand}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sku">Mã *</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={editData.sku}
                  onChange={handleNChange}
                  required
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Giá bán *</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={editData.price}
                  onChange={handleChange}
                  required
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="purchasePrice">Giá nhập</label>
                <input
                  type="text"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={editData.purchasePrice}
                  onChange={handleChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock_in_shelf">Số lượng trên kệ</label>
                <input
                  type="number"
                  id="stock_in_shelf"
                  name="stock_in_shelf"
                  value={editData.stock_in_shelf}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reorderLevel">
                  Số lượng cần được nhập hàng
                </label>
                <input
                  type="number"
                  id="reorderLevel"
                  name="reorderLevel"
                  value={editData.reorderLevel}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="supplier">Nhà cung cấp</label>
                <select
                  id="supplier"
                  name="supplier"
                  value={editData.supplier ? editData.supplier._id : ""}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="purchaseDate">Ngày nhập</label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={editData.purchaseDate}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Vị trí</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editData.location}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock_in_Warehouse">
                  Số lượng trong kho hàng
                </label>
                <input
                  type="number"
                  id="stock_in_Warehouse"
                  name="stock_in_Warehouse"
                  value={editData.stock_in_Warehouse}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="unit">đơn vị</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={editData.unit}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={editData.notes}
                  onChange={handleNChange}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s', minHeight: 80 }}
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="image">Image:</label>
                <img
                  src={link}
                  className="product-image-show"
                  alt="Product Image"
                  style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 18, boxShadow: '0 2px 12px #b3c6ff33', marginBottom: 12, border: '3px solid #e0e7ff' }}
                />
                <div
                  className="change_image"
                  onClick={() => {
                    setg((x) => {
                      return !x;
                    });
                  }}
                  style={{ cursor: 'pointer', color: '#1e88e5', fontWeight: 500, marginTop: 8, transition: 'color 0.2s' }}
                >
                  Thay đổi ảnh
                </div>
                {g && (
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label htmlFor="image">Image (3 cách để nhập ảnh)</label>
                    <p style={{ marginBottom: "3px", fontSize: 14 }}>1. tải ảnh lên từ máy</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      name="image"
                      onChange={handleChangeimage}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                    />
                    <p style={{ marginBottom: "3px", marginTop: "3px", fontSize: 14 }}>2. link ảnh trên mạng</p>
                    <input
                      type="text"
                      id="image"
                      name="image"
                      value={editData.image}
                      onChange={handleChange_link}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s' }}
                    />
                    <p style={{ marginBottom: "3px", marginTop: "3px", fontSize: 14 }}>3. chụp ảnh trực tiếp</p>
                    <div className="capture" onClick={startCamera} style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16, padding: '10px 36px', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s', textAlign: 'center' }}>
                      Chụp ảnh
                    </div>

                    {/* Modal hiển thị camera */}
                    {showCamera && (
                      <div className="camera-modal">
                        <div className="camera-container">
                          <video
                            ref={videoRef}
                            autoPlay
                            style={{ width: "100%" }}
                          />
                          <button
                            className="button-capture"
                            onClick={captureImage}
                            style={{ background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer', transition: 'background 0.3s' }}
                          >
                            Chụp
                          </button>
                          <button
                            className="button-capture"
                            onClick={stopCamera}
                            style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer', transition: 'background 0.3s' }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="detail">Thông tin chi tiết thay đổi</label>
                <textarea
                  id="detail"
                  name="detail"
                  value={details}
                  onChange={handleChangedetail}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, transition: 'border-color 0.3s', minHeight: 80 }}
                ></textarea>
              </div>
              <div className="submit-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="submit" className="save-button" style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16, padding: '10px 36px', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleEditToggle}
                  style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16, padding: '10px 36px', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
