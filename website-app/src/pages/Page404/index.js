import "./index.css"
import a from "./cute.jpg";
function Page404(){
    return(
      <>
        <div className="error-container">
        <img src={a} alt="Ảnh của bạn" className="error-image"/>
        <h1 className="error-title">404 - Không tìm thấy trang</h1>
        <p className="error-message">Rất tiếc, trang bạn yêu cầu không tồn tại.</p>
        <a href="javascript:history.back()" className="back-button">Quay lại trang trước</a>
       </div>
      </>
    )
  }
  
  export default Page404;
