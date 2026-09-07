let results = [];

// ===============================
// LOAD ANALYSIS DATA
// ===============================
async function loadAnalysis() {
  try {
    const response = await fetch("../data/results.json");

    if (!response.ok) {
      throw new Error("Data load failed");
    }

    results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("No data available");
    }

    showStatistics();
    showFrequency();
    showRecentResults();

  } catch (error) {
    console.error("Analysis error:", error);

    const list = document.getElementById("frequencyList");

    if (list) {
      list.textContent = "Unable to load data.";
    }
  }
}


// ===============================
// STATISTICS
// ===============================
function showStatistics() {

  const total = results.length;

  const sum = results.reduce(
    (total, value) => total + Number(value),
    0
  );

  const average = sum / total;

  const frequency = {};

  results.forEach(value => {
    frequency[value] =
      (frequency[value] || 0) + 1;
  });

  let mostFrequent = null;
  let highestCount = 0;

  Object.entries(frequency).forEach(
    ([value, count]) => {

      if (count > highestCount) {
        highestCount = count;
        mostFrequent = value;
      }

    }
  );


  // Total data
  const totalElement =
    document.getElementById("totalData");

  if (totalElement) {
    totalElement.textContent = total;
  }


  // Average
  const averageElement =
    document.getElementById("averageValue");

  if (averageElement) {
    averageElement.textContent =
      average.toFixed(2);
  }


  // Most frequent
  const frequentElement =
    document.getElementById("mostFrequent");

  if (frequentElement) {
    frequentElement.textContent =
      mostFrequent;
  }


  // Highest frequency
  const frequencyElement =
    document.getElementById("highestFrequency");

  if (frequencyElement) {
    frequencyElement.textContent =
      highestCount;
  }
}


// ===============================
// FREQUENCY ANALYSIS
// ===============================
function showFrequency() {

  const container =
    document.getElementById("frequencyList");

  if (!container) return;

  const frequency = {};

  results.forEach(value => {
    frequency[value] =
      (frequency[value] || 0) + 1;
  });


  const sorted =
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1]);


  const maxCount =
    sorted.length > 0
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

    item.className = "analysis-item";


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
          style="width: ${width}%">
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

    item.className = "recent-result";


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
