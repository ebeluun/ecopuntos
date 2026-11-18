
// Funciones para registrar usuarios e iniciar sesión en EcoPuntos.

// Obtener los usuarios guardados en el navegador.
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuariosEcoPuntos")) || [];
}

// Guardar los usuarios en el navegador.
function guardarUsuarios(usuarios) {
    localStorage.setItem("usuariosEcoPuntos", JSON.stringify(usuarios));
}

// Formulario de registro.
const formularioRegistro = document.querySelector("#form-registro");

if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", function(event) {
        event.preventDefault();

        const nombre = document.querySelector("#nombre").value.trim();
        const correo = document.querySelector("#correo").value.trim().toLowerCase();
        const usuario = document.querySelector("#usuario").value.trim();
        const contrasena = document.querySelector("#contrasena").value;

        const mensaje = document.querySelector("#mensaje");

        if (!nombre || !correo || !usuario || !contrasena) {
            mensaje.textContent = "Completa todos los campos.";
            return;
        }

        const usuarios = obtenerUsuarios();

        const existe = usuarios.some(function(persona) {
            return persona.correo === correo || persona.usuario === usuario;
        });

        if (existe) {
            mensaje.textContent = "El correo o nombre de usuario ya está registrado.";
            return;
        }

        const nuevoUsuario = {
            nombre: nombre,
            correo: correo,
            usuario: usuario,
            contrasena: contrasena
        };

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);

        mensaje.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión.";
        formularioRegistro.reset();
    });
}

// Formulario de inicio de sesión.
const formularioLogin = document.querySelector("#form-login");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", function(event) {
        event.preventDefault();

        const correo = document.querySelector("#correo").value.trim().toLowerCase();
        const contrasena = document.querySelector("#contrasena").value;
        const mensaje = document.querySelector("#mensaje");

        const usuarios = obtenerUsuarios();

        const usuarioEncontrado = usuarios.find(function(persona) {
            return persona.correo === correo && persona.contrasena === contrasena;
        });

        if (!usuarioEncontrado) {
            mensaje.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        localStorage.setItem("usuarioActivo", JSON.stringify({
            nombre: usuarioEncontrado.nombre,
            correo: usuarioEncontrado.correo,
            usuario: usuarioEncontrado.usuario
        }));

        window.location.href = "perfil.html";
    });
}
