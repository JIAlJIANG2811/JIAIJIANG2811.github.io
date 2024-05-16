document.addEventListener('wheel', function(event) {
    const image2 = document.querySelector('.image2');
    if (event.deltaY > 0) {
        // Scroll down
        image2.style.transform = 'translateX(0)';
    } else {
        // Scroll up
        image2.style.transform = 'translateX(100%)';
    }
});
