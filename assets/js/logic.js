
dayjs.extend(window.dayjs_plugin_advancedFormat);

var usesGivenKey = false;

function cardMaker(location, temp, feelsLike, humidity, windSpeed, windDir, iconcode, $element, timestamp) {

    var currentTime = dayjs(timestamp * 1000);

    var cardTemplate = (`<section class="card text-bg-light d-flex justify-content-between align-items-center" style="width:260px;">
                            <div class="icon" class="card-image-top">
                                <img class="wicon" src="http://openweathermap.org/img/w/` + iconcode + `.png" alt="Weather icon"></img>
                            </div>
                            <div class="card-body card-content"> 
                                <div class="card-title fs-5">` + location + `</div>
                                <div class="card-title fs-5">` + currentTime.format("dddd [the] Do [of] MMMM, YYYY") + `</div>
                                <div class="card-title card-temp fs-5"> Temperature: `+ temp + ` °c </div>
                                <div class="card-title card-temp fs-5"> Feels like: ` + feelsLike + ` °c </div>
                                <div class="card-title card-humidity fs-5"> Humidity: ` + humidity + `% </div>
                                <div class="card-title card-wind fs-5"> Wind Speed: ` + windSpeed + ` m/s </div>
                                <div class="card-title card-wind fs-5"> Wind Direction: ` + windDir + `° </div>
                            </div> 
                        </section>`);

    $element.append(cardTemplate);
}

function renderLookup(arr) {

    var $locations = $('#locations');
    $locations.empty();

    for (var i = 0; i < arr.length; i++) {

        var locationStr = "";

        if (arr[i].name) {
            locationStr += arr[i].name;
        }

        if (arr[i].state) {
            locationStr += " " + arr[i].state;
        }

        if (arr[i].country) {
            locationStr += " " + arr[i].country;
        }

        var template = $('<div class="btn btn-primary location-btn isInLookup my-1 w-100 h-3r" data-lon="' + arr[i].lon + '"data-lat="' + arr[i].lat + '"  data-text="' + locationStr + '">' + locationStr + '</div>');

        $locations.append(template);
    }
}


function handleLookup(event) {

    event.preventDefault();

    var STORED_KEY = localStorage.getItem('key');

    var location = $('#lookup-input').val();

    var queryGEO = 'http://api.openweathermap.org/geo/1.0/direct?q=' + location + '&limit=5&appid=' + STORED_KEY;

    fetch(queryGEO)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            renderLookup(data);
        })
        .catch((err) => console.log("Error in geocoding: " + err));

}

async function handleSearch(event) {

    event.preventDefault();

    $clicked = $(event.target);
    $history = $('#history');
    var lat = $clicked.attr("data-lat");
    var lon = $clicked.attr("data-lon");
    var text = $clicked.attr("data-text");
    var STORED_KEY = localStorage.getItem('key');



    if ($clicked.hasClass('isInLookup')) {
        $clicked.removeClass('isInLookup');
        var historyStr = retrieveHistory();
        var historyArr = JSON.parse(historyStr);

        historyArr[historyArr.length] = { text: text, lat: lat, lon: lon }

        localStorage.setItem('button-history', JSON.stringify(historyArr));

        $history.empty();
        renderHistory(historyArr, $('#history'));

        var $locations = $('#locations');
        $locations.empty();
    }


    if (lat && lon) {
        var queryURICurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + STORED_KEY + "&units=metric";

        var queryURIFiveDay = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + STORED_KEY + "&units=metric";

        fetch(queryURICurrent)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                $('#today').empty();
                cardMaker(data.name, data.main.temp, data.main.feels_like, data.main.humidity, data.wind.speed, data.wind.deg, data.weather[0].icon, $('#today'), data.dt);
            })
            .catch((err) => console.log("An error occured while fetching the current data: " + err));

        fetch(queryURIFiveDay)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                var locationName = data.city.name;

                $('#forecast').empty();
                for (let i = 0; i < data.list.length; i++) {
                    var myDt_Txt = data.list[i].dt_txt;
                    if (myDt_Txt.includes("12:00:00")) {
                        console.log(data.list[i]);
                        cardMaker(locationName, data.list[i].main.temp, data.list[i].main.feels_like, data.list[i].main.humidity, data.list[i].wind.speed, data.list[i].wind.deg, data.list[i].weather[0].icon, $('#forecast'), data.list[i].dt);
                    }
                }
            })
            .catch((err) => console.log("An error occured while fetching the five day data: " + err));
    }
}

function clearHistory() {

    localStorage.setItem('button-history', JSON.stringify([""]));
    $('#history').empty();

}

function retrieveHistory() {

    var historyStr = localStorage.getItem('button-history');

    if (!historyStr) {
        localStorage.setItem('button-history', JSON.stringify([""]));
        return JSON.stringify([""]);
    } else {
        return historyStr
    }

}

function renderHistory(arr, $element) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].lat) {
            var button = $('<div class="btn btn-primary location-btn my-1 w-100 h-3r" data-lon="' + arr[i].lon + '"data-lat="' + arr[i].lat + '">' + arr[i].text + '</div>');
            $element.prepend(button);
        }
    }
}

function checkForKey() {
    if (!localStorage.getItem('key')) {
        if (!API_KEY) {
            usesGivenKey = true;
            var GIVEN_KEY = prompt("No api key detected.  Please enter one here:");
            localStorage.setItem('key', GIVEN_KEY)
        }
        else localStorage.setItem('key', API_KEY);
    }
}

$(document).on("submit", handleLookup);
$(document).on("click", '.location-btn', handleSearch);
$('#clear-history').on("click", clearHistory);

checkForKey();

renderHistory(JSON.parse(retrieveHistory()), $('#history'));