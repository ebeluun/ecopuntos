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
    if (!usuarioActivo || !usuarioActivo.nombre || !usuarioActivo.correo) return;
    if (nav.querySelector(".user-session")) return;

    // Ocultar los accesos de registro e inicio de sesión,
    // pero conservar el enlace de cerrar sesión si ya existe.
    nav.querySelectorAll('a[href*="login.html"], a[href*="registro.html"], a[href*="#login-dialog"]')
      .forEach(function (link) {
        const esCerrarSesion = link.id === "cerrar-sesion" ||
          link.textContent.trim().toLowerCase() === "cerrar sesión";

        if (esCerrarSesion) {
          link.classList.add("user-session-logout");
          link.addEventListener("click", cerrarSesion);
        } else {
          link.hidden = true;
        }
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

    session.append(name, profile);

    // Crear el enlace de salida solo si la página no tiene uno.
    if (!nav.querySelector(".user-session-logout")) {
      const logout = document.createElement("a");
      logout.className = "user-session-logout";
      logout.href = "index.html";
      logout.textContent = "Cerrar sesión";
      logout.addEventListener("click", cerrarSesion);
      session.appendChild(logout);
    }

    nav.appendChild(session);
  });

  function cerrarSesion(event) {
    event.preventDefault();
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  }
});
