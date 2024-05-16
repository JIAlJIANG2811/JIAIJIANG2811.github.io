let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const image1 = document.querySelector('.image1');
    const image2 = document.querySelector('.image2');
    const image1Rect = image1.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && image1Rect.top <= 0) {
        // Scrolling down and the top of the first image is at or above the top of the viewport
        image2.style.transform = 'translateX(0)';
    } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        image2.style.transform = 'translateX(100%)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For mobile or negative scrolling
});
