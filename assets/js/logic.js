// use this to give access to advanced format options in dayjs().format()
dayjs.extend(window.dayjs_plugin_advancedFormat);

var usesGivenKey = false;

// helper function to make and style cards given the correct parameters, requires a target $element in which to append the card

function cardMaker(location, temp, feelsLike, humidity, windSpeed, windDir, iconcode, $element, timestamp) {

    var currentTime = dayjs(timestamp * 1000); //openweathermap.org counts in seconds so convert to milliseconds for dayjs

    // notice the use of backticks in the formation of cardTemplate!  url for icon formed from advice given on stackoverflow.com
    var cardTemplate = `<section class="card text-bg-light d-flex justify-content-between align-items-center" style="width:260px;">
                            <div class="icon" class="card-image-top">
                                <img class="wicon" src="https://openweathermap.org/img/w/` + iconcode + `.png" alt="Weather icon"></img>
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
                        </section>`;

    $element.append(cardTemplate);
}

function renderLookup(arr) {

    var $locations = $('#locations');
    $locations.empty();

    for (var i = 0; i < arr.length; i++) {

        var locationStr = "";

// used if blocks here since the data comes back differently for different locations

        if (arr[i].name) {
            locationStr += arr[i].name;
        }

        if (arr[i].state) {
            locationStr += " " + arr[i].state;
        }

        if (arr[i].country) {
            locationStr += " " + arr[i].country;
        }

        // saves the geo-coding information and location string to the button

        var template = $('<div class="btn btn-primary location-btn isInLookup my-1 w-100 h-3r" data-lon="' + arr[i].lon + '"data-lat="' + arr[i].lat + '"  data-text="' + locationStr + '">' + locationStr + '</div>');

        $locations.append(template);
    }
}

// this function is used to provide different address options given a search term

function handleLookup(event) {

    event.preventDefault();

    var STORED_KEY = localStorage.getItem('key');

    var location = $('#lookup-input').val();

    var queryGEO = 'https://api.openweathermap.org/geo/1.0/direct?q=' + location + '&limit=5&appid=' + STORED_KEY;

    fetch(queryGEO)
        .then((response) => response.json())
        .then((data) => {
            renderLookup(data);
        })
        .catch((err) => console.log("Error in geocoding: " + err));

}

async function handleSearch(event) {

    event.preventDefault();

    $clicked = $(event.target);
    $history = $('#history');
    //grab the necessary information from the data-* on the generated buttons
    var lat = $clicked.attr("data-lat");
    var lon = $clicked.attr("data-lon");
    var text = $clicked.attr("data-text");

    var STORED_KEY = localStorage.getItem('key');


// check to see if the button was clicked from the lookup pane. if so copy it to the history pane and add an entry to localStorage so that it persists there.
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
        // set the query url variables from the supplied information
        var queryURICurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + STORED_KEY + "&units=metric";

        var queryURIFiveDay = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + STORED_KEY + "&units=metric";

        //fetch the data
        fetch(queryURICurrent)
            .then((response) => response.json())
            .then((data) => {
                //clear the current (if any) contents and replace them with a card made from the returned data
                $('#today').empty();
                cardMaker(data.name, data.main.temp, data.main.feels_like, data.main.humidity, data.wind.speed, data.wind.deg, data.weather[0].icon, $('#today'), data.dt);
            })
            .catch((err) => console.log("An error occured while fetching the current data: " + err));

        fetch(queryURIFiveDay)
            .then((response) => response.json())
            .then((data) => {
                var locationName = data.city.name;
                // empty the forecast div 
                $('#forecast').empty();
                //loop over the data extracting 5 forecast elements to draw
                for (let i = 0; i < data.list.length; i++) {
                    var myDt_Txt = data.list[i].dt_txt;
                    // I chose to select only the 5 pieces of information that relates to midday localtime for my forecast 
                    if (myDt_Txt.includes("12:00:00")) {
                        //replace the 5 cards into the forecast div
                        cardMaker(locationName, data.list[i].main.temp, data.list[i].main.feels_like, data.list[i].main.humidity, data.list[i].wind.speed, data.list[i].wind.deg, data.list[i].weather[0].icon, $('#forecast'), data.list[i].dt);
                    }
                }
            })
            .catch((err) => console.log("An error occured while fetching the five day data: " + err));
    }
}

// an option to clear the button history is always nice!
function clearHistory() {

    localStorage.setItem('button-history', JSON.stringify([""]));
    $('#history').empty();

}

// this helper function protects us from the situation where there is no button-history key in storage
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

// this is used to set an api key into local storage
async function checkForKey() {
    if (!localStorage.getItem('key')) {

        usesGivenKey = true;
        var GIVEN_KEY = prompt("No api key detected.  Please enter one here:");
        localStorage.setItem('key', GIVEN_KEY);

    }
}

// added this in-case a bad key gets put into storage
function resetKey() {
    localStorage.removeItem('key');
    location.reload();
}

// initialise event handlers
$(document).on("submit", handleLookup);
$(document).on("click", '.location-btn', handleSearch);
$('#clear-history').on("click", clearHistory);
$('#resetKeyBtn').on("click", resetKey);

// call this to ensure a key is set
checkForKey();

// call this to persist the button-history
renderHistory(JSON.parse(retrieveHistory()), $('#history'));