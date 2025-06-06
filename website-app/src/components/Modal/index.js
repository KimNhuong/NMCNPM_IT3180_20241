import React, { useEffect, useState } from 'react';
import './Modal.css'; 
import { FaRegUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import {useAuth} from "../introduce/useAuth"
import Avatar from '../Avatar';
const Modal = () => {
  const {user,logout} =useAuth();
  const [isOpen, setIsOpen] = useState(false);
  console.log(user)
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside modal-content
      if (isOpen && !document.querySelector('.modal-wrapper')?.contains(event.target)) {
        toggleModal();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

  }, [isOpen]);


  return (
    <div className="modal-wrapper">
      <FaRegUser className="icon-user" onClick={toggleModal} />
      {isOpen && (
        <div className="uy-modal-content" style={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #fffde4 100%)",
          borderRadius: 18,
          boxShadow: "0 8px 32px 0 rgba(30,136,229,0.15)",
          padding: 24,
          minWidth: 220,
          minHeight: 120,
          position: "absolute",
          top: 48,
          right: 0,
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-16px)',
          transition: "opacity 0.3s cubic-bezier(.4,2,.6,1), transform 0.3s cubic-bezier(.4,2,.6,1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div className="user-info" style={{ marginBottom: 16, textAlign: "center" }}>
            <div className='uy-avatar-container' style={{ marginBottom: 8 }}>
              <div className='uy-avatar' style={{ boxShadow: "0 2px 8px #b3c6ff33", borderRadius: "50%", overflow: "hidden", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                <Avatar name={user.name} imageUrl={user.avatar} />
              </div>
            </div>
            <div className="user-details" style={{ color: "#1e88e5", fontWeight: 600, fontSize: 16 }}>
              <strong>{user.name}</strong>
              <div className="email" style={{ color: "#888", fontWeight: 400, fontSize: 13 }}>{user.email}</div>
            </div>
          </div>
          <div className="menu-items" style={{ width: "100%" }}>
            <Link to="/home/profile" style={{ textDecoration: "none" }}>
              <div className="menu-item" style={{
                padding: "10px 0",
                borderRadius: 10,
                color: "#1976d2",
                fontWeight: 600,
                textAlign: "center",
                marginBottom: 8,
                background: "#e3f2fd",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                boxShadow: "0 1px 4px #b3c6ff11"
              }}
                onMouseOver={e => { e.currentTarget.style.background = '#bbdefb'; e.currentTarget.style.color = '#0d47a1'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
              >
                <i className="icon fa fa-user"></i> Account Setting
              </div>
            </Link>
            <div className="menu-item" onClick={logout} style={{
              padding: "10px 0",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 600,
              textAlign: "center",
              background: "linear-gradient(90deg, #fda085 0%, #f6d365 100%)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              boxShadow: "0 1px 4px #fda08522"
            }}
              onMouseOver={e => { e.currentTarget.style.background = '#f44336'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(90deg, #fda085 0%, #f6d365 100%)'; e.currentTarget.style.color = '#fff'; }}
            >
              <i className="icon fa fa-sign-out-alt"></i> Logout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
