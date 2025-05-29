import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import LoginModal from "./intro";
import "./main.css";
import Cookies from "js-cookie";
import { notify } from "../../components/Notification/notification";
import help from "./img/help.png";
import logo from "./img/logo2-removebg-preview.png";

function Main() {
  const [a, setA] = useState(0);
  const handle = (x) => {
    setA(x);
  };
  const location = useLocation();
  const storedUser = Cookies.get("user");
  let user = null;
  useEffect(() => {
    if (location.state) {
      notify(2, "bạn phải đăng nhập", "Thất bại");
    }
  }, []);

  if (storedUser) {
    try {
      const decodedString = decodeURIComponent(storedUser);
      user = JSON.parse(decodedString);
    } catch (error) {
      console.error(
        "Không thể giải mã hoặc phân tích dữ liệu người dùng:",
        error
      );
    }
  }
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="intro-bg">
      {a === 1 && <LoginModal off={handle} isSignup={false} />}
      {a === 2 && <LoginModal off={handle} isSignup={true} />}
      <div className={`intro-overlay${a !== 0 ? " faded" : ""}`}></div>
      <header className="intro-header">
        <div className="intro-logo">
          <img src={logo} alt="Logo" />
          <span>SMART STORE</span>
        </div>
        <div className="intro-auth-buttons">
          <button className="intro-btn" onClick={() => setA(1)}>
            Đăng nhập
          </button>
          <button className="intro-btn" onClick={() => setA(2)}>
            Đăng ký
          </button>
        </div>
      </header>
      <main className="intro-main">
        <div className="intro-hero">
          <div className="intro-hero-content">
            <h1 className="intro-title">
              Chào mừng đến với <span>Smart Store</span>
            </h1>
            <p className="intro-desc">
              Nền tảng quản lý cửa hàng thông minh, hiện đại và thân thiện với
              người dùng.
            </p>
            <div className="intro-cta-group">
              <button className="intro-cta" onClick={() => setA(1)}>
                Bắt đầu ngay
              </button>
            </div>
          </div>
          <div className="intro-hero-img">
            <img src={help} alt="Support" />
            <div className="intro-hero-bg-effect"></div>
          </div>
        </div>
      </main>
      <footer className="intro-footer">
        <a
          href="http://localhost:8000"
          className="intro-support-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Hỗ trợ</span>
        </a>
      </footer>
    </div>
  );
}
export default Main;
