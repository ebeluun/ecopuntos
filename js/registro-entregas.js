
// Registro de entregas - EcoPuntos

const deliveryForm = document.getElementById("delivery-form");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");

// Obtener al usuario que inició sesión.
const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

// Establecer la fecha actual como valor inicial.
const today = new Date();
const localDate = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.value = localDate;
dateInput.max = localDate;

// Obtener las entregas guardadas.
function obtenerEntregas() {
  return JSON.parse(localStorage.getItem("entregasEcoPuntos")) || [];
}

// Guardar las entregas.
function guardarEntregas(entregas) {
  localStorage.setItem("entregasEcoPuntos", JSON.stringify(entregas));
}

// Procesar el formulario.
deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!deliveryForm.checkValidity()) {
    deliveryForm.reportValidity();
    return;
  }

  // Verificar que exista un usuario con sesión iniciada.
  if (!usuarioActivo || !usuarioActivo.correo) {
    formMessage.textContent =
      "Debes iniciar sesión para registrar una entrega.";
    formMessage.className = "form-message error";
    return;
  }

  // Obtener los datos del formulario.
  const center = document.getElementById("center").value;
  const material = document.getElementById("material").value;
  const quantity = Number(document.getElementById("quantity").value);
  const unit = document.getElementById("unit").value;
  const date = dateInput.value;
  const notes = document.getElementById("notes").value.trim();

  // Crear el registro de la entrega.
  const nuevaEntrega = {
    id: Date.now(),
    correoUsuario: usuarioActivo.correo,
    center: center,
    material: material,
    quantity: quantity,
    unit: unit,
    date: date,
    notes: notes
  };

  // Agregar la entrega a las que ya están guardadas.
  const entregas = obtenerEntregas();
  entregas.push(nuevaEntrega);

  // Guardar todas las entregas.
  guardarEntregas(entregas);

  // Mostrar mensaje de confirmación.
  formMessage.textContent =
    `¡Entrega registrada correctamente! Entregaste ${quantity} ${unit} de ${material} en ${center}.`;

  formMessage.className = "form-message success";

  // Limpiar el formulario.
  deliveryForm.reset();

  // Restablecer la fecha actual.
  dateInput.value = localDate;
});
