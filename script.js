document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Cierra el menú al hacer clic en un enlace (móvil)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if(icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 2. Efecto scroll en la barra de navegación y Parallax
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Smart Navbar
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        // Estilos de la barra
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 5%';
            navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '20px 5%';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        // Parallax Effect
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        }
    });

    // 3. Animaciones al hacer scroll usando Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Elementos a animar
    const fadeElements = document.querySelectorAll('.fade-in, .fade-up, .slide-in-left, .slide-in-right');
    
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Disparar animaciones de la sección hero al cargar
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // 4. Manejo del formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = '¡Gracias por suscribirte!';
            btn.style.backgroundColor = 'var(--primary-color)';
            btn.style.color = '#fff';
            
            contactForm.reset();
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = ''; 
                btn.style.color = '';
            }, 3000);
        });
    }

    // 5. Efecto interactivo en las tarjetas de productos
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const btn = card.querySelector('.btn-secondary');
        
        card.addEventListener('mouseenter', () => {
            if(btn) {
                btn.style.backgroundColor = 'var(--primary-color)';
                btn.style.color = 'var(--white)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if(btn) {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = 'var(--primary-color)';
            }
        });
    });

    // 6. Set current year dynamically
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
