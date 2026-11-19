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

const usuarioActivo = leerDato("usuarioActivo", null);

if (!usuarioActivo || !usuarioActivo.correo) {
  window.location.replace("login.html");
}

const listaEntregas = document.getElementById("lista-entregas");
const buscadorEntregas = document.getElementById("buscador-entregas");
const totalEntregas = document.getElementById("total-entregas");
const mensajeVacio = document.getElementById("mensaje-vacio");
const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");

const entregasGuardadas = leerDato("entregasEcoPuntos", []);
const correoActivo = usuarioActivo && usuarioActivo.correo
  ? usuarioActivo.correo.toLowerCase()
  : "";

const entregasUsuario = (Array.isArray(entregasGuardadas) ? entregasGuardadas : [])
  .filter((entrega) => (entrega.ownerEmail || "").toLowerCase() === correoActivo)
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";
  const partes = fecha.split("-");
  if (partes.length !== 3) return "Sin fecha";
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Mostrar cada entrega en su propia tarjeta.
function mostrarEntregas(entregas) {
  listaEntregas.replaceChildren();

  totalEntregas.textContent =
    entregas.length + (entregas.length === 1 ? " entrega registrada" : " entregas registradas");

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

    const encabezado = document.createElement("div");
    encabezado.className = "delivery-card-heading";

    const material = document.createElement("h3");
    material.textContent = entrega.material || "Material no especificado";

    const fecha = document.createElement("time");
    fecha.className = "delivery-date";
    fecha.textContent = formatearFecha(entrega.date);
    if (entrega.date) fecha.dateTime = entrega.date;

    encabezado.append(material, fecha);

    const centro = document.createElement("p");
    centro.className = "delivery-center";
    centro.textContent = "Centro: " + (entrega.center || "No especificado");

    const cantidad = document.createElement("p");
    cantidad.className = "delivery-quantity";
    cantidad.textContent = Number(entrega.quantity || 0) + " " +
      (entrega.unit === "kg" ? "kg" : "piezas");

    tarjeta.append(encabezado, centro);

    if (entrega.notes) {
      const observaciones = document.createElement("p");
      observaciones.className = "delivery-notes";
      observaciones.textContent = "Observaciones: " + entrega.notes;
      tarjeta.appendChild(observaciones);
    }

    tarjeta.appendChild(cantidad);
    listaEntregas.appendChild(tarjeta);
  });
}

// La búsqueda actual permite localizar por material, centro, fecha o cantidad.
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

mostrarEntregas(entregasUsuario);
