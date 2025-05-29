document.addEventListener('DOMContentLoaded', function() {
    const userInfo = localStorage.getItem("userInfo");
    let user = null; // Khai báo biến user ở phạm vi rộng hơn

    if (userInfo) {
        user = JSON.parse(userInfo);
        // Điền thông tin vào form
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || ''; // Giữ lại phone cho input
        document.getElementById('address').value = user.address || '';
    }
    
    const editCustomerForm = document.getElementById('editCustomerForm');

    if (editCustomerForm && user) { // Chỉ thêm listener nếu có form và user info
        editCustomerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Lấy giá trị từ các trường input
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim(); // Email vẫn lấy từ input dù readonly
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();

            // Kiểm tra cơ bản
            if (!fullName) {
                alert('Vui lòng nhập họ và tên.');
                document.getElementById('fullName').focus();
                return;
            }
            if (!email) {
                alert('Vui lòng nhập email.');
                document.getElementById('email').focus();
                return;
            }
            if (!isValidEmail(email)) {
                alert('Địa chỉ email không hợp lệ.');
                document.getElementById('email').focus();
                return;
            }
            if (!phone) {
                alert('Vui lòng nhập số điện thoại.');
                document.getElementById('phone').focus();
                return;
            }
            if (!isValidPhone(phone)) {
                alert('Số điện thoại không hợp lệ. (Yêu cầu: 10-11 chữ số)');
                document.getElementById('phone').focus();
                return;
            }
            if (!address) {
                alert('Vui lòng nhập địa chỉ.');
                document.getElementById('address').focus();
                return;
            }

            try {
                // Chuẩn bị dữ liệu để gửi lên server
                const userDataForApi = {
                    fullName: fullName,
                    email: email,
                    phoneNumber: phone, // Sử dụng phoneNumber cho API
                    address: address,
                    status: user.status || 'active', // Giữ nguyên status hoặc mặc định
                    role: user.role || 'user'       // Giữ nguyên role hoặc mặc định
                };

                // Lấy User ID (giả sử user object từ localStorage có trường id)
                const userId = user.id;
                if (!userId) {
                    throw new Error('Không tìm thấy User ID trong localStorage');
                }

                // Gọi API cập nhật thông tin
                const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Thêm token nếu cần
                    },
                    body: JSON.stringify(userDataForApi)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Cập nhật thông tin thất bại');
                }

                const result = await response.json();

                // Cập nhật localStorage sau khi API thành công
                // Cập nhật lại user object với dữ liệu mới (nếu API trả về dữ liệu cập nhật)
                // Hoặc chỉ cập nhật các trường đã chỉnh sửa
                const updatedUserInStorage = {
                   ...user, // Giữ lại các thông tin cũ như id, status, role
                   fullName: fullName,
                   email: email, // Email không đổi qua form nhưng vẫn lưu lại
                   phone: phone, // Lưu phone với tên phone trong storage
                   address: address
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInStorage));

                // Hiển thị thông báo thành công
                alert('Cập nhật thông tin thành công');

                // Chuyển về trang thông tin tài khoản
                window.location.href = 'profilecustomer.html';

            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin:', error);
                alert(`Có lỗi xảy ra khi cập nhật thông tin: ${error.message}. Vui lòng thử lại sau.`);
            }
        });
    }

    // Hàm kiểm tra định dạng email đơn giản
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Hàm kiểm tra định dạng số điện thoại (10-11 chữ số)
    function isValidPhone(phone) {
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phone);
    }
});