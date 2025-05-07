import { notify } from '../../components/Notification/notification';

export const getRoles = async (userId) => {
  try {
    const response = await fetch(`http://localhost:5000/roles/show?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  } finally {

  }
};

export const createRole = async (newRoleData,user) => {
  try {
    const response = await fetch("http://localhost:5000/roles/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({newRoleData, user}),
    });
    const data = await response.json();
    if(data.message === "Không có quyền truy cập" || data.message === "Vai trò không tồn tại" || data === "Role không được cung cấp" || data.message === "Vai trò đã tồn tại"){
      notify(2,data.message,"Thất bại");
    }else{
      notify(1,"Tạo thành công quyền mới","Thành công");
    }
  } catch (error) {
    notify(2,"Tạo quyền mới thất bại","Thất bại");
    console.error("Error creating role:", error);
    throw error;
  }
};

export const deleteRole = async (roleId, user) => {
  try {
    const response = await fetch(`http://localhost:5000/roles/delete/${roleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        role_id: roleId,
      }),
    });
    const data = await response.json();
    console.log(data);
    if(data.message == "Không có quyền truy cập" || data.message === "Vai trò không tồn tại" || data === "Role không được cung cấp"){
      notify(2,data.message,"Thất bại");
    }else{
      notify(1,"Xóa quyền thành công","Thành công");
    }
    return data;
  } catch (error) {
    notify(2,"Xóa quyền thất bại","Thất bại");
    console.error("Error deleting role:", error);
    throw error;
  }
};
