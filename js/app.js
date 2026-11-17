// Interacciones de la página principal de EcoPuntos.

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    if (dialog) dialog.close();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

// Este formulario es demostrativo: no existe todavía un sistema de autenticación.
const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("login-message");
    if (message) {
      message.textContent = "Formulario de demostración: tus datos no se enviaron ni se guardaron. El acceso real se habilitará al conectar el sistema de cuentas.";
    }
  });
}

// Abre el cuadro de inicio de sesión si otra página enlaza a #login-dialog.
if (window.location.hash === "#login-dialog") {
  const loginDialog = document.getElementById("login-dialog");
  if (loginDialog && typeof loginDialog.showModal === "function") {
    loginDialog.showModal();
  }
}
