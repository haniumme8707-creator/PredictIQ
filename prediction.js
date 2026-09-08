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
// ADVANCED STATISTICAL ANALYZER
// ===============================

function predictNext(data) {

  const total = data.length;
  const recent20 = data.slice(-20);
  const recent50 = data.slice(-50);

  const candidates = {};

  for (let i = 0; i <= 9; i++) {

    candidates[i] = {
      frequency: 0,
      recent: 0,
      gap: 0,
      transition: 0,
      score: 0
    };

  }


  // =============================
  // OVERALL FREQUENCY
  // =============================

  const frequency = {};

  data.forEach(number => {

    frequency[number] =
      (frequency[number] || 0) + 1;

  });


  for (let i = 0; i <= 9; i++) {

    candidates[i].frequency =
      (frequency[i] || 0) / total;

  }


  // =============================
  // RECENT FREQUENCY
  // =============================

  const recentFrequency = {};

  recent50.forEach(number => {

    recentFrequency[number] =
      (recentFrequency[number] || 0) + 1;

  });


  const recentTotal = recent50.length;


  for (let i = 0; i <= 9; i++) {

    candidates[i].recent =
      recentTotal > 0
        ? (recentFrequency[i] || 0) / recentTotal
        : 0;

  }


  // =============================
  // NUMBER GAP
  // =============================

  for (let i = 0; i <= 9; i++) {

    let gap = 0;

    for (
      let j = data.length - 1;
      j >= 0;
      j--
    ) {

      if (data[j] === i) {
        break;
      }

      gap++;

    }

    candidates[i].gap = gap;

  }


  // =============================
  // NORMALIZE GAP
  // =============================

  const maxGap =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.gap)
    );

  if (maxGap > 0) {

    for (let i = 0; i <= 9; i++) {

      candidates[i].gap =
        candidates[i].gap / maxGap;

    }

  }


  // =============================
  // LAST NUMBER TRANSITIONS
  // =============================

  const lastNumber =
    data[data.length - 1];

  const transitions = {};

  for (let i = 0; i <= 9; i++) {
    transitions[i] = 0;
  }


  let transitionCount = 0;


  for (
    let i = 0;
    i < data.length - 1;
    i++
  ) {

    if (data[i] === lastNumber) {

      const next =
        data[i + 1];

      transitions[next]++;
      transitionCount++;

    }

  }


  if (transitionCount > 0) {

    for (let i = 0; i <= 9; i++) {

      candidates[i].transition =
        transitions[i] / transitionCount;

    }

  }


  // =============================
  // NORMALIZE FREQUENCY
  // =============================

  const maxFrequency =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.frequency)
    );

  const maxRecent =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.recent)
    );

  const maxTransition =
    Math.max(
      ...Object.values(candidates)
        .map(item => item.transition)
    );


  for (let i = 0; i <= 9; i++) {

    const frequencyScore =
      maxFrequency > 0
        ? candidates[i].frequency / maxFrequency
        : 0;

    const recentScore =
      maxRecent > 0
        ? candidates[i].recent / maxRecent
        : 0;

    const transitionScore =
      maxTransition > 0
        ? candidates[i].transition / maxTransition
        : 0;


    // ===========================
    // COMBINED STATISTICAL SCORE
    // ===========================

    candidates[i].score =
      (frequencyScore * 0.30) +
      (recentScore * 0.30) +
      (transitionScore * 0.25) +
      (candidates[i].gap * 0.15);

  }


  // =============================
  // SORT TOP CANDIDATES
  // =============================

  const ranked =
    Object.entries(candidates)
      .sort(
        (a, b) =>
          b[1].score - a[1].score
      );


  const prediction =
    Number(ranked[0][0]);


  // =============================
  // STATISTICAL STRENGTH
  // =============================

  const topScore =
    ranked[0][1].score;

  const secondScore =
    ranked[1][1].score;

  let strength = "Low";

  if (
    topScore > 0 &&
    topScore >= secondScore * 1.25
  ) {

    strength = "Strong";

  } else if (
    topScore > 0 &&
    topScore >= secondScore * 1.10
  ) {

    strength = "Medium";

  }


  return {

    prediction: prediction,

    confidence:
      topScore * 100,

    strength: strength,

    candidates: ranked.slice(0, 3),

    frequency: frequency,

    recentFrequency: recentFrequency,

    recent20: recent20,

    recent50: recent50,

    gaps: candidates,

    transitions: transitions,

    transitionCount: transitionCount,

    lastNumber: lastNumber

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
