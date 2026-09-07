let results = [];

async function loadResults() {
    try {
        const response = await fetch("data/results.json");

        if (!response.ok) {
            throw new Error("Data load nahi hua");
        }

        results = await response.json();

        updateDashboard();

    } catch (error) {
        console.error("Error:", error);

        const dataCount = document.getElementById("dataCount");

        if (dataCount) {
            dataCount.textContent = "Error";
        }
    }
}


// Calculate basic statistics
function calculateStats(data) {

    if (!data.length) {
        return {
            mostCommon: "-",
            frequency: 0,
            average: 0,
            total: 0
        };
    }

    const frequency = {};

    data.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1;
    });

    let mostCommon = data[0];
    let highestFrequency = frequency[data[0]];

    Object.keys(frequency).forEach(value => {

        if (frequency[value] > highestFrequency) {
            mostCommon = Number(value);
            highestFrequency = frequency[value];
        }

    });

    const total = data.length;

    const average =
        data.reduce((sum, value) => sum + value, 0) / total;

    return {
        mostCommon,
        frequency: highestFrequency,
        average,
        total
    };
}


// Generate demo prediction
function generatePrediction(data) {

    const stats = calculateStats(data);

    if (!data.length) {
        return {
            value: "-",
            confidence: 0
        };
    }

    const confidence =
        (stats.frequency / stats.total) * 100;

    return {
        value: stats.mostCommon,
        confidence: confidence
    };
}


// Update dashboard
function updateDashboard() {

    const prediction = generatePrediction(results);
    const stats = calculateStats(results);

    const predictionValue =
        document.getElementById("predictionValue");

    const confidence =
        document.getElementById("confidence");

    const dataCount =
        document.getElementById("dataCount");

    const accuracy =
        document.getElementById("accuracy");

    const totalPredictions =
        document.getElementById("totalPredictions");

    const correctPredictions =
        document.getElementById("correctPredictions");

    const wrongPredictions =
        document.getElementById("wrongPredictions");


    if (predictionValue) {
        predictionValue.textContent = prediction.value;
    }

    if (confidence) {
        confidence.textContent =
            prediction.confidence.toFixed(1) + "%";
    }

    if (dataCount) {
        dataCount.textContent = stats.total;
    }


    // Demo values for now
    if (accuracy) {
        accuracy.textContent = "—";
    }

    if (totalPredictions) {
        totalPredictions.textContent = "0";
    }

    if (correctPredictions) {
        correctPredictions.textContent = "0";
    }

    if (wrongPredictions) {
        wrongPredictions.textContent = "0";
    }
}


// Mobile menu
const menuButton = document.getElementById("menuBtn");
const navigation = document.querySelector(".navbar nav");

if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        navigation.classList.toggle("mobile-open");

    });

}// Mobile menu
const menuButton = document.getElementById("menuBtn");
const navigation = document.querySelector(".navbar nav");

if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        navigation.classList.toggle("mobile-open");

    });

}
