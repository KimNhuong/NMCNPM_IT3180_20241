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
    <div
      className="profile-container profile-glass"
      style={{
        maxWidth: "700px",
        width: "100%",
        margin: "40px auto 32px auto",
        background: "linear-gradient(135deg, #e0e7ff 0%, #fffde4 100%)",
        borderRadius: 32,
        boxShadow: "0 8px 40px 0 rgba(30,136,229,0.10)",
        padding: "40px 32px 32px 32px",
        transition: "box-shadow 0.4s, background 0.4s",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className="profile-avatar-wrapper"
        style={{
          marginBottom: 0,
          position: "relative",
          width: 120,
          height: 190,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="profile-picture profile-picture-glass"
          onClick={() => setEditImage((prev) => !prev)}
          style={{
            cursor: "pointer",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)",
            border: "4px solid #fff",
            borderRadius: "50%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s, box-shadow 0.3s",
          }}
        >
          {data ? <Avatar name={data.name} imageUrl={data.avatar} /> : ""}
        </div>
        {editImage && (
          <ProfilePictureOptions
            image={data.avatar}
            reload={() => setRefresh((prev) => !prev)}
          />
        )}
      </div>
      <div
        className="profile-info profile-info-glass"
        style={{ textAlign: "center", marginBottom: 24, marginTop: 12 }}
      >
        {!edit ? (
          <div
            className="profile-info__name profile-info__name-glass"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1e88e5",
              textShadow: "0 2px 8px #b3c6ff",
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            {data ? data.name : ""}
          </div>
        ) : (
          <input
            type="text"
            name="name"
            value={newData ? newData.name : ""}
            onChange={handleEditChange}
            className="profile-edit-input"
            style={{
              fontSize: 24,
              fontWeight: 600,
              borderRadius: 12,
              padding: 8,
              marginBottom: 8,
            }}
          />
        )}
        {edit ? (
          <>
            <button
              className="message-btn profile-btn-glass"
              style={{ marginRight: 8 }}
              onClick={saveChanges}
            >
              Lưu
            </button>
            <button
              className="message-btn profile-btn-glass"
              onClick={() => setEdit(false)}
            >
              Thoát
            </button>
          </>
        ) : (
          <button
            className="message-btn profile-btn-glass"
            style={{
              marginTop: 8,
              position: "static",
              display: "inline-block",
            }}
            onClick={() => setEdit(true)}
          >
            Edit profile
          </button>
        )}
      </div>
      <div
        className="connect-section connect-section-glass"
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 12px #b3c6ff22",
          padding: 24,
          marginBottom: 24,
          width: "100%",
          transition: "box-shadow 0.3s, background 0.3s",
        }}
      >
        <div
          className="section-title"
          style={{
            color: "#1e88e5",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 12,
          }}
        >
          Thông tin cá nhân
        </div>
        <ul
          className="profile-list"
          style={{ fontSize: 17, color: "#333", lineHeight: 2 }}
        >
          <li>
            <FaRegUser
              className="profile-icon"
              style={{ color: "#1976d2" }}
            />{" "}
            Quán của : {data ? data.id_owner.name : ""}
          </li>
          <li>
            <FaChild className="profile-icon" style={{ color: "#43a047" }} />{" "}
            vị trí : {data ? data.role : ""}
          </li>
          <li>
            <FaCheckSquare
              className="profile-icon"
              style={{ color: "#ff6b6b" }}
            />{" "}
            Quyền :{" "}
            {data
              ? data.right
                ? data.right.permissions.map((p) => p).join(", ")
                : data.role == "Admin"
                ? "tất cả các quyền"
                : "Không có quyền gì"
              : ""}
          </li>
          <li>
            <MdEmail className="profile-icon" style={{ color: "#6d4c41" }} />{" "}
            Email : {data ? data.email : ""}
          </li>
        </ul>
      </div>
      <div
        className="bank-section bank-section-glass"
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 12px #a8edea33",
          padding: 24,
          width: "100%",
          marginBottom: 24,
          transition: "box-shadow 0.3s, background 0.3s",
        }}
      >
        <div
          className="section-title"
          style={{
            color: "#1e88e5",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 12,
          }}
        >
          Thông tin tài khoản ngân hàng
        </div>
        <button
          className="message-btn profile-btn-glass"
          style={{
            background:
              "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
            color: "#1e88e5",
            fontWeight: 600,
            borderRadius: 12,
            marginBottom: 16,
            transition: "background 0.3s",
          }}
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
          <div
            className="bank-form bank-form-glass"
            style={{ marginBottom: 16 }}
          >
            <form
              onSubmit={addBankAccount}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <input
                type="text"
                name="accountNumber"
                placeholder="Số tài khoản"
                value={newBankAccount.accountNumber}
                onChange={handleBankInputChange}
                required
                className="profile-edit-input"
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <div className="bank-select-container">
                <label
                  htmlFor="bankName"
                  className="bank-select-label"
                  style={{
                    fontWeight: 600,
                    color: "#1e88e5",
                  }}
                >
                  Chọn ngân hàng:
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={newBankAccount.bankName}
                  onChange={handleBankInputChange}
                  required
                  className="bank-select"
                  style={{
                    borderRadius: 10,
                    padding: 8,
                    border: "1px solid #b3c6ff",
                  }}
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
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <button
                className="message-btn profile-btn-glass"
                style={{
                  background:
                    "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                  color: "#1e88e5",
                  fontWeight: 600,
                  borderRadius: 12,
                  transition: "background 0.3s",
                }}
              >
                Lưu tài khoản
              </button>
            </form>
          </div>
        )}
        <ul
          className="bank-list"
          style={{ fontSize: 17, color: "#333", lineHeight: 2 }}
        >
          {bankAccounts.map((account, index) => (
            <li
              key={index}
              className="bank-list-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                borderRadius: 10,
                padding: "8px 16px",
                marginBottom: 8,
                boxShadow: "0 1px 4px #b3c6ff11",
                transition: "background 0.3s",
              }}
            >
              <span>
                {account.name} - {account.bankName} ({account.accountNumber})
              </span>
              <button
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  background:
                    "linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 10,
                  padding: "4px 16px",
                  border: "none",
                  transition: "background 0.3s",
                }}
                onClick={() => handleDeleteAccount(index)}
                className="delete_account profile-btn-glass"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="profile-logout" style={{ marginTop: 16 }}>
        <button
          className="message-btn logout profile-btn-glass"
          style={{
            background:
              "linear-gradient(90deg, #fda085 0%, #f6d365 100%)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 12,
            padding: "8px 32px",
            fontSize: 18,
            transition: "background 0.3s",
          }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
