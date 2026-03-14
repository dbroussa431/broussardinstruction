import "/training/js/app.js";
  state.filtered.forEach(student => {
    rows.push([
      student.firstName,
      student.lastName,
      student.email,
      student.course,
      student.priceTier,
      student.price,
      student.paymentMethod,
      student.paymentStatus,
      student.portalStatus,
      student.progressLabel,
      student.progressPercent,
      student.completionDate,
      student.certificateIssued ? "Yes" : "No",
      student.certificateDate || "",
      student.accessCode,
      student.notes || ""
    ]);
  });

  const csv = rows
    .map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bsa-portal-v2-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  [els.searchInput, els.paymentFilter, els.portalFilter, els.tierFilter, els.sortInput].forEach(el => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  els.clearFiltersBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    els.paymentFilter.value = "";
    els.portalFilter.value = "";
    els.tierFilter.value = "";
    els.sortInput.value = "newest";
    applyFilters();
  });

  [els.addStudentBtn, els.quickAddBtn].forEach(btn => btn.addEventListener("click", () => openModal()));
  [els.refreshBtn, els.reloadBtn].forEach(btn => btn.addEventListener("click", () => {
    loadStudents();
    renderMetrics();
    applyFilters();
    showNotice("info", "Records refreshed.");
  }));

  els.exportBtn.addEventListener("click", exportCSV);
  els.cancelStudentBtn.addEventListener("click", closeModal);
  els.studentModalBackdrop.addEventListener("click", event => {
    if (event.target === els.studentModalBackdrop) closeModal();
  });
  els.studentForm.addEventListener("submit", handleFormSubmit);
  els.priceTier.addEventListener("change", handlePriceTierChange);
  els.studentTableBody.addEventListener("click", handleRowActions);

  els.logoutBtn.addEventListener("click", () => {
    if (window.BSA && typeof window.BSA.logout === "function") {
      window.BSA.logout();
      return;
    }
    window.location.href = "/training/index.html";
  });
}

function init() {
  cacheEls();
  loadStudents();
  bindEvents();
  renderMetrics();
  applyFilters();
  hideNotice();
}

window.addEventListener("DOMContentLoaded", init);
