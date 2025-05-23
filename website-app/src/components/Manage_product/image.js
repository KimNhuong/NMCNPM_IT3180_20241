// ImageUpload.js
import React, { useState } from "react";

const ImageUpload = () => {
  const CLOUD_NAME = "ddgrjo6jr";
  const UPLOAD_PRESET = "my-app";
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const handleChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Vui lòng chọn một hình ảnh để tải lên.");
      return;
    }
console.log(image);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData, // Gửi FormData trực tiếp mà không cần JSON.stringify
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tải lên hình ảnh.");
      }

      const data = await response.json(); // Chuyển đổi phản hồi thành JSON
      setUrl(data.secure_url);
      console.log("Uploaded Image URL:", data.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Đã xảy ra lỗi khi tải lên hình ảnh.");
    }
  };

  return (
    <div>
      <h2>Tải lên hình ảnh với Cloudinary</h2>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Tải lên</button>
      {url && (
        <div>
          <h3>Hình ảnh đã tải lên:</h3>
          <img src={url} alt="Uploaded" width="300" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;






// import React, { useRef, useState } from 'react';

// const ImageUpload = () => {
//   const videoRef = useRef(null);
//   const [image, setImage] = useState(null);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//     } catch (error) {
//       console.error("Error accessing the camera: ", error);
//     }
//   };

//   const captureImage = () => {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     const video = videoRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     setImage(canvas.toDataURL('image/png'));
//   };

//   return (
//     <div>
//       <h2>Camera Capture</h2>
//       <video ref={videoRef} autoPlay></video>
//       <br />
//       <button onClick={startCamera}>Start Camera</button>
//       <button onClick={captureImage}>Capture Image</button>
//       {image && (
//         <div>
//           <h3>Captured Image:</h3>
//           <img src={image} alt="Captured" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageUpload;

// import React, { useState, useRef } from 'react';
// import "./image.css"
// const ImageUpload = () => {
//   const [showCamera, setShowCamera] = useState(false);
//   const [image, setImage] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Bắt đầu hiển thị video từ camera
//   const startCamera = async () => {
//     setShowCamera(true);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   // Chụp ảnh từ video
//   const captureImage = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageUrl = canvas.toDataURL('image/png');
//     setImage(imageUrl);
//     setShowCamera(false); // Đóng camera sau khi chụp

//     // Tạo một file blob từ imageUrl và đặt vào input file
//     fetch(imageUrl)
//       .then(res => res.blob())
//       .then(blob => {
//         const file = new File([blob], 'capture.png', { type: 'image/png' });
//         const dataTransfer = new DataTransfer();
//         dataTransfer.items.add(file);
//         fileInputRef.current.files = dataTransfer.files;
//       });
//   };

//   return (
//     <div className="form-group">
//       <label htmlFor="image">Image</label>
//       <input type="file" ref={fileInputRef} />

//       <div className="capture" onClick={startCamera}>Chụp ảnh</div>

//       {/* Modal hiển thị camera */}
//       {showCamera && (
//         <div className="camera-modal">
//           <div className="camera-container">
//             <video ref={videoRef} autoPlay style={{ width: '100%' }} />
//             <button onClick={captureImage}>Chụp</button>
//             <button onClick={() => setShowCamera(false)}>Hủy</button>
//           </div>
//         </div>
//       )}

//       <canvas ref={canvasRef} style={{ display: 'none' }} />

//       {image && (
//         <div>
//           <h3>Ảnh đã chụp:</h3>
//           <img src={image} alt="Captured" style={{ width: '300px' }} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageUpload;
