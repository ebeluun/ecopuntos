// Catálogo visual, filtros y administración de centros de reciclaje.
const centersGrid = document.getElementById("centers-grid");
const searchInput = document.getElementById("search-centers");
const filterButtons = document.querySelectorAll(".filter-button");
const resultsMessage = document.getElementById("results-message");
const feedback = document.getElementById("centers-feedback");
const editDialog = document.getElementById("center-edit-dialog");
const editForm = document.getElementById("center-edit-form");
const editError = document.getElementById("center-edit-error");
let activeFilter = "todos";
let editingCenterId = null;

const materialLabels = {
  plastico: "Plástico",
  papel: "Papel",
  carton: "Cartón",
  vidrio: "Vidrio",
  metal: "Metal",
  electronicos: "Electrónicos"
};

function showCenters() {
  const searchText = searchInput.value.trim().toLocaleLowerCase("es");
  const filteredCenters = centers.filter((center) => {
    const matchesSearch = (center.name + " " + center.location)
      .toLocaleLowerCase("es").includes(searchText);
    const matchesMaterial = activeFilter === "todos" || center.materials.includes(activeFilter);
    return matchesSearch && matchesMaterial;
  });

  centersGrid.replaceChildren();

  if (filteredCenters.length === 0) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.textContent = "No se encontraron centros. Intenta con otra búsqueda.";
    centersGrid.appendChild(message);
  } else {
    filteredCenters.forEach((center) => {
      const card = document.createElement("article");
      card.className = "center-card";

      const title = document.createElement("h2");
      title.textContent = center.icon + " " + center.name;
      const location = document.createElement("p");
      location.className = "location";
      location.textContent = "📍 " + center.location;
      const materialsTitle = document.createElement("p");
      materialsTitle.className = "materials-title";
      materialsTitle.textContent = "♻️ Materiales que recibe:";
      const materials = document.createElement("p");
      materials.className = "materials-list";
      materials.textContent = center.materialText;

      const detailsButton = document.createElement("button");
      detailsButton.className = "details-button";
      detailsButton.type = "button";
      detailsButton.textContent = "Ver detalles";
      detailsButton.dataset.details = center.id;

      card.append(title, location, materialsTitle, materials, detailsButton);

      if (getActiveUser()) {
        const actions = document.createElement("div");
        actions.className = "center-card-actions";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "center-edit-button";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditDialog(center));
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "center-delete-button";
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", () => deleteCenter(center.id));
        actions.append(editButton, deleteButton);
        card.appendChild(actions);
      }

      centersGrid.appendChild(card);
    });
  }

  resultsMessage.textContent = filteredCenters.length === 1
    ? "1 centro encontrado" : filteredCenters.length + " centros encontrados";
}

function getActiveUser() {
  try {
    const user = JSON.parse(localStorage.getItem("usuarioActivo") || "null");
    return user && user.correo ? user : null;
  } catch {
    return null;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    showCenters();
  });
});

searchInput.addEventListener("input", showCenters);

centersGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-details]");
  if (!button) return;
  window.location.href = "detalle-centro.html?id=" + encodeURIComponent(button.dataset.details);
});

function openEditDialog(center) {
  if (!getActiveUser()) return;
  editingCenterId = center.id;
  editError.textContent = "";
  editForm.elements.name.value = center.name;
  editForm.elements.location.value = center.location;
  editForm.elements.icon.value = center.icon;
  editForm.elements.description.value = center.description || "";
  editForm.querySelectorAll('input[name="materials"]').forEach((checkbox) => {
    checkbox.checked = center.materials.includes(checkbox.value);
  });
  if (typeof editDialog.showModal === "function") editDialog.showModal();
}

function closeEditDialog() {
  if (editDialog.open) editDialog.close();
  editingCenterId = null;
  editError.textContent = "";
}

document.getElementById("close-center-dialog").addEventListener("click", closeEditDialog);
document.getElementById("cancel-center-edit").addEventListener("click", closeEditDialog);
editDialog.addEventListener("click", (event) => {
  if (event.target === editDialog) closeEditDialog();
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  editError.textContent = "";
  if (!getActiveUser()) {
    editError.textContent = "Inicia sesión para administrar los centros.";
    return;
  }
  if (!editForm.reportValidity()) return;

  const name = editForm.elements.name.value.trim();
  const location = editForm.elements.location.value.trim();
  const icon = editForm.elements.icon.value.trim();
  const description = editForm.elements.description.value.trim();
  const materials = Array.from(editForm.querySelectorAll('input[name="materials"]:checked'))
    .map((checkbox) => checkbox.value);

  if (materials.length === 0) {
    editError.textContent = "Selecciona al menos un material que reciba el centro.";
    return;
  }

  const duplicate = centers.some((center) =>
    center.id !== editingCenterId && center.name.toLocaleLowerCase("es") === name.toLocaleLowerCase("es")
  );
  if (duplicate) {
    editError.textContent = "Ya existe un centro con ese nombre.";
    return;
  }

  const updated = centers.map((center) => center.id === editingCenterId
    ? { ...center, name, location, icon, description,
        materials, materialText: materials.map((key) => materialLabels[key]).join(", ") }
    : center);

  if (!saveCenters(updated)) {
    editError.textContent = "No se pudieron guardar los cambios. Revisa el espacio disponible en el navegador.";
    return;
  }

  closeEditDialog();
  showCenters();
  showFeedback("Los datos del centro se actualizaron correctamente.", "success");
});

function deleteCenter(centerId) {
  if (!getActiveUser()) return;
  const center = centers.find((item) => item.id === centerId);
  if (!center) return;

  const confirmed = window.confirm(
    '¿Seguro que quieres eliminar "' + center.name +
    '" del catálogo? Los registros anteriores del historial de entregas no se eliminarán.'
  );
  if (!confirmed) return;

  const updated = centers.filter((item) => item.id !== centerId);
  if (!saveCenters(updated)) {
    showFeedback("No se pudo eliminar el centro. Revisa el espacio disponible en el navegador.", "error");
    return;
  }
  showCenters();
  showFeedback("El centro se eliminó correctamente del catálogo.", "success");
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = "centers-feedback " + type;
}

showCenters();
