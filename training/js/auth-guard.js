const isLoggedIn = sessionStorage.getItem("bsaLoggedIn") === "true";
const studentId = sessionStorage.getItem("bsaStudentId");
const accessCode = sessionStorage.getItem("bsaAccessCode");

if (!isLoggedIn || !studentId || !accessCode) {
  window.location.href = "index.html";
}
