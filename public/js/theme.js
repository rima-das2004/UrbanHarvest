
        
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const savedTheme = localStorage.getItem('theme');


if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.classList.replace('btn-light', 'btn-dark');
    themeIcon.classList.add('bi-moon-stars-fill');
} else {
    themeIcon.classList.add('bi-brightness-high-fill');
}


themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    
    
    this.classList.toggle('btn-light');
    this.classList.toggle('btn-dark');
    
    
    const isDark = document.body.classList.contains('dark-theme');
    themeIcon.className = 'bi ' + (isDark ? 'bi-moon-stars-fill' : 'bi-brightness-high-fill');

    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
