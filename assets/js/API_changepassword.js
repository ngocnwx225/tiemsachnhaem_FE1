document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.changepw-form');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = localStorage.getItem('userEmail'); // phải được lưu sau khi login
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (!email) {
            alert('Không tìm thấy email người dùng. Vui lòng đăng nhập lại.');
            return;
        }

        if (!newPassword || !confirmPassword) {
            alert('Vui lòng điền đầy đủ mật khẩu');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Đổi mật khẩu thành công!');
                window.location.href = '../pages/profilecustomer.html';
            } else {
                alert(data.message || 'Email không tồn tại hoặc lỗi đổi mật khẩu.');
            }
        } catch (err) {
            console.error('Lỗi:', err);
            alert('Không thể kết nối đến máy chủ.');
        }
    });
});