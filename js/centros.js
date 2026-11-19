// Los datos de los centros vienen de js/centros-data.js (variable "centers").
const centersGrid = document.getElementById("centers-grid");
const searchInput = document.getElementById("search-centers");
const filterButtons = document.querySelectorAll(".filter-button");
const resultsMessage = document.getElementById("results-message");

let activeFilter = "todos";

// Mostrar los centros según la búsqueda y el filtro seleccionado.
function showCenters() {
  const searchText = searchInput.value.trim().toLocaleLowerCase("es");

  const filteredCenters = centers.filter((center) => {
    const matchesSearch = (center.name + " " + center.location)
      .toLocaleLowerCase("es")
      .includes(searchText);
    const matchesMaterial =
      activeFilter === "todos" || center.materials.includes(activeFilter);

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
      centersGrid.appendChild(card);
    });
  }

  resultsMessage.textContent =
    filteredCenters.length === 1
      ? "1 centro encontrado"
      : filteredCenters.length + " centros encontrados";
}

// Activar los filtros de materiales.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    showCenters();
  });
});

// Actualizar resultados al escribir.
searchInput.addEventListener("input", showCenters);

// Abrir la página de detalle del centro seleccionado.
centersGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-details]");
  if (!button) return;

  window.location.href =
    "detalle-centro.html?id=" + encodeURIComponent(button.dataset.details);
});

// SCRUM-82: volver a mostrar el catálogo si el administrador cambió los centros.
document.addEventListener("centros-actualizados", showCenters);

// Mostrar los centros al cargar la página.
showCenters();
