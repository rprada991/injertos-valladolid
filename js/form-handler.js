document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Función para mostrar mensajes
    function showMessage(message, isError = false) {
        const messageDiv = document.getElementById('formMessage');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `form-message ${isError ? 'error' : 'success'}`;
        messageDiv.style.display = 'block';

        // Scroll al mensaje
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ocultar mensaje después de 5 segundos si es exitoso
        if (!isError) {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Función para validar el formulario
    function validateForm(formData) {
        const nombre = formData.get('nombre');
        const email = formData.get('email');
        const telefono = formData.get('telefono');
        const mensaje = formData.get('mensaje');

        if (!nombre || !email || !telefono || !mensaje) {
            throw new Error('Por favor, complete todos los campos obligatorios');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Por favor, introduzca un email válido');
        }

        // Validar teléfono (formato español)
        const phoneRegex = /^(?:(?:\+|00)34|34)?[6789]\d{8}$/;
        if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
            throw new Error('Por favor, introduzca un número de teléfono válido');
        }
    }

    // Manejador del envío del formulario
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Deshabilitar el botón de envío
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            const formData = new FormData(contactForm);

            // Validar formulario
            validateForm(formData);

            // Enviar datos
            const response = await fetch('/php/process_form.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message);
                contactForm.reset();
                
                // Resetear reCAPTCHA si existe
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
            } else {
                throw new Error(result.message || 'Error al enviar el formulario');
            }
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            // Restaurar el botón
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Validación en tiempo real
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.required && !this.value) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else {
                this.classList.remove('error');
                this.classList.add('valid');
            }

            // Validación específica para email
            if (this.type === 'email' && this.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    this.classList.add('error');
                    this.classList.remove('valid');
                }
            }

            // Validación específica para teléfono
            if (this.name === 'telefono' && this.value) {
                const phoneRegex = /^(?:(?:\+|00)34|34)?[6789]\d{8}$/;
                if (!phoneRegex.test(this.value.replace(/\s/g, ''))) {
                    this.classList.add('error');
                    this.classList.remove('valid');
                }
            }
        });
    });
});
