import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/introduce/useAuth";
import Sales_daily from "./sale_daily";
import Useronline from "./useronlinecard";
// src/index.js hoặc src/App.js'
import CalendarComponent from "../Calendar/index.js";
// import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./x1.css";
function Home() {
  const { user, loading } = useAuth();
  const [totalrevenue, setTotalrevenue] = useState({
    percentChange: "0%",
    totalRevenueToday: "0",
    state: "",
  });
  const [totalincome, setTotalincome] = useState({
    profitToday: 0,
    profitYesterday: 0,
    percentChange: "0%",
    message: "notchange",
  });
  const [data, setData] = useState([]);
  const [topproduct, setTopproduct] = useState([]);
  const [newcustomer, setNewcustomer] = useState({
    customerToday: 0,
    customerYesterday: 0,
    percentChange: "0%",
    state: "notchange",
  });
  const [pending, setPending] = useState({ total: 0, percent: "0%" });
  const [act, setAct] = useState([]);
  const datas = [
    {
      name: "Jan",
      "Khách hàng trung thành": 270,
      "khách hàng mới": 150,
      "Khách hàng quay lại": 542,
    },
    {
      name: "Feb",
      "Khách hàng trung thành": 310,
      "khách hàng mới": 180,
      "Khách hàng quay lại": 520,
    },
    {
      name: "Mar",
      "Khách hàng trung thành": 350,
      "khách hàng mới": 200,
      "Khách hàng quay lại": 560,
    },
    {
      name: "Apr",
      "Khách hàng trung thành": 330,
      "khách hàng mới": 220,
      "Khách hàng quay lại": 480,
    },
    {
      name: "May",
      "Khách hàng trung thành": 450,
      "khách hàng mới": 260,
      "Khách hàng quay lại": 550,
    },
    {
      name: "Jun",
      "Khách hàng trung thành": 400,
      "khách hàng mới": 290,
      "Khách hàng quay lại": 580,
    },
    {
      name: "Jul",
      "Khách hàng trung thành": 460,
      "khách hàng mới": 320,
      "Khách hàng quay lại": 620,
    },
    {
      name: "Aug",
      "Khách hàng trung thành": 510,
      "khách hàng mới": 340,
      "Khách hàng quay lại": 680,
    },
    {
      name: "Sep",
      "Khách hàng trung thành": 252,
      "khách hàng mới": 360,
      "Khách hàng quay lại": 740,
    },
    {
      name: "Oct",
      "Khách hàng trung thành": 680,
      "khách hàng mới": 390,
      "Khách hàng quay lại": 820,
    },
    {
      name: "Nov",
      "Khách hàng trung thành": 780,
      "khách hàng mới": 420,
      "Khách hàng quay lại": 890,
    },
    {
      name: "Dec",
      "Khách hàng trung thành": 900,
      "khách hàng mới": 450,
      "Khách hàng quay lại": 980,
    },
  ];

  // if (!user) {
  //   return <div>Không có người dùng nào đăng nhập.</div>;
  // }
  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      const get_revenue = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/api/home/total_revenue",
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
          console.log("Revenue:", data);
          setTotalrevenue(data);
        } catch (error) {
          console.error("Error fetching revenue:", error);
        }
      };

      const get_income = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/api/home/today_income",
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
          console.log("Income:", data);
          setTotalincome(data);
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      };
      const get_customer = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/api/home/new_customer",
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
          console.log("customer:", data);
          setNewcustomer(data);
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      };
      // const get_report_customer = async () => {
      //   try {
      //     const response = await fetch(
      //       "http://localhost:8080/api/home/generateCustomerReport",
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify({
      //           user: user,
      //         }),
      //       }
      //     );

      //     if (!response.ok) {
      //       throw new Error("Network response was not ok");
      //     }

      //     const data = await response.json();
      //     console.log("customer:", data);
      //     setData(data);
      //   } catch (error) {
      //     console.error("Error fetching income:", error);
      //   }
      // };
      // const get_top_product = async () => {
      //   try {
      //     const response = await fetch(
      //       "http://localhost:8080/api/home/generate_top_product",
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify({
      //           user: user,
      //         }),
      //       }
      //     );

      //     if (!response.ok) {
      //       throw new Error("Network response was not ok");
      //     }

      //     const data = await response.json();
      //     console.log("products:", data);
      //     setTopproduct(data);
      //   } catch (error) {
      //     console.error("Error fetching income:", error);
      //   }
      // };
      const get_pending = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/api/home/total_pending",
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
          console.log("pending:", data);
          setPending(data);
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      };
      const get_activity = async () => {
        try {
          const activity = await fetch(
            "http://localhost:8080/api/home/recent_activity",
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
          const data = await activity.json();

          setAct(data.events);
        } catch (error) {
          console.error("Error fetching activity:", error);
        }
      };

      await Promise.all([
        get_revenue(),
        get_income(),
        get_customer(),
        // get_report_customer(),
        // get_top_product(),
        get_pending(),
        get_activity(),
      ]);
    };

    fetchData();
  }, [loading]); // Thêm 'user' vào dependencies nếu cần

  // Sinh dữ liệu khách hàng mới đồng bộ với UsersOnlineCard
  useEffect(() => {
    // 8 ngày gần nhất
    const today = new Date();
    const labels = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    // Số lượng khách hàng mới mỗi ngày (số nhỏ, thực tế)
    const dataArr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 6 + 2));
    // Số hôm nay là phần tử cuối cùng
    setNewcustomer({
      customerToday: dataArr[7],
      customerYesterday: dataArr[6],
      percentChange: ((dataArr[7] - dataArr[6]) / (dataArr[6] || 1) * 100).toFixed(1) + "%",
      state: dataArr[7] > dataArr[6] ? "up" : dataArr[7] < dataArr[6] ? "down" : "nochange",
      dataArr, // Lưu lại để truyền cho UsersOnlineCard nếu muốn
    });
  }, [loading]);

  return (
    <>
      <div className="container" style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #fffde4 100%)", minHeight: "100vh", padding: "32px 0" }}>
        <div className="page-inner">
          <div className="dashboard-container" style={{ marginBottom: 32 }}>
            <div className="dashboard-title" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h3 style={{ color: "#1e88e5", fontWeight: 700, letterSpacing: 1, textShadow: "0 2px 8px #b3c6ff" }}>Trang chủ</h3>
              <h6 style={{ color: "#ff6b6b", fontWeight: 600, marginLeft: 12, letterSpacing: 1 }}>NMCNPM - IT3180 - NHOM X</h6>
            </div>
            <div className="dashboard-actions" style={{ display: "flex", gap: 12 }}>
              {/* ...actions if needed... */}
            </div>
          </div>
          {/* Dashboard Summary Cards - Neutral, Consistent Color, Progress Bar */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32, marginTop: 8, flexWrap: "wrap" }}>
            {/* Total Revenue Card */}
            <div style={{ flex: 1, minWidth: 220, background: "#f5f7fa", borderRadius: 18, boxShadow: "0 4px 24px #b3c6ff33", color: "#1e293b", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", transition: "box-shadow 0.3s, transform 0.2s", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <i className="fas fa-coins" style={{ fontSize: 28, marginRight: 14, color: "#1e88e5" }}></i>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{totalrevenue.totalRevenueToday || 0}</span>
                <span style={{ fontWeight: 600, fontSize: 15, marginLeft: 12, color: totalrevenue.state === "up" ? "#16a34a" : totalrevenue.state === "down" ? "#dc2626" : "#64748b" }}>
                  {totalrevenue.percentChange}
                  <i className={totalrevenue.state === "up" ? "fas fa-arrow-up" : totalrevenue.state === "down" ? "fas fa-arrow-down" : "fas fa-minus"} style={{ marginLeft: 6 }}></i>
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Tổng doanh thu</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Hôm nay</div>
              {/* Progress bar */}
              <div style={{ height: 7, background: "#e0e7ef", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(Number(totalrevenue.percentChange.replace('%','')) || 0, 100)}%`, height: "100%", background: "#1e88e5", transition: "width 0.6s" }}></div>
              </div>
            </div>
            {/* Income Card */}
            <div style={{ flex: 1, minWidth: 220, background: "#f5f7fa", borderRadius: 18, boxShadow: "0 4px 24px #b3c6ff33", color: "#1e293b", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", transition: "box-shadow 0.3s, transform 0.2s", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <i className="fas fa-wallet" style={{ fontSize: 28, marginRight: 14, color: "#1e88e5" }}></i>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{totalincome.profitToday || 0}</span>
                <span style={{ fontWeight: 600, fontSize: 15, marginLeft: 12, color: totalincome.message === "up" ? "#16a34a" : totalincome.message === "down" ? "#dc2626" : "#64748b" }}>
                  {totalincome.percentChange}
                  <i className={totalincome.message === "up" ? "fas fa-arrow-up" : totalincome.message === "down" ? "fas fa-arrow-down" : "fas fa-minus"} style={{ marginLeft: 6 }}></i>
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Thu nhập</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Hôm nay</div>
              <div style={{ height: 7, background: "#e0e7ef", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(Number(totalincome.percentChange.replace('%','')) || 0, 100)}%`, height: "100%", background: "#1e88e5", transition: "width 0.6s" }}></div>
              </div>
            </div>
            {/* New Customer Card */}
            <div style={{ flex: 1, minWidth: 220, background: "#f5f7fa", borderRadius: 18, boxShadow: "0 4px 24px #b3c6ff33", color: "#1e293b", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", transition: "box-shadow 0.3s, transform 0.2s", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <i className="fas fa-user-plus" style={{ fontSize: 28, marginRight: 14, color: "#1e88e5" }}></i>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{newcustomer.customerToday || 0}</span>
                <span style={{ fontWeight: 600, fontSize: 15, marginLeft: 12, color: newcustomer.state === "up" ? "#16a34a" : newcustomer.state === "down" ? "#dc2626" : "#64748b" }}>
                  {newcustomer.percentChange}
                  <i className={newcustomer.state === "up" ? "fas fa-arrow-up" : newcustomer.state === "down" ? "fas fa-arrow-down" : "fas fa-minus"} style={{ marginLeft: 6 }}></i>
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Khách hàng mới</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Hôm nay</div>
              <div style={{ height: 7, background: "#e0e7ef", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(Number(newcustomer.percentChange.replace('%','')) || 0, 100)}%`, height: "100%", background: "#1e88e5", transition: "width 0.6s" }}></div>
              </div>
            </div>
            {/* Pending Card */}
            <div style={{ flex: 1, minWidth: 220, background: "#f5f7fa", borderRadius: 18, boxShadow: "0 4px 24px #b3c6ff33", color: "#1e293b", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", transition: "box-shadow 0.3s, transform 0.2s", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <i className="fas fa-hourglass-half" style={{ fontSize: 28, marginRight: 14, color: "#1e88e5" }}></i>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{pending.total || 0}</span>
                <span style={{ fontWeight: 600, fontSize: 15, marginLeft: 12, color: "#64748b" }}>
                  {pending.percent}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Đang chờ xử lý</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Tổng số</div>
              <div style={{ height: 7, background: "#e0e7ef", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(Number(pending.percent.replace('%','')) || 0, 100)}%`, height: "100%", background: "#1e88e5", transition: "width 0.6s" }}></div>
              </div>
            </div>
          </div>
          {/* Flexbox layout for charts */}
          <div style={{ display: "flex", gap: 32, width: "100%", alignItems: "flex-start", marginBottom: 32 }}>
            {/* Left: Customer Statistics Chart */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card" style={{ borderRadius: 18, boxShadow: "0 4px 24px #b3c6ff33", transition: "box-shadow 0.3s" }}>
                <div className="card-header" style={{ background: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
                  <div className="card-head-row">
                    <div className="card-title" style={{ color: "#1e88e5", fontWeight: 700 }}>Thống kê khách hàng</div>
                  </div>
                </div>
                <div className="card-body" style={{ background: "#f8fafc", borderBottomLeftRadius: 18, borderBottomRightRadius: 18, transition: "background 0.3s" }}>
                  <div className="chart-container" style={{ minHeight: "400px", height: "400px", width: "100%", transition: "height 0.3s" }}>
                    <ResponsiveContainer width="100%" height={360}>
                      <AreaChart data={datas} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "#1e88e5", fontWeight: 600 }} />
                        <YAxis type="number" domain={[0, "dataMax"]} tick={{ fill: "#1e88e5", fontWeight: 600 }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#b3c6ff" />
                        <Tooltip contentStyle={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #b3c6ff33" }} />
                        <Legend />
                        <Area type="monotone" dataKey="khách hàng mới" stroke="#ffa726" fill="#1e88e5" fillOpacity={0.8} isAnimationActive={true} animationDuration={1200} />
                        <Area type="monotone" dataKey="Khách hàng trung thành" stroke="#ff6b6b" fill="red" fillOpacity={0.6} isAnimationActive={true} animationDuration={1200} />
                        <Area type="monotone" dataKey="Khách hàng quay lại" stroke="#2196f3" fill="#0277bd" fillOpacity={0.4} isAnimationActive={true} animationDuration={1200} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div id="myChartLegend"></div>
                </div>
              </div>
            </div>
            {/* Right: Daily Sales and New Customers Charts */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>
              <div className="card card-primary" style={{ borderRadius: 18, boxShadow: "0 4px 24px #a1c4fd33", background: "#1e88e5" }}>
                <div className="card card-primary" style={{ background: "#1e88e5", borderRadius: 18 }}>
                  {/* Remove Export button in Sales_daily */}
                  <Sales_daily hideExport={true} />
                </div>
              </div>
              <div className="card" style={{ borderRadius: 18, boxShadow: "0 4px 24px #a8edea33" }}>
                <Useronline />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Lịch làm việc</div>
                </div>
                <div className="card-body p-0">
                  <CalendarComponent defaultView="month" />
                  {/* <div className="table-responsive">
                  <table className="table align-items-center">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Page name</th>
                        <th scope="col">Visitors</th>
                        <th scope="col">Unique users</th>
                        <th scope="col">Bounce rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">/kaiadmin/</th>
                        <td>4,569</td>
                        <td>340</td>
                        <td>
                          <i className="fas fa-arrow-up text-success me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/index.html</th>
                        <td>3,985</td>
                        <td>319</td>
                        <td>
                          <i className="fas fa-arrow-down text-warning me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/charts.html</th>
                        <td>3,513</td>
                        <td>294</td>
                        <td>
                          <i className="fas fa-arrow-down text-warning me-3"></i>
                          36,49%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/tables.html</th>
                        <td>2,050</td>
                        <td>147</td>
                        <td>
                          <i className="fas fa-arrow-up text-success me-3"></i>
                          50,87%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/profile.html</th>
                        <td>1,795</td>
                        <td>190</td>
                        <td>
                          <i className="fas fa-arrow-down text-danger me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/</th>
                        <td>4,569</td>
                        <td>340</td>
                        <td>
                          <i className="fas fa-arrow-up text-success me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/index.html</th>
                        <td>3,985</td>
                        <td>319</td>
                        <td>
                          <i className="fas fa-arrow-down text-warning me-3"></i>
                          46,53%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div> */}
                </div>
              </div>
            </div>
          </div>  
          <div className="row" style={{ marginTop: "10px" }}>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <div className="card-head-row card-tools-still-right">
                    <div className="card-title">Recent Activity</div>
                    <div className="card-tools">
                      {/* <div className="dropdown">
                      <button
                        className="btn btn-icon btn-clean"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <div
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                      </div>
                    </div> */}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <ol className="activity-feed">
                    {act.map((act) => {
                      return (
                        <li key={act.id || act.date || Math.random()} className={"feed-item " + act.type}>
                          <time className="date" dateTime={act.date}>
                            {act.date}
                          </time>
                          <span
                            className="text"
                            dangerouslySetInnerHTML={{
                              __html: act.detail, // Hiển thị HTML (thẻ <br /> sẽ được xử lý)
                            }}
                          ></span>
                        </li>
                      );
                    })}
                    {/* <li className="feed-item feed-item-secondary">
                    <time className="date" datetime="9-25">
                      Sep 25
                    </time>
                    <span className="text">
                      Responded to need
                      <a href="#">"Volunteer opportunity"</a>
                    </span>
                  </li>
                  <li className="feed-item feed-item-success">
                    <time className="date" datetime="9-24">
                      Sep 24
                    </time>
                    <span className="text">
                      Added an interest
                      <a href="#">"Volunteer Activities"</a>
                    </span>
                  </li>
                  <li className="feed-item feed-item-info">
                    <time className="date" datetime="9-23">
                      Sep 23
                    </time>
                    <span className="text">
                      Joined the group
                      <a href="single-group.php">"Boardsmanship Forum"</a>
                    </span>
                  </li>
                  <li className="feed-item feed-item-warning">
                    <time className="date" datetime="9-21">
                      Sep 21
                    </time>
                    <span className="text">
                      Responded to need
                      <a href="#">"In-Kind Opportunity"</a>
                    </span>
                  </li>
                  <li className="feed-item feed-item-danger">
                    <time className="date" datetime="9-18">
                      Sep 18
                    </time>
                    <span className="text">
                      Created need
                      <a href="#">"Volunteer Opportunity"</a>
                    </span>
                  </li>
                  <li className="feed-item">
                    <time className="date" datetime="9-17">
                      Sep 17
                    </time>
                    <span className="text">
                      Attending the event
                      <a href="single-event.php">"Some New Event"</a>
                    </span>
                  </li> */}
                  </ol>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <div className="card-head-row">
                    <div className="card-title">Information</div>
                    <div className="card-tools">
                      <ul
                        className="nav nav-pills nav-secondary nav-pills-no-bd nav-sm"
                        id="pills-tab"
                        role="tablist"
                      >
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            id="pills-today"
                            data-bs-toggle="pill"
                            href="#pills-today"
                            role="tab"
                            aria-selected="true"
                          >
                            Today
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link active"
                            id="pills-week"
                            data-bs-toggle="pill"
                            href="#pills-week"
                            role="tab"
                            aria-selected="false"
                          >
                            Week
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            id="pills-month"
                            data-bs-toggle="pill"
                            href="#pills-month"
                            role="tab"
                            aria-selected="false"
                          >
                            Month
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex">
                    <div className="avatar avatar-online">
                      <span className="avatar-title rounded-circle border border-white bg-info">
                        J
                      </span>
                    </div>
                    <div className="flex-1 ms-3 pt-1">
                      <h6 className="text-uppercase fw-bold mb-1">
                        Joko Subianto
                        <span className="text-warning ps-3">pending</span>
                      </h6>
                      <span className="text-muted">
                        I am facing some trouble with my viewport. When i start
                        my
                      </span>
                    </div>
                    <div className="float-end pt-1">
                      <small className="text-muted">8:40 PM</small>
                    </div>
                  </div>
                  <div className="separator-dashed"></div>
                  <div className="d-flex">
                    <div className="avatar avatar-offline">
                      <span className="avatar-title rounded-circle border border-white bg-secondary">
                        P
                      </span>
                    </div>
                    <div className="flex-1 ms-3 pt-1">
                      <h6 className="text-uppercase fw-bold mb-1">
                        Prabowo Widodo
                        <span className="text-success ps-3">open</span>
                      </h6>
                      <span className="text-muted">
                        I have some query regarding the license issue.
                      </span>
                    </div>
                    <div className="float-end pt-1">
                      <small className="text-muted">1 Day Ago</small>
                    </div>
                  </div>
                  <div className="separator-dashed"></div>
                  <div className="d-flex">
                    <div className="avatar avatar-away">
                      <span className="avatar-title rounded-circle border border-white bg-danger">
                        L
                      </span>
                    </div>
                    <div className="flex-1 ms-3 pt-1">
                      <h6 className="text-uppercase fw-bold mb-1">
                        Lee Chong Wei
                        <span className="text-muted ps-3">closed</span>
                      </h6>
                      <span className="text-muted">
                        Is there any update plan for RTL version near future?
                      </span>
                    </div>
                    <div className="float-end pt-1">
                      <small className="text-muted">2 Days Ago</small>
                    </div>
                  </div>
                  <div className="separator-dashed"></div>
                  <div className="d-flex">
                    <div className="avatar avatar-offline">
                      <span className="avatar-title rounded-circle border border-white bg-secondary">
                        P
                      </span>
                    </div>
                    <div className="flex-1 ms-3 pt-1">
                      <h6 className="text-uppercase fw-bold mb-1">
                        Peter Parker
                        <span className="text-success ps-3">open</span>
                      </h6>
                      <span className="text-muted">
                        I have some query regarding the license issue.
                      </span>
                    </div>
                    <div className="float-end pt-1">
                      <small className="text-muted">2 Day Ago</small>
                    </div>
                  </div>
                  <div className="separator-dashed"></div>
                  <div className="d-flex">
                    <div className="avatar avatar-away">
                      <span className="avatar-title rounded-circle border border-white bg-danger">
                        L
                      </span>
                    </div>
                    <div className="flex-1 ms-3 pt-1">
                      <h6 className="text-uppercase fw-bold mb-1">
                        Logan Paul{" "}
                        <span className="text-muted ps-3">closed</span>
                      </h6>
                      <span className="text-muted">
                        Is there any update plan for RTL version near future?
                      </span>
                    </div>
                    <div className="float-end pt-1">
                      <small className="text-muted">2 Days Ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid d-flex justify-content-between">
          <nav className="pull-left">
            <ul className="nav">
              <li className="nav-item">
                <a className="nav-link" href="#">
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  {" "}
                  Help{" "}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  {" "}
                  Licenses{" "}
                </a>
              </li>
            </ul>
          </nav>
          <div className="copyright">
            2024-2 <i className="fa fa-heart heart text-danger"></i>
          </div>
          <div>
            Distributed by
            <a target="_blank" href="https://themewagon.com/">
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
