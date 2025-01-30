document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                mobileMenuToggle?.classList.remove('active');
                navLinks?.classList.remove('active');
            }
        });
    });

    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Form Validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }

                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        isValid = false;
                        field.classList.add('error');
                    }
                }
            });

            if (isValid) {
                // Here you would typically send the form data to your server
                console.log('Form submitted successfully');
                form.reset();
                showNotification('Mensaje enviado correctamente', 'success');
            } else {
                showNotification('Por favor, complete todos los campos requeridos correctamente', 'error');
            }
        });
    });

    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Lazy Loading Images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Carrusel de testimonios
    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const testimonials = [
            {
                icon: 'fa-user-circle',
                text: '"Después de mi injerto capilar FUE, recuperé no solo mi cabello sino también mi confianza. Los resultados son increíblemente naturales y el proceso fue mucho más cómodo de lo que esperaba."',
                name: 'Carlos M.',
                location: 'Valladolid',
                details: 'Injerto Capilar FUE - 2500 folículos'
            },
            {
                icon: 'fa-user-circle',
                text: '"La micropigmentación capilar cambió mi vida. El resultado es tan natural que nadie nota que es un tratamiento. El equipo médico fue excepcional en todo momento."',
                name: 'Juan S.',
                location: 'Valladolid',
                details: 'Micropigmentación Capilar'
            },
            {
                icon: 'fa-user-circle',
                text: '"Elegí la técnica DHI y no podría estar más satisfecho. La precisión en la implantación y la densidad conseguida superaron todas mis expectativas."',
                name: 'Miguel A.',
                location: 'Valladolid',
                details: 'Injerto Capilar DHI - 2800 folículos'
            }
        ];

        let currentIndex = 0;

        function updateTestimonial() {
            const testimonial = testimonials[currentIndex];
            const card = carousel.querySelector('.testimonial-card');
            
            // Primero ocultamos la tarjeta
            card.style.opacity = '0';
            
            // Después de un breve retraso, actualizamos el contenido y mostramos la tarjeta
            setTimeout(() => {
                card.innerHTML = `
                    <div class="testimonial-icon">
                        <i class="fas ${testimonial.icon}"></i>
                    </div>
                    <p class="testimonial-text">${testimonial.text}</p>
                    <h3 class="testimonial-name">${testimonial.name}</h3>
                    <p class="testimonial-location">${testimonial.location}</p>
                    <p class="testimonial-details">${testimonial.details}</p>
                `;
                card.style.opacity = '1';
            }, 300);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                updateTestimonial();
            });

            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                updateTestimonial();
            });

            // Auto-rotate cada 5 segundos
            setInterval(() => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                updateTestimonial();
            }, 5000);
        }
    }

    // FAQ Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', () => {
                    // Cerrar todos los otros items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle del item actual
                    item.classList.toggle('active');
                });
            }
        });
    }

    // Testimonials Slider
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (testimonialsSlider) {
        let currentSlide = 0;
        const slides = testimonialsSlider.querySelectorAll('.testimonial');
        const totalSlides = slides.length;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        // Initialize slider
        showSlide(0);

        // Auto advance slides every 5 seconds
        setInterval(nextSlide, 5000);
    }
});

// Add to any async functions that modify the DOM
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize performance for scroll events
const optimizedScroll = debounce(function() {
    // Your scroll handling code here
}, 16);

window.addEventListener('scroll', optimizedScroll);

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    if (e.state) {
        // Handle state change
        console.log('Navigation state changed:', e.state);
    }
});
