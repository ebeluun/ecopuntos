
// Historial de entregas - EcoPuntos

// Leer un dato de localStorage sin romper la página si está dañado.
function leerDato(clave, valorPorDefecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor === null ? valorPorDefecto : valor;
  } catch {
    return valorPorDefecto;
  }
}

// Obtener al usuario que inició sesión.
const usuarioActivo = leerDato("usuarioActivo", null);

// Sin sesión no hay historial que mostrar: enviar al inicio de sesión.
if (!usuarioActivo || !usuarioActivo.correo) {
  window.location.replace("login.html");
}

// Obtener los elementos de la página.
const listaEntregas = document.getElementById("lista-entregas");
const buscadorEntregas = document.getElementById("buscador-entregas");
const totalEntregas = document.getElementById("total-entregas");
const mensajeVacio = document.getElementById("mensaje-vacio");
const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");

// Obtener todas las entregas guardadas.
const entregasGuardadas = leerDato("entregasEcoPuntos", []);

// Mostrar solamente las entregas del usuario activo, de la más reciente a la más antigua.
// El formulario de registro (main) guarda el dueño de cada entrega en "ownerEmail".
const correoActivo = usuarioActivo && usuarioActivo.correo
  ? usuarioActivo.correo.toLowerCase()
  : "";

const entregasUsuario = (Array.isArray(entregasGuardadas) ? entregasGuardadas : [])
  .filter((entrega) => (entrega.ownerEmail || "").toLowerCase() === correoActivo)
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

// Formatear la fecha: 2026-11-18 -> 18/11/2026.
function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";
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

// Buscar entregas por material, centro o fecha (como 18/11/2026 o 2026-11-18).
buscadorEntregas.addEventListener("input", () => {
  const busqueda = buscadorEntregas.value.toLowerCase().trim();

  const resultados = entregasUsuario.filter((entrega) => {
    const datos = [
      entrega.material,
      entrega.center,
      entrega.date,
      formatearFecha(entrega.date),
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
