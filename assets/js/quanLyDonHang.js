// Hàm tiện ích để tìm phần tử chứa văn bản chính xác
HTMLElement.prototype.contains = function (text) {
  return this.textContent.trim() === text;
};

let ordersData = []; // Biến toàn cục để lưu dữ liệu từ API

// Hàm gọi API để lấy tất cả đơn hàng (GET /orders)
async function fetchOrders() {
  try {
    const response = await fetch(
      "https://tiemsachnhaem-be-mu.vercel.app/api/orders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Thêm token nếu cần
          // 'Authorization': 'Bearer your-token-here'
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi API: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Dữ liệu orders từ API:", data);
    ordersData = data; // Lưu dữ liệu từ API
    renderOrdersTable(); // Cập nhật bảng với dữ liệu API
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ API:", error);
    // Nếu API thất bại, giữ nguyên dữ liệu mẫu
    ordersData = [
      {
        id: "68386a8a255efda73f31c105",
        customerInfo: { name: "Test A", email: "testmail@mail.com" },
        orderInfo: {
          createdAt: "2025-05-29T14:09:14.492Z",
          totalAmount: 490000,
          status: "pending",
        },
      },
      {
        id: "68386b98ce25038722ba6a1e",
        customerInfo: { name: "Nguyên", email: "pthainguyen.id@gmail.com" },
        orderInfo: {
          createdAt: "2025-05-29T14:13:44.134Z",
          totalAmount: 490000,
          status: "pending",
        },
      },
    ];
    renderOrdersTable(); // Sử dụng dữ liệu mẫu
  }
}

// Hàm hiển thị dữ liệu lên bảng
function renderOrdersTable() {
  const tbody = document.getElementById("ordersTableBody");
  const statusText = {
    unresolved: "Chưa giải quyết",
    pending: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  tbody.innerHTML = ordersData
    .map((order) => {
      // Xác định dữ liệu từ cấu trúc mới hoặc cũ
      const customerName =
        order.customerInfo?.name || order.customerName || "Không xác định";
      const customerEmail =
        order.customerInfo?.email || order.customerEmail || "Chưa có email";
      const createdAt =
        order.orderInfo?.orderDate ||
        order.orderInfo?.createdAt ||
        order.createdAt;
      const totalAmount =
        order.orderInfo?.totalAmount || order.totalAmount || 0;
      const status = order.orderInfo?.status || order.status || "pending";

      return `
    <tr>
      <td>#${order.id.slice(-5)}</td>
      <td>
        <strong>${customerName}</strong><br>
        <small class="text-muted">${customerEmail}</small>
      </td>
      <td>${new Date(createdAt).toLocaleDateString("vi-VN")}</td>
      <td>${totalAmount.toLocaleString("vi-VN")}₫</td>
      <td><span class="badge rounded-pill status-${status}" id="status${order.id.slice(
        -5
      )}">${statusText[status] || "N/A"}</span></td>
      <td>
        <button class="btn btn-outline-primary btn-sm" onclick="showOrderDetail('${
          order.id
        }')">👁️</button>
        <button class="btn btn-outline-danger btn-sm delete-btn" onclick="deleteOrder('${
          order.id
        }')">🗑️</button>
      </td>
    </tr>
  `;
    })
    .join("");
}

// Hàm lấy chi tiết đơn hàng (GET /orders/{id})
async function showOrderDetail(orderId) {
  try {
    // Hiển thị modal ngay lập tức để người dùng không phải đợi
    const myModal = new bootstrap.Modal(document.getElementById("orderModal"));
    myModal.show();

    // Hiển thị thông báo đang tải
    document.getElementById("orderCustomer").textContent = "Đang tải...";
    document.getElementById("orderEmail").textContent = "Đang tải...";
    document.getElementById("orderPhone").textContent = "Đang tải...";
    document.getElementById("orderAddress").textContent = "Đang tải...";
    document.getElementById("orderDate").textContent = "Đang tải...";
    document.getElementById("orderTotal").textContent = "Đang tải...";
    document.getElementById("orderStatus").textContent = "Đang tải...";
    document.getElementById("orderProducts").innerHTML =
      '<tr><td colspan="3">Đang tải thông tin sản phẩm...</td></tr>';

    // Gọi API GET /orders/{id}
    const response = await fetch(
      `https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Thêm token nếu cần
          // 'Authorization': 'Bearer your-token-here'
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi API: ${response.status} - ${response.statusText}`
      );
    }

    const order = await response.json();
    console.log("Received order data:", order); // Kiểm tra dữ liệu nhận được

    // Hiển thị dữ liệu từ API với cấu trúc mới
    document.getElementById("orderCode").textContent = `#${order.id.slice(-5)}`;

    // Thông tin khách hàng
    document.getElementById("orderCustomer").textContent =
      order.customerInfo?.name || "Không xác định";
    document.getElementById("orderEmail").textContent =
      order.customerInfo?.email || "Chưa có email";
    document.getElementById("orderPhone").textContent =
      order.customerInfo?.phoneNumber || "Chưa có số điện thoại";
    document.getElementById("orderAddress").textContent =
      order.orderInfo?.shippingAddress ||
      order.customerInfo?.address ||
      "Chưa có địa chỉ";

    // Thông tin đơn hàng
    document.getElementById("orderDate").textContent = new Date(
      order.orderInfo?.orderDate || order.orderInfo?.createdAt
    ).toLocaleDateString("vi-VN");
    document.getElementById("orderTotal").textContent = order.orderInfo
      ?.totalAmount
      ? order.orderInfo.totalAmount.toLocaleString("vi-VN") + "₫"
      : "0₫";

    // Hiển thị phương thức thanh toán nếu có
    if (order.orderInfo?.paymentMethod) {
      const paymentMethodText =
        order.orderInfo.paymentMethod === "online"
          ? "Thanh toán online"
          : order.orderInfo.paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng"
          : order.orderInfo.paymentMethod;

      // Thêm dòng hiển thị phương thức thanh toán nếu có phần tử
      const orderStatusElement = document.getElementById("orderStatus");
      if (orderStatusElement && orderStatusElement.parentElement) {
        // Kiểm tra xem đã có phần tử payment method chưa
        const existingPaymentMethod =
          orderStatusElement.parentElement.querySelector(
            "[data-payment-method]"
          );
        if (!existingPaymentMethod) {
          const paymentMethodElement = document.createElement("p");
          paymentMethodElement.setAttribute("data-payment-method", "true");
          paymentMethodElement.innerHTML = `<strong>Phương thức thanh toán:</strong> <span>${paymentMethodText}</span>`;
          orderStatusElement.parentElement.insertBefore(
            paymentMethodElement,
            orderStatusElement.nextSibling
          );
        } else {
          existingPaymentMethod.innerHTML = `<strong>Phương thức thanh toán:</strong> <span>${paymentMethodText}</span>`;
        }
      }
    }

    // Kiểm tra nếu có items (sản phẩm) trong order
    if (order.items && Array.isArray(order.items)) {
      document.getElementById("orderProducts").innerHTML = order.items
        .map(
          (item) => `
          <tr>
            <td>
              ${item.title} (${item.author || "N/A"})
              ${item.ISBN ? `<br><small>ISBN: ${item.ISBN}</small>` : ""}
            </td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString("vi-VN")}₫</td>
          </tr>
        `
        )
        .join("");
    } else {
      document.getElementById("orderProducts").innerHTML =
        '<tr><td colspan="3">Không có thông tin sản phẩm</td></tr>';
    }

    const statusText = {
      unresolved: "Chưa giải quyết",
      pending: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };

    const currentStatus = order.orderInfo?.status || "pending";
    document.getElementById("orderStatusSelect").value = currentStatus;
    document.getElementById("orderStatus").textContent =
      statusText[currentStatus] || "Đang xử lý";
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    // Fallback về dữ liệu hiện có trong bảng
    const order = ordersData.find((o) => o.id === orderId);

    if (order) {
      const statusText = {
        unresolved: "Chưa giải quyết",
        pending: "Đang xử lý",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
      };

      document.getElementById("orderCode").textContent = `#${order.id.slice(
        -5
      )}`;

      // Kiểm tra xem dữ liệu có theo cấu trúc mới không
      if (order.customerInfo) {
        document.getElementById("orderCustomer").textContent =
          order.customerInfo.name || "Không xác định";
        document.getElementById("orderEmail").textContent =
          order.customerInfo.email || "Chưa có email";
        document.getElementById("orderPhone").textContent =
          order.customerInfo.phoneNumber || "Chưa có số điện thoại";
        document.getElementById("orderAddress").textContent =
          order.orderInfo?.shippingAddress ||
          order.customerInfo.address ||
          "Chưa có địa chỉ";
        document.getElementById("orderDate").textContent = new Date(
          order.orderInfo?.createdAt
        ).toLocaleDateString("vi-VN");
        document.getElementById("orderTotal").textContent =
          order.orderInfo?.totalAmount.toLocaleString("vi-VN") + "₫";
        const currentStatus = order.orderInfo?.status || "pending";
        document.getElementById("orderStatusSelect").value = currentStatus;
        document.getElementById("orderStatus").textContent =
          statusText[currentStatus] || "Đang xử lý";
      } else {
        // Cấu trúc dữ liệu cũ
        document.getElementById("orderCustomer").textContent =
          order.customerName || "Không xác định";
        document.getElementById("orderEmail").textContent =
          order.customerEmail || "Chưa có email";
        document.getElementById("orderPhone").textContent =
          order.phone || "Chưa có số điện thoại";
        document.getElementById("orderAddress").textContent =
          order.address || "Chưa có địa chỉ";
        document.getElementById("orderDate").textContent = new Date(
          order.createdAt
        ).toLocaleDateString("vi-VN");
        document.getElementById("orderTotal").textContent =
          order.totalAmount.toLocaleString("vi-VN") + "₫";
        const currentStatus = order.status || "pending";
        document.getElementById("orderStatusSelect").value = currentStatus;
        document.getElementById("orderStatus").textContent =
          statusText[currentStatus] || "Đang xử lý";
      }

      document.getElementById("orderProducts").innerHTML =
        '<tr><td colspan="3">Không có thông tin sản phẩm chi tiết</td></tr>';
    } else {
      document.getElementById("orderCustomer").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderEmail").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderPhone").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderAddress").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderDate").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderTotal").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderStatus").textContent =
        "Không tìm thấy thông tin";
      document.getElementById("orderProducts").innerHTML =
        '<tr><td colspan="3">Không tìm thấy thông tin sản phẩm</td></tr>';

      alert("Không tìm thấy thông tin đơn hàng!");
    }
  }
}
// Gán hàm cho window để có thể gọi từ HTML
window.showOrderDetail = showOrderDetail;

// Hàm cập nhật trạng thái đơn hàng (PUT /orders/{id})
async function updateOrderStatus() {
  const orderCode = document.getElementById("orderCode").textContent;
  // Lấy ID đầy đủ từ ordersData thay vì chỉ cắt mã đơn hàng
  const shortId = orderCode.replace("#", "");

  // Tìm đơn hàng đầy đủ từ dữ liệu đã lưu
  const orderItem = ordersData.find((order) => order.id.slice(-5) === shortId);

  if (!orderItem) {
    alert("Không tìm thấy thông tin đơn hàng!");
    return;
  }

  const orderId = orderItem.id; // Sử dụng ID đầy đủ
  const status = document.getElementById("orderStatusSelect").value;
  const statusText = {
    unresolved: "Chưa giải quyết",
    pending: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  }[status];

  try {
    console.log(`Cập nhật đơn hàng với ID đầy đủ: ${orderId}`);

    // Trước tiên, lấy thông tin chi tiết đơn hàng hiện tại từ API
    // const getResponse = await fetch(
    //   `https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderId}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // if (!getResponse.ok) {
    //   throw new Error(
    //     `Lỗi khi lấy thông tin đơn hàng: ${getResponse.status} - ${getResponse.statusText}`
    //   );
    // }

    // const currentOrder = await getResponse.json();
    // console.log("Dữ liệu đơn hàng trước khi cập nhật:", currentOrder);

    // // Chuẩn bị dữ liệu cập nhật
    // let updatedOrderData;

    // // Kiểm tra cấu trúc dữ liệu mới
    // if (currentOrder.orderInfo) {
    //   // Cấu trúc dữ liệu mới
    //   updatedOrderData = {
    //     ...currentOrder,
    //     orderInfo: {
    //       ...currentOrder.orderInfo,
    //       status: status, // Chỉ cập nhật trạng thái
    //     },
    //   };
    // } else {
    //   // Cấu trúc dữ liệu cũ
    //   updatedOrderData = {
    //     ...currentOrder,
    //     status: status,
    //   };
    // }

    // console.log("Dữ liệu đơn hàng sẽ gửi để cập nhật:", updatedOrderData);

    // Gọi API PUT /orders/{id}
    const response = await fetch(
      `https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Lỗi khi cập nhật đơn hàng: ${response.status} - ${response.statusText}`
      );
    }

    // Cập nhật trạng thái trên bảng chính
    const statusElement = document.getElementById(`status${shortId}`);
    if (statusElement) {
      statusElement.textContent = statusText;
      statusElement.className = `badge rounded-pill status-${status}`;
    }

    // Cập nhật trạng thái trong modal
    document.getElementById("orderStatus").textContent = statusText;

    // Hiển thị popup thành công
    document.getElementById("successTitle").textContent =
      "Cập nhật trạng thái đơn hàng";
    document.getElementById(
      "successMessage"
    ).textContent = `Trạng thái đơn hàng đã được cập nhật thành: ${statusText}`;
    const popup = document.getElementById("successOverlay");
    popup.style.display = "flex";

    // Đóng modal chi tiết đơn hàng
    const modalElement = document.getElementById("orderModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // Làm mới danh sách đơn hàng
    await fetchOrders();
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    alert("Không thể cập nhật đơn hàng. Lỗi: " + error.message);
  }
}
// Gán hàm cho window để có thể gọi từ HTML
window.updateOrderStatus = updateOrderStatus;

// Hàm xóa đơn hàng (DELETE /orders/{id})
async function deleteOrder(orderId) {
  if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId.slice(-5)}?`)) {
    try {
      const response = await fetch(
        `https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Lỗi khi xóa đơn hàng: ${response.status} - ${response.statusText}`
        );
      }

      // Hiển thị popup thành công
      document.getElementById("successTitle").textContent = "Xóa đơn hàng";
      document.getElementById(
        "successMessage"
      ).textContent = `Đơn hàng #${orderId.slice(-5)} đã được xóa thành công!`;
      const popup = document.getElementById("successOverlay");
      popup.style.display = "flex";

      // Làm mới danh sách đơn hàng
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      alert("Không thể xóa đơn hàng. Lỗi: " + error.message);
    }
  }
}
// Gán hàm cho window để có thể gọi từ HTML
window.deleteOrder = deleteOrder;

function closeSuccessPopup(event) {
  const popup = document.getElementById("successOverlay");
  if (event && !event.target.closest(".success-popup")) {
    popup.style.display = "none";
  } else if (!event) {
    popup.style.display = "none";
  }
}
// Gán hàm cho window để có thể gọi từ HTML
window.closeSuccessPopup = closeSuccessPopup;

// Hàm tạo đơn hàng mới (POST /orders)
window.createOrder = async function () {
  try {
    const customerName = document.getElementById("createCustomerId").value;
    const productId = document.getElementById("createProductId").value;
    const quantity = parseInt(document.getElementById("createQuantity").value);
    const price = parseInt(document.getElementById("createPrice").value);
    const totalAmount = parseInt(
      document.getElementById("createTotalAmount").value
    );
    const status = document.getElementById("createStatus").value;

    if (!customerName || !productId || !quantity || !price || !totalAmount) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newOrder = {
      customerName: customerName,
      customerEmail: customerName + "@example.com", // Tạm thời gán email dựa trên tên
      products: [{ productId, quantity, price }],
      totalAmount,
      status,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(
      "https://tiemsachnhaem-be-mu.vercel.app/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Thêm token nếu cần
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(newOrder),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Lỗi khi tạo đơn hàng: ${response.status} - ${response.statusText}`
      );
    }

    alert("Tạo đơn hàng thành công!");
    const createModal = bootstrap.Modal.getInstance(
      document.getElementById("createOrderModal")
    );
    createModal.hide();

    // Làm mới danh sách đơn hàng
    await fetchOrders();
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    if (error.message.includes("400")) {
      alert("Dữ liệu không hợp lệ! Vui lòng kiểm tra lại.");
    } else if (error.message.includes("401")) {
      alert("Unauthorized! Vui lòng đăng nhập lại.");
    } else {
      alert("Không thể tạo đơn hàng. Vui lòng thử lại sau!");
    }
  }
};

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("successOverlay");
  popup.style.display = "none";
  fetchOrders(); // Gọi API khi trang tải
});

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("active");
}
