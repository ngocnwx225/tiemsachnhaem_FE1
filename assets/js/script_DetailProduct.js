document.addEventListener("DOMContentLoaded", async function () {
  const carousels = document.querySelectorAll(".carousel-wrapper");

  //lấy id sản phẩm từ url
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  //lấy thông tin sản phẩm từ api
  const product = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/${id}`);
  const productData = await product.json();

  document.querySelector("#book-image").src = productData.imageUrl;
  document.querySelector("#book-title").innerHTML = productData.bookTitle;
  document.querySelector("#book-price").textContent = productData.price.toLocaleString('vi-VN') + 'đ';
  document.querySelector("#book-stock").textContent = `Đã bán: ${productData.soldCount || 0}`;
  document.querySelector("#book-isbn").textContent = productData.ISBN;
  document.querySelector("#book-publisher").textContent = productData.publisher;
  document.querySelector("#book-author").textContent = productData.author;
  document.querySelector("#book-pages").textContent = productData.pageCount;
  document.querySelector("#book-catalog").textContent = productData.catalog || 'Không rõ';
  document.querySelector("#book-desc").textContent = productData.description;

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

