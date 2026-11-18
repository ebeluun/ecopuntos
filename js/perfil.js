// Perfil e historial construidos con los registros reales de la cuenta activa.
function readActiveUser() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch {
    return null;
  }
}

function readDeliveries() {
  try {
    const records = JSON.parse(localStorage.getItem("entregasEcoPuntos") || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

const activeUser = readActiveUser();
if (!activeUser || !activeUser.correo) {
  window.location.replace("login.html");
} else {
  renderUserProfile(activeUser, readDeliveries());
}

function renderUserProfile(user, allDeliveries) {
  const email = user.correo.toLowerCase();
  const userDeliveries = allDeliveries
    .filter((delivery) => delivery.ownerEmail &&
      delivery.ownerEmail.toLowerCase() === email)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const nameElement = document.getElementById("nombre-perfil");
  if (nameElement) nameElement.textContent = "¡Hola, " + user.nombre + "!";

  const countElement = document.getElementById("total-entregas");
  const kgElement = document.getElementById("total-kilos");
  const piecesElement = document.getElementById("total-piezas");
  if (countElement) countElement.textContent = userDeliveries.length;

  const totalKg = userDeliveries
    .filter((item) => item.unit === "kg")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalPieces = userDeliveries
    .filter((item) => item.unit === "piezas")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (kgElement) kgElement.textContent = formatQuantity(totalKg) + " kg";
  if (piecesElement) piecesElement.textContent = formatQuantity(totalPieces);

  const list = document.getElementById("lista-entregas");
  list.replaceChildren();

  if (userDeliveries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sin-entregas";
    empty.textContent = "Todavía no tienes entregas registradas. ¡Registra tu primera entrega y aparecerá aquí!";
    list.appendChild(empty);
    return;
  }

  userDeliveries.forEach((delivery) => {
    const article = document.createElement("article");
    article.className = "entrega";

    const detail = document.createElement("div");
    detail.className = "entrega-detalle";

    const material = document.createElement("h3");
    material.textContent = delivery.material || "Material";

    const center = document.createElement("p");
    center.textContent = delivery.center || "Centro no especificado";

    const date = document.createElement("p");
    date.textContent = formatDate(delivery.date);

    if (delivery.notes) {
      const notes = document.createElement("p");
      notes.textContent = "Observaciones: " + delivery.notes;
      detail.append(material, center, date, notes);
    } else {
      detail.append(material, center, date);
    }

    const meta = document.createElement("div");
    meta.className = "entrega-meta";
    const quantity = document.createElement("strong");
    quantity.textContent = formatQuantity(Number(delivery.quantity || 0)) +
      " " + (delivery.unit === "kg" ? "kg" : "piezas");
    const label = document.createElement("span");
    label.textContent = "Cantidad entregada";
    meta.append(quantity, label);

    article.append(detail, meta);
    list.appendChild(article);
  });
}

function formatQuantity(value) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value) {
  if (!value) return "Fecha no especificada";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "Fecha no especificada";
  return date.toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  });
}

// Cerrar sesión desde el perfil.
const logoutButton = document.getElementById("cerrar-sesion");
if (logoutButton) {
  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("usuarioActivo");
    window.location.href = "login.html";
  });
}
