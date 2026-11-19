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
const list = document.getElementById("lista-entregas");
const historyMessage = document.getElementById("historial-message");
const editDialog = document.getElementById("editar-entrega-dialog");
const editForm = document.getElementById("editar-entrega-form");
const editCenter = document.getElementById("editar-centro");
const editMaterial = document.getElementById("editar-material");
const editError = document.getElementById("editar-error");
let editingDeliveryId = null;

if (!activeUser || !activeUser.correo) {
  window.location.replace("login.html");
} else {
  renderUserProfile(activeUser, readDeliveries());
  initializeEditForm();
}

function getUserDeliveries(allDeliveries) {
  const email = activeUser.correo.toLowerCase();
  return allDeliveries
    .filter((delivery) => delivery.ownerEmail &&
      delivery.ownerEmail.toLowerCase() === email)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function saveDeliveries(deliveries) {
  try {
    localStorage.setItem("entregasEcoPuntos", JSON.stringify(deliveries));
    return true;
  } catch {
    showHistoryMessage("No se pudieron guardar los cambios. Revisa el espacio disponible en el navegador.", "error");
    return false;
  }
}

function showHistoryMessage(message, type) {
  if (!historyMessage) return;
  historyMessage.textContent = message;
  historyMessage.className = "historial-message " + (type || "");
}

function renderUserProfile(user, allDeliveries) {
  const userDeliveries = getUserDeliveries(allDeliveries);

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

    detail.append(material, center, date);
    if (delivery.notes) {
      const notes = document.createElement("p");
      notes.textContent = "Observaciones: " + delivery.notes;
      detail.appendChild(notes);
    }

    const meta = document.createElement("div");
    meta.className = "entrega-meta";
    const quantity = document.createElement("strong");
    quantity.textContent = formatQuantity(Number(delivery.quantity || 0)) +
      " " + (delivery.unit === "kg" ? "kg" : "piezas");
    const label = document.createElement("span");
    label.textContent = "Cantidad entregada";
    meta.append(quantity, label);

    const actions = document.createElement("div");
    actions.className = "entrega-acciones";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "accion-editar";
    editButton.textContent = "Editar";
    editButton.setAttribute("aria-label", "Editar entrega de " + (delivery.material || "material"));
    editButton.addEventListener("click", () => openEditDialog(delivery));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "accion-eliminar";
    deleteButton.textContent = "Eliminar";
    deleteButton.setAttribute("aria-label", "Eliminar entrega de " + (delivery.material || "material"));
    deleteButton.addEventListener("click", () => deleteDelivery(delivery.id));

    actions.append(editButton, deleteButton);
    meta.appendChild(actions);
    article.append(detail, meta);
    list.appendChild(article);
  });
}

function initializeEditForm() {
  if (!editForm || !Array.isArray(centers)) return;

  centers.forEach((center) => {
    const option = document.createElement("option");
    option.value = center.id;
    option.textContent = center.name;
    editCenter.appendChild(option);
  });

  editCenter.addEventListener("change", () => populateEditMaterials(editCenter.value));
  document.getElementById("cancelar-edicion").addEventListener("click", closeEditDialog);
  document.getElementById("descartar-edicion").addEventListener("click", closeEditDialog);

  editDialog.addEventListener("click", (event) => {
    if (event.target === editDialog) closeEditDialog();
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    editError.textContent = "";

    if (!editForm.reportValidity()) return;

    const selectedCenter = centers.find((center) => center.id === editCenter.value);
    const materialKey = editMaterial.value;
    const quantity = Number(document.getElementById("editar-cantidad").value);
    const date = document.getElementById("editar-fecha").value;
    const today = getLocalToday();

    if (!selectedCenter || !selectedCenter.materials.includes(materialKey)) {
      editError.textContent = "Selecciona un material que reciba el centro elegido.";
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      editError.textContent = "La cantidad debe ser mayor que cero.";
      return;
    }
    if (date > today) {
      editError.textContent = "La fecha no puede ser posterior al día de hoy.";
      return;
    }

    const allDeliveries = readDeliveries();
    const index = allDeliveries.findIndex((delivery) =>
      delivery.id === editingDeliveryId &&
      delivery.ownerEmail &&
      delivery.ownerEmail.toLowerCase() === activeUser.correo.toLowerCase()
    );

    if (index === -1) {
      editError.textContent = "No se encontró esta entrega en tu cuenta. Actualiza la página e inténtalo de nuevo.";
      return;
    }

    const materialNames = {
      plastico: "Plástico",
      papel: "Papel",
      carton: "Cartón",
      vidrio: "Vidrio",
      metal: "Metal",
      electronicos: "Electrónicos"
    };

    allDeliveries[index] = {
      ...allDeliveries[index],
      center: selectedCenter.name,
      centerId: selectedCenter.id,
      material: materialNames[materialKey] || materialKey,
      materialKey,
      quantity,
      unit: document.getElementById("editar-unidad").value,
      date,
      notes: document.getElementById("editar-observaciones").value.trim(),
      updatedAt: new Date().toISOString()
    };

    if (!saveDeliveries(allDeliveries)) return;

    closeEditDialog();
    renderUserProfile(activeUser, allDeliveries);
    showHistoryMessage("Los cambios de tu entrega se guardaron correctamente.", "success");
  });
}

function populateEditMaterials(centerId, selectedMaterial) {
  const center = centers.find((item) => item.id === centerId);
  const labels = {
    plastico: "Plástico",
    papel: "Papel",
    carton: "Cartón",
    vidrio: "Vidrio",
    metal: "Metal",
    electronicos: "Electrónicos"
  };

  editMaterial.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = center ? "Selecciona un material" : "Primero selecciona un centro";
  editMaterial.appendChild(placeholder);

  if (!center) {
    editMaterial.disabled = true;
    return;
  }

  center.materials.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = labels[key] || key;
    editMaterial.appendChild(option);
  });
  editMaterial.disabled = false;

  if (selectedMaterial && center.materials.includes(selectedMaterial)) {
    editMaterial.value = selectedMaterial;
  }
}

function openEditDialog(delivery) {
  editingDeliveryId = delivery.id;
  editError.textContent = "";

  const matchingCenter = centers.find((center) =>
    center.id === delivery.centerId
  ) || centers.find((center) => center.name === delivery.center);

  editCenter.value = matchingCenter ? matchingCenter.id : "";
  populateEditMaterials(editCenter.value, delivery.materialKey || "");
  document.getElementById("editar-cantidad").value = delivery.quantity;
  document.getElementById("editar-unidad").value = delivery.unit || "kg";
  document.getElementById("editar-fecha").value = delivery.date || getLocalToday();
  document.getElementById("editar-fecha").max = getLocalToday();
  document.getElementById("editar-observaciones").value = delivery.notes || "";

  if (!matchingCenter) {
    editError.textContent = "El centro de este registro ya no está disponible. Selecciona uno nuevo.";
  }

  if (typeof editDialog.showModal === "function") editDialog.showModal();
}

function closeEditDialog() {
  if (editDialog.open) editDialog.close();
  editingDeliveryId = null;
  editError.textContent = "";
}

function deleteDelivery(deliveryId) {
  const allDeliveries = readDeliveries();
  const delivery = allDeliveries.find((item) =>
    item.id === deliveryId &&
    item.ownerEmail &&
    item.ownerEmail.toLowerCase() === activeUser.correo.toLowerCase()
  );

  if (!delivery) {
    showHistoryMessage("No se encontró esta entrega en tu cuenta.", "error");
    return;
  }

  const confirmed = window.confirm(
    "¿Seguro que quieres eliminar esta entrega de " +
    (delivery.material || "material") + "? Esta acción no se puede deshacer."
  );
  if (!confirmed) return;

  const updatedDeliveries = allDeliveries.filter((item) => item.id !== deliveryId);
  if (!saveDeliveries(updatedDeliveries)) return;

  renderUserProfile(activeUser, updatedDeliveries);
  showHistoryMessage("La entrega se eliminó correctamente de tu historial.", "success");
}

function getLocalToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];
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
