
// Historial de entregas - EcoPuntos

// Obtener al usuario que inició sesión.
const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

// Obtener los elementos de la página.
const listaEntregas = document.getElementById("lista-entregas");
const buscadorEntregas = document.getElementById("buscador-entregas");
const totalEntregas = document.getElementById("total-entregas");
const mensajeVacio = document.getElementById("mensaje-vacio");
const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");

// Obtener todas las entregas guardadas.
const entregasGuardadas =
  JSON.parse(localStorage.getItem("entregasEcoPuntos")) || [];

// Mostrar solamente las entregas del usuario activo.
const entregasUsuario = usuarioActivo
  ? entregasGuardadas.filter(
      (entrega) => entrega.correoUsuario === usuarioActivo.correo
    )
  : [];

// Formatear la fecha.
function formatearFecha(fecha) {
  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Mostrar las entregas.
function mostrarEntregas(entregas) {
  listaEntregas.innerHTML = "";

  totalEntregas.textContent =
    `${entregas.length} ${entregas.length === 1 ? "entrega registrada" : "entregas registradas"}`;

  if (entregasUsuario.length === 0) {
    mensajeVacio.hidden = false;
    mensajeSinResultados.hidden = true;
    return;
  }

  mensajeVacio.hidden = true;

  if (entregas.length === 0) {
    mensajeSinResultados.hidden = false;
    return;
  }

  mensajeSinResultados.hidden = true;

  entregas.forEach((entrega) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "delivery-item";

    const informacion = document.createElement("div");
    informacion.className = "delivery-info";

    const titulo = document.createElement("h3");
    titulo.textContent = entrega.material;

    const centro = document.createElement("p");
    centro.textContent = `Centro: ${entrega.center}`;

    const fecha = document.createElement("p");
    fecha.textContent = `Fecha: ${formatearFecha(entrega.date)}`;

    informacion.appendChild(titulo);
    informacion.appendChild(centro);
    informacion.appendChild(fecha);

    if (entrega.notes) {
      const observaciones = document.createElement("p");
      observaciones.textContent = `Observaciones: ${entrega.notes}`;
      informacion.appendChild(observaciones);
    }

    const cantidad = document.createElement("div");
    cantidad.className = "delivery-quantity";
    cantidad.textContent = `${entrega.quantity} ${entrega.unit}`;

    tarjeta.appendChild(informacion);
    tarjeta.appendChild(cantidad);

    listaEntregas.appendChild(tarjeta);
  });
}

// Buscar entregas por material, centro o fecha.
buscadorEntregas.addEventListener("input", () => {
  const busqueda = buscadorEntregas.value.toLowerCase().trim();

  const resultados = entregasUsuario.filter((entrega) => {
    const datos = [
      entrega.material,
      entrega.center,
      entrega.date,
      entrega.quantity,
      entrega.unit,
      entrega.notes
    ];

    return datos.some((dato) =>
      String(dato || "").toLowerCase().includes(busqueda)
    );
  });

  mostrarEntregas(resultados);
});

// Mostrar las entregas al abrir la página.
mostrarEntregas(entregasUsuario);
