
async function cardMaker(location, temp, feelsLike, humidity, windSpeed, windDir, iconcode, $element) {

    var $icon = $('<div id="icon" class="card-image-top"><img id="wicon" src="http://openweathermap.org/img/w/' + iconcode + '.png" alt="Weather icon"></img></div>');

    var cardTemplate = ('<section class="card text-bg-light"> <div class="card-body card-content"> </div> </section>');
    $element.append(cardTemplate);
    $('.card').prepend($icon);
    $('.card-content').append($('<div class="card-title fs-5">' + location + '</div>'));
    $('.card-content').append($('<div class="card-title card-temp fs-5">' + "Temperature: "+ temp + " celsius" + '</div>'));
    $('.card-content').append($('<div class="card-title card-temp fs-5">' + "Feels like: " + feelsLike + " celsius" + '</div>'));
    $('.card-content').append($('<div class="card-title card-humidity fs-5">' + "Humidity: " + humidity + '</div>'));
    $('.card-content').append($('<div class="card-title card-wind fs-5">' + "Wind Speed: " + windSpeed +'</div>'));
    $('.card-content').append($('<div class="card-title card-wind fs-5">' + "Wind Directon: " + windDir + " degrees" + '</div>'));
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

        var template = $('<div class="btn btn-secondary location-btn isInLookup my-1 w-100 h-3r" data-lon="' + arr[i].lon + '"data-lat="' + arr[i].lat + '"  data-text="' + locationStr + '">' + locationStr + '</div>');

        $locations.append(template);
    }
}


function handleLookup(event) {

    event.preventDefault();

    var location = $('#lookup-input').val();

    var queryGEO = 'http://api.openweathermap.org/geo/1.0/direct?q=' + location + '&limit=5&appid=' + API_KEY;

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
        var queryURICurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY + "&units=metric";

        var queryURIFiveDay = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY + "&units=metric";

        fetch(queryURICurrent)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                $('#today').empty();
                cardMaker(data.name, data.main.temp, data.main.feels_like, data.main.humidity, data.wind.speed, data.wind.deg, data.weather[0].icon, $('#today'));
            })
            .catch((err) => console.log("An error occured while fetching the current data: " + err));

        fetch(queryURIFiveDay)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => console.log("An error occured while fetching the five day data: " + err));
    }
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

function renderHistory(arr, element) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].lat) {
            var button = $('<div class="btn btn-secondary location-btn my-1 w-100 h-3r" data-lon="' + arr[i].lon + '"data-lat="' + arr[i].lat + '">' + arr[i].text + '</div>');
            element.prepend(button);
        }
    }
}


$('#lookup-button').on("click", handleLookup);
$(document).on("click", '.location-btn', handleSearch);

renderHistory(JSON.parse(retrieveHistory()), $('#history'));