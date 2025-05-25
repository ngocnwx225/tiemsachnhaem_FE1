
  document.addEventListener("DOMContentLoaded", function () {
    const carousels = document.querySelectorAll(".carousel-wrapper");

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

