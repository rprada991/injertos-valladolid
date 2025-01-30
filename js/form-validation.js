class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.messageContainer = document.getElementById('formMessage');
        
        this.validationRules = {
            nombre: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                messages: {
                    required: 'Por favor, introduce tu nombre',
                    minLength: 'El nombre debe tener al menos 2 caracteres',
                    pattern: 'El nombre solo puede contener letras'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    required: 'Por favor, introduce tu email',
                    pattern: 'Por favor, introduce un email válido'
                }
            },
            telefono: {
                required: true,
                pattern: /^(?:(?:\+|00)34|34)?[6789]\d{8}$/,
                messages: {
                    required: 'Por favor, introduce tu teléfono',
                    pattern: 'Por favor, introduce un teléfono válido (formato español)'
                }
            },
            mensaje: {
                required: true,
                minLength: 10,
                messages: {
                    required: 'Por favor, introduce tu mensaje',
                    minLength: 'El mensaje debe tener al menos 10 caracteres'
                }
            },
            privacidad: {
                required: true,
                messages: {
                    required: 'Debes aceptar la política de privacidad'
                }
            }
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Validación en tiempo real
        this.form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });

        // Validación al enviar
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(field) {
        const rules = this.validationRules[field.name];
        if (!rules) return true;

        const errorContainer = field.parentElement.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';

        // Limpiar clases previas
        field.classList.remove('valid', 'error');

        // Validar campo requerido
        if (rules.required && !field.value.trim()) {
            isValid = false;
            errorMessage = rules.messages.required;
        }
        // Validar longitud mínima
        else if (rules.minLength && field.value.trim().length < rules.minLength) {
            isValid = false;
            errorMessage = rules.messages.minLength;
        }
        // Validar patrón
        else if (rules.pattern && !rules.pattern.test(field.value.trim())) {
            isValid = false;
            errorMessage = rules.messages.pattern;
        }

        // Actualizar UI
        if (errorContainer) {
            errorContainer.textContent = errorMessage;
            errorContainer.style.display = isValid ? 'none' : 'block';
        }

        field.classList.add(isValid ? 'valid' : 'error');
        return isValid;
    }

    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, textarea, select');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showMessage('Por favor, corrige los errores en el formulario', true);
            return;
        }

        // Verificar reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                this.showMessage('Por favor, completa el captcha', true);
                return;
            }
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message || 'Mensaje enviado correctamente', false);
                this.form.reset();
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
            } else {
                throw new Error(result.message || 'Error al enviar el mensaje');
            }
        } catch (error) {
            this.showMessage(error.message || 'Error al enviar el mensaje', true);
        } finally {
            this.setLoadingState(false);
        }
    }

    showMessage(message, isError = false) {
        if (!this.messageContainer) return;

        this.messageContainer.textContent = message;
        this.messageContainer.className = `form-message ${isError ? 'error' : 'success'}`;
        this.messageContainer.style.display = 'block';

        // Scroll al mensaje
        this.messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ocultar mensaje después de 5 segundos si es exitoso
        if (!isError) {
            setTimeout(() => {
                this.messageContainer.style.display = 'none';
            }, 5000);
        }
    }

    setLoadingState(loading) {
        if (!this.submitButton) return;

        const buttonText = this.submitButton.querySelector('.button-text');
        const buttonLoader = this.submitButton.querySelector('.button-loader');

        this.submitButton.disabled = loading;
        
        if (buttonText && buttonLoader) {
            buttonText.style.display = loading ? 'none' : 'inline';
            buttonLoader.style.display = loading ? 'inline' : 'none';
        }
    }
}

// Inicializar el validador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const formValidator = new FormValidator('contactForm');

    // Añadir máscaras a los campos si se incluye la librería IMask
    if (typeof IMask !== 'undefined') {
        // Máscara para teléfono
        const phoneInput = document.getElementById('telefono');
        if (phoneInput) {
            IMask(phoneInput, {
                mask: '+34 000 000 000'
            });
        }
    }
});
