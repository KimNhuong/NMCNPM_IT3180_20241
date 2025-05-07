import React, { useState } from "react";
import "./intro.css";
import Cookies from 'js-cookie';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FacebookProvider, LoginButton } from 'react-facebook';
import facebook from '../introduce/facebook.png';
import {jwtDecode} from 'jwt-decode';
import  { useNavigate }  from 'react-router-dom';
import {useAuth} from '../introduce/useAuth'
import Forgot_password from "./forgot_password"
import Change_password from "./resetpassword"
import {useLoading} from "./Loading"
import top from './img/top.png'
function LoginModal({ off, isSignup }) {
  // Sử dụng state để điều khiển hiển thị modal và form
  const { startLoading, stopLoading } = useLoading();
  const [error,setError]=useState('')
  const [confirm,setConfirm]=useState(false)
  const [isforgot,setIsforgot]=useState(false)
  const [isreset,setIsreset]=useState(false)
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(isSignup && { username: "", confirmPassword: "",code:"" }), // Thêm confirmPassword nếu là đăng ký
  });
  // const isFormValid = formData.email && formData.password;
  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const submit_log = (e) => {
    e.preventDefault();
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu khác với xác nhận mật khẩu");
      } else {
        const body = {
          email: formData.email,
          password: formData.password,
          name: formData.username,
          confirm:confirm,
          code:formData.code
        };
        console.log(body);
        startLoading();
        fetch("http://localhost:5000/login/sign_up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            stopLoading();
            if (data.message === "User created successfully") {
              // Lưu dữ liệu user vào Cookies
              if(confirm){
              Cookies.set("user", JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'Strict' });
              login(data.user)
              navigate('/home');
              // notify(1,"đăng nhập thành công","Thành công")
              }else{
                setConfirm(true)
              }

            } else {
              setError(data.message);
            }
          })
          .catch((error) => {
            console.error('Lỗi:', error);
          });
      }
    } else {
      const body = {
        email: formData.email,
        password: formData.password,
      };
      console.log(formData);
      startLoading();
      fetch("http://localhost:5000/login/login_raw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          stopLoading();
          console.log(data.user);
          console.log(data.token);
          console.log(data.message)
          if (data.message === "Login successful") {
            // Lưu dữ liệu user vào Cookies
            localStorage.setItem("token", data.token);
            Cookies.set("user", JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'Strict' });
            login(data.user)
            navigate('/home');
          } else {
            setError("Email hoặc mật khẩu của bạn không hợp lệ");
          }
        })
        .catch((error) => {
          console.error('Lỗi:', error);
        });
    }
  };
  
  
  //google
  const responseMessage = (response) => {
    const credential = response.credential;
    const decoded = jwtDecode(credential);
    console.log(decoded)
    const body = {
      family_name: decoded.family_name,
      given_name: decoded.given_name,
      GoogleID: decoded.sub,
      email: decoded.email,
    };
    console.log(JSON.stringify(body));
    startLoading();
    fetch("http://localhost:5000/login/login_google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        stopLoading()
        console.log(data);
        if (data.message === "Login successful"||data.message === "User created successfully") {
          // Lưu dữ liệu user vào Cookies
          localStorage.setItem("token", data.token);
          Cookies.set("user", JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'Strict' });
          login(data.user)
          navigate('/home');
        } else {
          setError("Email hoặc mật khẩu của bạn không hợp lệ");
        }
      })
      .catch((error) => {
        console.log("Lỗi:", error);
      });
  };
  

  const errorMessage = (error) => {
    console.log(error);
  };
  //facebook
  const handleResponse = (data) => {
    console.log(data); 
  };

  const handleError = (error) => {
    console.error(error); 
  };
  const forgot=()=>{
setIsforgot(true);
  }
  const sentagain = ()=>{
    setConfirm(false)
    const body = {
      email: formData.email,
      password: formData.password,
      name: formData.username,
      confirm:false,
      code:formData.code,
    };
    console.log(body);
    startLoading();
    fetch("http://localhost:5000/login/sign_up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        stopLoading();
        if (data.message === "User created successfully") {
          // Lưu dữ liệu user vào Cookies
            setConfirm(true)
        } else {
          setError(data.message);
        }
      })
      .catch((error) => {
        console.error('Lỗi:', error);
      });
  }
  return (<> 
  {isreset&&<Change_password off={()=>{setIsreset(false)}} email={isreset}/>} 
  {isforgot&&<Forgot_password off={()=>{setIsforgot(false)}} turnon={(email)=>{setIsreset(email)}}/>} 
      <GoogleOAuthProvider clientId="1039484967279-b0uv9c8m0t6v453c7im8f0jiopq82v3j.apps.googleusercontent.com">
        <div className="login">
          <div className="login-modal">
          <div class="image-top">

<img src={top} alt="Background" class="top-image"/>
</div> 
            <div className="login-header">
              <h2>{isSignup ? "Sign up" : "Login"}</h2>
              <span className="close-btn" onClick={()=>{off(0)}}>
                &times;
              </span>
            </div>
            
            <p>
              By continuing, you agree to our <a href="#">User Agreement</a> and
              acknowledge that you understand the <a href="#">Privacy Policy</a>
              .
            </p>

            <button className="login-option">Continue with phone number</button>

            <div className="forgoogle">
              <GoogleLogin
                onSuccess={responseMessage}
                onError={errorMessage}
                theme="filled_blue"
                size="large"
                shape="circle"
                color="blue"
                className="custom-google-login"
              />
            </div>
            <FacebookProvider appId="1509733739672960"> 
      <LoginButton
        scope="email" 
        onCompleted={handleResponse}
        onError={handleError}
        className="facebook-login-button"
      >
        <span className="facebook-icon" >
          <img src={facebook} style={{height:"40px"}}></img>
</span> 
        <span>Đăng nhập bằng Facebook</span>
      </LoginButton>
    </FacebookProvider>

            <div className="divider">
              <span>OR</span>
            </div>

            <form className="login-form" onSubmit={submit_log}>
              <div className="form-group">
                <input
                 name="email"
                  type="text"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange} // Cập nhật giá trị email
                  required
                />
              </div>
              <div className="form-group">
                <input
                name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange} // Cập nhật giá trị password
                  required
                />
              </div>
              {isSignup && (
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              {isSignup && (
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder="user_name"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
{confirm && (<>
                <div className="form-group">
                  <input
                    type="text"
                    name="code"
                    placeholder="điền mã xác nhận "
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div> 
                <p className="sentagain" onClick={sentagain} >Gửi lại mã</p></>
              )}
              {!isSignup && (
                <a className="forgot-password" onClick={forgot} style={{cursor:"pointer"}}>
                  Forgot password?
                </a>
              )}
              <button id="login-btn" type="submit">
                {isSignup ? "Sign up" : "login"}
              </button>
              <p style={{color:"red"}}>{error}</p>
            </form>
            {!isSignup && (
              <p className="signup-text">
                New to Myapp? <a style={{cursor:"pointer",color:"cornflowerblue"}} onClick={()=>{off(2)}}>Sign Up</a>
              </p>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>  </>
    )
}
export default LoginModal;
