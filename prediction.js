let results = [];
let currentPrediction = null;

// ===============================
// LOAD RESULTS
// ===============================

async function loadPredictionData() {

  try {

    const response = await fetch("../data/results.json");

    if (!response.ok) {
      throw new Error("Unable to load results");
    }

    results = await response.json();

    if (!Array.isArray(results) || results.length < 5) {
      throw new Error("Not enough data");
    }

    showPrediction();
    showRecentResults();

  } catch (error) {

    console.error("PredictIQ:", error);

    const prediction =
      document.getElementById("predictionValue");

    const confidence =
      document.getElementById("confidenceValue");

    if (prediction) {
      prediction.textContent = "—";
    }

    if (confidence) {
      confidence.textContent = "Data unavailable";
    }

  }

}


// ===============================
// PREDICTION ENGINE
// ===============================

function predictNext(data) {

  const candidates = {};

  // Create candidates 0–9

  for (let i = 0; i <= 9; i++) {

    candidates[i] = {
      frequency: 0,
      recency: 0,
      pattern: 0,
      score: 0
    };

  }


  // =============================
  // FREQUENCY
  // =============================

  const frequency = {};

  data.forEach(number => {

    frequency[number] =
      (frequency[number] || 0) + 1;

  });


  const maxFrequency =
    Math.max(...Object.values(frequency));


  for (let i = 0; i <= 9; i++) {

    candidates[i].frequency =
      maxFrequency > 0
        ? (frequency[i] || 0) / maxFrequency
        : 0;

  }


  // =============================
  // RECENCY
  // =============================

  const recentCount =
    Math.min(10, data.length);

  const recent =
    data.slice(-recentCount);


  recent.forEach((number, index) => {

    const weight =
      (index + 1) / recentCount;

    candidates[number].recency += weight;

  });


  const maxRecency =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.recency)
    );


  if (maxRecency > 0) {

    for (let i = 0; i <= 9; i++) {

      candidates[i].recency /=
        maxRecency;

    }

  }


  // =============================
  // SEQUENCE PATTERN
  // =============================

  const lastValue =
    data[data.length - 1];


  for (let i = 0; i < data.length - 1; i++) {

    if (data[i] === lastValue) {

      const nextValue =
        data[i + 1];

      candidates[nextValue].pattern++;

    }

  }


  const maxPattern =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.pattern)
    );


  if (maxPattern > 0) {

    for (let i = 0; i <= 9; i++) {

      candidates[i].pattern /=
        maxPattern;

    }

  }


  // =============================
  // FINAL SCORE
  // =============================

  for (let i = 0; i <= 9; i++) {

    candidates[i].score =
      (candidates[i].frequency * 0.40) +
      (candidates[i].recency * 0.35) +
      (candidates[i].pattern * 0.25);

  }


  // =============================
  // BEST NUMBER
  // =============================

  let prediction = 0;
  let bestScore = -Infinity;


  for (let i = 0; i <= 9; i++) {

    if (candidates[i].score > bestScore) {

      bestScore =
        candidates[i].score;

      prediction = i;

    }

  }


  // =============================
  // CONFIDENCE
  // =============================

  const totalScore =
    Object.values(candidates)
      .reduce(
        (sum, item) => sum + item.score,
        0
      );


  const confidence =
    totalScore > 0
      ? (bestScore / totalScore) * 100
      : 0;


  return {
    prediction,
    confidence
  };

}


// ===============================
// SHOW PREDICTION
// ===============================

function showPrediction() {

  const predictionData =
    predictNext(results);
  
  currentPrediction =
    predictionData.prediction;

  const predictionElement =
    document.getElementById(
      "predictionValue"
    );


  const confidenceElement =
    document.getElementById(
      "confidenceValue"
    );


  if (predictionElement) {

    predictionElement.textContent =
      predictionData.prediction;

  }


  if (confidenceElement) {

    confidenceElement.textContent =
      predictionData.confidence.toFixed(1) + "%";

  }

}


// ===============================
// SHOW RECENT RESULTS
// ===============================

function showRecentResults() {

  const container =
    document.getElementById(
      "recentResults"
    );


  if (!container) return;


  const recent =
    results.slice(-10).reverse();


  container.innerHTML = "";


  recent.forEach((number, index) => {

    const item =
      document.createElement("div");


    item.className =
      "recent-result";


    item.innerHTML = `
      <span>#${index + 1}</span>
      <strong>${number}</strong>
    `;


    container.appendChild(item);

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

  menuButton.addEventListener(
    "click",
    () => {

      navigation.classList.toggle(
        "mobile-open"
      );

    }
  );

}
// ===============================
// SAVE PREDICTION
// ===============================

function savePrediction() {

  if (currentPrediction === null) return;

  const history = JSON.parse(
    localStorage.getItem("predictIQ_history") || "[]"
  );

  history.push({
    id: Date.now(),
    prediction: currentPrediction,
    actual: null,
    status: "Pending",
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(
    "predictIQ_history",
    JSON.stringify(history)
  );

  const status = document.getElementById("saveStatus");

  if (status) {
    status.textContent = "Prediction saved successfully.";
  }
}


// ===============================
// SAVE BUTTON
// ===============================

const savePredictionBtn =
  document.getElementById("savePredictionBtn");

if (savePredictionBtn) {

  savePredictionBtn.addEventListener(
    "click",
    savePrediction
  );

} 

// ===============================
// CHECK ACTUAL RESULT
// ===============================

function checkActualResult() {

  const input =
    document.getElementById("actualResult");

  const status =
    document.getElementById("resultStatus");

  if (!input || input.value === "") {
    if (status) {
      status.textContent = "Please enter the actual result.";
    }
    return;
  }

  const actual = Number(input.value);

  if (actual < 0 || actual > 9) {
    if (status) {
      status.textContent = "Enter a number between 0 and 9.";
    }
    return;
  }

  const history = JSON.parse(
    localStorage.getItem("predictIQ_history") || "[]"
  );

  if (history.length === 0) {
    if (status) {
      status.textContent = "No saved prediction found.";
    }
    return;
  }

  // Find latest pending prediction
  let latest = null;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].status === "Pending") {
      latest = history[i];
      break;
    }
  }

  if (!latest) {
    if (status) {
      status.textContent = "No pending prediction found.";
    }
    return;
  }

  latest.actual = actual;

  if (latest.prediction === actual) {
    latest.status = "Correct";
    status.textContent = "✓ Prediction was correct!";
  } else {
    latest.status = "Incorrect";
    status.textContent = "✕ Prediction was incorrect.";
  }

  localStorage.setItem(
    "predictIQ_history",
    JSON.stringify(history)
  );
}


// ===============================
// CHECK RESULT BUTTON
// ===============================

const checkResultBtn =
  document.getElementById("checkResultBtn");

if (checkResultBtn) {

  checkResultBtn.addEventListener(
    "click",
    checkActualResult
  );

}
// ===============================
// ANALYSE USER RESULTS
// ===============================

function analyseUserResults() {

  const input =
    document.getElementById("resultsInput");

  const status =
    document.getElementById("inputStatus");

  if (!input) return;

  const values = input.value
    .split(",")
    .map(value => value.trim())
    .filter(value => value !== "")
    .map(Number);

  if (values.length < 5) {

    if (status) {
      status.textContent =
        "Please enter at least 5 results.";
    }

    return;
  }

  if (
    values.some(
      value =>
        !Number.isInteger(value) ||
        value < 0 ||
        value > 9
    )
  ) {

    if (status) {
      status.textContent =
        "Use numbers from 0 to 9 only.";
    }

    return;
  }

  results = values;

  showPrediction();
  showRecentResults();

  if (status) {
    status.textContent =
      "Results analysed successfully.";
  }

}


// ===============================
// ANALYSE BUTTON
// ===============================

const analyseBtn =
  document.getElementById("analyseBtn");

if (analyseBtn) {

  analyseBtn.addEventListener(
    "click",
    analyseUserResults
  );

}


// ===============================
// START
// ===============================

loadPredictionData();
