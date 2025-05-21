  //Ẩn hiện mật khẩu
    var x = true;
    function myfunction() {
      if (x) {
        document.getElementById('pass').type = "text";
        x = false;
      } else {
        document.getElementById('pass').type = "password";
        x = true;
      }
    }

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  input.type = (input.type === "password") ? "text" : "password";
}


  //Cuộn sách trong Home
  function scrollBooks(direction) {
    const scrollAmount = 300;
    row1.scrollLeft += scrollAmount * direction;
    row2.scrollLeft += scrollAmount * direction;
  }