// asset/js/component-loader.js
function loadComponent(id, url) {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        document.getElementById(id).innerHTML = html;
      });
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header-placeholder', '../components/header.html');
    loadComponent('footer-placeholder', '../components/footer.html');
  });