window.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const libraryMenu = document.getElementById('libraryMenu');

  if (hamburgerBtn && libraryMenu) {
    // 1. Toggle menu with hamburger button
    hamburgerBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      libraryMenu.classList.toggle('open');
    });

    // 2. Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideMenu = libraryMenu.contains(event.target);
      const isClickOnButton = hamburgerBtn.contains(event.target);
      if (libraryMenu.classList.contains('open') && !isClickInsideMenu && !isClickOnButton) {
        libraryMenu.classList.remove('open');
      }
    });

    // 3. Swipe to close menu on touch devices
    let touchstartX = 0;
    libraryMenu.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX);
    libraryMenu.addEventListener('touchend', e => {
      if (e.changedTouches[0].screenX < touchstartX - 50) {
        libraryMenu.classList.remove('open');
      }
    });
  }
});