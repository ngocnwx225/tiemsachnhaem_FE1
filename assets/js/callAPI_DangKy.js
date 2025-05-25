function callRegisterAPI(event) {
  event.preventDefault(); // Ngăn reload

  const username = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return false;
  }

  fetch("https://tiemsachnhaem-be-mu.vercel.app/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Đăng ký thất bại");
    return res.json();
  })
  .then(data => {
    alert("Đăng ký thành công!");
    window.location.href = "../pages/dangnhap1.html";
  })
  .catch(error => {
    console.error("Lỗi đăng ký:", error);
    alert("Đăng ký thất bại. Vui lòng thử lại.");
  });

  return false;
}
