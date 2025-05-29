// 1. Load sidebar từ file HTML
fetch("../components/sidebar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("sidebar-container").innerHTML = data;

    // Cập nhật lại các đường dẫn tương đối
    document.querySelectorAll("#sidebar-container a, #sidebar-container img").forEach((el) => {
      const src = el.getAttribute("src") || el.getAttribute("href");
      if (src && !src.startsWith("http") && !src.startsWith("../")) {
        if (el.tagName === "IMG") el.src = "../" + src;
        else el.href = "../" + src;
      }
    });

    // Cố định sidebar
    const sidebarElement = document.querySelector("#sidebar-container .sidebar");
    if (sidebarElement) {
      sidebarElement.style.position = "fixed";
      sidebarElement.style.left = "0";
      sidebarElement.style.top = "0";
      sidebarElement.style.height = "100vh";
    }

    // Đánh dấu menu đang active
    document.getElementById("menu-statistics")?.classList.add("active");
  });

// 2. Biểu đồ doanh thu
const ctx = document.getElementById("salesChart").getContext("2d");
const salesChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: "#86A788",
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 40,
    }],
  },
  options: {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.toLocaleString()} VND`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: {
          callback: (val) => `${(val / 1_000_000).toFixed(1)}M`,
          font: { size: 12 },
        },
        grid: { color: "#eee" },
        beginAtZero: true,
      },
    },
  },
});

// 3. Lọc dữ liệu theo thời gian
function filterByDateRange(data, type) {
  const now = new Date();
  if (type === "tuần") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return data.filter((o) => new Date(o.orderDate) >= weekAgo);
  }
  if (type === "tháng") {
    const m = now.getMonth();
    const y = now.getFullYear();
    return data.filter((o) => {
      const d = new Date(o.orderDate);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }
  if (type === "năm") {
    const y = now.getFullYear();
    return data.filter((o) => new Date(o.orderDate).getFullYear() === y);
  }
  return data;
}

// 4. Cập nhật thống kê
function updateStatistics(data) {
  let counts = { pending: 0, delivered: 0, processing: 0, canceled: 0, shipped: 0 };
  let revenueByDay = { T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0, CN: 0 };

  data.forEach((o) => {
    const s = o.status?.toLowerCase();
    if (counts[s] !== undefined) counts[s]++;
    if (s === "delivered") {
      const d = new Date(o.orderDate);
      const key = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
      revenueByDay[key] += o.totalAmount;
    }
  });

  document.querySelector(".stat-box.bg-yellow h3").textContent = counts.pending || 0;
  document.querySelector(".stat-box.bg-red h3").textContent = counts.delivered || 0;
  document.querySelectorAll(".stat-box.bg-gray h3")[0].textContent = counts.processing + counts.shipped;
  document.querySelectorAll(".stat-box.bg-gray h3")[1].textContent = counts.canceled || 0;

  salesChart.data.datasets[0].data = [
    revenueByDay["T2"], revenueByDay["T3"], revenueByDay["T4"],
    revenueByDay["T5"], revenueByDay["T6"], revenueByDay["T7"], revenueByDay["CN"]
  ];
  salesChart.update();

  const total = Object.values(revenueByDay).reduce((a, b) => a + b, 0);
  document.querySelector(".chart-box.wide p span").textContent = total.toLocaleString("vi-VN") + " VND";
}

// 5. Gọi API đơn hàng và cập nhật
function fetchAndUpdate(filterType = "tháng") {
  fetch("https://tiemsachnhaem-be-mu.vercel.app/api/orders")
    .then((res) => res.json())
    .then((data) => {
      const filtered = filterByDateRange(data, filterType);
      updateStatistics(filtered);
    });
}

// 6. Sự kiện chọn thời gian
document.querySelectorAll(".time-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const label = btn.innerText.trim().toLowerCase();
    if (label === "tùy chỉnh") {
      document.getElementById("custom-date-range").style.display = "block";
    } else {
      document.getElementById("custom-date-range").style.display = "none";
      fetchAndUpdate(label);
    }
  });
});

// 7. Lọc theo ngày tùy chỉnh
document.getElementById("apply-filter").addEventListener("click", () => {
  const from = new Date(document.getElementById("from-date").value);
  const to = new Date(document.getElementById("to-date").value);
  if (isNaN(from) || isNaN(to)) return alert("Vui lòng chọn đủ cả 2 ngày");
  fetch("https://tiemsachnhaem-be-mu.vercel.app/api/orders")
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.filter((o) => {
        const d = new Date(o.orderDate);
        return d >= from && d <= to;
      });
      updateStatistics(filtered);
    });
});

// 8. Gọi API sản phẩm bán chạy
fetch("https://tiemsachnhaem-be-mu.vercel.app/api/products/top-selling?limit=5")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".chart-box.narrow");
    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";
    list.style.marginTop = "12px";

    if (!data.length) {
      const empty = document.createElement("p");
      empty.textContent = "Không có dữ liệu.";
      empty.style.color = "#999";
      container.appendChild(empty);
      return;
    }

    data.forEach((product, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${i + 1}. ${product.name}</strong><br>
        Giá: ${product.price.toLocaleString()} VND<br>
        Tồn kho: ${product.stock}
      `;
      li.style.marginBottom = "10px";
      list.appendChild(li);
    });

    container.appendChild(list);
  })
  .catch((err) => console.error("Lỗi khi lấy sản phẩm bán chạy:", err));

// 9. Load mặc định khi vào trang
fetchAndUpdate();
