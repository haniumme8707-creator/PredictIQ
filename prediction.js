let results = [];
let currentPrediction = null;


// ===============================
// LOAD DATA
// ===============================
async function loadPredictionData() {

  try {

    const response =
      await fetch("../data/results.json");

    if (!response.ok) {
      throw new Error("Unable to load data");
    }

    results = await response.json();

    if (!Array.isArray(results) || results.length < 5) {
      throw new Error("Not enough data");
    }

    results = results
      .map(Number)
      .filter(n => Number.isInteger(n) && n >= 0 && n <= 9);

    showPrediction();
    showRecentResults();

  } catch (error) {

    console.error(error);

    const prediction =
      document.getElementById("predictionValue");

    if (prediction) {
      prediction.textContent = "—";
    }

  }
}


// ===============================
// COLOR RULES
// ===============================
function getColor(number) {

  if (number === 0 || number === 5) {
    return "Violet";
  }

  if (
    number === 1 ||
    number === 3 ||
    number === 7 ||
    number === 9
  ) {
    return "Green";
  }

  return "Red";
}


// ===============================
// BIG / SMALL
// ===============================
function getSize(number) {

  return number <= 4
    ? "Small"
    : "Big";
}


// ===============================
// FREQUENCY
// ===============================
function getFrequency(data) {

  const frequency = {};

  for (let number = 0; number <= 9; number++) {
    frequency[number] = 0;
  }

  data.forEach(number => {
    frequency[number]++;
  });

  return frequency;
}


// ===============================
// TRANSITIONS
// ===============================
function getTransitions(data, lastNumber) {

  const transitions = {};

  for (let number = 0; number <= 9; number++) {
    transitions[number] = 0;
  }

  let total = 0;

  for (let i = 0; i < data.length - 1; i++) {

    if (data[i] === lastNumber) {

      transitions[data[i + 1]]++;
      total++;

    }
  }

  return {
    transitions,
    total
  };
}


// ===============================
// CURRENT GAPS
// ===============================
function getGaps(data) {

  const gaps = {};

  for (let number = 0; number <= 9; number++) {

    let gap = data.length;

    for (let i = data.length - 1; i >= 0; i--) {

      if (data[i] === number) {

        gap = data.length - 1 - i;
        break;

      }
    }

    gaps[number] = gap;
  }

  return gaps;
}


// ===============================
// SCORE NUMBERS
// ===============================
function calculateScores(data) {

  const frequency =
    getFrequency(data);

  const recent20 =
    data.slice(-20);

  const recent50 =
    data.slice(-50);

  const recent20Freq =
    getFrequency(recent20);

  const recent50Freq =
    getFrequency(recent50);

  const lastNumber =
    data[data.length - 1];

  const transitionData =
    getTransitions(data, lastNumber);

  const transitions =
    transitionData.transitions;

  const transitionTotal =
    transitionData.total;


  const scores = [];


  for (let number = 0; number <= 9; number++) {

    // Overall frequency
    const frequencyScore =
      data.length > 0
        ? frequency[number] / data.length
        : 0;


    // Recent 50
    const recent50Score =
      recent50.length > 0
        ? recent50Freq[number] / recent50.length
        : 0;


    // Recent 20 gets extra recency weight
    const recent20Score =
      recent20.length > 0
        ? recent20Freq[number] / recent20.length
        : 0;


    // Transition signal
    let transitionScore = 0;

    if (transitionTotal >= 5) {

      transitionScore =
        transitions[number] / transitionTotal;

    }


    /*
      We report gaps separately.
      We DO NOT assume that a long-missing
      number is automatically "due".
    */

    const score =
      (frequencyScore * 0.25) +
      (recent50Score * 0.25) +
      (recent20Score * 0.25) +
      (transitionScore * 0.25);


    scores.push({
      number,
      score,
      frequency: frequency[number],
      recent50: recent50Freq[number],
      recent20: recent20Freq[number],
      transitions: transitions[number]
    });

  }


  return {
    scores,
    frequency,
    recent20Freq,
    recent50Freq,
    transitions,
    transitionTotal,
    gaps: getGaps(data)
  };
}


// ===============================
// PREDICTION ENGINE
// ===============================
function predictNext(data) {

  const analysis =
    calculateScores(data);


  const ranked =
    analysis.scores
      .slice()
      .sort((a, b) => b.score - a.score);


  const top =
    ranked.slice(0, 3);


  const first =
    top[0];

  const second =
    top[1];


  const margin =
    first.score - second.score;


  let strength =
    "Weak";


  if (margin >= 0.03) {
    strength = "Strong";
  } else if (margin >= 0.015) {
    strength = "Moderate";
  }


  return {

    prediction: first.number,

    candidates: top,

    strength,

    score: first.score,

    frequency:
      analysis.frequency,

    recent20:
      analysis.recent20Freq,

    recent50:
      analysis.recent50Freq,

    transitions:
      analysis.transitions,

    transitionTotal:
      analysis.transitionTotal,

    gaps:
      analysis.gaps

  };
}

// ===============================
// WALK-FORWARD BACKTEST
// ===============================
function runBacktest(data) {

  if (data.length < 15) {
    return {
      tested: 0,
      correct: 0,
      accuracy: null,
      baseline: null,
      improvement: null
    };
  }

  let tested = 0;
  let correct = 0;

  // Test prediction at every historical point
  for (let i = 10; i < data.length; i++) {

    const trainingData = data.slice(0, i);
    const actual = data[i];

    const prediction = predictNext(trainingData);

    if (prediction.prediction === actual) {
      correct++;
    }

    tested++;
  }

  const accuracy =
    tested > 0
      ? (correct / tested) * 100
      : null;

  // Majority-number baseline
  const frequency = getFrequency(data);

  const highestFrequency =
    Math.max(...Object.values(frequency));

  const baseline =
    data.length > 0
      ? (highestFrequency / data.length) * 100
      : null;

  const improvement =
    accuracy !== null && baseline !== null
      ? accuracy - baseline
      : null;

  return {
    tested,
    correct,
    accuracy,
    baseline,
    improvement
  };
}

// ===============================
// SHOW PREDICTION
// ===============================
function showPrediction() {

  if (!results.length) return;


  currentPrediction =
    predictNext(results);


  const predictionElement =
    document.getElementById("predictionValue");


  const confidenceElement =
    document.getElementById("confidenceValue");


  if (predictionElement) {

    predictionElement.textContent =
      currentPrediction.prediction;

  }


  if (confidenceElement) {

    confidenceElement.textContent =
      currentPrediction.strength;

  }


  showPredictionReport();

}


// ===============================
// PREDICTION REPORT
// ===============================
function showPredictionReport() {

  const card =
    document.querySelector(".prediction-card");

  if (!card || !currentPrediction) return;


  let report =
    document.getElementById("predictionReport");


  if (!report) {

    report =
      document.createElement("div");

    report.id =
      "predictionReport";

    report.className =
      "prediction-report";

    const actions =
      card.querySelector(".prediction-actions");

    if (actions) {
      actions.before(report);
    } else {
      card.appendChild(report);
    }

  }


  const predicted =
    currentPrediction.prediction;


  const candidates =
    currentPrediction.candidates;


  const backtest =
    runBacktest(results);


  let backtestText =
    "Not enough historical data.";


  if (backtest.accuracy !== null) {

    backtestText =
      `${backtest.accuracy.toFixed(1)}% historical hit rate ` +
      `(${backtest.correct}/${backtest.tested})`;

  }


  report.innerHTML = `

    <div class="prediction-details">

      <div class="prediction-detail">
        <span>Color</span>
        <strong>
          ${getColor(predicted)}
        </strong>
      </div>

      <div class="prediction-detail">
        <span>Size</span>
        <strong>
          ${getSize(predicted)}
        </strong>
      </div>

      <div class="prediction-detail">
        <span>Signal</span>
        <strong>
          ${currentPrediction.strength}
        </strong>
      </div>

    </div>


    <div class="candidate-section">

      <h3>Top Statistical Candidates</h3>

      <div class="candidate-list">

        ${candidates.map((item, index) => `

          <div class="candidate">

            <span class="candidate-rank">
              #${index + 1}
            </span>

            <strong>
              ${item.number}
            </strong>

            <span>
              ${getColor(item.number)}
            </span>

            <span>
              ${getSize(item.number)}
            </span>

          </div>

        `).join("")}

      </div>

    </div>


    <div class="prediction-evidence">

      <h3>Statistical Evidence</h3>

      <p>
        Overall frequency:
        <strong>
          ${currentPrediction.frequency[predicted]}
        </strong>
      </p>

      <p>
        Recent 20 appearances:
        <strong>
          ${currentPrediction.recent20[predicted]}
        </strong>
      </p>

      <p>
        Recent 50 appearances:
        <strong>
          ${currentPrediction.recent50[predicted]}
        </strong>
      </p>

      <p>
        Current gap:
        <strong>
          ${currentPrediction.gaps[predicted]}
        </strong>
      </p>

      <p>
        Previous-number transition count:
        <strong>
          ${currentPrediction.transitions[predicted]}
        </strong>
      </p>

    </div>


    <div class="backtest-box">

      <h3>Historical Backtest</h3>

      <p>
        ${backtestText}
      </p>

    </div>

  `;
}


// ===============================
// RECENT RESULTS
// ===============================
function showRecentResults() {

  const container =
    document.getElementById("recentResults");

  if (!container) return;


  const recent =
    results.slice(-10).reverse();


  container.innerHTML = "";


  recent.forEach((value, index) => {

    const item =
      document.createElement("div");

    item.className =
      "recent-result";


    item.innerHTML = `

      <span class="recent-number">
        #${results.length - index}
      </span>

      <span class="recent-value">
        ${value}
      </span>

    `;


    container.appendChild(item);

  });
}


// ===============================
// SAVE PREDICTION
// ===============================
function savePrediction() {

  if (!currentPrediction) return;


  const history =
    JSON.parse(
      localStorage.getItem("predictIQ_history") || "[]"
    );


  history.push({

    prediction:
      currentPrediction.prediction,

    candidates:
      currentPrediction.candidates
        .map(item => item.number),

    color:
      getColor(currentPrediction.prediction),

    size:
      getSize(currentPrediction.prediction),

    strength:
      currentPrediction.strength,

    actual: null,

    status: "Pending",

    timestamp:
      new Date().toISOString()

  });


  localStorage.setItem(
    "predictIQ_history",
    JSON.stringify(history)
  );


  const status =
    document.getElementById("saveStatus");


  if (status) {

    status.textContent =
      "Prediction saved successfully.";

  }

}


// ===============================
// CHECK ACTUAL RESULT
// ===============================
function checkActualResult() {

  const input =
    document.getElementById("actualResult");


  const value =
    Number(input?.value);


  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 9
  ) {

    return;

  }


  const history =
    JSON.parse(
      localStorage.getItem("predictIQ_history") || "[]"
    );


  for (let i = history.length - 1; i >= 0; i--) {

    if (history[i].actual === null) {

      history[i].actual = value;

      history[i].status =
        history[i].prediction === value
          ? "Correct"
          : "Incorrect";

      break;

    }

  }


  localStorage.setItem(
    "predictIQ_history",
    JSON.stringify(history)
  );


  const status =
    document.getElementById("resultStatus");


  if (status) {

    status.textContent =
      history[history.length - 1]?.prediction === value
        ? "Result matched the saved prediction."
        : "Result did not match the saved prediction.";

  }

}


// ===============================
// USER RESULT INPUT
// ===============================
function analyseUserResults() {

  const input =
    document.getElementById("resultsInput");


  const status =
    document.getElementById("inputStatus");


  if (!input) return;


  const values =
    input.value
      .split(",")
      .map(value => Number(value.trim()))
      .filter(value =>
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 9
      );


  if (values.length < 5) {

    if (status) {

      status.textContent =
        "Please enter at least 5 valid numbers (0–9).";

    }

    return;

  }


  results = values;


  showPrediction();
  showRecentResults();


  if (status) {

    status.textContent =
      `${values.length} results analysed successfully.`;

  }

}


// ===============================
// BUTTONS
// ===============================
const saveButton =
  document.getElementById("savePredictionBtn");

if (saveButton) {

  saveButton.addEventListener(
    "click",
    savePrediction
  );

}


const checkButton =
  document.getElementById("checkResultBtn");

if (checkButton) {

  checkButton.addEventListener(
    "click",
    checkActualResult
  );

}


const analyseButton =
  document.getElementById("analyseBtn");

if (analyseButton) {

  analyseButton.addEventListener(
    "click",
    analyseUserResults
  );

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
loadPredictionData();
