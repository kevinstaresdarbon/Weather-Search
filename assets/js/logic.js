function renderLookup(arr){

    var $locations = $('#locations');
        $locations.empty();

    for (var i=0; i < arr.length; i++){

        var locationStr = "";

        if (arr[i].name){
            locationStr += arr[i].name;
        }

        if (arr[i].state){
            locationStr += " " + arr[i].state;
        }

        if (arr[i].country){
            locationStr += " " + arr[i].country;
        }

        var template =  $('<div class="btn btn-secondary location-btn my-1 w-100" data-lon="' + arr[i].lon +'"data-lat="' + arr[i].lat + '">' + locationStr + '</div>');

        $locations.append(template);
    }
}


function handleLookup(event){

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

function handleSearch(event){
    
    event.preventDefault();

    $clicked = $(event.target);

    var lat = $clicked.attr("data-lat");
    var lon = $clicked.attr("data-lon");

    if(lat&&lon){
        var queryURICurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;

        var queryURIFiveDay = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;

        fetch(queryURICurrent)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
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

$('#lookup-button').on("click", handleLookup);
$('#locations').on("click", '.location-btn', handleSearch);