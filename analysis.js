let results = [];

async function loadAnalysis() {

    try {

        const response = await fetch("data/results.json");

        if (!response.ok) {
            throw new Error("Data load failed");
        }

        results = await response.json();

        showStatistics();
        showFrequency();
        showRecentResults();

    } catch (error) {

        console.error(error);

        document.getElementById("frequencyList").textContent =
            "Unable to load data.";

    }
}


// Statistics
function showStatistics() {

    if (!results.length) return;

    const total = results.length;

    const sum = results.reduce(
        (a, b) => a + b,
        0
    );

    const average = sum / total;

    const minimum = Math.min(...results);
    const maximum = Math.max(...results);

    const frequency = {};

    results.forEach(value => {
        frequency[value] =
            (frequency[value] || 0) + 1;
    });

    let mostCommon = results[0];

    Object.keys(frequency).forEach(value => {

        if (
            frequency[value] >
            frequency[mostCommon]
        ) {
            mostCommon = Number(value);
        }

    });


    document.getElementById("totalData")
        .textContent = total;

    document.getElementById("average")
        .textContent = average.toFixed(2);

    document.getElementById("mostCommon")
        .textContent = mostCommon;

    document.getElementById("range")
        .textContent =
        minimum + " – " + maximum;
}


// Frequency distribution
function showFrequency() {

    const container =
        document.getElementById("frequencyList");

    const frequency = {};

    results.forEach(value => {

        frequency[value] =
            (frequency[value] || 0) + 1;

    });


    const sorted =
        Object.entries(frequency)
            .sort((a, b) => b[1] - a[1]);


    container.innerHTML = "";


    sorted.forEach(([value, count]) => {

        const percentage =
            (count / results.length) * 100;


        const item =
            document.createElement("div");

        item.className = "analysis-item";

        item.innerHTML = `
            <div>
                <strong>Value ${value}</strong>
                <span>${count} occurrences</span>
            </div>

            <div class="analysis-percent">
                ${percentage.toFixed(1)}%
            </div>
        `;

        container.appendChild(item);

    });

}


// Recent results
function showRecentResults() {

    const container =
        document.getElementById("recentResults");

    const recent =
        results.slice(-10).reverse();

    container.innerHTML = "";


    recent.forEach((value, index) => {

        const item =
            document.createElement("div");

        item.className = "recent-item";

        item.innerHTML = `
            <span>#${index + 1}</span>
            <strong>${value}</strong>
        `;

        container.appendChild(item);

    });

}


loadAnalysis();
