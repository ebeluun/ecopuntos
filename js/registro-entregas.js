// Registro de entregas conectado al catálogo de centros.
const deliveryForm = document.getElementById("delivery-form");
const centerSelect = document.getElementById("center");
const materialSelect = document.getElementById("material");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");

// Relacionar las claves del catálogo con los nombres que verá el usuario.
const materialNames = {
  plastico: "Plástico",
  papel: "Papel",
  carton: "Cartón",
  vidrio: "Vidrio",
  metal: "Metal",
  electronicos: "Electrónicos"
};

// Preparar la fecha actual y evitar fechas futuras.
const today = new Date();
const localDate = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.value = localDate;
dateInput.max = localDate;

// Cargar los centros directamente desde js/centros-data.js.
centers.forEach((center) => {
  const option = document.createElement("option");
  option.value = center.id;
  option.textContent = center.name;
  centerSelect.appendChild(option);
});

// Mostrar solamente los materiales que recibe el centro seleccionado.
centerSelect.addEventListener("change", () => {
  const selectedCenter = centers.find(
    (center) => center.id === centerSelect.value
  );

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

// Procesar el formulario.
deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!deliveryForm.checkValidity()) {
    deliveryForm.reportValidity();
    return;
  }

  const selectedCenter = centers.find(
    (center) => center.id === centerSelect.value
  );

  if (!selectedCenter || !selectedCenter.materials.includes(materialSelect.value)) {
    formMessage.textContent = "Selecciona un material disponible en ese centro.";
    formMessage.className = "form-message error";
    return;
  }

  const delivery = {
    center: selectedCenter.name,
    material: materialNames[materialSelect.value],
    quantity: Number(document.getElementById("quantity").value),
    unit: document.getElementById("unit").value,
    date: dateInput.value,
    notes: document.getElementById("notes").value.trim()
  };

  // Guardar el registro de demostración en el navegador.
  const deliveries = JSON.parse(localStorage.getItem("entregasEcoPuntos")) || [];
  deliveries.push(delivery);
  localStorage.setItem("entregasEcoPuntos", JSON.stringify(deliveries));

  formMessage.textContent =
    "¡Entrega registrada! Entregaste " +
    delivery.quantity + " " + delivery.unit + " de " +
    delivery.material + " en " + delivery.center + ".";

  formMessage.className = "form-message success";

  deliveryForm.reset();
  dateInput.value = localDate;
  materialSelect.disabled = true;
  materialSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Primero selecciona un centro";
  materialSelect.appendChild(placeholder);
});
