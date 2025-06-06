import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Menu, MenuItem } from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Tự động đăng ký các thành phần biểu đồ
import { useAuth } from "../../components/introduce/useAuth";
function Sales_daily() {
  const { user, loading } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [dt, Setdt] = useState({
    date: [0, 2, 5, 6, 8, 15, 17, 19],
    report: [0, 0, 2, 4, 5, 7, 11, 12],
  });
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const data = {
    labels: dt.date,
    datasets: [
      {
        data: dt.report,
        borderColor: "#fff",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
  useEffect(() => {
    // Sinh dữ liệu ngẫu nhiên cho 8 ngày gần nhất
    const today = new Date();
    const dates = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    // Sinh số liệu ngẫu nhiên cho mỗi ngày
    const reports = Array.from({ length: 8 }, () => Math.floor(Math.random() * 1000000 + 100000));
    Setdt({ date: dates, report: reports });
  }, [loading]);
  return (
    <Box
      sx={{
        backgroundColor: "#1e88e5",
        color: "#fff",
        borderRadius: 2,
        padding: 3,
        textAlign: "center",
        width: "100%", // Cho phép mở rộng toàn bộ chiều rộng của phần tử cha
        position: "relative",
        minHeight: 340,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h6">Daily Sales</Typography>
      <Typography variant="body2">{`${dt.date[0]}   ---   ${dt.date[7]}`}</Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", marginTop: 1 }}
      >{`${Math.max(...dt.report).toLocaleString("vn-Vi")} đ`}</Typography>

      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "#1976d2",
          color: "#fff",
          padding: "4px 8px",
          minWidth: "auto",
          fontSize: "0.75rem",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem onClick={handleClose}>Export as CSV</MenuItem>
        <MenuItem onClick={handleClose}>Export as PDF</MenuItem>
      </Menu>

      <Box sx={{ marginTop: 3, width: "100%", height: 180 }}>
        {" "}
        {/* Đặt width=100% cho biểu đồ */}
        <Line
          data={data}
          options={{
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            responsive: true,
            maintainAspectRatio: false,
          }}
          height={180}
        />
      </Box>
    </Box>
  );
}

export default Sales_daily;
