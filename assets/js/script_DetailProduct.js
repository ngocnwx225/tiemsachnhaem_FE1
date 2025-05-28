document.addEventListener("DOMContentLoaded", async function () {
  const carousels = document.querySelectorAll(".carousel-wrapper");

  //lấy id sản phẩm từ url
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  //lấy thông tin sản phẩm từ api
  const product = await fetch(`http://localhost:3000/products/${id}`);
  const productData = await product.json();

  const phoneNumber = document.querySelector(".phone-number");
  phoneNumber.textContent = productData.phoneNumber;

  carousels.forEach(wrapper => {
    const bookList = wrapper.querySelector(".book-list");
    const prevBtn = wrapper.querySelector(".prev");
    const nextBtn = wrapper.querySelector(".next");

    const scrollAmount = 240; // Độ dài cuộn mỗi lần bấm

    prevBtn.addEventListener("click", () => {
      bookList.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      bookList.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  });
});

