import React, { useState, useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
import { FaChild } from "react-icons/fa";
import { FaCheckSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import "./Profile.css";
import { useAuth } from "../../components/introduce/useAuth";
import Avatar from "../../components/Avatar";
import { useLoading } from "../../components/introduce/Loading";
import ProfilePictureOptions from "./image.js";
import { notify } from "../../components/Notification/notification";

function Profile() {
  const { user, logout, loading } = useAuth();
  const [edit, setEdit] = useState(false);
  const [editImage, setEditImage] = useState(false);
  const [data, setData] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const [newData, setNewData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [newBankAccount, setNewBankAccount] = useState({
    accountNumber: "",
    bankName: "",
    name: "",
  });
  const [x, SetX] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      if (loading) return;
      startLoading();
      const response = await fetch(
        "http://localhost:8080/api/profile/get_profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        }
      );
      const response2 = await fetch("http://localhost:8080/api/bank/get_bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      if (!response.ok || !response2.ok) {
        notify(2, "network is not okay!", "Thất bại");
      }
      const profileData = await response.json();
      const acc = await response2.json();
      console.log(profileData);
      stopLoading();
      setData(profileData);
      setNewData(profileData);
      setBankAccounts(acc);
    };

    fetchProfile();
  }, [loading, x]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setNewData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    startLoading();
    const response = await fetch(
      "http://localhost:8080/api/profile/change_profile",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newData }),
      }
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
    stopLoading();
    if (result.respond === "success") {
      notify(1, "Cập nhật thông tin cá nhân thành công", "Thành công");
      setEdit(false);
      setRefresh((prev) => !prev);
    }
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setNewBankAccount((prev) => ({ ...prev, [name]: value }));
  };
  const addBankAccount = async (e) => {
    e.preventDefault();
    if (data.role != "Admin") {
      notify(2, "chỉ có chủ mới có quyền thêm tài khoản", "Thất bại");
      return;
    }
    startLoading();
    let body = {
      user: user,
      newPr: { ...newBankAccount },
    };
    fetch("http://localhost:8080/api/bank/add_bank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        stopLoading();
        console.log(data.message);
        if (data.message === "Success") {
          notify(1, "thêm tài khoản thành công", "Thành công");
          SetX((a) => !a);
        } else {
          notify(2, "có lỗi xảy ra", "Thất bại");
        }
      })
      .catch((error) => {
        notify(2, "thêm sản phẩm thất bại", "Thất bại");
        console.log("Lỗi:", error);
      });
  };
  const handleDeleteAccount = async (index) => {
    if (data.role != "Admin") {
      notify(2, "chỉ có chủ mới có quyền xoá tài khoản", "Thất bại");
      return;
    }
    const accountToDelete = bankAccounts[index];
    const response = await fetch("http://localhost:8080/api/bank/delete_bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user,
        accountNumber: accountToDelete.accountNumber,
        bankName: accountToDelete.bankName,
      }),
    });
    console.log(response);
    if (response.ok) {
      setBankAccounts((prev) => prev.filter((_, i) => i !== index));
      notify(1, "Xóa tài khoản thành công", "Thành công");
    } else {
      notify(2, "Xóa tài khoản thất bại", "Thất bại");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://th.bing.com/th?id=ORMS.56823debd4d1cba419b1262f94a12e45&pid=Wdp&w=612&h=304&qlt=90&c=1&rs=1&dpr=1.5&p=0"
          alt="Profile Banner"
          className="banner"
        />
        <div>
          <div
            className="profile-picture"
            onClick={() => setEditImage((prev) => !prev)}
          >
            <div className="uy-avatar" style={{ cursor: "pointer" }}>
              {data ? <Avatar name={data.name} imageUrl={data.avatar} /> : ""}
            </div>
          </div>
          {editImage && (
            <ProfilePictureOptions
              image={data.avatar}
              reload={() => setRefresh((prev) => !prev)}
            />
          )}
        </div>

        <div className="profile-info">
          {!edit ? (
            <div className="profile-info__name">{data ? data.name : ""}</div>
          ) : (
            <input
              type="text"
              name="name"
              value={newData ? newData.name : ""}
              onChange={handleEditChange}
            />
          )}

          {edit ? (
            <>
              <button className="message-btn" onClick={saveChanges}>
                Lưu
              </button>
              <button
                className="message-btn"
                onClick={() => setEdit(false)}
                style={{ marginLeft: "10px" }}
              >
                Thoát
              </button>
            </>
          ) : (
            <button className="message-btn" onClick={() => setEdit(true)}>
              Edit profile
            </button>
          )}
        </div>
      </div>

      <div className="connect-section">
        <div>Thông tin cá nhân</div>
        <ul>
          <li>
            <a href="#">
              <FaRegUser /> Quán của : {data ? data.id_owner.name : ""}
            </a>
          </li>
          <li>
            <a href="#">
              <FaChild /> vị trí : {data ? data.role : ""}
            </a>
          </li>
          <li>
            <a href="#">
              <FaCheckSquare /> Quyền :{" "}
              {data
                ? data.right
                  ? data.right.permissions.map((p) => p).join(", ")
                  : data.role == "Admin"
                  ? "tất cả các quyền"
                  : "Không có quyền gì"
                : ""}
            </a>
          </li>
          <li>
            <a href="#">
              <MdEmail /> Email : {data ? data.email : ""}
            </a>
          </li>
          <li>
            <a href="#">
              <RiLockPasswordFill /> Mật khẩu :
              {!edit ? (
                data ? (
                  data.password
                ) : (
                  ""
                )
              ) : (
                <input
                  type="text"
                  name="password"
                  value={newData ? newData.password : ""}
                  onChange={handleEditChange}
                />
              )}
            </a>
          </li>
        </ul>
      </div>

      <div className="bank-section">
        <div>Thông tin tài khoản ngân hàng</div>
        <button
          className="message-btn"
          onClick={() => {
            setShowBankForm((prev) => !prev);
            setNewBankAccount({
              accountNumber: "",
              bankName: "",
              name: "",
              image: "",
            });
          }}
        >
          {showBankForm ? "Đóng form" : "Thêm tài khoản ngân hàng"}
        </button>
        {showBankForm && (
          <div className="bank-form">
            <form onSubmit={addBankAccount}>
              <input
                type="text"
                name="accountNumber"
                placeholder="Số tài khoản"
                value={newBankAccount.accountNumber}
                onChange={handleBankInputChange}
                required
              />
              <div className="bank-select-container">
                <label htmlFor="bankName" className="bank-select-label">
                  Chọn ngân hàng:
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={newBankAccount.bankName}
                  onChange={handleBankInputChange}
                  required
                  className="bank-select"
                >
                  <option value="" disabled>
                    Chọn ngân hàng
                  </option>
                  <option value="VCB">Vietcombank (VCB)</option>
                  <option value="TCB">Techcombank (TCB)</option>
                  <option value="ICB">VietinBank (ICB)</option>
                  <option value="BIDV">BIDV</option>
                  <option value="STB">Sacombank (STB)</option>
                  <option value="MB">MB Bank (MB)</option>
                  <option value="ACB">ACB</option>
                  <option value="VPB">VPBank (VPB)</option>
                  <option value="HDB">HDBank (HDB)</option>
                  <option value="SHB">SHB</option>
                  <option value="Oceanbank">OceanBank</option>
                  <option value="DOB">DongA Bank (DOB)</option>
                  <option value="VBA">Agribank (VBA)</option>
                  <option value="EIB">Eximbank (EIB)</option>
                </select>
              </div>

              <input
                type="text"
                name="name"
                placeholder="Tên"
                value={newBankAccount.name}
                onChange={handleBankInputChange}
                required
              />
              {/* <label>mã QR</label>
        <input type="file" name="image" onChange={handleChangeimage} required />
        {image && (
          <div>
            <h3>Ảnh :</h3>
            <img src={image} alt="Captured" style={{ width: '300px' }} />
          </div>
        )} */}
              <button className="message-btn">Lưu tài khoản</button>
            </form>
          </div>
        )}
        <ul>
          {bankAccounts.map((account, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span>
                {account.name} - {account.bankName} ({account.accountNumber})
              </span>

              <button
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => handleDeleteAccount(index)}
                className="delete_account"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="profile-logout">
        <button className="message-btn logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
