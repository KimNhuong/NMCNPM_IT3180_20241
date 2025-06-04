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
      user: { ...user, id: user._id },
      newPr: { ...newBankAccount },
    };
    console.log(body);
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
          notify(1, "thêm tài khoản thành công", "Thành công");
          SetX((a) => !a);
        }
      })
      .catch((error) => {
        notify(2, "thêm sản phẩm thất bại", "Thất bại");
        console.log("Lỗi:", error);
      });
  };
  const handleDeleteAccount = async (index) => {
    if (data.role !== "Admin") {
      notify(2, "chỉ có chủ mới có quyền xoá tài khoản", "Thất bại");
      return;
    }
    const accountToDelete = bankAccounts[index];
    const response = await fetch("http://localhost:8080/api/bank/delete_bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: { ...user, id: user._id },
        accountNumber: accountToDelete.accountNumber,
        bankName: accountToDelete.bankName,
      }),
    });
    console.log(response);
    if (response.ok) {
      setBankAccounts((prev) => prev.filter((_, i) => i !== index));
      notify(1, "Xóa tài khoản thành công", "Thành công");
    } else {
      notify(1, "Xóa tài khoản thành công", "Thành công");
    }
  };

  return (
    <div className="profile-container profile-glass">
      <div className="profile-header profile-header-glass">
        <img
          src="https://th.bing.com/th?id=ORMS.56823debd4d1cba419b1262f94a12e45&pid=Wdp&w=612&h=304&qlt=90&c=1&rs=1&dpr=1.5&p=0"
          alt="Profile Banner"
          className="banner banner-glass"
        />
        <div className="profile-avatar-wrapper">
          <div
            className="profile-picture profile-picture-glass"
            onClick={() => setEditImage((prev) => !prev)}
          >
            <div className="uy-avatar avatar-glass" style={{ cursor: "pointer", boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)", border: "4px solid #fff", borderRadius: "50%", overflow: "hidden", transition: "transform 0.3s", background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }}>
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
        <div className="profile-info profile-info-glass">
          {!edit ? (
            <div className="profile-info__name profile-info__name-glass">{data ? data.name : ""}</div>
          ) : (
            <input
              type="text"
              name="name"
              value={newData ? newData.name : ""}
              onChange={handleEditChange}
              className="profile-edit-input"
            />
          )}
          {edit ? (
            <>
              <button className="message-btn profile-btn-glass" onClick={saveChanges}>
                Lưu
              </button>
              <button
                className="message-btn profile-btn-glass"
                onClick={() => setEdit(false)}
                style={{ marginLeft: "10px" }}
              >
                Thoát
              </button>
            </>
          ) : (
            <button className="message-btn profile-btn-glass" onClick={() => setEdit(true)}>
              Edit profile
            </button>
          )}
        </div>
      </div>
      <div className="connect-section connect-section-glass">
        <div className="section-title">Thông tin cá nhân</div>
        <ul className="profile-list">
          <li>
            <FaRegUser className="profile-icon" /> Quán của : {data ? data.id_owner.name : ""}
          </li>
          <li>
            <FaChild className="profile-icon" /> vị trí : {data ? data.role : ""}
          </li>
          <li>
            <FaCheckSquare className="profile-icon" /> Quyền : {data
              ? data.right
                ? data.right.permissions.map((p) => p).join(", ")
                : data.role == "Admin"
                ? "tất cả các quyền"
                : "Không có quyền gì"
              : ""}
          </li>
          <li>
            <MdEmail className="profile-icon" /> Email : {data ? data.email : ""}
          </li>
        </ul>
      </div>
      <div className="bank-section bank-section-glass">
        <div className="section-title">Thông tin tài khoản ngân hàng</div>
        <button
          className="message-btn profile-btn-glass"
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
          <div className="bank-form bank-form-glass">
            <form onSubmit={addBankAccount}>
              <input
                type="text"
                name="accountNumber"
                placeholder="Số tài khoản"
                value={newBankAccount.accountNumber}
                onChange={handleBankInputChange}
                required
                className="profile-edit-input"
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
                className="profile-edit-input"
              />
              <button className="message-btn profile-btn-glass">Lưu tài khoản</button>
            </form>
          </div>
        )}
        <ul className="bank-list">
          {bankAccounts.map((account, index) => (
            <li
              key={index}
              className="bank-list-item"
            >
              <span>
                {account.name} - {account.bankName} ({account.accountNumber})
              </span>
              <button
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => handleDeleteAccount(index)}
                className="delete_account profile-btn-glass"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="profile-logout">
        <button className="message-btn logout profile-btn-glass" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
