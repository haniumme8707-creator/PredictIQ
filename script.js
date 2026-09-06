// ================================
// PredictIQ — Dashboard Logic
// ================================

// Demo dataset
// Later we will replace this with
// a proper dataset + prediction model.

const results = [
    7, 3, 8, 8, 2,
    6, 4, 7, 5, 8,
    3, 6, 7, 2, 5,
    8, 4, 6, 7, 3
];


// ================================
// BASIC STATISTICS
// ================================

function calculateStats(data) {

    const total = data.length;

    if (total === 0) {
        return {
            mostCommon: null,
            average: 0,
            total: 0
        };
    }

    const frequency = {};

    data.forEach(number => {
        frequency[number] = (frequency[number] || 0) + 1;
    });

    let mostCommon = data[0];

    Object.keys(frequency).forEach(number => {

        if (
            frequency[number] >
            (frequency[mostCommon] || 0)
        ) {
            mostCommon = Number(number);
        }

    });

    const sum = data.reduce(
        (total, number) => total + number,
        0
    );

    const average = sum / total;

    return {
        mostCommon,
        average,
        total
    };
}


// ================================
// SIMPLE DEMO PREDICTION
// ================================

function generatePrediction(data) {

    if (data.length === 0) {
        return {
            prediction: "—",
            confidence: 0
        };
    }

    const stats = calculateStats(data);

    /*
       IMPORTANT:
       This is only a demonstration
       statistical rule.

       It is NOT a guaranteed
       prediction model.
    */

    const prediction = stats.mostCommon;

    const frequency = data.filter(
        value => value === prediction
    ).length;

    const confidence =
        Math.round((frequency / data.length) * 100);

    return {
        prediction,
        confidence
    };
}


// ================================
// UPDATE DASHBOARD
// ================================

function updateDashboard() {

    const stats = calculateStats(results);

    const prediction =
        generatePrediction(results);


    // Prediction
    document.getElementById(
        "predictionValue"
    ).textContent = prediction.prediction;


    // Confidence
    document.getElementById(
        "confidence"
    ).textContent =
        prediction.confidence + "%";


    // Data count
    document.getElementById(
        "dataCount"
    ).textContent = stats.total;


    // Demo statistics
    document.getElementById(
        "accuracy"
    ).textContent = "—";


    document.getElementById(
        "totalPredictions"
    ).textContent = "0";


    document.getElementById(
        "correctPredictions"
    ).textContent = "0";


    document.getElementById(
        "wrongPredictions"
    ).textContent = "0";
}


// ================================
// MOBILE MENU
// ================================

const menuBtn =
    document.getElementById("menuBtn");

const nav =
    document.querySelector("nav");


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            if (nav.style.display === "flex") {

                nav.style.display = "none";

            } else {

                nav.style.display = "flex";
                nav.style.flexDirection = "column";
                nav.style.position = "absolute";
                nav.style.top = "74px";
                nav.style.right = "5%";
                nav.style.padding = "20px";

                nav.style.background = "#10131a";
                nav.style.border = "1px solid rgba(255,255,255,0.08)";
                nav.style.borderRadius = "15px";

            }

        }
    );

}


// ================================
// START
// ================================

updateDashboard();
