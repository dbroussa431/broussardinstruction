
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var pageHasModernForm = !!document.getElementById("loginForm");
    var input = document.getElementById("accessCode") || document.querySelector('input[type="text"], input[type="email"], input');
    var button = document.getElementById("loginBtn") || document.querySelector('button, input[type="submit"]');

    if (!input || !button) {
      if (!pageHasModernForm) window.location.href = "login.html";
      return;
    }

    function showMessage(message) {
      var node = document.getElementById("loginMsg");
      if (!node) {
        node = document.createElement("p");
        node.id = "loginMsg";
        node.style.color = "#ffb8b8";
        node.style.marginTop = "12px";
        (button.parentNode || document.body).appendChild(node);
      }
      node.textContent = message;
      node.classList.remove("hidden");
    }

    function handleLogin(evt) {
      if (evt) evt.preventDefault();
      button.disabled = true;
      var original = button.textContent || button.value || "Enter";
      if (button.textContent !== undefined) button.textContent = "Checking Code...";
      if (button.value !== undefined) button.value = "Checking Code...";

      import("../app.js").then(function (mod) {
        return mod.login(input.value);
      }).then(function (result) {
        if (!result.ok) {
          showMessage(result.message || "Unable to log in.");
          button.disabled = false;
          if (button.textContent !== undefined) button.textContent = original;
          if (button.value !== undefined) button.value = original;
          return;
        }
        window.location.href = "dashboard.html";
      }).catch(function (error) {
        console.error(error);
        showMessage("Login failed. Please try again.");
        button.disabled = false;
        if (button.textContent !== undefined) button.textContent = original;
        if (button.value !== undefined) button.value = original;
      });
    }

    var form = document.getElementById("loginForm") || button.closest("form");
    if (form) form.addEventListener("submit", handleLogin);
    button.addEventListener("click", handleLogin);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") handleLogin(event);
    });
  });
})();
