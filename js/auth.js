
// Funciones para registrar usuarios e iniciar sesión en EcoPuntos.

// Obtener los usuarios guardados en el navegador.
function obtenerUsuarios() {
    try {
        const usuariosGuardados = localStorage.getItem("usuariosEcoPuntos");
        const usuarios = JSON.parse(usuariosGuardados || "[]");

        return Array.isArray(usuarios) ? usuarios : [];
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        return [];
    }
}

// Guardar los usuarios en el navegador.
function guardarUsuarios(usuarios) {
    try {
        localStorage.setItem("usuariosEcoPuntos", JSON.stringify(usuarios));
        return true;
    } catch (error) {
        console.error("Error al guardar los usuarios:", error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.querySelector("#form-registro, #form-login");

    if (!formulario) return;

    const mensaje = formulario.querySelector("#mensaje");
    const campos = formulario.querySelectorAll("input");
    const esRegistro = formulario.id === "form-registro";

    // Mostrar mensajes de validación.
    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "mensaje " + tipo;
        mensaje.setAttribute(
            "role",
            tipo === "mensaje-error" ? "alert" : "status"
        );
    }

    // Limpiar mensajes anteriores.
    function limpiarMensaje() {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
    }

    // Validar el formato del correo electrónico.
    function validarCorreo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
    }

    // Validar los requisitos de la contraseña.
    function validarContrasena(contrasena) {
        return contrasena.length >= 8 &&
            /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(contrasena) &&
            /\d/.test(contrasena);
    }

    // Quitar el estado de error cuando el usuario modifica un campo.
    campos.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.classList.remove("campo-error");
            limpiarMensaje();
        });
    });

    // Validar el formulario antes de procesarlo.
    formulario.addEventListener("submit", function (event) {

        event.preventDefault();
        limpiarMensaje();

        const correo = formulario.querySelector("#correo");
        const contrasena = formulario.querySelector("#contrasena");

        const nombre = esRegistro
            ? formulario.querySelector("#nombre").value.trim()
            : "";

        const usuario = esRegistro
            ? formulario.querySelector("#usuario").value.trim()
            : "";

        const correoNormalizado = correo.value.trim().toLowerCase();

        campos.forEach(function (campo) {
            campo.classList.remove("campo-error");
        });

        // Validar campos obligatorios.
        if (esRegistro && !nombre) {
            const campo = formulario.querySelector("#nombre");

            campo.classList.add("campo-error");
            mostrarMensaje(
                "Por favor, escribe tu nombre completo.",
                "mensaje-error"
            );
            campo.focus();
            return;
        }

        if (esRegistro && !usuario) {
            const campo = formulario.querySelector("#usuario");

            campo.classList.add("campo-error");
            mostrarMensaje(
                "Por favor, escribe un nombre de usuario.",
                "mensaje-error"
            );
            campo.focus();
            return;
        }

        if (!correoNormalizado) {
            correo.classList.add("campo-error");
            mostrarMensaje(
                "Por favor, ingresa tu correo electrónico.",
                "mensaje-error"
            );
            correo.focus();
            return;
        }

        if (!contrasena.value.trim()) {
            contrasena.classList.add("campo-error");
            mostrarMensaje(
                "Por favor, ingresa tu contraseña.",
                "mensaje-error"
            );
            contrasena.focus();
            return;
        }

        // Comprobar que el correo tenga un formato válido.
        if (!validarCorreo(correoNormalizado)) {
            correo.classList.add("campo-error");
            mostrarMensaje(
                "Escribe un correo electrónico válido. Ejemplo: nombre@correo.com",
                "mensaje-error"
            );
            correo.focus();
            return;
        }

        const usuarios = obtenerUsuarios();

        // Proceso de registro.
        if (esRegistro) {

            // Validar la contraseña.
            if (!validarContrasena(contrasena.value)) {
                contrasena.classList.add("campo-error");
                mostrarMensaje(
                    "La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número.",
                    "mensaje-error"
                );
                contrasena.focus();
                return;
            }

            // Evitar correos y nombres de usuario duplicados.
            const existe = usuarios.some(function (persona) {
                return persona.correo?.toLowerCase() === correoNormalizado ||
                    persona.usuario?.toLowerCase() === usuario.toLowerCase();
            });

            if (existe) {
                mostrarMensaje(
                    "El correo o nombre de usuario ya está registrado.",
                    "mensaje-error"
                );
                return;
            }

            // Crear el nuevo usuario.
            const nuevoUsuario = {
                nombre: nombre,
                correo: correoNormalizado,
                usuario: usuario,
                contrasena: contrasena.value
            };

            usuarios.push(nuevoUsuario);

            // Guardar el registro.
            if (!guardarUsuarios(usuarios)) {
                mostrarMensaje(
                    "No fue posible guardar tu registro. Inténtalo nuevamente.",
                    "mensaje-error"
                );
                return;
            }

            mostrarMensaje(
                "¡Registro exitoso! Ahora puedes iniciar sesión.",
                "mensaje-exito"
            );

            formulario.reset();

        } else {

            // Proceso de inicio de sesión.
            const usuarioEncontrado = usuarios.find(function (persona) {
                return persona.correo?.toLowerCase() === correoNormalizado &&
                    persona.contrasena === contrasena.value;
            });

            // Comprobar las credenciales.
            if (!usuarioEncontrado) {
                correo.classList.add("campo-error");
                contrasena.classList.add("campo-error");

                mostrarMensaje(
                    "Correo o contraseña incorrectos.",
                    "mensaje-error"
                );
                return;
            }

            // Guardar los datos de la sesión activa.
            try {
                localStorage.setItem("usuarioActivo", JSON.stringify({
                    nombre: usuarioEncontrado.nombre,
                    correo: usuarioEncontrado.correo,
                    usuario: usuarioEncontrado.usuario
                }));
            } catch (error) {
                console.error("Error al iniciar la sesión:", error);

                mostrarMensaje(
                    "No fue posible iniciar la sesión. Inténtalo nuevamente.",
                    "mensaje-error"
                );
                return;
            }

            // Redirigir al perfil del usuario.
            window.location.href = "perfil.html";
        }
    });
});
