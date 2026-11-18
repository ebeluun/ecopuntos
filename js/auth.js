// Validaciones y mensajes visuales para los formularios de EcoPuntos.

document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector("#form-registro, #form-login");

    if (!formulario) return;

    const mensaje = formulario.querySelector("#mensaje");
    const campos = formulario.querySelectorAll("input");
    const esRegistro = formulario.id === "form-registro";

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "mensaje " + tipo;
        mensaje.setAttribute("role", tipo === "mensaje-error" ? "alert" : "status");
    }

    function limpiarMensaje() {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
    }

    function validarCorreo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
    }

    function validarContrasena(contrasena) {
        return contrasena.length >= 8 &&
            /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(contrasena) &&
            /\d/.test(contrasena);
    }

    campos.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.classList.remove("campo-error");
            limpiarMensaje();
        });
    });

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        limpiarMensaje();

        const correo = formulario.querySelector("#correo");
        const contrasena = formulario.querySelector("#contrasena");
        const primerCampoVacio = Array.from(campos).find(function (campo) {
            return campo.required && !campo.value.trim();
        });

        campos.forEach(function (campo) {
            campo.classList.remove("campo-error");
        });

        if (primerCampoVacio) {
            primerCampoVacio.classList.add("campo-error");
            mostrarMensaje("Por favor, completa todos los campos obligatorios.", "mensaje-error");
            primerCampoVacio.focus();
            return;
        }

        if (!validarCorreo(correo.value.trim())) {
            correo.classList.add("campo-error");
            mostrarMensaje("Escribe un correo electrónico válido. Ejemplo: nombre@correo.com", "mensaje-error");
            correo.focus();
            return;
        }

        if (esRegistro && !validarContrasena(contrasena.value)) {
            contrasena.classList.add("campo-error");
            mostrarMensaje("La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número.", "mensaje-error");
            contrasena.focus();
            return;
        }

        if (!esRegistro && !contrasena.value.trim()) {
            contrasena.classList.add("campo-error");
            mostrarMensaje("Ingresa tu contraseña para continuar.", "mensaje-error");
            contrasena.focus();
            return;
        }

        if (esRegistro) {
            mostrarMensaje("¡Datos validados correctamente! El formulario de registro está listo.", "mensaje-exito");
        } else {
            mostrarMensaje("¡Datos validados correctamente! El formulario de inicio de sesión está listo.", "mensaje-exito");
        }
    });
});
