// Obtener los datos del usuario que inició sesión.
const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

// Mostrar el nombre del usuario en el perfil.
const nombrePerfil = document.getElementById("nombre-perfil");

if (usuarioActivo && nombrePerfil) {
    nombrePerfil.textContent = "¡Hola, " + usuarioActivo.nombre + "!";
} else if (nombrePerfil) {
    nombrePerfil.textContent = "¡Hola, Usuario!";
}

// Cerrar la sesión del usuario.
const botonCerrarSesion = document.getElementById("cerrar-sesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.removeItem("usuarioActivo");
        window.location.href = "login.html";
    });
}

// Datos de demostración de las entregas.
const entregas = [
    {
        material: "Plástico",
        fecha: "12 de octubre de 2026",
        puntos: 100
    },
    {
        material: "Cartón",
        fecha: "18 de octubre de 2026",
        puntos: 150
    },
    {
        material: "Aluminio",
        fecha: "24 de octubre de 2026",
        puntos: 100
    }
];

// Calcular los puntos acumulados.
let totalPuntos = 0;

entregas.forEach(function(entrega) {
    totalPuntos += entrega.puntos;
});

// Mostrar los puntos en el perfil.
const cantidadPuntos = document.querySelector(".cantidad");

if (cantidadPuntos) {
    cantidadPuntos.textContent = totalPuntos + " puntos";
}
