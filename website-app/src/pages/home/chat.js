import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../../components/introduce/useAuth";
import { IoCallSharp } from "react-icons/io5";
import { FaVideo } from "react-icons/fa";

function Chat({chats,ring}) {
  const { user, loading } = useAuth();
  const chatEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messageHandled = useRef(false);
    const socket = io("http://localhost:5000");
  useEffect(() => {


    const fetchMessages = async () => {
      if (loading) return;
      try {
        const response = await fetch("http://localhost:5000/chat/getMessages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({user}),
        });
        const data = await response.json();
        console.log(data)
        if (Array.isArray(data)) {
          const formattedData = data.map((msg) => ({
            ...msg,
            isUser: msg.sender._id === user._id,
          }));
          setChat(formattedData);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
      
    // socket.on("receive_message", (data) => {
    //   console.log(!messageHandled.current)
    //   console.log(data.sender._id !== user._id)
    //   if(!messageHandled.current&&data.sender._id !== user._id){
    //     messageHandled.current = true;
        
    //     const newMessage = {
    //     ...data,
    //     isUser: data.sender._id === user._id,
    //   };
    //   console.log("day la chat ",chats)
    //   if(!chats){ring()}
    //   setChat((prev) => [...prev, newMessage]);
    //   setTimeout(() => {
    //     messageHandled.current = false;  // Đặt lại để xử lý tin nhắn mới
    //   }, 1000); // Ví dụ reset sau 1 giây
    //   }
      
    // });

    // // Cleanup khi component unmount
    // return () => {
    //   socket.disconnect();
    // };
  }, [loading, user]);
  useEffect(()=>{
    socket.on("receive_message", (data) => {
      console.log(!messageHandled.current)
      console.log(data.sender._id !== user._id)
      if(!messageHandled.current&&data.sender._id !== user._id){
        messageHandled.current = true;
        
        const newMessage = {
        ...data,
        isUser: data.sender._id === user._id,
      };
      console.log("day la chat ",chats)
      if(!chats){ring()}
      setChat((prev) => [...prev, newMessage]);
      setTimeout(() => {
        messageHandled.current = false;  // Đặt lại để xử lý tin nhắn mới
      }, 1000); // Ví dụ reset sau 1 giây
      }
      
    });

    // Cleanup khi component unmount
    return () => {
      socket.disconnect();
    };
  },[ring])
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        sender: user,
        owner: user.id_owner,
        content: message,
      };
  
      socket.emit("send_message", newMessage);
  
      setChat((prev) => [
        ...prev,
        {
          ...{sender:user,
            content:message
          },
          isUser: true,
        },
      ]);
  
      setMessage(""); // Xóa nội dung tin nhắn sau khi gửi
    }
  };
  
  return (
    <div style={{ ...styles.container, display: chats ? "block" : "none" }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={user?.avatar} alt="Avatar" style={styles.headerAvatar} />
          <span style={styles.headerName}>{user?.name || "Chat"}</span>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.headerButton}><IoCallSharp /></button>
          <button style={styles.headerButton}><FaVideo />
          </button>
        </div>
      </div>
      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {chat.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageContainer,
              justifyContent: msg.isUser ? "flex-end" : "flex-start",
            }}
          >
            {!msg.isUser && (
              <img src={msg.sender.avatar} alt="Avatar" style={styles.avatar} />
            )}
            <div
              style={{
                ...styles.message,
                backgroundColor: msg.isUser ? "#d1e7ff" : "#e1ffc7",
              }}
            >
              {msg.content}
            </div>
            {msg.isUser && (
              <img src={msg.sender.avatar} alt="Avatar" style={styles.avatar} />
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input Field */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
  
}

const styles = {
  container: {
    
    width: "300px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "5px",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    position: "fixed",
    right:"150px",
    bottom:"95px",
    zIndex:1000,
    
  },
  chatWindow: {
    height: "300px",
    overflowY: "scroll",
    padding: "10px",
    backgroundColor: "#f1f1f1",
  },
  messageContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    margin: "0 10px",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "200px",
    fontSize: "14px",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "10px",
    backgroundColor:"white"
  },
  input: {
    flex: 1,
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
  },
  button: {
    padding: "8px 12px",
    fontSize: "14px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "5px",
  },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      backgroundColor: "#007bff",
      color: "#fff",
      borderBottom: "1px solid #ccc",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
    },
    headerAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    headerName: {
      fontSize: "16px",
      fontWeight: "bold",
    },
    headerRight: {
      display: "flex",
      gap: "5px",
    },
    headerButton: {
      padding: "5px 10px",
      fontSize: "14px",
      backgroundColor: "#0056b3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    
    // Các kiểu khác giữ nguyên
  }
  
};

export default Chat;

