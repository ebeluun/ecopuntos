// Panel de administración de demostración: utiliza los datos guardados en este navegador.
const materialLabels = {
  plastico: "Plástico", papel: "Papel", carton: "Cartón",
  vidrio: "Vidrio", metal: "Metal", electronicos: "Electrónicos"
};

const centerTable = document.getElementById("centers-table");
const deliveryTable = document.getElementById("deliveries-table");
const usersGrid = document.getElementById("users-grid");
const centerDialog = document.getElementById("center-dialog");
const centerForm = document.getElementById("center-form");
let editingCenterId = null;

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderDashboard() {
  const centersList = obtenerTodosLosCentros();
  const deliveries = readList("entregasEcoPuntos");
  const users = readList("usuariosEcoPuntos");
  document.getElementById("stat-centers").textContent = centersList.length;
  document.getElementById("stat-active-centers").textContent =
    centersList.filter((center) => center.active !== false).length + " activos";
  document.getElementById("stat-deliveries").textContent = deliveries.length;
  document.getElementById("stat-users").textContent = users.length;
  document.getElementById("stat-materials").textContent = Object.keys(materialLabels).length;
  renderCenters(centersList);
  renderDeliveries(deliveries, users);
  renderUsers(users);
}

function renderCenters(list) {
  centerTable.innerHTML = "";
  document.getElementById("center-count").textContent = list.length + (list.length === 1 ? " centro" : " centros");
  document.getElementById("centers-empty").hidden = list.length > 0;
  list.forEach((center) => {
    const row = document.createElement("tr");
    const materials = (center.materials || []).map((key) =>
      '<span class="chip">' + escapeHtml(materialLabels[key] || key) + '</span>'
    ).join("");
    row.innerHTML =
      '<td><span class="center-name">' + escapeHtml(center.name) + '</span><span class="center-sub">' + escapeHtml(center.id) + '</span></td>' +
      '<td>' + escapeHtml(center.location) + '</td>' +
      '<td>' + escapeHtml(center.address || "Sin dirección registrada") + '</td>' +
      '<td>' + escapeHtml(center.schedule || "Sin horario registrado") + '</td>' +
      '<td><div class="material-chips">' + (materials || '<span class="chip">Sin materiales</span>') + '</div></td>' +
      '<td><span class="state ' + (center.active === false ? "inactive" : "active") + '">' +
      (center.active === false ? "Inactivo" : "Activo") + '</span></td>' +
      '<td><button class="action-button" type="button" data-edit="' + escapeHtml(center.id) + '">Editar</button>' +
      '<button class="action-button" type="button" data-toggle="' + escapeHtml(center.id) + '">' +
      (center.active === false ? "Activar" : "Desactivar") + '</button></td>';
    centerTable.appendChild(row);
  });
}

function renderDeliveries(deliveries, users) {
  deliveryTable.innerHTML = "";
  const recent = deliveries.slice().reverse().slice(0, 8);
  document.getElementById("deliveries-empty").hidden = recent.length > 0;
  recent.forEach((delivery) => {
    const user = users.find((person) => person.correo === delivery.ownerEmail);
    const row = document.createElement("tr");
    const date = delivery.date
      ? new Date(delivery.date + "T00:00:00").toLocaleDateString("es-MX")
      : "Sin fecha";
    row.innerHTML =
      '<td>' + escapeHtml(user ? user.nombre : delivery.ownerEmail || "Usuario") + '</td>' +
      '<td>' + escapeHtml(delivery.center) + '</td>' +
      '<td>' + escapeHtml(delivery.material) + '</td>' +
      '<td>' + escapeHtml(delivery.quantity) + " " + escapeHtml(delivery.unit === "kg" ? "kg" : "piezas") + '</td>' +
      '<td>' + escapeHtml(date) + '</td>';
    deliveryTable.appendChild(row);
  });
}

function renderUsers(users) {
  usersGrid.innerHTML = "";
  document.getElementById("users-empty").hidden = users.length > 0;
  users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "user-card";
    const initial = (user.nombre || user.usuario || "U").trim().charAt(0).toUpperCase();
    card.innerHTML = '<div class="user-avatar">' + escapeHtml(initial) + '</div><div><strong>' +
      escapeHtml(user.nombre || user.usuario || "Usuario") + '</strong><small>' +
      escapeHtml(user.correo) + '</small></div>';
    usersGrid.appendChild(card);
  });
}

function resetCenterForm() {
  centerForm.reset();
  editingCenterId = null;
  document.getElementById("dialog-title").textContent = "Agregar centro";
  document.getElementById("save-center").textContent = "Guardar centro";
  document.getElementById("center-form-message").textContent = "";
}

document.getElementById("open-center-form").addEventListener("click", () => {
  resetCenterForm();
  centerDialog.showModal();
});

document.getElementById("close-center-form").addEventListener("click", () => centerDialog.close());
document.getElementById("cancel-center-form").addEventListener("click", () => centerDialog.close());

centerTable.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const toggleButton = event.target.closest("[data-toggle]");
  const centersList = obtenerTodosLosCentros();

  if (editButton) {
    const center = centersList.find((item) => item.id === editButton.dataset.edit);
    if (!center) return;
    resetCenterForm();
    editingCenterId = center.id;
    document.getElementById("dialog-title").textContent = "Editar centro";
    document.getElementById("save-center").textContent = "Guardar cambios";
    document.getElementById("center-name").value = center.name || "";
    document.getElementById("center-location").value = center.location || "";
    document.getElementById("center-address").value = center.address || "";
    document.getElementById("center-schedule").value = center.schedule || "";
    document.getElementById("center-description").value = center.description || "";
    centerForm.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = (center.materials || []).includes(checkbox.value);
    });
    centerDialog.showModal();
  }

  if (toggleButton) {
    const center = centersList.find((item) => item.id === toggleButton.dataset.toggle);
    if (!center) return;
    center.active = center.active === false;
    guardarCentros(centersList);
    renderDashboard();
  }
});

centerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("center-name").value.trim();
  const location = document.getElementById("center-location").value.trim();
  const materials = Array.from(centerForm.querySelectorAll('input[type="checkbox"]:checked'))
    .map((checkbox) => checkbox.value);
  const message = document.getElementById("center-form-message");

  if (!name || !location) {
    message.textContent = "Completa el nombre y la ubicación.";
    return;
  }
  if (materials.length === 0) {
    message.textContent = "Selecciona al menos un material.";
    return;
  }

  const list = obtenerTodosLosCentros();
  const data = {
    id: editingCenterId || "centro-" + Date.now(),
    name,
    icon: "♻️",
    location,
    address: document.getElementById("center-address").value.trim(),
    schedule: document.getElementById("center-schedule").value.trim(),
    materials,
    materialText: materials.map((key) => materialLabels[key] || key).join(", "),
    description: document.getElementById("center-description").value.trim(),
    active: true
  };

  if (editingCenterId) {
    const index = list.findIndex((center) => center.id === editingCenterId);
    if (index !== -1) data.active = list[index].active !== false, list[index] = data;
  } else {
    list.push(data);
  }

  guardarCentros(list);
  centerDialog.close();
  resetCenterForm();
  renderDashboard();
});

document.getElementById("center-search").addEventListener("input", (event) => {
  const term = event.target.value.trim().toLowerCase();
  const filtered = obtenerTodosLosCentros().filter((center) =>
    (center.name + " " + center.location).toLowerCase().includes(term)
  );
  renderCenters(filtered);
});

window.addEventListener("storage", (event) => {
  if (["centrosEcoPuntos", "entregasEcoPuntos", "usuariosEcoPuntos"].includes(event.key)) {
    renderDashboard();
  }
});

renderDashboard();
