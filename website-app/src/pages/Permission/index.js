import React, { useEffect, useState } from 'react';
import './Permission.css';
import { useAuth } from '../../components/introduce/useAuth';
import { useLoading } from "../../components/introduce/Loading";
import { getRoles } from '../../services/Roles/rolesService';
import { notify } from '../../components/Notification/notification'

const Permissions = () => {
  const rights = ["add_product", "edit_product", "delete_product", "create_order", "edit_order"
    ,"create-customer", "edit-customer","create-suplier", "edit-suplier","delete_suplier","*role"];
  const [rolesData, setRolesData] = useState([]);
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      if (user) {
        startLoading();
        const roles = await getRoles(user.id_owner);
        setRolesData(roles);
        console.log(document.cookie);
        console.log("OK");
        
        const initialPermissions = {};
        roles.forEach((role) => {
          initialPermissions[role.role] = {
            permissions: role.permissions || [],
          };
        });
        setPermissions(initialPermissions);
        stopLoading();
      }
    };
    fetchRoles();
  }, [user]);

  const handleCheckboxChange = (role, permission, checked) => {
    setPermissions((prev) => {
      // Lấy các quyền hiện tại của vai trò này từ `prev`
      const rolePermissions = prev[role]?.permissions || [];
  
      // Tạo một bản sao của các quyền đã có, sau đó cập nhật
      const updatedPermissions = checked
        ? [...rolePermissions, permission] // Thêm quyền nếu checkbox được chọn
        : rolePermissions.filter((perm) => perm !== permission); // Xóa quyền nếu checkbox bỏ chọn
  
      // Trả về đối tượng cập nhật với quyền của vai trò đã được thay đổi
      return {
        ...prev,
        [role]: { permissions: updatedPermissions },
      };
    });
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rolesWithPermissions = rolesData.map((role) => ({
      _id: role._id,
      permissions: permissions[role.role]?.permissions || [],
    }));

    await updatePermissions(rolesWithPermissions);
  };

  const updatePermissions = async (rolesWithPermissions) => {
    try {
      const response = await fetch("http://localhost:5000/roles/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rolesWithPermissions,
          user:user}),
      });
      console.log(rolesWithPermissions);
      
      const data = await response.json();
      console.log(data);
      if(data.message=="Không có quyền truy cập"||data.message=="Vai trò không tồn tại"||data.message=="Lỗi máy chủ nội bộ"){
        notify(2,"Lỗi khi cập nhật phân quyền","Lỗi rồi ba");
      }else{
        notify(1,"Cập nhật quyền thành công","Thành công");
      }
    } catch (error) {
      notify(2,"Lỗi khi cập nhật phân quyền","Lỗi rồi ba");
      console.error("Lỗi khi cập nhật phân quyền:", error);
    }
  };

  return (
    <form className="permissions-container" onSubmit={handleSubmit}>
      <h2>Permission</h2>
      <h3>Thiết lập phân quyền</h3>

      <div className="uy-tabs">
        <table className = "permissions-table">
          <thead>
            <tr>
              <th style={{width:"150px"}}>Tính năng</th>
              {rolesData.map((role, index) => (
                <th key={index}>{role.role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rights.map((perm) => (
              <tr key={perm}>
                <td>{perm.charAt(0).toUpperCase() + perm.slice(1)}</td>
                {rolesData.map((role, index) => (
                  <td key={index}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleCheckboxChange(role.role, perm, e.target.checked)}
                      checked={permissions[role.role]?.permissions.includes(perm) || false}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{marginBottom:"5px", color:"red"}}>Lưu ý khi trao quyền "*role" vì nó có thể thao tác được với quyền(bao gồm thêm, chỉnh sửa, xóa) </p>
      <button type="submit" className="update-btn">
        Cập nhật
      </button>
    </form>
  );
};

export default Permissions;
