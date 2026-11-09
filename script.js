document.addEventListener('DOMContentLoaded', () => {
    // 1. Menú móvil (Hamburguesa)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Navbar dinámica al hacer scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Año dinámico en el footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 5. Efecto interactivo en las tarjetas de productos (Mostrar/ocultar detalles)
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const btnMoreInfo = card.querySelector('.btn-more-info');
        const btnCloseDetails = card.querySelector('.btn-close-details');

        // Mostrar detalles
        if (btnMoreInfo) {
            btnMoreInfo.addEventListener('click', (e) => {
                e.preventDefault();
                card.classList.add('show-details');
            });
        }

        // Ocultar detalles
        if (btnCloseDetails) {
            btnCloseDetails.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.classList.remove('show-details');
            });
        }
    });

    // 6. Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Gracias por unirte a El Club Kaya! Pronto recibirás novedades exclusivas.');
            contactForm.reset();
        });
    }
});
