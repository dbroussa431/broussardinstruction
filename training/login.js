(async function () {
  try {
    const app = await import('../app.js');
    const { login, getCurrentStudent } = app;

    const current = getCurrentStudent();
    if (current && current.accessCode && current.status === 'active') {
      if (sessionStorage.getItem("bsaConfirmed") === "true") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "confirmation.html";
      }
      return;
    }

    const form = document.getElementById('loginForm');
    const accessCode = document.getElementById('accessCode');
    const loginBtn = document.getElementById('loginBtn');
    const loginMsg = document.getElementById('loginMsg');

    function showMessage(message) {
      loginMsg.textContent = message;
      loginMsg.classList.remove("hidden");
    }

    function setLoading(isLoading) {
      loginBtn.disabled = isLoading;
      loginBtn.textContent = isLoading ? 'Checking Code...' : 'Enter Student Portal';
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      setLoading(true);

      const result = await login(accessCode.value);

      if (result.ok) {
        if (sessionStorage.getItem("bsaConfirmed") === "true") {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "confirmation.html";
        }
        return;
      }

      showMessage(result.message || 'Login failed.');
      setLoading(false);
    });

  } catch (error) {
    console.error('Login failed:', error);
  }
})();
