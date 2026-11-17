
// Datos de demostración de las entregas del usuario

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

// Calcular los puntos acumulados
let totalPuntos = 0;

entregas.forEach(function(entrega) {
    totalPuntos += entrega.puntos;
});

// Mostrar el total de puntos en la página
const cantidadPuntos = document.querySelector(".cantidad");

if (cantidadPuntos) {
    cantidadPuntos.textContent = totalPuntos + " puntos";
}
