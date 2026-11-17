
const detailContainer = document.getElementById("center-detail");

// Obtener el ID del centro desde la URL.
const parameters = new URLSearchParams(window.location.search);
const centerId = parameters.get("id");

// Buscar el centro en los datos compartidos.
const selectedCenter = centers.find(
  (center) => center.id === centerId
);

// Mostrar los detalles del centro.
function showCenterDetails(center) {
  detailContainer.replaceChildren();

  const backLink = document.createElement("a");
  backLink.href = "centros.html";
  backLink.className = "back-link";
  backLink.textContent = "← Volver a centros";

  const card = document.createElement("article");
  card.className = "detail-card";

  const icon = document.createElement("p");
  icon.className = "detail-icon";
  icon.textContent = center.icon;
  icon.setAttribute("aria-hidden", "true");

  const title = document.createElement("h1");
  title.textContent = center.name;

  const location = document.createElement("p");
  location.className = "detail-location";
  location.textContent = "📍 " + center.location;

  const descriptionSection = document.createElement("section");
  descriptionSection.className = "detail-section";

  const descriptionTitle = document.createElement("h2");
  descriptionTitle.textContent = "Sobre este centro";

  const description = document.createElement("p");
  description.className = "detail-description";
  description.textContent = center.description;

  descriptionSection.append(
    descriptionTitle,
    description
  );

  const materialsSection = document.createElement("section");
  materialsSection.className = "detail-section";

  const materialsTitle = document.createElement("h2");
  materialsTitle.textContent = "Materiales que recibe";

  const materialsList = document.createElement("div");
  materialsList.className = "material-tags";

  center.materialText.split(", ").forEach((material) => {
    const tag = document.createElement("span");
    tag.className = "material-tag";
    tag.textContent = material;

    materialsList.appendChild(tag);
  });

  materialsSection.append(
    materialsTitle,
    materialsList
  );

  const actions = document.createElement("div");
  actions.className = "detail-actions";

  const materialsButton = document.createElement("a");
  materialsButton.href = "materiales.html";
  materialsButton.className = "detail-button";
  materialsButton.textContent =
    "Conocer materiales reciclables";

  const backButton = document.createElement("a");
  backButton.href = "centros.html";
  backButton.className = "detail-button secondary";
  backButton.textContent = "Volver al catálogo";

  actions.append(materialsButton, backButton);

  card.append(
    icon,
    title,
    location,
    descriptionSection,
    materialsSection,
    actions
  );

  detailContainer.append(backLink, card);
}

// Mostrar un mensaje si el centro no existe.
function showError() {
  detailContainer.replaceChildren();

  const message = document.createElement("div");
  message.className = "error-message";

  const title = document.createElement("h2");
  title.textContent = "Centro no encontrado";

  const description = document.createElement("p");
  description.textContent =
    "No pudimos encontrar la información de este centro. Regresa al catálogo para seleccionar uno.";

  const backButton = document.createElement("a");
  backButton.href = "centros.html";
  backButton.className = "detail-button";
  backButton.textContent = "Volver al catálogo";

  message.append(title, description, backButton);
  detailContainer.appendChild(message);
}

// Decidir qué mostrar.
if (selectedCenter) {
  showCenterDetails(selectedCenter);
} else {
  showError();
}
