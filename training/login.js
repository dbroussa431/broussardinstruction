(async function () {
  try {
    const app = await import('../app.js');
    const { login, getCurrentStudent } = app;

    // 🔒 EXISTING SESSION CHECK (CLEAN + CONTROLLED)
    const current = getCurrentStudent();
    if (current && current.accessCode && current.status === 'active') {
      if (sessionStorage.getItem("bsaConfirmed") === "true") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "confirmation.html";
      }
      return;
    }

    const form = document.getElementById('loginForm') || document.querySelector('form');
    const accessCode = document.getElementById('accessCode') ||
      document.querySelector('input[type="text"], input[type="password"], input[name="accessCode"]');

    const loginBtn = document.getElementById('loginBtn') ||
      document.querySelector('button[type="submit"], input[type="submit"]');

    const loginMsg = document.getElementById('loginMsg') ||
      document.getElementById('message');

    function showMessage(message) {
      if (loginMsg) {
        loginMsg.textContent = message;
        loginMsg.style.display = 'block';
      } else {
        alert(message);
      }
    }

    function setLoading(isLoading) {
      if (!loginBtn) return;
      loginBtn.disabled = isLoading;

      if ('textContent' in loginBtn) {
        loginBtn.textContent = isLoading ? 'Checking Code...' : 'Enter';
      }
    }

    if (!form || !accessCode) return;

    // 🚀 LOGIN SUBMIT HANDLER (CLEAN + SINGLE FLOW)
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      setLoading(true);

      const result = await login(accessCode.value);

      if (result.ok) {
        // 🔑 CORE PHILOSOPHY GATE
        if (sessionStorage.getItem("bsaConfirmed") === "true") {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "confirmation.html";
        }
        return;
      }

      // ❌ FAILURE PATH
      showMessage(result.message || 'Login failed.');
      setLoading(false);
    });

  } catch (error) {
    console.error('Compatibility login bootstrap failed:', error);
  }
})();
