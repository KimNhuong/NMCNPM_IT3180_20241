import "../../components/introduce/resetpassword.css"
import { useState } from "react";
const Change_password=({email,off})=>{
    const [password,SetPassword]=useState("")
    const [confirmpassword,SetconfirmPassword]=useState("")
    const [error,SetError]=useState("")
    const submit_log=(e)=>{  
      e.preventDefault();
      if(password!=confirmpassword){SetError("nhập lại mật khẩu không khớp với mật khẩu");return}
      const body = {
        email:email,
        password:password
      };
      fetch("http://localhost:5000/login/change_password2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
      if(data.message==='Success'){   
off();
      }else{
        SetError(data.message)
      } 
        })
        .catch((error) => {
          console.error('Lỗi:', error);
        });
    }
    return(
    <div className="change-login">
    <div className="change-login-modal">
      <div className="change-login-header">
        <div>
        <h1 style={{fontSize:"30px",  lineHeight: "1.7",  fontWeight: "bold"}}>Reset Password</h1>
        <h2 style={{marginTop:"10px"}}>Điền mật khẩu mới</h2>
        </div>
        <span className="change-close-btn" 
        onClick={()=>{off()}}
        >
          &times;
        </span>
      </div>
      <form className="change-login-form" onSubmit={submit_log}>
        <div className="change-form-group">
          <input
           name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e)=>{SetPassword(e.target.value) ;SetError("")} 
            } 
            required
          />
          <input
           name="password"
            type="password"
            placeholder="Nhập lại password"
            value={confirmpassword}
            onChange={(e)=>{SetconfirmPassword(e.target.value) ;SetError("")} 
            } 
            required
          />
          <button id="login-btn" type="submit">
                 Xác nhận
              </button>
              <p style={{color:"red",padding:"10px 0px"}}>{error}</p>
        </div></form>
    </div>
  </div>)
}
export default Change_password;