import React, { useState, useCallback, useEffect,useImperativeHandle, forwardRef  } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./ModalHistory.css";
import Modal from "./../../components/ComponentExport/Modal";
import  { useAuth }  from '../../components/introduce/useAuth'

const ModalHistory = forwardRef(({ isOpen, onClose,openModalDetail,setIdOrder,apiGetHistory,setView,loadLog }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [listOrder, setListOrder] = useState({ logs: [], totalCount: 0 });
  const [page, setPage] = useState(1);
  const { user,loading } = useAuth();
  
  const fetchProductSuggestions = async (keyword, hrefLink, page, limit) => {
    try {
      const response = await axios.get(hrefLink, {
        params: { search: keyword, page: page, limit: limit,ownerId:user.id_owner },
      });
      const sugg = response.data;
  
      setListOrder((prev) => {
        if (page > 1) {
          // Nếu page > 1, tức là đang nhấn "Load More", nối thêm dữ liệu mới
          return {
            ...prev,
            logs: [...prev.logs, ...sugg.logs],
            totalCount: sugg.totalCount,
          };
        } else {
          // Nếu page = 1 (tìm kiếm mới), thay thế toàn bộ dữ liệu
          return sugg;
        }
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };
  
  const debouncedFetchSuggestions = useCallback(
    debounce((keyword, hrefLink, page, limit) => {
      fetchProductSuggestions(keyword, hrefLink, page, limit);
    }, 500),
    [user,loadLog]
  );
  useImperativeHandle(apiGetHistory,()=>({
    debouncedFetchSuggestions
  }))
const handleSearchChange = (e) => {
  const term = e.target.value;
  setSearchTerm(term);        // Cập nhật từ khoá tìm kiếm
  setListOrder({ logs: [], totalCount: 0 }); // Xoá dữ liệu cũ
  setPage(1);                 // Reset lại trang về 1
};

  const handleRowClick = (order) => {
 
    setSelectedRow(order);
    setView(false)
    openModalDetail();
    onClose()
    setIdOrder(order.orderId)
    console.log("Đã chọn hàng:", order);
  };

  useEffect(() => {
    if(loading)return
    debouncedFetchSuggestions(searchTerm.trim(), "http://localhost:5000/import/loggingOrder/listOrder", page, 10);
  }, [searchTerm, page,loading,loadLog,user]);  
  
  const handlePage = () => {
    // Tăng page khi nhấn "Load More" để tải thêm dữ liệu
    setPage((prevPage) => prevPage + 1);
  };
  

  const transfer = (date) => {
    const date2 = new Date(date);
    return date2.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="Modal-title">Order history</div>
      <div className="divide"></div>
      <div className="header-order">
        <div className="search-container">
          <div className="supplier2">
            <div style={{ alignItems: "flex-start", padding: "12px" }}>
              Code order or Date :
            </div>
            <div>
              <input
                type="text"
                className="order-mgmt-search"
                placeholder="Search for..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div style={{ padding: "4px 10px", fontSize: 12, color: "#888", fontStyle: "italic" }}>
                Total results: {listOrder.totalCount}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container_modal">
        <div style={{ display: "flex", padding: "10px 0", fontWeight: 600, fontSize: 24, justifyContent: "center" }}>
          Danh sách đơn hàng
        </div>
        <table className="order-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>UserName</th>
              <th>Order Code</th>
              <th>Tên Sản Phẩm</th>
              <th>CreatedAt</th>
              <th>Last Update</th>
              <th>Status</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {listOrder.logs.map((order, index) => (
              <tr key={order._id} onClick={() => handleRowClick(order)}>
                <td>{index + 1}</td>
                <td>{order.userName}</td>
                <td>{order.orderDetailId}</td>
                <td>{order.productName}</td>
                <td>{transfer(order.createdAt)}</td>
                <td>{transfer(order.updatedAt)}</td>
                <td>
                  <div
                    style={{
                      padding: "8px 6px",
                      color: "white",
                      borderRadius: "10px",
                      textAlign: "center",
                      background:
                        order.status === "update" ? "#efc346" :
                        order.status === "delete" ? "red" : "#5da452",
                    }}
                  >
                    {order.status}
                  </div>
                </td>
                <td>{order.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {listOrder.totalCount - 10 * page > 0 && (
        <div style={{ padding: "4px 10px", fontSize: 12, color: "#888", fontStyle: "italic", textAlign: "center" }}>
          <span className="loadMore" onClick={handlePage}>
            Load more({listOrder.totalCount - 10 * page >= 10 ? 10 : listOrder.totalCount - 10 * page})
          </span>
        </div>
      )}
    </Modal>
  );
});

export default ModalHistory;