import React,{useEffect,useState} from "react";
import { useAuth } from "../../components/introduce/useAuth";
import Sales_daily from "./sale_daily"
import Useronline from "./useronlinecard"
// src/index.js hoặc src/App.js'
import CalendarComponent from "../Calendar/index.js"
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
  const [totalrevenue,setTotalrevenue] =useState({percentChange:"0%",totalRevenueToday:"0",state:""});
  const [totalincome,setTotalincome] =useState({
    profitToday:0,
    profitYesterday:0,
    percentChange:"0%",
    message: "notchange",
});
const  [data,setData]=useState([])
const  [topproduct,setTopproduct]=useState([])
const [newcustomer,setNewcustomer] =useState({
  customerToday:0,
  customerYesterday:0,
  percentChange:"0%",
  state: "notchange",
});
const [pending,setPending]=useState({total:0,percent:"0%"})
const [act,setAct]=useState([])
  const datas = [
    { name: "Jan", "Khách hàng trung thành": 270, "khách hàng mới": 150, "Khách hàng quay lại": 542 },
    { name: "Feb", "Khách hàng trung thành": 310, "khách hàng mới": 180, "Khách hàng quay lại": 520 },
    { name: "Mar", "Khách hàng trung thành": 350, "khách hàng mới": 200, "Khách hàng quay lại": 560 },
    { name: "Apr", "Khách hàng trung thành": 330, "khách hàng mới": 220, "Khách hàng quay lại": 480 },
    { name: "May", "Khách hàng trung thành": 450, "khách hàng mới": 260, "Khách hàng quay lại": 550 },
    { name: "Jun", "Khách hàng trung thành": 400, "khách hàng mới": 290, "Khách hàng quay lại": 580 },
    { name: "Jul", "Khách hàng trung thành": 460, "khách hàng mới": 320, "Khách hàng quay lại": 620 },
    { name: "Aug", "Khách hàng trung thành": 510, "khách hàng mới": 340, "Khách hàng quay lại": 680 },
    { name: "Sep", "Khách hàng trung thành": 252, "khách hàng mới": 360, "Khách hàng quay lại": 740 },
    { name: "Oct", "Khách hàng trung thành": 680, "khách hàng mới": 390, "Khách hàng quay lại": 820 },
    { name: "Nov", "Khách hàng trung thành": 780, "khách hàng mới": 420, "Khách hàng quay lại": 890 },
    { name: "Dec", "Khách hàng trung thành": 900, "khách hàng mới": 450, "Khách hàng quay lại": 980 },
  ];

  // if (!user) {
  //   return <div>Không có người dùng nào đăng nhập.</div>;
  // }
  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      const get_revenue = async () => {
        try {
          const response = await fetch('http://localhost:5000/home/total_revenue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
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
          const response = await fetch('http://localhost:5000/home/today_income', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
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
          const response = await fetch('http://localhost:5000/home/new_customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
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
      const get_report_customer=async()=>{
        try {
          const response = await fetch('http://localhost:5000/home/generateCustomerReport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const data = await response.json();
          console.log("customer:", data);
          setData(data)
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      }
      const get_top_product=async()=>{
        try {
          const response = await fetch('http://localhost:5000/home/generate_top_product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const data = await response.json();
          console.log("products:", data);
          setTopproduct(data)
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      }
      const get_pending=async()=>{
        try {
          const response = await fetch('http://localhost:5000/home/total_pending', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("pending:", data);
          setPending(data)
        } catch (error) {
          console.error("Error fetching income:", error);
        }
      }
      const get_activity=async () => {
      try{
        const activity = await fetch('http://localhost:5000/home/recent_activity',{
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user,
            }),

        });
        const data=await activity.json();
      
        setAct(data.events);
      }catch (error) {
        console.error("Error fetching activity:", error)
      }
      }

      await Promise.all([get_revenue(), get_income(),get_customer(),get_report_customer(),get_top_product(),get_pending(),get_activity()]);
    };
  
    fetchData();
  }, [loading]); // Thêm 'user' vào dependencies nếu cần
  
  return (<>
    <div class="container">
      <div class="page-inner">
        <div class="dashboard-container">
          <div class="dashboard-title">
            <h3>Trang chủ</h3>
            <h6>Made by team 25</h6>
          </div>
          <div class="dashboard-actions">
            <a href="#">Manage</a>
            <a href="#">Add Customer</a>
          </div>
        </div>
        <div class="row row-card-no-pd">
          <div class="col-12 col-sm-6 col-md-6 col-xl-3">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6>
                      <b style={{ whiteSpace: "nowrap", 
  overflow: "hidden",
  textOverflow: "ellipsis" }}>Todays Income</b>
                    </h6>
                    <p class="text-muted">All Customs Value</p>
                  </div><h4 class="text-info fw-bold">{totalincome.profitToday}</h4>
                </div>
                <div class="progress progress-sm">
                  <div
                    class="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${totalincome.percentChange}` }}
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="text-muted">Change</p>
                  <p class="text-muted">{totalincome.percentChange}<small>{' '+totalincome.state}</small></p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-6 col-xl-3">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6>
                      <b>Total Revenue</b>
                      
                    </h6>
                    <p class="text-muted">All Customs Value</p>
                  </div><h4 class="text-success fw-bold">{totalrevenue.totalRevenueToday}</h4>
                </div>
                <div class="progress progress-sm">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${totalrevenue.percentChange}` }}
                  ></div>
                  
                </div>
                <div class="d-flex justify-content-between">
                  <p class="text-muted">Change</p>
                  <p class="text-muted">{totalrevenue.percentChange}<small>{' '+totalrevenue.state}</small></p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-6 col-xl-3">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6>
                      <b>Pending order</b>
                      
                    </h6>
                    <p class="text-muted">Fresh Order Amount</p>
                  </div><h4 class="text-danger fw-bold">{pending.total}</h4>
                </div>
                <div class="progress progress-sm">
                  <div
                    class="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: `${pending.percent}` }}
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="text-muted">Change</p>
                  <p class="text-muted">{pending.percent}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-6 col-xl-3">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6>
                      <b>New Customer</b>
                      
                    </h6>
                    <p class="text-muted">Joined New User</p>
                  </div><h4 class="text-secondary fw-bold">{newcustomer.customerToday}</h4>
                </div>
                <div class="progress progress-sm">
                  <div
                    class="progress-bar bg-secondary"
                    role="progressbar"
                    style={{ width: `${newcustomer.percentChange}` }}
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="text-muted">Change</p>
                  <p class="text-muted">{newcustomer.percentChange}<small>{' '+newcustomer.state}</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row row-card-no-pd">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <div class="card-head-row">
                  <div class="card-title">Thống kê khách hàng</div>
                  <div class="card-tools">
                    <a
                      href="#"
                      class="btn btn-label-success btn-round btn-sm me-2"
                    >
                      <span class="btn-label">
                        <i class="fa fa-pencil"></i>
                      </span>
                      Export
                    </a>
                    <a href="#" class="btn btn-label-info btn-round btn-sm">
                      <span class="btn-label">
                        <i class="fa fa-print"></i>
                      </span>
                      Print
                    </a>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container" style={{ minHeight: "375px" }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={datas}>
                      <XAxis dataKey="name" />
                      <YAxis type="number" domain={[0, "dataMax"]} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="khách hàng mới"
                        stroke="#ffa726"
                        fill="#1e88e5"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="Khách hàng trung thành"
                        stroke="#ff6b6b"
                        fill="red"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="Khách hàng quay lại"
                        stroke="#2196f3"
                        fill="#0277bd"
                        fillOpacity={0.4}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div id="myChartLegend"></div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-primary">
              <div class="card card-primary">
<Sales_daily />

              </div>
            
            </div>
            <div class="card">

              <Useronline />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <div class="card-title">Lịch làm việc</div>
              </div>
              <div class="card-body p-0">
                <CalendarComponent defaultView="month"/>
                {/* <div class="table-responsive">
                  <table class="table align-items-center">
                    <thead class="thead-light">
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
                          <i class="fas fa-arrow-up text-success me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/index.html</th>
                        <td>3,985</td>
                        <td>319</td>
                        <td>
                          <i class="fas fa-arrow-down text-warning me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/charts.html</th>
                        <td>3,513</td>
                        <td>294</td>
                        <td>
                          <i class="fas fa-arrow-down text-warning me-3"></i>
                          36,49%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/tables.html</th>
                        <td>2,050</td>
                        <td>147</td>
                        <td>
                          <i class="fas fa-arrow-up text-success me-3"></i>
                          50,87%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/profile.html</th>
                        <td>1,795</td>
                        <td>190</td>
                        <td>
                          <i class="fas fa-arrow-down text-danger me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/</th>
                        <td>4,569</td>
                        <td>340</td>
                        <td>
                          <i class="fas fa-arrow-up text-success me-3"></i>
                          46,53%
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">/kaiadmin/index.html</th>
                        <td>3,985</td>
                        <td>319</td>
                        <td>
                          <i class="fas fa-arrow-down text-warning me-3"></i>
                          46,53%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div> */}
              </div>
            </div>
          </div>
          <div class="col-md-4" style={{maxHeight:"645px",overflowY:"auto",marginBottom:"15px"}}>
            <div class="card">
              <div class="card-header">
                <div class="card-title">Top Products</div>
              </div>
              <div class="card-body pb-0">
              {topproduct.map((a,b)=>{
              if(b>=1){
                return (<><div class="separator-dashed"></div>
                  <div class="d-flex">
                    <div class="avatar">
                      <img
                        src={a.image?a.image.secure_url:"https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"}
                        alt="..."
                        class="avatar-img rounded-circle"
                      />
                    </div>
                    <div class="flex-1 pt-1 ms-2">
                      <h6 class="fw-bold mb-1">{a.name}</h6>
                      {/* <small class="text-muted">The Best Donuts</small> */}
                    </div>
                    <div class="d-flex ms-auto align-items-center">
                      <h4 class="text-info fw-bold">{a.rate}</h4>
                    </div>
                  </div></>)
              }
              return (
                <div class="d-flex ">
                  <div class="avatar">
                    <img
                      src={a.image?a.image.secure_url:"https://www.shutterstock.com/shutterstock/photos/600304136/display_1500/stock-vector-full-basket-of-food-grocery-shopping-special-offer-vector-line-icon-design-600304136.jpg"}
                      alt="..."
                      class="avatar-img rounded-circle"
                    />
                  </div>
                  <div class="flex-1 pt-1 ms-2">
                    <h6 class="fw-bold mb-1">{a.name}</h6>
                    {/* <small class="text-muted">Cascading Style Sheets</small> */}
                  </div>
                  <div class="d-flex ms-auto align-items-center">
                    <h4 class="text-info fw-bold">{a.rate}</h4>
                  </div>
                </div>
              )
              })}
                {/* <div class="d-flex ">
                  <div class="avatar">
                    <img
                      src="assets/img/logoproduct.svg"
                      alt="..."
                      class="avatar-img rounded-circle"
                    />
                  </div>
                  <div class="flex-1 pt-1 ms-2">
                    <h6 class="fw-bold mb-1">CSS</h6>
                    <small class="text-muted">Cascading Style Sheets</small>
                  </div>
                  <div class="d-flex ms-auto align-items-center">
                    <h4 class="text-info fw-bold">+$17</h4>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar">
                    <img
                      src="assets/img/logoproduct.svg"
                      alt="..."
                      class="avatar-img rounded-circle"
                    />
                  </div>
                  <div class="flex-1 pt-1 ms-2">
                    <h6 class="fw-bold mb-1">J.CO Donuts</h6>
                    <small class="text-muted">The Best Donuts</small>
                  </div>
                  <div class="d-flex ms-auto align-items-center">
                    <h4 class="text-info fw-bold">+$300</h4>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar">
                    <img
                      src="assets/img/logoproduct3.svg"
                      alt="..."
                      class="avatar-img rounded-circle"
                    />
                  </div>
                  <div class="flex-1 pt-1 ms-2">
                    <h6 class="fw-bold mb-1">Ready Pro</h6>
                    <small class="text-muted">
                      Bootstrap 5 Admin Dashboard
                    </small>
                  </div>
                  <div class="d-flex ms-auto align-items-center">
                    <h4 class="text-info fw-bold">+$350</h4>
                  </div>
                </div> */}
                <div class="separator-dashed"></div>
                <div class="pull-in">
                  <canvas id="topProductsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row" style={{marginTop:"10px"}}>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <div class="card-head-row card-tools-still-right">
                  <div class="card-title">Recent Activity</div>
                  <div class="card-tools">
                    {/* <div class="dropdown">
                      <button
                        class="btn btn-icon btn-clean"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i class="fas fa-ellipsis-h"></i>
                      </button>
                      <div
                        class="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <a class="dropdown-item" href="#">
                          Action
                        </a>
                        <a class="dropdown-item" href="#">
                          Another action
                        </a>
                        <a class="dropdown-item" href="#">
                          Something else here
                        </a>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div class="card-body">
                <ol class="activity-feed">
                  {act.map(act =>{
                    return(
                      <li class={"feed-item "+ act.type}>
                    <time class="date" datetime={act.date}>
                      {act.date}
                    </time>
                    <span class="text" dangerouslySetInnerHTML={{
              __html: act.detail,  // Hiển thị HTML (thẻ <br /> sẽ được xử lý)
            }}>
                     
                    </span>
                  </li>
                    )
                  })}
                  {/* <li class="feed-item feed-item-secondary">
                    <time class="date" datetime="9-25">
                      Sep 25
                    </time>
                    <span class="text">
                      Responded to need
                      <a href="#">"Volunteer opportunity"</a>
                    </span>
                  </li>
                  <li class="feed-item feed-item-success">
                    <time class="date" datetime="9-24">
                      Sep 24
                    </time>
                    <span class="text">
                      Added an interest
                      <a href="#">"Volunteer Activities"</a>
                    </span>
                  </li>
                  <li class="feed-item feed-item-info">
                    <time class="date" datetime="9-23">
                      Sep 23
                    </time>
                    <span class="text">
                      Joined the group
                      <a href="single-group.php">"Boardsmanship Forum"</a>
                    </span>
                  </li>
                  <li class="feed-item feed-item-warning">
                    <time class="date" datetime="9-21">
                      Sep 21
                    </time>
                    <span class="text">
                      Responded to need
                      <a href="#">"In-Kind Opportunity"</a>
                    </span>
                  </li>
                  <li class="feed-item feed-item-danger">
                    <time class="date" datetime="9-18">
                      Sep 18
                    </time>
                    <span class="text">
                      Created need
                      <a href="#">"Volunteer Opportunity"</a>
                    </span>
                  </li>
                  <li class="feed-item">
                    <time class="date" datetime="9-17">
                      Sep 17
                    </time>
                    <span class="text">
                      Attending the event
                      <a href="single-event.php">"Some New Event"</a>
                    </span>
                  </li> */}
                </ol>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <div class="card-head-row">
                  <div class="card-title">Information</div>
                  <div class="card-tools">
                    <ul
                      class="nav nav-pills nav-secondary nav-pills-no-bd nav-sm"
                      id="pills-tab"
                      role="tablist"
                    >
                      <li class="nav-item">
                        <a
                          class="nav-link"
                          id="pills-today"
                          data-bs-toggle="pill"
                          href="#pills-today"
                          role="tab"
                          aria-selected="true"
                        >
                          Today
                        </a>
                      </li>
                      <li class="nav-item">
                        <a
                          class="nav-link active"
                          id="pills-week"
                          data-bs-toggle="pill"
                          href="#pills-week"
                          role="tab"
                          aria-selected="false"
                        >
                          Week
                        </a>
                      </li>
                      <li class="nav-item">
                        <a
                          class="nav-link"
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
              <div class="card-body">
                <div class="d-flex">
                  <div class="avatar avatar-online">
                    <span class="avatar-title rounded-circle border border-white bg-info">
                      J
                    </span>
                  </div>
                  <div class="flex-1 ms-3 pt-1">
                    <h6 class="text-uppercase fw-bold mb-1">
                      Joko Subianto
                      <span class="text-warning ps-3">pending</span>
                    </h6>
                    <span class="text-muted">
                      I am facing some trouble with my viewport. When i start my
                    </span>
                  </div>
                  <div class="float-end pt-1">
                    <small class="text-muted">8:40 PM</small>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar avatar-offline">
                    <span class="avatar-title rounded-circle border border-white bg-secondary">
                      P
                    </span>
                  </div>
                  <div class="flex-1 ms-3 pt-1">
                    <h6 class="text-uppercase fw-bold mb-1">
                      Prabowo Widodo
                      <span class="text-success ps-3">open</span>
                    </h6>
                    <span class="text-muted">
                      I have some query regarding the license issue.
                    </span>
                  </div>
                  <div class="float-end pt-1">
                    <small class="text-muted">1 Day Ago</small>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar avatar-away">
                    <span class="avatar-title rounded-circle border border-white bg-danger">
                      L
                    </span>
                  </div>
                  <div class="flex-1 ms-3 pt-1">
                    <h6 class="text-uppercase fw-bold mb-1">
                      Lee Chong Wei
                      <span class="text-muted ps-3">closed</span>
                    </h6>
                    <span class="text-muted">
                      Is there any update plan for RTL version near future?
                    </span>
                  </div>
                  <div class="float-end pt-1">
                    <small class="text-muted">2 Days Ago</small>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar avatar-offline">
                    <span class="avatar-title rounded-circle border border-white bg-secondary">
                      P
                    </span>
                  </div>
                  <div class="flex-1 ms-3 pt-1">
                    <h6 class="text-uppercase fw-bold mb-1">
                      Peter Parker
                      <span class="text-success ps-3">open</span>
                    </h6>
                    <span class="text-muted">
                      I have some query regarding the license issue.
                    </span>
                  </div>
                  <div class="float-end pt-1">
                    <small class="text-muted">2 Day Ago</small>
                  </div>
                </div>
                <div class="separator-dashed"></div>
                <div class="d-flex">
                  <div class="avatar avatar-away">
                    <span class="avatar-title rounded-circle border border-white bg-danger">
                      L
                    </span>
                  </div>
                  <div class="flex-1 ms-3 pt-1">
                    <h6 class="text-uppercase fw-bold mb-1">
                      Logan Paul <span class="text-muted ps-3">closed</span>
                    </h6>
                    <span class="text-muted">
                      Is there any update plan for RTL version near future?
                    </span>
                  </div>
                  <div class="float-end pt-1">
                    <small class="text-muted">2 Days Ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">
    <div class="container-fluid d-flex justify-content-between">
      <nav class="pull-left">
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link" href="#">
              TeaM_25
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"> Help </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"> Licenses </a>
          </li>
        </ul>
      </nav>
      <div class="copyright">
        2024, made with <i class="fa fa-heart heart text-danger"></i> by team_25
      </div>
      <div>
        Distributed by
        <a target="_blank" href="https://themewagon.com/">team_25</a>.
      </div>
    </div>
  </footer></>
  );
}

export default Home;
