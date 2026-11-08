// Interacciones de la página de bienvenida de EcoPuntos.

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialogId = button.dataset.openDialog;
    const dialog = document.getElementById(dialogId);

    if (dialog) {
      dialog.showModal();
    }
  });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog").close();
  });
});

// Cierra las ventanas al hacer clic fuera de su contenido.
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
});

// El formulario es una demostración visual; todavía no inicia sesión.
const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("login-message");
    message.textContent = "¡Gracias! El inicio de sesión se conectará cuando esté listo el backend.";
  });
}
