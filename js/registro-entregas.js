
// Registro de entregas - EcoPuntos

const deliveryForm = document.getElementById("delivery-form");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");

// Establecer la fecha actual como valor inicial.
const today = new Date();
const localDate = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.value = localDate;
dateInput.max = localDate;

// Procesar el formulario.
deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!deliveryForm.checkValidity()) {
    deliveryForm.reportValidity();
    return;
  }

  const center = document.getElementById("center").value;
  const material = document.getElementById("material").value;
  const quantity = document.getElementById("quantity").value;
  const unit = document.getElementById("unit").value;

  // SCRUM-67: guardar la entrega a nombre del usuario que inició sesión.
  const activeUser = obtenerUsuarioActivo();

  if (!activeUser) {
    window.location.href = "login.html?volver=registro-entregas.html";
    return;
  }

  guardarEntrega({
    usuario: activeUser.correo,
    centro: center,
    material: material,
    cantidad: Number(quantity),
    unidad: unit,
    fecha: dateInput.value,
    notas: document.getElementById("notes").value.trim()
  });

  formMessage.textContent =
    `¡Entrega registrada correctamente! Entregaste ${quantity} ${unit} de ${material} en ${center}.`;

  formMessage.className = "form-message success";

  deliveryForm.reset();

  // Restablecer la fecha después de limpiar el formulario.
  dateInput.value = localDate;
});
