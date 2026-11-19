// Actualizar la navegación según el estado de sesión del usuario.
document.addEventListener("DOMContentLoaded", function () {
  let usuarioActivo = null;

  try {
    usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch (error) {
    localStorage.removeItem("usuarioActivo");
  }

  const navegaciones = document.querySelectorAll("header nav");

  navegaciones.forEach(function (nav) {
    if (nav.querySelector(".user-session")) return;

    // Sin sesión, se conservan los enlaces originales: Iniciar sesión y Crear cuenta.
    if (!usuarioActivo || !usuarioActivo.nombre || !usuarioActivo.correo) return;

    // Con sesión, se reemplazan los accesos de autenticación por el acceso al perfil.
    nav.querySelectorAll('a[href*="login.html"], a[href*="registro.html"], a[href*="#login-dialog"]')
      .forEach(function (link) {
        link.hidden = true;
      });

    const session = document.createElement("span");
    session.className = "user-session";

    const name = document.createElement("span");
    name.className = "user-session-name";
    name.textContent = "Hola, " + usuarioActivo.nombre;

    const profile = document.createElement("a");
    profile.className = "user-session-profile";
    profile.href = "perfil.html";
    profile.textContent = "Ver perfil";
    profile.setAttribute("aria-label", "Ver mi perfil");

    const logout = document.createElement("a");
    logout.className = "user-session-logout";
    logout.href = "login.html";
    logout.textContent = "Cerrar sesión";
    logout.addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("usuarioActivo");
      window.location.href = "index.html";
    });

    session.append(name, profile, logout);
    nav.appendChild(session);
  });
});
