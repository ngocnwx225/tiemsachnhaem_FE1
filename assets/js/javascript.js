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

// Đợi cho trang web load xong
document.addEventListener('DOMContentLoaded', function() {
    const row1 = document.getElementById('row1');
    const row2 = document.getElementById('row2');

    // Lấy chiều rộng thực tế của 1 product-card (bao gồm margin)
    function getCardWidth() {
        const card = row1.querySelector('.product-card');
        if (!card) return 250;
        const style = window.getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseInt(style.marginRight) || 0;
        const marginLeft = parseInt(style.marginLeft) || 0;
        return width + marginLeft + marginRight;
    }

    // Biến kiểm soát đồng bộ scroll
    let isButtonScrolling = false;

    // Hàm cuộn sách khi bấm nút
    window.scrollBooks = function(direction) {
        const cards = row1.querySelectorAll('.product-card');
        const totalCards = cards.length;

        // Tìm card đầu tiên đang hiển thị hoàn toàn hoặc gần nhất mép trái
        let currentIndex = 0;
        for (let i = 0; i < totalCards; i++) {
            if (cards[i].offsetLeft + cards[i].offsetWidth/2 > row1.scrollLeft) {
                currentIndex = i;
                break;
            }
        }

        // Tính chỉ số card mới
        let newIndex = currentIndex + direction;
        newIndex = Math.max(0, Math.min(newIndex, totalCards - 1));

        // Scroll tới vị trí card mới, căn sát mép trái
        let newScrollLeft = cards[newIndex].offsetLeft;

        row1.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        row2.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }

    // Bỏ phần đồng bộ scroll giữa 2 dòng
    // Chỉ giữ lại chức năng nút next/back
});