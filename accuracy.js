function calculateAccuracy() {

  const history = JSON.parse(
    localStorage.getItem("predictIQ_history") || "[]"
  );

  const completed =
    history.filter(item =>
      item.status === "Correct" ||
      item.status === "Incorrect"
    );

  const correct =
    completed.filter(
      item => item.status === "Correct"
    ).length;

  const incorrect =
    completed.filter(
      item => item.status === "Incorrect"
    ).length;

  const total = completed.length;


  const accuracy =
    total > 0
      ? (correct / total) * 100
      : 0;


  document.getElementById("totalChecked").textContent =
    total;

  document.getElementById("correctCount").textContent =
    correct;

  document.getElementById("incorrectCount").textContent =
    incorrect;


  const accuracyValue =
    document.getElementById("accuracyValue");

  const message =
    document.getElementById("accuracyMessage");


  if (total === 0) {

    accuracyValue.textContent = "—";

    message.textContent =
      "No completed predictions yet.";

  } else {

    accuracyValue.textContent =
      accuracy.toFixed(1) + "%";

    message.textContent =
      `${correct} correct out of ${total} completed predictions.`;

  }

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

calculateAccuracy();
