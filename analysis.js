let results = [];


// Load data
async function loadAnalysis() {

    try {

        const response =
            await fetch("../data/results.json");

        if (!response.ok) {
            throw new Error("Data load failed");
        }

        results = await response.json();

        showStatistics();
        showFrequency();
        showRecentResults();

    } catch (error) {

        console.error("Analysis error:", error);

        const list =
            document.getElementById("frequencyList");

        if (list) {
            list.textContent =
                "Unable to load data.";
        }

    }

}


// Statistics
function showStatistics() {

    if (!results.length) return;


    const total =
        results.length;


    const sum =
        results.reduce(
            (a, b) => a + Number(b),
            0
        );


    const average =
        sum / total;


    const minimum =
        Math.min(...results);


    const maximum =
        Math.max(...results);


    const frequency = {};


    results.forEach(value => {

        frequency[value] =
            (frequency[value] || 0) + 1;

    });


    let mostCommon =
        results[0];


    Object.keys(frequency).forEach(value => {

        if (
            frequency[value] >
            frequency[mostCommon]
        ) {

            mostCommon =
                Number(value);

        }

    });


    document.getElementById("totalData")
        .textContent = total;


    document.getElementById("average")
        .textContent =
        average.toFixed(2);


    document.getElementById("mostCommon")
        .textContent =
        mostCommon;


    document.getElementById("range")
        .textContent =
        minimum + " – " + maximum;

}


// Frequency chart + list
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
            .sort(
                (a, b) =>
                    Number(a[0]) -
                    Number(b[0])
            );


    container.innerHTML = "";


    sorted.forEach(([value, count]) => {

        const percentage =
            (count / results.length) * 100;


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
                    ${count} occurrences
                </div>

            </div>


            <div class="bar-area">

                <div
                    class="bar-fill"
                    style="width:${percentage}%"
                ></div>

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


    if (!container) return;


    const recent =
        results
            .slice(-10)
            .reverse();


    container.innerHTML = "";


    recent.forEach((value, index) => {

        const item =
            document.createElement("div");


        item.className =
            "recent-item";


        item.innerHTML = `

            <span>
                #${index + 1}
            </span>

            <strong>
                ${value}
            </strong>

        `;


        container.appendChild(item);

    });

}


// Mobile menu
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


// Start
loadAnalysis();
