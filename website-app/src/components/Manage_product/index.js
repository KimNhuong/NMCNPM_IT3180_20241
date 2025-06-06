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
        <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f5f7fa', borderRadius: 18, boxShadow: '0 2px 8px #b3c6ff22', padding: '12px 18px', marginBottom: 18, transition: 'box-shadow 0.3s' }}>
          <button className="scroll-button" onClick={handleScrollLeft} style={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 1px 4px #b3c6ff22', fontSize: 20, width: 36, height: 36, cursor: 'pointer', transition: 'background 0.2s' }}>◀</button>
          <div className="scrollable-categories" ref={categoriesRef} style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}>
            {categories.length > 1 && categories.map((category) => (
              <button
                style={{
                  marginRight: 0,
                  background: selectedCategory === category ? 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)' : '#fff',
                  color: selectedCategory === category ? '#fff' : '#1e88e5',
                  border: selectedCategory === category ? 'none' : '1.5px solid #b3c6ff',
                  borderRadius: 16,
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '8px 22px',
                  boxShadow: selectedCategory === category ? '0 2px 8px #1e88e522' : '0 1px 4px #b3c6ff22',
                  cursor: 'pointer',
                  transition: 'background 0.3s, color 0.3s, border 0.3s',
                }}
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
            {categories.length <= 1 && <h1 style={{ textAlign: 'center', color: '#64748b', fontSize: 18, fontWeight: 500 }}>Đây là nơi chọn lọc sản phẩm theo categories, hãy thử add từ 2 sản phẩm có categories khác nhau trở lên</h1>}
          </div>
          <button className="scroll-button" onClick={handleScrollRight} style={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 1px 4px #b3c6ff22', fontSize: 20, width: 36, height: 36, cursor: 'pointer', transition: 'background 0.2s' }}>▶</button>
          <button className="create-button" onClick={turnonA} style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)', color: '#fff', border: 'none', borderRadius: 18, fontWeight: 600, fontSize: 16, padding: '8px 28px', boxShadow: '0 2px 8px #1e88e522', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Add</button>
        </div>
        <div className="extended-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f5f7fa', borderRadius: 18, boxShadow: '0 2px 8px #b3c6ff22', padding: '12px 18px', marginBottom: 18, transition: 'box-shadow 0.3s' }}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ borderRadius: 16, border: '1.5px solid #b3c6ff', padding: '8px 18px', fontSize: 16, minWidth: 220, background: '#fff', boxShadow: '0 1px 4px #b3c6ff22', outline: 'none', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.border = '1.5px solid #1e88e5'}
            onBlur={e => e.target.style.border = '1.5px solid #b3c6ff'}
          />
          <select
            value={sortByA}
            onChange={(e) => setSortByA(e.target.value)}
            className="sort-select"
            style={{ borderRadius: 16, border: '1.5px solid #b3c6ff', padding: '8px 18px', fontSize: 16, background: '#fff', boxShadow: '0 1px 4px #b3c6ff22', outline: 'none', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.border = '1.5px solid #1e88e5'}
            onBlur={e => e.target.style.border = '1.5px solid #b3c6ff'}
          >
            <option value="default">Sắp xếp theo</option>
            <option value="Giá nhập">Giá nhập</option>
            <option value="Giá bán">Giá bán</option>
            <option value="Tên">Tên</option>
          </select>
          <select
            value={sortByB}
            onChange={(e) => setSortByB(e.target.value)}
            className="sort-select"
            style={{ borderRadius: 16, border: '1.5px solid #b3c6ff', padding: '8px 18px', fontSize: 16, background: '#fff', boxShadow: '0 1px 4px #b3c6ff22', outline: 'none', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.border = '1.5px solid #1e88e5'}
            onBlur={e => e.target.style.border = '1.5px solid #b3c6ff'}
          >
            <option value="Từ thấp đến cao">Từ thấp đến cao</option>
            <option value="Từ cao đến thấp">Từ cao đến thấp</option>
          </select>
          <button className="history-button" onClick={turnonB} style={{ background: 'linear-gradient(90deg, #b3c6ff 0%, #e0e7ff 100%)', color: '#1e293b', border: 'none', borderRadius: 18, fontWeight: 600, fontSize: 16, padding: '8px 24px', boxShadow: '0 2px 8px #b3c6ff22', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Xem lịch sử</button>
          <button className="supplier-button" onClick={turnonD} style={{ background: 'linear-gradient(90deg, #43cea2 0%, #1e88e5 100%)', color: '#fff', border: 'none', borderRadius: 18, fontWeight: 600, fontSize: 16, padding: '8px 24px', boxShadow: '0 2px 8px #1e88e522', cursor: 'pointer', transition: 'background 0.3s, transform 0.2s' }}>Nhà cung cấp</button>
        </div>
      </div>

      {/* Mở rộng thanh điều khiển để chứa tìm kiếm, sắp xếp và xem lịch sử */}


      {/* Hiển thị grid sản phẩm */}
      {c&&<ProductGrid  selectedCategory={selectedCategory} reload={reload_categorie} searchTerm={searchTerm} sortByA={sortByA} sortByB={sortByB}/>}
    </div>
  );
};

export default ProductManager;
