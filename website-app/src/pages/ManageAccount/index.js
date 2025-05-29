import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ManageAccount.css";
import { getRoles } from "../../services/Roles/rolesService";
import { useAuth } from "../../components/introduce/useAuth";
import { useLoading } from "../../components/introduce/Loading";
import { notify } from "../../components/Notification/notification";
import { useNavigate } from "react-router-dom";

// Icons
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaCode,
  FaRefreshCw,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";

// ✅ Di chuyển defaultRoles ra ngoài component để tránh infinite loop
const DEFAULT_ROLES = [
  { _id: "1", role: "Admin", description: "Quản trị viên hệ thống" },
  { _id: "2", role: "Manager", description: "Quản lý cửa hàng" },
  { _id: "3", role: "Staff", description: "Nhân viên bán hàng" },
  { _id: "4", role: "Cashier", description: "Thu ngân" },
  { _id: "5", role: "Warehouse", description: "Nhân viên kho" },
  { _id: "6", role: "Accountant", description: "Kế toán" },
  { _id: "7", role: "Customer Service", description: "Chăm sóc khách hàng" },
  { _id: "8", role: "Security", description: "Bảo vệ" },
];

const ManageAccount = () => {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [rolesData, setRolesData] = useState(DEFAULT_ROLES); // ✅ Khởi tạo với roles mặc định
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterRole, setFilterRole] = useState("");
  const [showMenuIndex, setShowMenuIndex] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false); // ✅ Thêm showModal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    code: "",
  });
  const [confirmOtp, setConfirmOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Hooks
  const { startLoading, stopLoading } = useLoading();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // API Functions
  const getAccounts = useCallback(
    async (userId) => {
      if (!userId) {
        console.error("Lỗi: userId không hợp lệ!");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/user/list?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("API Response data:", data); // ✅ Debug logging

        // ✅ Xử lý cấu trúc response {message: 'Success', data: Array}
        if (data && data.data && Array.isArray(data.data)) {
          setAccounts(data.data); // Lấy array từ data.data
          console.log("✅ Loaded accounts from API:", data.data);
        } else if (Array.isArray(data)) {
          setAccounts(data); // Fallback nếu response là array trực tiếp
          console.log("✅ Loaded accounts (direct array):", data);
        } else {
          console.warn("API response structure not recognized:", data);
          setAccounts([]); // Set empty array nếu response không đúng format
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        notify(2, "Không thể tải danh sách tài khoản", "Lỗi");
      }
    },
    [] // ✅ Loại bỏ startLoading, stopLoading khỏi dependencies
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.id_owner) {
        try {
          // ✅ Fetch accounts
          await getAccounts(user.id_owner);

          // ✅ Fetch roles với fallback
          try {
            const rolesResponse = await getRoles(user.id_owner);
            console.log("Roles API Response:", rolesResponse);

            // Xử lý roles response
            if (Array.isArray(rolesResponse) && rolesResponse.length > 0) {
              setRolesData(rolesResponse);
              console.log("✅ Loaded roles from API:", rolesResponse);
            } else {
              console.log("⚠️ Using default roles");
              setRolesData(DEFAULT_ROLES);
            }
          } catch (roleError) {
            console.warn(
              "⚠️ Failed to fetch roles, using defaults:",
              roleError
            );
            setRolesData(DEFAULT_ROLES);
          }

          // ✅ Set form data
          setFormData((prevData) => ({ ...prevData, id_owner: user._id }));
        } catch (error) {
          console.error("❌ Error in fetchData:", error);
        }
      }
    };

    fetchData();
  }, [user?.id_owner, user?._id, getAccounts]); // ✅ Loại bỏ DEFAULT_ROLES vì nó là constant

  const toggleMenu = (index) => {
    setShowMenuIndex(showMenuIndex === index ? null : index);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // ✅ Đảm bảo accounts luôn là array trước khi filter
  const filteredAccounts = Array.isArray(accounts)
    ? accounts.filter((account) => {
        const name = account.name ? account.name.toLowerCase() : "";
        const email = account.email ? account.email.toLowerCase() : "";
        const role = account.role ? account.role.toLowerCase() : "";

        return (
          name.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          role.includes(searchTerm.toLowerCase())
        );
      })
    : []; // Trả về array rỗng nếu accounts không phải array

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const dataUser = {
        id: user ? user.id : "",
        role: formData.role,
        id_owner: user ? user.id_owner : "",
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmOtp: confirmOtp,
        code: formData.code,
      };

      startLoading();
      const response = await fetch("http://localhost:8080/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ dataUser, user }),
      });

      const data = await response.json();
      stopLoading();
      console.log("Create account response:", data);

      if (confirmOtp) {
        // ✅ Đang ở bước xác nhận OTP
        if (data.message === "Staff is created successfully") {
          notify(1, "Tạo thành công tài khoản", "Thành công");
          setFormData({
            id: user ? user.id : "",
            name: "",
            email: "",
            password: "",
            role: "",
            id_owner: user ? user.id_owner : "",
            code: "",
          });
          setConfirmOtp(false);
          setShowModal(false);
          await getAccounts(user.id_owner);
        } else {
          notify(2, data.message || "Lỗi xác nhận mã", "Thất bại");
        }
      } else {
        // ✅ Đang ở bước gửi OTP
        if (data.message === "Confirmation code sent") {
          setConfirmOtp(true);
          notify(1, "Mã xác nhận đã được gửi", "Thành công");
        } else if (data.message === "User_new updated successfully!") {
          notify(1, "Tạo thành công tài khoản", "Thành công");
          setFormData({
            id: user ? user.id : "",
            name: "",
            email: "",
            password: "",
            role: "",
            id_owner: user ? user.id_owner : "",
            code: "",
          });
          setConfirmOtp(false);
          setShowModal(false);
          await getAccounts(user.id_owner);
        } else {
          notify(2, data.message || "Không thể gửi mã xác nhận", "Thất bại");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      notify(2, "Có lỗi xảy ra", "Lỗi");
      stopLoading();
    }
  };

  const handleOpenEditModal = (account) => {
    setFormData({
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      password: account.password, // Assuming password can be left blank for editing
    });
    setShowEditModal(true);
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const response = await fetch(
        `http://localhost:8080/api/user/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();
      console.log("Success:", data);
      stopLoading();
      notify(1, "Chỉnh sửa tài khoản thành công", "Thành công");
      await getAccounts(user.id_owner);
      setShowModal(false);
    } catch (error) {
      notify(2, "Chỉnh sửa tài khoản thất bại", "Thất bại");
      console.error("Error edit:", error);
    }
  };

  // ✅ Handle delete account sử dụng DELETE /api/user/{id}
  const handleDeleteAccount = async (accountId) => {
    try {
      startLoading();
      const response = await fetch(
        `http://localhost:8080/api/user/${accountId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      if (user._id === accountId) {
        logout();
        navigate("/");
      } else {
        await getAccounts(user.id_owner);
        notify(1, "Xóa thành công tài khoản", "Thành công");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      notify(2, "Xóa tài khoản thất bại", "Thất bại");
    } finally {
      stopLoading();
      setShowDeleteModal(false);
      setSelectedAccount(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Function để gửi lại mã OTP
  const sentAgain = async () => {
    try {
      const dataUser = {
        id: user?.id || "",
        role: formData.role,
        id_owner: user?.id_owner || "",
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmOtp: confirmOtp,
        code: formData.code,
      };

      startLoading();
      const response = await fetch("http://localhost:8080/api/user/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ dataUser, user }),
      });

      const data = await response.json();
      stopLoading();

      if (data.message === "Confirmation code sent") {
        setFormData((prev) => ({ ...prev, code: "" }));
        notify(1, "Mã xác nhận đã được gửi lại", "Thành công");
      } else {
        notify(2, data.message || "Không thể gửi lại mã xác nhận", "Thất bại");
      }
    } catch (error) {
      console.error("Error:", error);
      notify(2, "Có lỗi xảy ra khi gửi lại mã", "Lỗi");
      stopLoading();
    }
  };

  return (
    <div className="account-table">
      <div className="account-header">
        <h2>Quản lí tài khoản</h2>
        <div className="uy-search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="create-order-btn"
            onClick={() => setShowModal(true)}
          >
            Tạo tài khoản nhân viên
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form
              className="create-account-form"
              onSubmit={handleCreateAccount}
            >
              <h3 style={{ marginBottom: "10px" }}>Tạo tài khoản nhân viên</h3>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Chọn vai trò
                </option>
                {rolesData.map((role) => (
                  <option key={role._id} value={role.role}>
                    {role.role} - {role.description}
                  </option>
                ))}
              </select>

              {confirmOtp && (
                <>
                  <input
                    type="text"
                    name="code"
                    placeholder="Điền mã xác nhận "
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                  />
                  {/* <p className="uy-sentagain" onClick={sentAgain}>
                    Gửi lại mã
                  </p> */}
                </>
              )}

              <button type="submit">
                {confirmOtp ? "Xác minh và tạo tài khoản" : "Gửi mã OTP"}
              </button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowEditModal(false)}
            >
              ✖
            </button>
            <form className="create-account-form" onSubmit={handleEditAccount}>
              {" "}
              {/* Changed class name here */}
              <h3>Edit Staff Account</h3>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  🎯 Chọn vai trò
                </option>
                {rolesData.map((role) => (
                  <option key={role._id} value={role.role}>
                    {role.role} - {role.description}
                  </option>
                ))}
              </select>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Họ Tên</th>
            <th>Phân Quyền</th>
            <th>Email</th>
            <th>Trạng Thái</th>
            <th>Lương</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account) => (
            <tr key={account._id}>
              <td>{account.name}</td>
              <td>{account.role}</td>
              <td>{account.email}</td>
              <td>
                <span
                  className={`status ${
                    account.status ? account.status.toLowerCase() : "active"
                  }`}
                >
                  {account.status || "Acctive"}
                </span>
              </td>
              <td>{account.salary || "N/A"}</td>
              <td>
                <div className="uy-action">
                  <button
                    onClick={() => toggleMenu(account._id)}
                    className="menu-btn"
                  >
                    ⋮
                  </button>
                  {showMenuIndex === account._id && (
                    <div className="uy-dropdown-menu" ref={dropdownRef}>
                      <ul>
                        <li onClick={() => handleOpenEditModal(account)}>
                          Chỉnh sửa
                        </li>
                        <li onClick={() => handleDeleteAccount(account._id)}>
                          Xóa
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginBottom: "5px", color: "red" }}>
        Lưu ý nếu sửa quyền của Admin sang một quyền khác mà không bao gồm
        ("*role") bạn sẽ không thể phân quyền nữa
      </p>
      <button
        className="deleteAccountBtn"
        onClick={() => handleDeleteAccount(user._id)}
      >
        Xóa Tài Khoản
      </button>
    </div>
  );
};

export default ManageAccount;
