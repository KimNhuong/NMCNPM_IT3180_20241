// src/ProductGrid.js
import React, { useState, useEffect } from "react";
import "../Manage_product/item.css";
import { useAuth } from "../introduce/useAuth";
import ProductDetail from "./Product_detail";
import DeleteProductModal from "./Form_delete";
import { useLoading } from "../introduce/Loading";
import { notify } from "../../components/Notification/notification";
const ProductGrid = ({
  selectedCategory,
  reload,
  searchTerm,
  sortByA,
  sortByB,
}) => {
  const { startLoading, stopLoading } = useLoading();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState();
  const [x, setX] = useState();
  const [fdelete, SetFdelete] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      if (loading) {
        return;
      }
      try {
        startLoading();
        const response = await fetch(
          "http://localhost:8080/api/products/show",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        stopLoading();
        let o = [];
        for (let i = 0; i < data.length; i++) {
          if (!o.includes(data[i].category)) {
            o = [...o, data[i].category];
          }
        }
        reload(o);
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchProducts();
  }, [user, x]); // Thêm user vào dependency array

  const show = async (a) => {
    startLoading();
    const response = await fetch(
      "http://localhost:8080/api/products/show/" + a,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    stopLoading();
    console.log(data);
    setProduct({ ...data });
  };
  const onDelete = async (a, b) => {
    startLoading();
    const response = await fetch("http://localhost:8080/api/products/deletes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        product_delete: a,
        detail: b,
      }),
    });
    const data = await response.json();
    stopLoading();
    if (data.message == "Product deleted successfully") {
      notify(1, `Sản phẩm "${a.name}" đã được xóa thành công!`, "Thành công");
      setX((a) => {
        if (a == "edit") return "";
        else {
          return "edit";
        }
      });
    } else {
      notify(2, `Sản phẩm "${a.name}" xóa thất bại`, "Thất bại");
    }
  };
  const onClose = () => {
    setProduct(false);
  };
  const onClose2 = () => {
    SetFdelete(false);
  };
  let filteredProducts = products.slice();
  if (selectedCategory) {
    filteredProducts = products.filter(
      (product) => product.category === selectedCategory
    );
  }
  if (searchTerm != "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  if (sortByA == "Giá bán") {
    filteredProducts.sort((a, b) => {
      return (
        Number(a.price.replace(/\./g, "")) - Number(b.price.replace(/\./g, ""))
      );
    });
  } else if (sortByA == "Giá nhập") {
    filteredProducts.sort(
      (a, b) =>
        Number(a.purchasePrice.replace(/\./g, "")) -
        Number(b.purchasePrice.replace(/\./g, ""))
    );
  } else if (sortByA == "Tên") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortByB == "Từ cao đến thấp") {
    filteredProducts.reverse();
  }
  const onUpdate = async (a, b, c) => {
    if (
      a.stock_in_shelf < 0 ||
      a.reorderLevel < 0 ||
      a.stock_in_Warehouse < 0
    ) {
      notify(2, "Các trường số phải lớn hơn hoặc bằng 0.", "Lỗi");
      return;
    }

    // Kiểm tra các trường price và purchasePrice phải là chuỗi số hợp lệ
    const isNumeric = (value) =>
      /^\d+(\.\d+)?$/.test(value.replace(/,/g, "").replace(/\./g, ""));
    if (
      !isNumeric(a.price) ||
      !isNumeric(a.purchasePrice) ||
      a.price < 0 ||
      a.purchasePrice < 0
    ) {
      notify(
        2,
        "Giá bán và giá nhập phải là chuỗi số hợp lệ và lớn hơn hoặc bằng 0.",
        "Lỗi"
      );
      return;
    }
    let body = {
      user: user,
      product_edit: a,
      detail: b,
      check: c,
    };
    startLoading();
    const response = await fetch("http://localhost:8080/api/products/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    stopLoading();
    if (data.message == "success") {
      setProduct(false);
      setX((a) => {
        if (a == "edit") return "";
        else {
          return "edit";
        }
      });
      setTimeout(() => {
        notify(
          1,
          `Sản phẩm "${a.name}" đã được cập nhật thành công!`,
          "Thành công"
        );
      }, 100);
    } else {
      notify(2, `Sản phẩm "${a.name}" cập nhật thất bại!`, "Thất bại");
    }
  };
  return (
    <>
      {product && (
        <ProductDetail
          product={product}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      )}
      {fdelete && (
        <DeleteProductModal
          product={fdelete}
          onClose2={onClose2}
          onDelete={(a, b) => onDelete(a, b)}
        />
      )}
      <div
        className="product-grid"
        style={{
          marginBottom: "200px",
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          justifyContent: "flex-start",
        }}
      >
        {filteredProducts.map((product, index) => (
          <div
            className="item"
            key={index}
            style={{
              flex: "0 1 260px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="product-card"
              style={{
                background: "#fff",
                borderRadius: 22,
                boxShadow: "0 4px 24px #b3c6ff33",
                padding: 24,
                minWidth: 220,
                maxWidth: 280,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition:
                  "box-shadow 0.3s, transform 0.2s",
                position: "relative",
                cursor: "pointer",
                gap: 12,
                border: "1.5px solid #e0e7ff",
              }}
            >
              <img
                src={
                  product.image
                    ? product.image.secure_url
                    : "https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"
                }
                alt="Product Image"
                className="product-image"
                style={{
                  width: 90,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 16,
                  boxShadow: "0 2px 12px #b3c6ff33",
                  border: "2px solid #e0e7ff",
                  marginBottom: 8,
                }}
              />
              <h3
                className="product-name"
                style={{
                  fontWeight: 700,
                  color: "#1e88e5",
                  fontSize: 18,
                  margin: 0,
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {product.name}
              </h3>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 15,
                  marginBottom: 2,
                  textAlign: "center",
                }}
              >
                {product.category}
              </div>
              <div
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 6,
                }}
              >
                {`$${product.price}`}
              </div>
              <div
                className="actions"
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  className="action-button edit-button"
                  onClick={() => show(product._id)}
                  style={{
                    background:
                      "linear-gradient(90deg, #1e88e5 0%, #43cea2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "7px 22px",
                    boxShadow: "0 2px 8px #1e88e522",
                    cursor: "pointer",
                    transition:
                      "background 0.3s, transform 0.2s",
                  }}
                >
                  Chi tiết
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => SetFdelete(product)}
                  style={{
                    background:
                      "linear-gradient(90deg, #ff5858 0%, #f857a6 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "7px 22px",
                    boxShadow: "0 2px 8px #f857a633",
                    cursor: "pointer",
                    transition:
                      "background 0.3s, transform 0.2s",
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductGrid;
