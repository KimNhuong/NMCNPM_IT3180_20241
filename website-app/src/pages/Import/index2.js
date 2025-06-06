// import ImageUpload from "../../components/Manage_product/image"
// import Change_password from"../../components/introduce/resetpassword.js"
import OrderManagement from "../../components/test/index";
import ModalHistory from "./ModalHistory";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import Modal from "./../../components/ComponentExport/Modal";
import "./import.css";
import ModalDetail from "./ModalDetail";
import { useAuth } from "../../components/introduce/useAuth";
import { notify } from "../../components/Notification/notification";
import { useLoading } from "../../components/introduce/Loading";
function Import2() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suppOrPro, setSuppOrPro] = useState(false);
  const [idProductAdded, setIdProductAdded] = useState([]);
  const [idOrder, setIdOrder] = useState(null);
  const [dataTop, setDataTop] = useState([]);
  const { user, loading } = useAuth();
  const apiGetOrder = useRef();
  const apiGetHistory = useRef();
  const [view, setView] = useState(true);
  const [loadLog, setLoadLog] = useState(false);
  const [loadOrder, setLoadOrder] = useState(false);
  // const id_owner = user.id_owner;
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openModalHistory = () => setOpenHistory(true);
  const closeModalHistory = () => setOpenHistory(false);
  const closeModalDetail = () => setOpenDetail(false);
  const openModalDetail = () => setOpenDetail(true);
  const { startLoading, stopLoading } = useLoading();
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (loading) return;
        const res = await fetch(
          `http://localhost:8080/api/import/orderHistory/lastProductTop100?ownerId=${user.id_owner}`
        );
        const dataRes = await res.json();
        setDataTop(dataRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [loading]);
  const handleSearch = (event) => {
    const term = event.target.value;
    let keyword = term.trim();
    setSearchTerm(term);
    if (keyword.startsWith("@All")) {
      keyword = keyword.substr(4).trim();
      setSuppOrPro(false);
      if (keyword.length > 0) {
        debouncedFetchSuggestions(
          keyword,
          `http://localhost:8080/api/import/supplier/search`
        );
      } else {
        setSuggestions([]); // Nếu không có từ khóa, xóa kết quả gợi ý
      }
    } else {
      setSuppOrPro(true);
      if (keyword.length > 0) {
        const topData = dataTop
          .filter((item) =>
            item.name.toLowerCase().includes(keyword.toLowerCase())
          )
          .slice(0, 5);
        if (topData.length) {
          setResults(topData.map((item) => item.name));
          setSuggestions(topData);
        } else {
          console.log("jellooo");
          debouncedFetchSuggestions(
            keyword,
            `http://localhost:8080/api/import/products/exhibitProN`
          );
        }
      } else {
        setSuggestions([]); // Nếu không có từ khóa, xóa kết quả gợi ý
      }
    }
  };
  // database
  const fetchProductSuggestions = async (keyword, hrefLink) => {
    try {
      const response = await axios.get(hrefLink, {
        params: {
          query: keyword,
          ownerId: user.id_owner,
        },
      });
      const sugg = response.data.map((s) => s.name);
      setResults(sugg);
      setDataTop((prev) => {
        const newData = [...prev, ...response.data];
        return newData;
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };
  const debouncedFetchSuggestions = useCallback(
    debounce(
      (keyword, hrefLink) => fetchProductSuggestions(keyword, hrefLink),
      500
    ),
    [user] // Chỉ tạo ra một lần
  );

  const handleAddToOrder = async () => {
    const idPro = suggestions.filter((sugg) => sugg.name === searchTerm);
    setSuggestions([]);
    const suppliersId = idPro ? idPro[0] : null;
    try {
      // Gửi request GET với query string chứa productId
      if (suppliersId) {
        let response;
        if (!suppOrPro) {
          response = await fetch(
            `http://localhost:8080/api/import/products/exhibitPro?productId=${suppliersId._id}&ownerId=${user.id_owner}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Kiểm tra nếu request thành công
        if (!suppOrPro && response.ok) {
          const data = await response.json(); // Dữ liệu trả về từ server (có thể là chi tiết sản phẩm)
          setIdProductAdded(data);
          // Xử lý dữ liệu từ server (Hiển thị thông tin đơn hàng, ví dụ...)
          setSearchTerm("");
          setResults([]);
        } else if (suppOrPro) {
          setIdProductAdded(idPro);
          setSearchTerm("");
          setResults([]);
        } else {
          console.error("Error adding to order");
        }
      }
    } catch (error) {
      console.error("Request failed", error);
    }
  };
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 700);
  };
  const handleSelectLiResult = (result) => {
    setSearchTerm(result); // Cập nhật giá trị input với kết quả đã chọn
    setShowDropdown(false); // Ẩn dropdown sau khi chọn
  };
  //  console.log(apiGetHistory.current)
  return (
    <>
      <OrderManagement
        onCreateOrder={openModal}
        onHistory={openModalHistory}
        openModalDetail={openModalDetail}
        setIdOrder={setIdOrder}
        refOrder={apiGetOrder}
        setView={setView}
        loadOrder={loadOrder}
        setLoadLog={setLoadLog}
        setLoadOrder={setLoadOrder}
      />

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="Modal-title" style={{ color: '#1e88e5', fontWeight: 700, fontSize: 24, textAlign: 'center', marginBottom: 8 }}>Create your order opening</div>
        <div className="divide" style={{ margin: '12px 0', background: '#e0e7ff', height: 2, borderRadius: 2 }}></div>
        <div className="header-order" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
          <div className="search-container" style={{ flex: 1 }}>
            <div style={{ display: 'flex', flex: 1, marginLeft: 10, alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', paddingTop: '10px', color: '#1e88e5', fontWeight: 600 }}>Tìm kiếm: </span>
              <div className="search-result-container" style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  style={{ flex: 1, borderRadius: 16, border: '1.5px solid #b3c6ff', padding: '10px 18px', fontSize: 16, background: '#fff', boxShadow: '0 1px 4px #b3c6ff22', outline: 'none', transition: 'border 0.3s' }}
                  className="order-mgmt-search"
                  placeholder="Search by code or product name"
                  value={searchTerm}
                  onChange={handleSearch}
                  onBlur={handleBlur}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && results.length > 0 && (
                  <ul className="dropdown" style={{ position: 'absolute', top: 44, left: 0, right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px #b3c6ff33', zIndex: 10, padding: 0, margin: 0, listStyle: 'none', border: '1.5px solid #e0e7ff' }}>
                    {results.map((result, index) => (
                      <li
                        key={index}
                        className="search-item"
                        onClick={() => handleSelectLiResult(result)}
                        style={{ padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s', borderBottom: '1px solid #f0f4fa' }}
                      >
                        <div className="search-container-item" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                          {result}
                          {suppOrPro && suggestions.length > 0 && (
                            <div
                              className="search-container-img"
                              style={{
                                width: 32, height: 32, borderRadius: 8, backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: 8,
                                backgroundImage: `url(${suggestions[index].image ? suggestions[index].image.secure_url : 'https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg'})`,
                              }}
                            ></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <button className="btn-add-order" onClick={handleAddToOrder} style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 600, fontSize: 16, padding: '10px 36px', boxShadow: '0 2px 8px #1e88e522', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Add to order</button>
        </div>
        <div className="body-modal" style={{ background: '#f5f7fa', borderRadius: 18, padding: 18, boxShadow: '0 2px 8px #b3c6ff22', marginTop: 8 }}>
          <ContentOrder
            dataHis={idProductAdded}
            setIdProductAdded={setIdProductAdded}
            apiFetchOrderHistory={apiGetOrder}
            apiGetHistory={apiGetHistory}
          />
        </div>
      </Modal>
      <ModalHistory
        isOpen={openHistory}
        onClose={closeModalHistory}
        openModalDetail={openModalDetail}
        setIdOrder={setIdOrder}
        apiGetHistory={apiGetHistory}
        setView={setView}
        loadLog={loadLog}
      />
      <ModalDetail
        isOpen={openDetail}
        onClose={closeModalDetail}
        idOrder={idOrder}
        view={view}
        setLoadLog={setLoadLog}
        setLoadOrder={setLoadOrder}
      >
        {" "}
      </ModalDetail>
    </>
    // <div style={{ textAlign: 'center', margin: '20px' }}>
    //   <input
    //     type="file"
    //     accept="image/*"
    //     onChange={handleImageChange}
    //   />
    //   {selectedImage && (
    //     <div style={{ marginTop: '20px' }}>
    //       <h3>Ảnh đã tải lên:</h3>
    //       <img
    //         src={selectedImage}
    //         alt="Uploaded"
    //         style={{ maxWidth: '300px', maxHeight: '300px' }}
    //       />
    //     </div>
    //   )}
    // </div>
  );
}

// ContentOrder: làm đẹp bảng sản phẩm trong đơn hàng
const ContentOrder = ({
  dataHis,
  setIdProductAdded,
  apiFetchOrderHistory,
  apiGetHistory,
}) => {
  const initItem = (item) => {
    return {
      name: item.name,
      description: item.description,
      supplier: item.supplierDetails.name,
      price: parseFloat(item.purchasePrice.replace(/\./g, "")) || 0,
      imageUrl: item.image.secure_url,
      supplierId: item.supplierDetails._id,
      quantity: 1,
      status: "pending",
      email: true,
      isChecked: true,
      emailName: item.supplierDetails.email,
      productId: item._id,
    };
  };
  const { startLoading, stopLoading } = useLoading();
  const { user, loading } = useAuth();
  const [listProductWereAdded, setListProductWereAdded] = useState([]);
  const listItem = dataHis.map((item) => initItem(item));
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [isDropdownOpenSupplier, setIsDropdownOpenSupplier] = useState(
    Array(listProductWereAdded.length).fill(false)
  );
  const [selectedSupplier, setSelectedSupplier] = useState(
    Array(listProductWereAdded.length).fill("")
  );
  const [quantities, setQuantities] = useState(
    listProductWereAdded.map((product) => product.quantity) // Khởi tạo mảng quantity từ listProductWereAdded
  );

  const [isOpen, setIsOpen] = useState(
    new Array(listProductWereAdded.length).fill(false)
  ); // Khởi tạo mảng isOpen
  const [myTax, setMyTax] = useState(10);
  useEffect(() => {
    if (dataHis && dataHis.length > 0) {
      const newItems = dataHis.map(initItem);
      console.log(dataHis, listProductWereAdded);
      if (
        !listProductWereAdded.some((item) =>
          dataHis.some((it) => it._id === item.productId)
        )
      ) {
        setListProductWereAdded((prevList) => [...newItems, ...prevList]);
      }
      setIdProductAdded([]);
    }
  }, [dataHis]);
  const handleSupplierChange = (supplier, index) => {
    setListProductWereAdded((prev) => {
      const newList = [...prev];
      newList[index].supplier = supplier; // Cập nhật nhà cung cấp cho ô hiện tại
      return newList;
    });

    // Cập nhật selectedSupplier
    setSelectedSupplier((prev) => {
      const newSelectedSuppliers = [...prev];
      newSelectedSuppliers[index] = supplier; // Lưu giá trị đã chọn
      return newSelectedSuppliers;
    });

    // Ẩn dropdown sau khi chọn
    setIsDropdownOpenSupplier((prev) => {
      const newDropdownState = [...prev];
      newDropdownState[index] = false; // Ẩn dropdown cho ô hiện tại
      return newDropdownState;
    });
  };
  const handleSupplierClick = (index) => {
    setIsDropdownOpenSupplier((prev) => {
      const newDropdownState = [...prev];
      newDropdownState[index] = !newDropdownState[index]; // Đảo ngược trạng thái cho ô hiện tại
      return newDropdownState;
    });
  };
  const amountBill = () => {
    let sum = 0;
    listProductWereAdded.forEach((product) => {
      sum += product.price.replace(/\./g, "") * product.quantity;
    });
    return sum;
  };
  const toggleDropdown = (index) => {
    setIsOpen((prev) => {
      const newOpen = [...prev];
      newOpen[index] = !newOpen[index]; // Đảo ngược giá trị tại index
      return newOpen;
    });
  };

  const dropdownRef = useRef(null);
  const dropdownRefSupplier = useRef(null);
  const handleStatusClick = (index) => {
    setDropdownOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleStatusChange = (index, newStatus) => {
    setListProductWereAdded((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index].status = newStatus;
      setDropdownOpenIndex(null);
      return updatedProducts;
    });
    // Ẩn dropdown sau khi chọn
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpenIndex(null); // Ẩn dropdown khi click ra ngoài
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const increase = (index) => {
    setListProductWereAdded((prev) => {
      const newQuantities = [...prev];
      newQuantities[index].quantity += 1; // Tăng giá trị
      return newQuantities;
    });
  };

  const decrease = (index) => {
    setListProductWereAdded((prev) => {
      const newQuantities = [...prev];
      if (newQuantities[index].quantity > 0) {
        newQuantities[index].quantity -= 1; // Tăng giá trị
      }
      return newQuantities;
    });
  };

  const handleRemove = (index) => {
    setListProductWereAdded((prev) => {
      const newList = [...prev];
      newList.splice(index, 1); // Xoá phần tử
      return newList;
    });

    setIsOpen((prev) => {
      const newOpen = [...prev];
      newOpen.splice(index, 1); // Cập nhật mảng isOpen
      return newOpen;
    });
  };
  const handleInputQuantitty = (index, e) => {
    const newQuantity = e.target.value; // Lấy giá trị mới từ input
    setListProductWereAdded((prev) => {
      // Tạo bản sao của danh sách hiện tại
      const updatedList = [...prev];
      // Cập nhật số lượng sản phẩm tại chỉ số index
      updatedList[index] = {
        ...updatedList[index],
        quantity: newQuantity,
      };
      return updatedList; // Trả về danh sách đã cập nhật
    });
  };
  const handleCheckboxChange = (index) => {
    setListProductWereAdded((prev) => {
      const updatedProducts = [...listProductWereAdded];
      updatedProducts[index].email = !updatedProducts[index].email;
      return updatedProducts;
    });
  };

  const handleSubmit = async () => {
    const groupBySupplier = listProductWereAdded.reduce(
      (acc, item) => {
        // Kiểm tra xem đã có supplier này trong nhóm chưa
        if (!acc.dataForm[item.supplier]) {
          acc.dataForm[item.supplier] = [];
        }
        acc.dataForm[item.supplier].push(item); // Thêm item vào đúng nhóm
        return acc;
      },
      { user: {}, dataForm: {} }
    );
    groupBySupplier.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      ownerId: user.id_owner,
      id_owner: user.id_owner,
      role: user.role,
    };
    groupBySupplier.tax = myTax;
    const url = "http://localhost:8080/api/import/orderHistory/save";

    try {
      const response = await fetch(url, {
        method: "POST", // Phương thức POST
        headers: {
          "Content-Type": "application/json", // Xác định kiểu dữ liệu là JSON
        },
        body: JSON.stringify(groupBySupplier), // Chuyển đổi dữ liệu thành chuỗi JSON
      });

      if (response.ok) {
        // Nếu thành công, xử lý kết quả
        notify(1, "you've completed importing goods", "Successfully!");
        const responseData = await response.json();
        console.log("Dữ liệu đã được gửi thành công", responseData);
        await apiFetchOrderHistory.current.fetchOrder("");
        await apiGetHistory.current.debouncedFetchSuggestions(
          " ",
          "http://localhost:8080/api/import/loggingOrder/listOrder",
          1,
          10
        );

        setIdProductAdded([]);
        setListProductWereAdded([]);
      } else {
        notify(2, "you don't have the role to do this", "Fail!");
        // Nếu có lỗi từ server
        console.error("Lỗi khi gửi dữ liệu:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  return (
    <>
      <div className="list-product-title" style={{ color: '#1e88e5', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>List product</div>
      <div className="list-product-content" style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px #b3c6ff22', padding: 18, marginBottom: 12 }}>
        <div className="list-product-detail" style={{ overflowX: 'auto', borderRadius: 12 }}>
          <table style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px #b3c6ff22', transition: 'box-shadow 0.3s', marginBottom: 0 }}>
            <thead style={{ background: '#f0f4fa' }}>
              <tr style={{ color: '#1e88e5', fontWeight: 700, fontSize: 15 }}>
                <th>STT</th>
                <th>Ảnh Mô Tả</th>
                <th>Sản Phẩm</th>
                <th>Nhà Cung Cấp</th>
                <th>Số Lượng</th>
                <th>Thành Tiền</th>
                <th>Status</th>
                <th>Delete</th>
                <th>Mail</th>
              </tr>
            </thead>
            <tbody>
              {listProductWereAdded.map((product, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f8fafc' : '#fff', transition: 'background 0.2s' }}>
                  <td style={{ fontWeight: 600, color: '#1e88e5' }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div className="body-container-img-description" style={{ width: 48, height: 48, borderRadius: 12, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${product.imageUrl})`, border: '2px solid #e0e7ff', boxShadow: '0 2px 8px #b3c6ff22' }}></div>
                    </div>
                  </td>
                  <td>
                    <div className="modal-body-product-name" style={{ fontWeight: 700, color: '#1e88e5', fontSize: 16 }}>{product.name}</div>
                    <div className="modal-body-product-description" style={{ color: '#64748b', fontSize: 14 }}>{product.description}</div>
                  </td>
                  <td>
                    <div style={{ position: 'relative', color: '#1e293b', fontWeight: 600 }}>{product.supplier}</div>
                  </td>
                  <td>
                    <div className="Quantity" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button className="Quantity-button" onClick={() => decrease(index)} style={{ background: '#e0e7ff', color: '#1e88e5', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, width: 32, height: 32, cursor: 'pointer', transition: 'background 0.2s' }}>-</button>
                      <input value={listProductWereAdded[index].quantity} className="Quantity-input" onChange={(e) => handleInputQuantitty(index, e)} style={{ borderRadius: 8, border: '1.5px solid #b3c6ff', width: 48, textAlign: 'center', fontSize: 16, padding: '4px 0', outline: 'none', transition: 'border 0.3s' }} />
                      <button className="Quantity-button" onClick={() => increase(index)} style={{ background: '#e0e7ff', color: '#1e88e5', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, width: 32, height: 32, cursor: 'pointer', transition: 'background 0.2s' }}>+</button>
                    </div>
                  </td>
                  <td style={{ color: '#1e293b', fontWeight: 600 }}>
                    {(product.price * listProductWereAdded[index].quantity).toLocaleString()} VND
                  </td>
                  <td>
                    <div className={`product-status ${listProductWereAdded[index].status}`} onClick={() => handleStatusClick(index)} style={{ position: 'relative', cursor: 'pointer', padding: '4px 14px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: product.status === 'pending' ? 'linear-gradient(90deg, #ffd200 0%, #f7971e 100%)' : product.status === 'deliveried' ? 'linear-gradient(90deg, #43cea2 0%, #1e88e5 100%)' : 'linear-gradient(90deg, #ff5858 0%, #f857a6 100%)', color: '#fff', boxShadow: '0 2px 8px #b3c6ff22', transition: 'background 0.3s' }}>
                      {product.status}
                      {dropdownOpenIndex === index && (
                        <div ref={dropdownRef} className="dropdown" style={{ position: 'absolute', top: 36, left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #b3c6ff33', zIndex: 10, minWidth: 120, overflow: 'hidden', border: '1.5px solid #e0e7ff' }}>
                          <div className="dropdown-item" style={{ padding: '10px 18px', cursor: 'pointer', color: '#1e88e5', fontWeight: 600, transition: 'background 0.2s' }} onClick={() => handleStatusChange(index, 'pending')}>Pending</div>
                          <div className="dropdown-item" style={{ padding: '10px 18px', cursor: 'pointer', color: '#43cea2', fontWeight: 600, transition: 'background 0.2s' }} onClick={() => handleStatusChange(index, 'deliveried')}>Delivered</div>
                          <div className="dropdown-item" style={{ padding: '10px 18px', cursor: 'pointer', color: '#ff5858', fontWeight: 600, transition: 'background 0.2s' }} onClick={() => handleStatusChange(index, 'canceled')}>Canceled</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <input type="checkbox" checked={product.isChecked} onChange={() => handleRemove(index)} id={`checkbox-${index}`} style={{ width: 20, height: 20, accentColor: '#ff5858', cursor: 'pointer' }} />
                  </td>
                  <td>
                    <input type="checkbox" checked={listProductWereAdded[index].email} onChange={() => handleCheckboxChange(index)} style={{ width: 20, height: 20, accentColor: '#1e88e5', cursor: 'pointer' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="order-tax" style={{ marginTop: 18, fontWeight: 600, color: '#1e88e5', fontSize: 16 }}>
          TAX :
          <input
            type="text"
            style={{ borderRadius: '8px', maxWidth: '60px', border: '1.5px solid #b3c6ff', fontSize: '16px', color: '#333', textAlign: 'right', lineHeight: '24px', paddingRight: '8px', marginLeft: 8, marginRight: 4 }}
            value={myTax}
            name="tax"
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                setMyTax(e.target.value);
              }
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 300 }}> %</span>
        </div>
        <div className="order-tax" style={{ marginTop: 8, fontWeight: 600, color: '#1e88e5', fontSize: 16 }}>
          Tổng tiền:
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginLeft: 8 }}>
            {((amountBill() * (myTax + 100)) / 100).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            VND
          </span>
        </div>
        <div className="complete-order" style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <button onClick={() => handleSubmit()} style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 18, padding: '10px 36px', boxShadow: '0 2px 8px #1e88e522', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Complete</button>
        </div>
      </div>
    </>
  );
};

export default Import2;
