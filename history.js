// ===============================
// LOAD PREDICTION HISTORY
// ===============================

function loadHistory() {

  const historyList =
    document.getElementById("historyList");

  if (!historyList) return;

  const history = JSON.parse(
    localStorage.getItem("predictIQ_history") || "[]"
  );

  historyList.innerHTML = "";

  if (history.length === 0) {

    historyList.innerHTML = `
      <div class="empty-history">
        No saved predictions yet.
      </div>
    `;

    return;
  }


  history.slice().reverse().forEach(item => {

    const row =
      document.createElement("div");

    row.className = "history-row";

    row.innerHTML = `
      <span>${item.prediction}</span>
      <span>${item.actual !== null ? item.actual : "—"}</span>
      <span>${item.status}</span>
    `;

    historyList.appendChild(row);

  });

}


// ===============================
// MOBILE MENU
// ===============================

const menuButton =
  document.getElementById("menuBtn");

const navigation =
  document.querySelector(".navbar nav");

if (menuButton && navigation) {

  menuButton.addEventListener("click", () => {

    navigation.classList.toggle(
      "mobile-open"
    );

  });

}


// ===============================
// START
// ===============================

loadHistory();
