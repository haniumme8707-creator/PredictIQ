let results = [];

// ===============================
// LOAD ANALYSIS DATA
// ===============================
async function loadAnalysis() {

  try {

    const response =
      await fetch("../data/results.json");

    if (!response.ok) {
      throw new Error("Data load failed");
    }

    results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("No data available");
    }

    results = results.map(Number);

    showStatistics();
    showFrequency();
    showRecentResults();

    showRecent50Frequency();
    showHotCold();
    showNumberGaps();
    showTransitions();
    showRecent20Trend();
    showBigSmall();
    showStreaks();
    showSampleQuality();
    showDistribution();
    showFinalReport();

  } catch (error) {

    console.error("Analysis error:", error);

    document.querySelectorAll(".analysis-list")
      .forEach(element => {
        element.textContent = "Unable to load analysis.";
      });

  }
}


// ===============================
// STATISTICS
// ===============================
function showStatistics() {

  const total = results.length;

  const sum =
    results.reduce(
      (total, value) => total + value,
      0
    );

  const average = sum / total;

  const frequency = {};

  results.forEach(value => {
    frequency[value] =
      (frequency[value] || 0) + 1;
  });

  const entries =
    Object.entries(frequency);

  const highestCount =
    entries.length
      ? Math.max(...entries.map(item => item[1]))
      : 0;

  const mostFrequent =
    entries
      .filter(item => item[1] === highestCount)
      .map(item => item[0])
      .join(", ");


  const range =
    Math.max(...results) -
    Math.min(...results);


  const totalElement =
    document.getElementById("totalData");

  const averageElement =
    document.getElementById("average");

  const commonElement =
    document.getElementById("mostCommon");

  const rangeElement =
    document.getElementById("range");


  if (totalElement)
    totalElement.textContent = total;

  if (averageElement)
    averageElement.textContent =
      average.toFixed(2);

  if (commonElement)
    commonElement.textContent =
      mostFrequent || "—";

  if (rangeElement)
    rangeElement.textContent =
      range;
}


// ===============================
// FREQUENCY ANALYSIS
// ===============================
function getFrequency(data) {

  const frequency = {};

  data.forEach(value => {

    frequency[value] =
      (frequency[value] || 0) + 1;

  });

  return frequency;
}


function showFrequency() {

  const container =
    document.getElementById("frequencyList");

  if (!container) return;

  const frequency =
    getFrequency(results);


  const sorted =
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1]);


  const maxCount =
    sorted.length
      ? Number(sorted[0][1])
      : 1;


  container.innerHTML = "";


  sorted.forEach(([value, count]) => {

    const percentage =
      (count / results.length) * 100;

    const width =
      (count / maxCount) * 100;


    const item =
      document.createElement("div");

    item.className =
      "analysis-item";


    item.innerHTML = `
      <div class="analysis-info">
        <div class="analysis-title">
          Value ${value}
        </div>

        <div class="analysis-count">
          ${count} occurrence${count !== 1 ? "s" : ""}
        </div>
      </div>

      <div class="bar-area">
        <div
          class="bar-fill"
          style="width:${width}%">
        </div>
      </div>

      <div class="analysis-percent">
        ${percentage.toFixed(1)}%
      </div>
    `;


    container.appendChild(item);

  });
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
// RECENT 50 FREQUENCY
// ===============================
function showRecent50Frequency() {

  const container =
    document.getElementById("recent50Frequency");

  if (!container) return;


  const recent =
    results.slice(-50);

  const frequency =
    getFrequency(recent);


  const sorted =
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1]);


  container.innerHTML =
    sorted.map(([value, count]) => {

      const percentage =
        (count / recent.length) * 100;

      return `
        <div class="analysis-item">
          <div class="analysis-info">
            <div class="analysis-title">
              ${value}
            </div>

            <div class="analysis-count">
              ${count} times
            </div>
          </div>

          <div class="analysis-percent">
            ${percentage.toFixed(1)}%
          </div>
        </div>
      `;

    }).join("");
}


// ===============================
// HOT & COLD NUMBERS
// ===============================
function showHotCold() {

  const container =
    document.getElementById("hotColdNumbers");

  if (!container) return;


  const frequency =
    getFrequency(results);


  const numbers =
    Array.from(
      { length: 10 },
      (_, i) => [
        i,
        frequency[i] || 0
      ]
    );


  numbers.sort((a, b) => b[1] - a[1]);


  const hot =
    numbers.slice(0, 3)
      .map(item => item[0])
      .join(", ");


  const cold =
    numbers.slice(-3)
      .map(item => item[0])
      .join(", ");


  container.innerHTML = `
    <div class="analysis-item">
      <div class="analysis-title">
        🔥 Hot Numbers
      </div>

      <div class="analysis-count">
        ${hot || "—"}
      </div>
    </div>

    <div class="analysis-item">
      <div class="analysis-title">
        ❄️ Cold Numbers
      </div>

      <div class="analysis-count">
        ${cold || "—"}
      </div>
    </div>
  `;
}


// ===============================
// NUMBER GAPS
// ===============================
function showNumberGaps() {

  const container =
    document.getElementById("numberGaps");

  if (!container) return;


  const gaps = {};


  for (let number = 0; number <= 9; number++) {

    let gap = 0;

    for (
      let i = results.length - 1;
      i >= 0;
      i--
    ) {

      if (results[i] === number) {
        break;
      }

      gap++;
    }

    gaps[number] = gap;
  }


  container.innerHTML =
    Object.entries(gaps)
      .sort((a, b) => b[1] - a[1])
      .map(([number, gap]) => `

        <div class="analysis-item">

          <div class="analysis-title">
            Number ${number}
          </div>

          <div class="analysis-count">
            ${gap} result${gap !== 1 ? "s" : ""} since last appearance
          </div>

        </div>

      `).join("");
}


// ===============================
// LAST NUMBER TRANSITIONS
// ===============================
function showTransitions() {

  const container =
    document.getElementById("transitions");

  if (!container) return;


  if (results.length < 2) {

    container.textContent =
      "Not enough data.";

    return;
  }


  const last =
    results[results.length - 1];


  const transitions = {};


  for (let i = 0; i < results.length - 1; i++) {

    if (results[i] === last) {

      const next =
        results[i + 1];

      transitions[next] =
        (transitions[next] || 0) + 1;

    }

  }


  const sorted =
    Object.entries(transitions)
      .sort((a, b) => b[1] - a[1]);


  if (!sorted.length) {

    container.textContent =
      `No previous transition data for ${last}.`;

    return;
  }


  container.innerHTML =
    sorted.map(([number, count]) => `

      <div class="analysis-item">

        <div class="analysis-title">
          ${last} → ${number}
        </div>

        <div class="analysis-count">
          ${count} occurrence${count !== 1 ? "s" : ""}
        </div>

      </div>

    `).join("");
}


// ===============================
// RECENT 20 TREND
// ===============================
function showRecent20Trend() {

  const container =
    document.getElementById("recent20Trend");

  if (!container) return;


  const recent =
    results.slice(-20);


  const frequency =
    getFrequency(recent);


  const sorted =
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1]);


  container.innerHTML =
    sorted.map(([number, count]) => `

      <div class="analysis-item">

        <div class="analysis-title">
          ${number}
        </div>

        <div class="analysis-count">
          ${count} / ${recent.length}
        </div>

      </div>

    `).join("");
}


// ===============================
// BIG / SMALL
// ===============================
function showBigSmall() {

  const container =
    document.getElementById("bigSmallAnalysis");

  if (!container) return;


  let small = 0;
  let big = 0;


  results.forEach(value => {

    if (value <= 4) {
      small++;
    } else {
      big++;
    }

  });


  const total =
    results.length;


  container.innerHTML = `

    <div class="analysis-item">

      <div class="analysis-title">
        Small (0–4)
      </div>

      <div class="analysis-count">
        ${small} (${((small / total) * 100).toFixed(1)}%)
      </div>

    </div>

    <div class="analysis-item">

      <div class="analysis-title">
        Big (5–9)
      </div>

      <div class="analysis-count">
        ${big} (${((big / total) * 100).toFixed(1)}%)
      </div>

    </div>

  `;
}


// ===============================
// CURRENT STREAKS
// ===============================
function showStreaks() {

  const container =
    document.getElementById("currentStreaks");

  if (!container) return;


  const last =
    results[results.length - 1];


  let streak = 0;


  for (
    let i = results.length - 1;
    i >= 0;
    i--
  ) {

    if (results[i] === last) {
      streak++;
    } else {
      break;
    }

  }


  container.innerHTML = `

    <div class="analysis-item">

      <div class="analysis-title">
        Current Number
      </div>

      <div class="analysis-count">
        ${last}
      </div>

    </div>

    <div class="analysis-item">

      <div class="analysis-title">
        Current Streak
      </div>

      <div class="analysis-count">
        ${streak}
      </div>

    </div>

  `;
}


// ===============================
// SAMPLE QUALITY
// ===============================
function showSampleQuality() {

  const container =
    document.getElementById("sampleQuality");

  if (!container) return;


  const total =
    results.length;


  let quality =
    "Small Sample";


  if (total >= 100) {
    quality = "Strong Sample";
  } else if (total >= 50) {
    quality = "Moderate Sample";
  }


  container.innerHTML = `

    <div class="analysis-item">

      <div class="analysis-title">
        Dataset Size
      </div>

      <div class="analysis-count">
        ${total} results
      </div>

    </div>

    <div class="analysis-item">

      <div class="analysis-title">
        Sample Assessment
      </div>

      <div class="analysis-count">
        ${quality}
      </div>

    </div>

  `;
}


// ===============================
// DISTRIBUTION CHECK
// ===============================
function showDistribution() {

  const container =
    document.getElementById("distributionCheck");

  if (!container) return;


  const frequency =
    getFrequency(results);


  const expected =
    results.length / 10;


  let deviation = 0;


  for (let number = 0; number <= 9; number++) {

    const actual =
      frequency[number] || 0;

    deviation +=
      Math.abs(actual - expected);

  }


  const averageDeviation =
    deviation / 10;


  let assessment =
    "Relatively balanced";


  if (averageDeviation > expected * 0.30) {
    assessment = "Noticeable imbalance";
  }


  container.innerHTML = `

    <div class="analysis-item">

      <div class="analysis-title">
        Expected per number
      </div>

      <div class="analysis-count">
        ${expected.toFixed(1)}
      </div>

    </div>

    <div class="analysis-item">

      <div class="analysis-title">
        Distribution
      </div>

      <div class="analysis-count">
        ${assessment}
      </div>

    </div>

  `;
}


// ===============================
// FINAL REPORT
// ===============================
function showFinalReport() {

  const container =
    document.getElementById("finalReport");

  if (!container) return;


  const frequency =
    getFrequency(results);


  const sorted =
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1]);


  const topNumbers =
    sorted
      .slice(0, 3)
      .map(item => item[0])
      .join(", ");


  const last =
    results[results.length - 1];


  container.innerHTML = `

    <p>
      Dataset contains <strong>${results.length}</strong>
      recorded results.
    </p>

    <p>
      Most frequently observed numbers:
      <strong>${topNumbers || "—"}</strong>.
    </p>

    <p>
      Latest recorded result:
      <strong>${last}</strong>.
    </p>

    <p>
      These statistics describe historical behaviour only.
      They do not establish a reliable probability of the next
      outcome.
    </p>

  `;
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
loadAnalysis();
