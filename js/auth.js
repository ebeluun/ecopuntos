
// Funciones para registrar usuarios e iniciar sesión en EcoPuntos.

// Obtener los usuarios guardados en el navegador.
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuariosEcoPuntos")) || [];
}

// Guardar los usuarios en el navegador.
function guardarUsuarios(usuarios) {
    localStorage.setItem("usuariosEcoPuntos", JSON.stringify(usuarios));
}

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
        const nombre = esRegistro ? formulario.querySelector("#nombre").value.trim() : "";
        const usuario = esRegistro ? formulario.querySelector("#usuario").value.trim() : "";

        campos.forEach(function (campo) {
            campo.classList.remove("campo-error");
        });

        if (esRegistro && (!nombre || !usuario)) {
            const campoVacio = !nombre
                ? formulario.querySelector("#nombre")
                : formulario.querySelector("#usuario");

            campoVacio.classList.add("campo-error");
            mostrarMensaje("Por favor, completa todos los campos obligatorios.", "mensaje-error");
            campoVacio.focus();
            return;
        }

        if (!correo.value.trim() || !contrasena.value.trim()) {
            const campoVacio = !correo.value.trim() ? correo : contrasena;
            campoVacio.classList.add("campo-error");
            mostrarMensaje("Por favor, completa todos los campos obligatorios.", "mensaje-error");
            campoVacio.focus();
            return;
        }

        if (!validarCorreo(correo.value.trim())) {
            correo.classList.add("campo-error");
            mostrarMensaje("Escribe un correo electrónico válido. Ejemplo: nombre@correo.com", "mensaje-error");
            correo.focus();
            return;
        }

        if (esRegistro) {
            if (!validarContrasena(contrasena.value)) {
                contrasena.classList.add("campo-error");
                mostrarMensaje("La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número.", "mensaje-error");
                contrasena.focus();
                return;
            }

            const usuarios = obtenerUsuarios();

            const existe = usuarios.some(function (persona) {
                return persona.correo === correo.value.trim().toLowerCase() ||
                    persona.usuario === usuario;
            });

            if (existe) {
                mostrarMensaje("El correo o nombre de usuario ya está registrado.", "mensaje-error");
                return;
            }

            const nuevoUsuario = {
                nombre: nombre,
                correo: correo.value.trim().toLowerCase(),
                usuario: usuario,
                contrasena: contrasena.value
            };

            usuarios.push(nuevoUsuario);
            guardarUsuarios(usuarios);

            mostrarMensaje("¡Registro exitoso! Ahora puedes iniciar sesión.", "mensaje-exito");
            formulario.reset();

        } else {
            // SCRUM-63: verificar los datos contra los usuarios registrados (js/sesion.js).
            const usuarioEncontrado = verificarCredenciales(correo.value, contrasena.value);

            if (!usuarioEncontrado) {
                correo.classList.add("campo-error");
                contrasena.classList.add("campo-error");
                mostrarMensaje("Correo o contraseña incorrectos.", "mensaje-error");
                contrasena.focus();
                return;
            }

            iniciarSesion(usuarioEncontrado);
            mostrarMensaje("¡Bienvenido, " + usuarioEncontrado.nombre + "!", "mensaje-exito");

            // Regresar a la página que pidió iniciar sesión, o al perfil.
            setTimeout(function () {
                window.location.href = paginaDeRegreso("perfil.html");
            }, 800);
        }
    });
});
