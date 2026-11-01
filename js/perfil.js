// Datos de demostración para mostrar cómo se verá el perfil.
// Después se podrán reemplazar por los datos reales del usuario.
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

// Sumamos los puntos de todas las entregas.
let totalPuntos = 0;

entregas.forEach(function(entrega) {
    totalPuntos = totalPuntos + entrega.puntos;
});

// Mostramos el total de puntos y la cantidad de entregas.
document.getElementById("total-puntos").textContent = totalPuntos;
document.getElementById("cantidad-entregas").textContent =
    entregas.length + (entregas.length === 1 ? " entrega" : " entregas");

// Creamos una tarjeta visual para cada entrega.
const listaEntregas = document.getElementById("lista-entregas");

entregas.forEach(function(entrega) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "entrega";

    tarjeta.innerHTML = `
        <div>
            <h3>${entrega.material}</h3>
            <p>${entrega.fecha}</p>
        </div>
        <span class="puntos-entrega">+${entrega.puntos} puntos</span>
    `;

    listaEntregas.appendChild(tarjeta);
});
