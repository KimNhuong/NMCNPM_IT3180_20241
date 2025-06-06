import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useAuth } from "../../components/introduce/useAuth";
function UsersOnlineCard() {
  const { user, loading } = useAuth();
  const [dt, Setdt] = useState({
    labels: [0, 0, 0, 0, 0, 0, 0, 0],
    data: [0, 0, 0, 0, 0, 0, 0, 0],
  });
  const data = {
    labels: dt.labels,
    datasets: [
      {
        data: dt.data,
        borderColor: "#1e88e5",
        backgroundColor: "rgba(30, 136, 229, 0.2)",
        pointBackgroundColor: "#ff5722",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };
  useEffect(() => {
    // Sinh dữ liệu ngẫu nhiên cho 8 ngày gần nhất
    const today = new Date();
    const labels = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    // Sinh số lượng khách hàng mới ngẫu nhiên cho mỗi ngày
    const dataArr = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 20 + 1)
    );
    Setdt({ labels, data: dataArr });
  }, [loading]);
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        borderRadius: 2,
        padding: 2,
        width: "100%",
        textAlign: "left",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        {Math.max(...dt.data)}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        New customers
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: "#1e88e5",
          fontWeight: "bold",
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        +5%
      </Typography>

      <Box sx={{ marginTop: 2, height: 60 }}>
        <Line data={data} options={options} />
      </Box>
    </Box>
  );
}

export default UsersOnlineCard;
