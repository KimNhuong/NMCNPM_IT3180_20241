import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hàm để tạo nội dung tùy chỉnh cho thông báo
const ToastContent = ({ title, message, color }) => (
  <div>
    <h4 style={{ margin: 0, color }}>{title}</h4>
    <p style={{ margin: '5px 0 0', color: '#333',lineHeight:1.5 }}>{message}</p>
  </div>
);

// Hàm notify sử dụng ToastContent với màu viền tùy chỉnh
export const notify = (type, message, title) => {
  let color;
  switch (type) {
    case 1:
      color = 'green';
      toast.success(<ToastContent title={title} message={message} color={color} />, {
        style: { borderLeft: `5px solid #47d864` }
      });
      break;
    case 2:
      color = 'red';
      toast.error(<ToastContent title={title} message={message} color={color} />, {
        style: { borderLeft: `5px solid ${color}` }
      });
      break;
    case 3:
      color = 'orange';
      toast.warning(<ToastContent title={title} message={message} color={color} />, {
        style: { borderLeft: `5px solid ${color}` }
      });
      break;
    default:
      color = 'blue';
      toast.info(<ToastContent title={title} message={message} color={color} />, {
        style: { borderLeft: `5px solid ${color}` }
      });
  }
};

const Notification = () => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    style={{
      zIndex: 1000000,
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0)',
    }}
    toastStyle={{
      backgroundColor: '#fff',
      color: '#333',
      padding: '16px 24px',
      margin: '10px 0',
      minWidth: '300px',
    }}
    bodyClassName={{
      display: 'flex',
      alignItems: 'center',
    }}
  />
);

export default Notification;