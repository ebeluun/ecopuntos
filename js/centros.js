const centers = [
  {
    id: "centro-verde",
    name: "Centro Verde",
    icon: "🌱",
    location: "Monterrey, Nuevo Leon",
    materials: ["plastico", "papel", "carton"],
    materialText: "Plastico, Papel y Carton",
    description: "Centro de ejemplo para recibir plastico, papel y carton."
  },
  {
    id: "ecorecicla",
    name: "EcoRecicla",
    icon: "♻️",
    location: "San Nicolas, Nuevo Leon",
    materials: ["vidrio", "metal", "plastico"],
    materialText: "Vidrio, Metal y Plastico",
    description: "Centro de ejemplo para recibir vidrio, metal y plastico."
  },
  {
    id: "punto-limpio",
    name: "Punto Limpio",
    icon: "🌎",
    location: "Guadalupe, Nuevo Leon",
    materials: ["papel", "carton", "electronicos"],
    materialText: "Papel, Carton y Electronicos",
    description: "Centro de ejemplo para recibir papel, carton y residuos electronicos."
  }
];

const centersGrid = document.getElementById("centers-grid");
const searchInput = document.getElementById("search-centers");
const filterButtons = document.querySelectorAll(".filter-button");
const resultsMessage = document.getElementById("results-message");
const detailsDialog = document.getElementById("details-dialog");
const detailsContent = document.getElementById("details-content");
let activeFilter = "todos";

function showCenters() {
  const searchText = searchInput.value.trim().toLocaleLowerCase("es");

  const filteredCenters = centers.filter((center) => {
    const matchesSearch = (center.name + " " + center.location)
      .toLocaleLowerCase("es")
      .includes(searchText);
    const matchesMaterial = activeFilter === "todos" ||
      center.materials.includes(activeFilter);

    return matchesSearch && matchesMaterial;
  });

  centersGrid.replaceChildren();

  if (filteredCenters.length === 0) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.textContent = "No se encontraron centros. Intenta con otra busqueda.";
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

  resultsMessage.textContent = filteredCenters.length === 1
    ? "1 centro encontrado"
    : filteredCenters.length + " centros encontrados";
}

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

searchInput.addEventListener("input", showCenters);

centersGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-details]");
  if (!button) return;

  const center = centers.find((item) => item.id === button.dataset.details);
  if (!center) return;

  detailsContent.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = center.icon + " " + center.name;

  const location = document.createElement("p");
  location.textContent = "📍 " + center.location;

  const materials = document.createElement("p");
  materials.textContent = "Materiales que recibe: " + center.materialText;

  const description = document.createElement("p");
  description.textContent = center.description;

  detailsContent.append(title, location, materials, description);
  detailsDialog.showModal();
});

detailsDialog.querySelector(".dialog-close").addEventListener("click", () => {
  detailsDialog.close();
});

detailsDialog.addEventListener("click", (event) => {
  if (event.target === detailsDialog) detailsDialog.close();
});

showCenters();
