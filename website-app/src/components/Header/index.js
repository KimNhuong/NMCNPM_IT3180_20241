import { RiSettings4Line } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser,FaSearch } from "react-icons/fa";
import '../Header/Header.css'
import Modal from "../Modal/index.js";
import AudioPlayer from "./music.js"
import Notification from "./noti.js"
function Header({size}) {
  return(<>
  
    <div className="header" style={{width:`${size}%`,marginLeft:`${100-size}%`}}>
      {/* <div className="search-box">
      <FaSearch className="search-icon" />
      <input type="text" placeholder="Search ..."/>
      </div> */}
      <div className="header__right" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* <div className="header__setting"><RiSettings4Line /></div> */}
        <div className="header__notify"></div>
        <div className="header__user" style={{ marginLeft: "1350px" }}><Modal /></div>
      </div>
    </div></>
  )
}

export default Header;