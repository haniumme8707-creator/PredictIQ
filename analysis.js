let results = [];

// ===============================
// LOAD HISTORICAL DATA
// ===============================
async function loadResults() {
  try {
    const response = await fetch("data/results.json");

    if (!response.ok) {
      throw new Error("Unable to load results");
    }

    results = await response.json();

    if (!Array.isArray(results) || results.length < 5) {
      throw new Error("Not enough historical data");
    }

    updateDashboard();
    generatePrediction();

  } catch (error) {
    console.error("PredictionIQ Error:", error);
  }
}


// ===============================
// BASIC STATISTICS
// ===============================
function calculateStats(data) {
  const frequency = {};

  data.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  let mostFrequent = null;
  let highestFrequency = 0;

  Object.entries(frequency).forEach(([value, count]) => {
    if (count > highestFrequency) {
      highestFrequency = count;
      mostFrequent = Number(value);
    }
  });

  const sum = data.reduce((total, value) => total + Number(value), 0);
  const average = sum / data.length;

  return {
    frequency,
    mostFrequent,
    highestFrequency,
    average
  };
}


// ===============================
// PREDICTION ENGINE
// ===============================
function predictNext(data) {

  const candidates = {};

  // Possible values 0–9
  for (let i = 0; i <= 9; i++) {
    candidates[i] = {
      frequency: 0,
      recency: 0,
      pattern: 0,
      score: 0
    };
  }

  // --------------------------------
  // 1. FREQUENCY SIGNAL
  // --------------------------------
  const frequency = {};

  data.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  const maxFrequency = Math.max(
    ...Object.values(frequency)
  );

  for (let i = 0; i <= 9; i++) {
    candidates[i].frequency =
      maxFrequency > 0
        ? (frequency[i] || 0) / maxFrequency
        : 0;
  }


  // --------------------------------
  // 2. RECENCY SIGNAL
  // --------------------------------
  const recentCount = Math.min(10, data.length);
  const recent = data.slice(-recentCount);

  recent.forEach((value, index) => {

    // Later results get higher weight
    const weight = (index + 1) / recentCount;

    candidates[value].recency += weight;
  });

  const maxRecency = Math.max(
    ...Object.values(candidates).map(c => c.recency)
  );

  if (maxRecency > 0) {
    for (let i = 0; i <= 9; i++) {
      candidates[i].recency /= maxRecency;
    }
  }


  // --------------------------------
  // 3. SIMPLE SEQUENCE SIGNAL
  // --------------------------------
  if (data.length >= 4) {

    const lastValue = data[data.length - 1];

    // Find historical occurrences of the
    // same last value and see what followed it.
    for (let i = 0; i < data.length - 1; i++) {

      if (data[i] === lastValue) {

        const nextValue = data[i + 1];

        if (candidates[nextValue]) {
          candidates[nextValue].pattern += 1;
        }
      }
    }
  }

  const maxPattern = Math.max(
    ...Object.values(candidates).map(c => c.pattern)
  );

  if (maxPattern > 0) {
    for (let i = 0; i <= 9; i++) {
      candidates[i].pattern /= maxPattern;
    }
  }


  // --------------------------------
  // 4. COMBINED SCORE
  // --------------------------------
  for (let i = 0; i <= 9; i++) {

    candidates[i].score =
      (candidates[i].frequency * 0.40) +
      (candidates[i].recency * 0.35) +
      (candidates[i].pattern * 0.25);
  }


  // --------------------------------
  // FIND BEST CANDIDATE
  // --------------------------------
  let prediction = 0;
  let bestScore = -Infinity;

  for (let i = 0; i <= 9; i++) {

    if (candidates[i].score > bestScore) {
      bestScore = candidates[i].score;
      prediction = i;
    }
  }


  // --------------------------------
  // CONFIDENCE
  // --------------------------------
  const totalScore = Object.values(candidates)
    .reduce((sum, candidate) => sum + candidate.score, 0);

  const confidence =
    totalScore > 0
      ? (bestScore / totalScore) * 100
      : 0;


  return {
    prediction,
    confidence,
    candidates
  };
}


// ===============================
// GENERATE CURRENT PREDICTION
// ===============================
function generatePrediction() {

  if (!results.length) return;

  const predictionData = predictNext(results);

  const predictionElement =
    document.getElementById("predictionValue");

  const confidenceElement =
    document.getElementById("confidenceValue");

  if (predictionElement) {
    predictionElement.textContent =
      predictionData.prediction;
  }

  if (confidenceElement) {
    confidenceElement.textContent =
      predictionData.confidence.toFixed(1) + "%";
  }

  console.log(
    "Prediction:",
    predictionData.prediction
  );

  console.log(
    "Confidence:",
    predictionData.confidence.toFixed(1) + "%"
  );
}


// ===============================
// UPDATE DASHBOARD
// ===============================
function updateDashboard() {

  const stats = calculateStats(results);

  const dataCount =
    document.getElementById("dataCount");

  const averageValue =
    document.getElementById("averageValue");

  const frequentValue =
    document.getElementById("frequentValue");

  if (dataCount) {
    dataCount.textContent = results.length;
  }

  if (averageValue) {
    averageValue.textContent =
      stats.average.toFixed(2);
  }

  if (frequentValue) {
    frequentValue.textContent =
      stats.mostFrequent;
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
loadResults();
