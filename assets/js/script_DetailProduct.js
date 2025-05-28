
document.addEventListener("DOMContentLoaded", function () {
  const carousels = document.querySelectorAll(".carousel-wrapper");

  //lấy id sản phẩm từ url
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

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

async function loadBookDetailById() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    document.getElementById("book-title").innerText = "Không tìm thấy sản phẩm!";
    return;
  }

  try {
    const res = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/${productId}`);
    const book = await res.json();

    document.getElementById('book-image').src = book.imageUrl;
    document.getElementById('book-title').innerHTML = book.bookTitle;
    document.getElementById('book-price').textContent = book.price.toLocaleString('vi-VN') + 'đ';
    document.getElementById('book-stock').textContent = `Đã bán: ${book.soldCount || 0}`;
    document.getElementById('book-isbn').textContent = book.ISBN;
    document.getElementById('book-publisher').textContent = book.publisher;
    document.getElementById('book-author').textContent = book.author;
    document.getElementById('book-pages').textContent = book.pageCount;
    document.getElementById('book-catalog').textContent = book.catalog || 'Không rõ';
    document.getElementById('book-desc').textContent = book.description;

  } catch (err) {
    console.error("Lỗi khi gọi API sản phẩm:", err);
    document.getElementById("book-title").innerText = "Không thể tải sản phẩm!";
  }
}

window.addEventListener("DOMContentLoaded", loadBookDetailById);