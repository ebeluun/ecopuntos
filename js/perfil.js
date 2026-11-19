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

  renderStatistics(userDeliveries);

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

// SCRUM-76: gráficas de barras con los materiales reciclados y las entregas por mes.
function renderStatistics(deliveries) {
  const materialsChart = document.getElementById("grafica-materiales");
  const monthsChart = document.getElementById("grafica-meses");
  if (!materialsChart || !monthsChart) return;

  // Agrupar por material: número de entregas, kilos y piezas.
  const byMaterial = {};
  deliveries.forEach((delivery) => {
    const name = delivery.material || "Otro";
    if (!byMaterial[name]) byMaterial[name] = { count: 0, kg: 0, pieces: 0 };
    byMaterial[name].count += 1;
    if (delivery.unit === "kg") byMaterial[name].kg += Number(delivery.quantity || 0);
    else byMaterial[name].pieces += Number(delivery.quantity || 0);
  });

  const materialRows = Object.entries(byMaterial)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, totals]) => {
      const amounts = [];
      if (totals.kg > 0) amounts.push(formatQuantity(totals.kg) + " kg");
      if (totals.pieces > 0) amounts.push(formatQuantity(totals.pieces) + " piezas");
      return {
        label: name,
        value: totals.count,
        text: totals.count + (totals.count === 1 ? " entrega" : " entregas") +
          (amounts.length ? " · " + amounts.join(" y ") : "")
      };
    });

  drawBars(materialsChart, materialRows,
    "Aún no hay materiales para mostrar. Registra una entrega para ver tu gráfica.");

  // Entregas de los últimos 6 meses, incluido el actual.
  const today = new Date();
  const monthRows = [];
  for (let offset = 5; offset >= 0; offset--) {
    const month = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const key = month.getFullYear() + "-" + String(month.getMonth() + 1).padStart(2, "0");
    const count = deliveries.filter((delivery) => (delivery.date || "").startsWith(key)).length;
    const monthName = month.toLocaleDateString("es-MX", { month: "short" }).replace(".", "");

    monthRows.push({
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1) + " " + month.getFullYear(),
      value: count,
      text: count + (count === 1 ? " entrega" : " entregas")
    });
  }

  const hasRecentDeliveries = monthRows.some((row) => row.value > 0);
  drawBars(monthsChart, hasRecentDeliveries ? monthRows : [],
    "No tienes entregas en los últimos 6 meses.");
}

// Dibujar una lista de barras horizontales; el ancho es proporcional al valor más alto.
function drawBars(container, rows, emptyText) {
  container.replaceChildren();

  if (rows.length === 0) {
    const empty = document.createElement("li");
    empty.className = "barra-vacia";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  const max = Math.max(...rows.map((row) => row.value), 1);

  rows.forEach((row) => {
    const item = document.createElement("li");
    item.className = "barra";

    const label = document.createElement("span");
    label.className = "barra-etiqueta";
    label.textContent = row.label;

    const track = document.createElement("span");
    track.className = "barra-pista";
    track.setAttribute("aria-hidden", "true");

    const fill = document.createElement("span");
    fill.className = "barra-relleno";
    // Un mínimo de 3% para que una barra con valor se vea; las de 0 quedan vacías.
    fill.style.width = row.value > 0 ? Math.max((row.value / max) * 100, 3) + "%" : "0";
    track.appendChild(fill);

    const value = document.createElement("span");
    value.className = "barra-valor";
    value.textContent = row.text;

    item.append(label, track, value);
    container.appendChild(item);
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
