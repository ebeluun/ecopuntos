// Registro de entregas asociado a la cuenta que inició sesión.
const deliveryForm = document.getElementById("delivery-form");
const centerSelect = document.getElementById("center");
const materialSelect = document.getElementById("material");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");
const confirmationDialog = document.getElementById("delivery-confirmation");
const closeConfirmationButton = document.getElementById("close-confirmation");

function getActiveUser() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch {
    return null;
  }
}

function getSavedDeliveries() {
  try {
    const saved = JSON.parse(localStorage.getItem("entregasEcoPuntos") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// El formulario requiere una sesión para poder asignar la entrega correctamente.
const activeUser = getActiveUser();
if (!activeUser || !activeUser.correo) {
  window.location.replace("login.html");
} else {
  initializeDeliveryForm();
}

const materialNames = {
  plastico: "Plástico",
  papel: "Papel",
  carton: "Cartón",
  vidrio: "Vidrio",
  metal: "Metal",
  electronicos: "Electrónicos"
};

function initializeDeliveryForm() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

  dateInput.value = localDate;
  dateInput.max = localDate;

  centers.forEach((center) => {
    const option = document.createElement("option");
    option.value = center.id;
    option.textContent = center.name;
    centerSelect.appendChild(option);
  });

  centerSelect.addEventListener("change", () => {
    const selectedCenter = centers.find((center) => center.id === centerSelect.value);
    materialSelect.replaceChildren();

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = selectedCenter
      ? "Selecciona un material"
      : "Primero selecciona un centro";
    materialSelect.appendChild(firstOption);

    if (!selectedCenter) {
      materialSelect.disabled = true;
      return;
    }

    selectedCenter.materials.forEach((material) => {
      const option = document.createElement("option");
      option.value = material;
      option.textContent = materialNames[material] || material;
      materialSelect.appendChild(option);
    });
    materialSelect.disabled = false;
  });

  closeConfirmationButton.addEventListener("click", () => confirmationDialog.close());
  confirmationDialog.addEventListener("click", (event) => {
    if (event.target === confirmationDialog) confirmationDialog.close();
  });

  deliveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!deliveryForm.checkValidity()) {
      deliveryForm.reportValidity();
      return;
    }

    const selectedCenter = centers.find((center) => center.id === centerSelect.value);
    if (!selectedCenter || !selectedCenter.materials.includes(materialSelect.value)) {
      formMessage.textContent = "Selecciona un material disponible en ese centro.";
      formMessage.className = "form-message error";
      return;
    }

    const delivery = {
      id: (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "entrega-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
      ownerEmail: activeUser.correo.toLowerCase(),
      center: selectedCenter.name,
      centerId: selectedCenter.id,
      material: materialNames[materialSelect.value],
      materialKey: materialSelect.value,
      quantity: Number(document.getElementById("quantity").value),
      unit: document.getElementById("unit").value,
      date: dateInput.value,
      notes: document.getElementById("notes").value.trim(),
      createdAt: new Date().toISOString()
    };

    const deliveries = getSavedDeliveries();
    deliveries.push(delivery);

    try {
      localStorage.setItem("entregasEcoPuntos", JSON.stringify(deliveries));
    } catch (error) {
      formMessage.textContent = "No se pudo guardar la entrega. Revisa el espacio disponible en el navegador.";
      formMessage.className = "form-message error";
      return;
    }

    formMessage.textContent = "Tu entrega se registró correctamente.";
    formMessage.className = "form-message success";
    showDeliveryConfirmation(delivery);

    deliveryForm.reset();
    dateInput.value = localDate;
    materialSelect.disabled = true;
    materialSelect.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Primero selecciona un centro";
    materialSelect.appendChild(placeholder);
  });
}

function showDeliveryConfirmation(delivery) {
  const formattedDate = new Date(delivery.date + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  });
  document.getElementById("confirm-center").textContent = delivery.center;
  document.getElementById("confirm-material").textContent = delivery.material;
  document.getElementById("confirm-quantity").textContent =
    delivery.quantity + " " + (delivery.unit === "kg" ? "kg" : "piezas");
  document.getElementById("confirm-date").textContent = formattedDate;
  document.getElementById("confirm-notes").textContent = delivery.notes || "Sin observaciones";
  if (typeof confirmationDialog.showModal === "function") confirmationDialog.showModal();
}
