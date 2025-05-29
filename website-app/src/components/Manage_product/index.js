import React, { useState, useRef,useEffect } from "react";
import "../Manage_product/index.css"; // Để tạo kiểu
import ProductGrid from "./item.js";
import ProductForm from '../../components/Manage_product/ProductForm';
import History from "../../components/Manage_product/history.js"
import {useLoading} from "../introduce/Loading"
import Historys from "../export/form_show.js"
const ProductManager = () => {
  const { startLoading, stopLoading } = useLoading();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [unselectedCategory, unsetSelectedCategory] = useState('');
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  const [d, setD] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByA, setSortByA] = useState("default"); // Mặc định
  const [sortByB, setSortByB] = useState("Từ thấp lên cao"); // Mặc định
  const categoriesRef = useRef(null);
const handleScrollLeft = () => {
  if (categoriesRef.current) {
    categoriesRef.current.scrollBy({
      left: -100,
      behavior: 'smooth',
    });
  }
};

const handleScrollRight = () => {
  if (categoriesRef.current) {
    categoriesRef.current.scrollBy({
      left: 100,
      behavior: 'smooth',
    });
  }
};

  
  
  
  
  const turnonA = () => {
    setA(true);
  };
  const turnonB = () => {
    setB(true);
  }
  const turnonD =()=>{
    setD(true)
  }
  const turnoffA = () => {
    setA(false);
  };
  const turnoffB = () => {
    setB(false);
  };
  const turnoffD = () => {
    setD(false);
  };
  const reload_categorie = (a) => {
    setCategories(a);
  };
  const refresh=()=>{
 setC(false);
  }
  useEffect(() => {
    if (!c) {
      startLoading();
      setTimeout(() => {setC(true);stopLoading()}, 100); // Có thể thay đổi thời gian tùy ý
    }
  }, [c])

  return (
    <div className="product-manager">
      {a && <ProductForm turnoff={turnoffA} refresh={refresh} />}
      {b && <History turnoff={turnoffB} />}
      {d && <Historys turnoff={turnoffD} supplier={true} />}
      <div className="x">
              <div className="filter-bar">
        <button className="scroll-button" onClick={handleScrollLeft}>◀</button>
        <div className="scrollable-categories" ref={categoriesRef}>
          {categories.length>1&&categories.map((category) => (
            <button
              style={{ 
                // width: "115px",
                 marginRight: "9px" }}
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                if (unselectedCategory !== category) {
                  unsetSelectedCategory(category);
                  setSelectedCategory(category);
                } else {
                  unsetSelectedCategory('');
                  setSelectedCategory('');
                }
              }}
            >
              {category}
            </button>
          ))}
          {
            categories.length<=1&& <h1 style={{textAlign:"center"}}>đây là nơi chọn lọc sản phẩm theo categories, hãy thử add từ 2 sản phẩm có catcategpries khác nhau trở lên</h1>
          }
        </div>
        <button className="scroll-button" onClick={handleScrollRight}>▶</button>
        <button className="create-button" onClick={turnonA}>Add</button>
        
      </div>
      <div className="extended-filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={sortByA}
          onChange={(e) => setSortByA(e.target.value)}
          className="sort-select"
        >
          <option value="default">Sắp xếp theo</option>
          <option value="Giá nhập">Giá nhập</option>
          <option value="Giá bán">Giá bán</option>
          <option value="Tên">Tên</option>
          {/* Thêm các tùy chọn khác nếu cần */}
        </select>
        <select 
          value={sortByB}
          onChange={(e) => setSortByB(e.target.value)}
          className="sort-select"
        >
          <option value="Từ thấp đến cao">Từ thấp đến cao</option>
          <option value="Từ cao đến thấp">Từ cao đến thấp</option>
          {/* Thêm các tùy chọn khác nếu cần */}
        </select>
        <button className="history-button" onClick={turnonB}>Xem lịch sử</button>
        <button className="supplier-button" onClick={turnonD}>Nhà cung cấp</button>
      </div>
      </div>

      {/* Mở rộng thanh điều khiển để chứa tìm kiếm, sắp xếp và xem lịch sử */}


      {/* Hiển thị grid sản phẩm */}
      {c&&<ProductGrid  selectedCategory={selectedCategory} reload={reload_categorie} searchTerm={searchTerm} sortByA={sortByA} sortByB={sortByB}/>}
    </div>
  );
};

export default ProductManager;
