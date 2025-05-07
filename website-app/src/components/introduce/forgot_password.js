import "./forgot_password.css"
import { useState } from "react";
import {useLoading} from '../introduce/Loading'
const Forgot_password=({off,turnon})=>{
  const {startLoading,stopLoading}=useLoading();
    const [email,SetEmail]=useState("")
    const [ma,SetMa]=useState("")
    const [error,SetError]=useState("")
    const [error2,SetError2]=useState("")
    const [color,SetColor]=useState("green")
    const [a,SetA]=useState(false)
    const submit_log=(e)=>{  
      e.preventDefault();
      const body = {
        email:email,
      };
      startLoading();
      fetch("http://localhost:5000/login/forgot_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {stopLoading()
      if(data.message==='Mã xác nhận đã được gửi đến email của bạn!'){
        SetColor('green')
        SetA(true)      
      }else{
        SetColor('red')
      }SetError(data.message)
        })
        .catch((error) => {
          console.error('Lỗi:', error);
        });
    }
    const check=(e)=>{
      e.preventDefault();
      const body = {
        email:email,
        ma:ma
      };
      startLoading()
      fetch("http://localhost:5000/login/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {stopLoading();
if(data.message==='Success'){off();turnon(email)}else{
  SetError2(data.message)
}
        })
        .catch((error) => {
          console.error('Lỗi:', error);
        });
    }
    const sentagain=()=>{
      SetA(false)
      SetError("")
      const body = {
        email:email,
      };
      startLoading();
      fetch("http://localhost:5000/login/forgot_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {stopLoading()
      if(data.message==='Mã xác nhận đã được gửi đến email của bạn!'){
        SetColor('green')
        SetA(true)      
      }else{
        SetColor('red')
      }SetError(data.message)
        })
        .catch((error) => {
          console.error('Lỗi:', error);
        });
    }
    return(
    <div className="forgot-login">
    <div className="forgot-login-modal">
      <div className="forgot-login-header">
        <div>
        <h1 style={{fontSize:"30px",  lineHeight: "1.7",  fontWeight: "bold"}}>Reset Password</h1>
        <h2 style={{marginTop:"10px"}}>Điền Email của bạn chúng tôi sẽ gửi mail với mã xác nhận , mã xác nhận chỉ có hiệu lực trong 2 phút</h2>
        </div>
        <span className="forgot-close-btn" 
        onClick={()=>{off()}}
        >
          &times;
        </span>
      </div>
      <form className="forgot-login-form" onSubmit={submit_log}>
        <div className="forgot-form-group">
          <input
           name="email"
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e)=>{SetEmail(e.target.value) ;SetError("");SetA(false)} 
            } 
            required
          />
          <button id="login-btn" type="submit">
                 Xác nhận
              </button>
             {a&&(<p className="sentagain" onClick={sentagain}>Gửi lại mã</p>)}
        </div>
        
        <p style={{color:color,padding:"10px 0px"}}>{error}</p></form>
        {a&&(<>
          <form className="forgot-login-form" onSubmit={check}>
          <div className="forgot-form-group">
        <input
           name="ma"
            type="text"
            placeholder="điền mã xác nhận ở đây"
            value={ma}
            onChange={(e)=>{SetMa(e.target.value) ;} 
            } 
            required
          />
          <button id="login-btn" type="submit">
                 Xác nhận
              </button>
              <p style={{color:"red",padding:"10px 0px"}}>{error2}</p>
              </div>
              </form>
          </>
          )}
      
    </div>
  </div>)
}
export default Forgot_password;