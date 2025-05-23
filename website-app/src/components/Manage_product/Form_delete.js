import React, { useState } from 'react';
import "../Manage_product/Form_delete.css"
import { notify } from '../../components/Notification/notification';
const DeleteProductModal = ({ product, onDelete, onClose2,supplier,customer }) => {
  const [reason, setReason] = useState('');

  const handleDelete = () => {
    if (reason.trim()) {
      if(product){onDelete(product, reason);}
      else{onDelete(supplier, reason);}
       // Gọi hàm xóa với lý do
      onClose2(); // Đóng form sau khi xóa
    } else {
      notify(2,'Vui lòng nhập lý do xóa!','Thất bại')
    }
  };

  return (
    <div className="delete_form-modal">
      <div className="delete_form-modal-content">
        {!supplier&&!customer?<h2>Xác nhận xóa sản phẩm</h2>:(!supplier?<h2>Xác nhận xóa khách hàng</h2>:<h2>Xác nhận xóa supplier</h2>)}
        {!supplier&&!customer?<p>Bạn có chắc chắn muốn xóa sản phẩm {product.name}?</p>:(!supplier?<p>Bạn có chắc chắn muốn xóa khách hàng {customer.name}?</p>:<p>Bạn có chắc chắn muốn xóa supplier {supplier.name}?</p>)}
        <div className="delete_form-input-group">
          <label htmlFor="reason">Lý do xóa:</label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do xóa"
          />
        </div>

        <div className="delete_form-actions">
          <button className="delete_form-btn-delete" onClick={handleDelete}>
            Xóa
          </button>
          <button className="delete_form-btn-cancel" onClick={onClose2}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
