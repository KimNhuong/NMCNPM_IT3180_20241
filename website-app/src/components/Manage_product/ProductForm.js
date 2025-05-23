import React, { useState ,useRef,useEffect} from "react";
import "./ProductForm.css";
import { useAuth } from "../introduce/useAuth";
import {useLoading} from "../introduce/Loading"
import { notify } from '../../components/Notification/notification';
const ProductForm = ({turnoff,refresh,profile}) => {
  const {startLoading,stopLoading}=useLoading()
    const CLOUD_NAME = "ddgrjo6jr";
    const UPLOAD_PRESET = "my-app";
    const { user,loading} = useAuth();
    const [error,setError]=useState('');
    const [details,setDetails] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [image, setImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);
    const [suppliers, setSuppliers] = useState([]); // state for suppliers list
    // Bắt đầu hiển thị video từ camera
    const scrollableRef = useRef(null);
    const scrollToTop = () => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    const startCamera = async () => {
      setShowCamera(true);
      scrollToTop()
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = streamRef.current;
    };
    useEffect(() => {
      const fetchSuppliers = async () => {
        let body={
          user: user
              }
        try {
          let response = await fetch('http://localhost:5000/products/get_supplier', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          console.log(data.suppliers)
          setSuppliers(data.suppliers);
        } catch (error) {
          
          console.error("Error fetching suppliers:", error);
        }
      };
      fetchSuppliers();
    }, []);
    // Chụp ảnh từ video
    const captureImage = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setImage(imageUrl);
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop()); // Dừng từng track trong stream
        videoRef.current.srcObject = null; // Gán srcObject về null
        streamRef.current = null; // Đặt lại tham chiếu stream
      }
      setShowCamera(false); // Đóng camera sau khi chụp
      // Tạo một file blob từ imageUrl và đặt vào input file
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'capture.png', { type: 'image/png' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          console.log(file)
          setFormData(prevData => ({
            ...prevData,
            image: file // Lưu trữ file vào state
        }));
        });
    };
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    sku: "",
    price: "",
    stock_in_shelf: 0,
    reorderLevel: 10,
    supplier: "",
    purchaseDate: "",
    location: "",
    stock_in_Warehouse: 0,
    unit: "pcs",
    purchasePrice: "",
    notes: "",
    image:""
  });

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;

    // Xóa dấu phân tách cũ và chuyển thành số
    const numericValue = Number(value.replace(/,/g, '').replace(/\./g, ''));
    
    // Định dạng lại nếu là số hợp lệ
    const formattedValue = !Number.isNaN(numericValue) ? numericValue.toLocaleString('vn-VI')  : value;
    
    // Cập nhật formData với giá trị đã chuyển đổi
    setFormData({
      ...formData,
      [name]: typeof formattedValue === "string" 
                ? formattedValue.toLowerCase().replace(/,/g, '.')
                : value.replace(/,/g, '.')
    });
};

  const handleChange_link=(e) => {setError("")
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    fileInputRef.current.value = ""; 
    setImage(value);
  };
 const handleChangeimage=(e)=>{
    setFormData({
        ...formData,
        image: e.target.files[0]
      });
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setImage(imageUrl);
      }
 }
 const handleChangedetails=(e)=>{
    const {  value } = e.target;
    setDetails(value);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.stock_in_shelf < 0 || formData.reorderLevel < 0 || formData.stock_in_Warehouse < 0) {
      notify(2, 'Các trường số phải lớn hơn hoặc bằng 0.', 'Lỗi');
      return;
  }

  // Kiểm tra các trường price và purchasePrice phải là chuỗi số hợp lệ
  const isNumeric = (value) => /^\d+(\.\d+)?$/.test(value.replace(/,/g, '').replace(/\./g, ''));
  if (
    !isNumeric(formData.price) || !isNumeric(formData.purchasePrice) ||
    formData.price < 0 || formData.purchasePrice < 0
  ) {
    notify(
      2,
      'Giá bán và giá nhập phải là chuỗi số hợp lệ và lớn hơn hoặc bằng 0.',
      'Lỗi'
    );
    return;
  }
    if (!formData.supplier&&!profile) {
      notify(3,'Vui lòng chọn nhà cung cấp.Nếu không có nhà cung cấp bạn phải vào "Nhà cung cấp" để thêm','Cảnh báo');
      return;
    }
    if(profile&&!formData.image){
      notify(2,'Vui lòng thêm ảnh','Lỗi');
      return;
    }
    let body = {
user:user,
newPr:{...formData},
detail:details
    };
    startLoading();
    if(formData.image){
            const imageData = new FormData();
            imageData.append('file', formData.image);
           imageData.append('upload_preset', UPLOAD_PRESET);
        try {     
            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
                {
                  method: "POST",
                  body: imageData, // Gửi FormData trực tiếp mà không cần JSON.stringify
                }
              );
              const data = await cloudinaryResponse.json();
              const secure_url=data.secure_url
              const public_id=data.public_id
            // Chuẩn bị dữ liệu sản phẩm để gửi lên backend
            body = {
                user: user, // Giả sử user có thuộc tính _id
                newPr: {
                    ...formData,
                    image: {secure_url, public_id } // Thêm thông tin hình ảnh
                },
                detail: details
            };
            console.log(secure_url)
    }catch (error) {
        console.error("Error uploading image:", error);
        notify(2,"Đã xảy ra lỗi khi tải lên hình ảnh.","Thất bại")
      }
}
    console.log(JSON.stringify(body));
    if(!profile){fetch("http://localhost:5000/products/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {stopLoading()
        console.log(data.message)
      if(data.message==="Success"){turnoff();  notify(1,"thêm sản phẩm thành công","Thành công");refresh();}
      else{
        notify(2,data.message,'Thất bại');
        setError(data.message)}
      })
      .catch((error) => {
        notify(2,"thêm sản phẩm thất bại","Thất bại")
        console.log("Lỗi:", error);
      });}else{
        fetch("http://localhost:5000/profile/update_avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {stopLoading()
            console.log(data.respond)
          if(data.respond==="success"){turnoff();  notify(1,"thay đổi ảnh đại diện thành công","Thành công");
            console.log(refresh);
            refresh();}
          else{
            notify(2,'một lỗi nào đó đã xảy ra','Thất bại');
            }
          })
          .catch((error) => {
            notify(2,"thêm sản phẩm thất bại","Thất bại")
            console.log("Lỗi:", error);
          });
      }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop()); // Dừng từng track trong stream
      videoRef.current.srcObject = null; // Gán srcObject về null
      streamRef.current = null; // Đặt lại tham chiếu stream
    }
    setShowCamera(false); // Đóng modal hoặc ẩn camera
  };
  // const handleSupplierChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     supplier: e.target.value
  //   });
  // };
  // const handleCodeChange = (e) => {

  //   setFormData({
  //     ...formData,
  //     sku: e.target.value
  //   });
  // };
  const handleNChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.toLowerCase()
    });
  }; 
  return (
    <div className="form-container" ref={scrollableRef} style={profile?({top:"8%",minHeight:"450px"}):({})}>
        <span className="close-button" onClick={turnoff}>&times;</span> {/* Dấu X để tắt form */}
    <h2>{!profile?"Product Entry Form":"Upload ảnh"}</h2>
    <form onSubmit={handleSubmit}>
      {!profile?(<>
        <div className="form-row">
            <div className="form-group">
                <label htmlFor="name">Tên hàng hóa *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleNChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="category">Loại hàng hóa *</label>
                <input type="text" id="category" name="category" value={formData.category} onChange={handleNChange} required />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="brand">Thương hiệu</label>
                <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleNChange} />
            </div>
            <div className="form-group">
                <label htmlFor="sku">Mã *</label>
                <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleNChange} required />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="price">Giá bán *</label>
                <input type="text" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="purchasePrice">Giá nhập</label>
                <input type="text" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="stock_in_shelf">Số lượng trên kệ</label>
                <input type="number" id="stock_in_shelf" name="stock_in_shelf" value={formData.stock_in_shelf} onChange={handleNChange} />
            </div>
            <div className="form-group">
                <label htmlFor="reorderLevel">Thông báo cần nhập hàng nếu số lượng dưới:</label>
                <input type="number" id="reorderLevel" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="supplier">Nhà cung cấp</label>
                <select id="supplier" name="supplier" value={formData.supplier} onChange={handleNChange}>
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
            </div>
            <div className="form-group">
                <label htmlFor="purchaseDate">Ngày nhập hàng</label>
                <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="location">Vị trí</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleNChange} />
            </div>
            <div className="form-group">
            <label htmlFor="stock_in_Warehouse">Số lượng trong kho</label>
            <input type="number" id="stock_in_Warehouse" name="stock_in_Warehouse" value={formData.stock_in_Warehouse} onChange={handleNChange}/>
            </div>
        </div>
        </>):null}
        <div className="form-row">
            {!profile?(<><div className="form-group">
                <label htmlFor="unit">đơn vị</label>
                <input type="text" id="unit" name="unit" value={formData.unit} onChange={handleNChange} />
            </div>
            <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleNChange}></textarea>
            </div></>):null}
            <div className="form-group">
      <label htmlFor="image">Image (3 cách để nhập ảnh)</label>
      <p style={{marginBottom:"3px"}}>1. tải ảnh lên từ máy</p>
      <input type="file" ref={fileInputRef} name="image" onChange={handleChangeimage}/>
      <p style={{marginBottom:"3px",marginTop:"3px"}}>2. link ảnh trên mạng</p>
      <input type="text" id="image" name="image" value={formData.image} onChange={handleChange_link} />
      <p style={{marginBottom:"3px",marginTop:"3px"}}>3. chụp ảnh trực tiếp</p>
      <div className="capture" onClick={startCamera}>Chụp ảnh</div>

      {/* Modal hiển thị camera */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video ref={videoRef} autoPlay style={{ width: '100%' }} />
            <button className="button-capture" onClick={captureImage}>Chụp</button>
            <button  className="button-capture" onClick={stopCamera}>Hủy</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {image && (
        <div>
          <h3>Ảnh :</h3>
          <img src={image} alt="Captured" style={{ width: '300px' }} />
        </div>
      )}
    </div>
            {!profile?(<div className="form-group">
                <label htmlFor="details">Thông tin chi tiết về thêm sản phẩm </label>
                <textarea id="details" name="details" value={details} onChange={handleChangedetails}></textarea>
            </div>):("")}
        </div>
        <p style={{color:"red"}}>{error}</p>
        <div className="submit-row">
            <div className="submit-group">
                <input type="submit" value="Submit" />
            </div>
        </div>
    </form>
</div>
  );
};

export default ProductForm;