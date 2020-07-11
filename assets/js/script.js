var parkArray = [];
var parkNameEl;

// retrieve park name from user input and pass to fetch
function getInputParkData() {
    var parkName = $(parkNameEl).val().trim();
    if (!parkName) {
        // some alert message
    }
    else {
        cleanParkInput(parkName);
        getParkData(parkName);
    }
}
function cleanParkInput(parkName) {
   var cleanInput = parkName.split(" ");
   var cleanName = cleanInput.filter(noSpaces => noSpaces !=="");
   return cleanName.join(" ").toLowerCase();
}

var apiKey = "aqSeG01qbzM1PxC6rl1RhVTduggetxV6DyVBxjar"
// first fetch to get park code and coordinates
function getParkData(parkName) {
    var apiUrl = `https://developer.nps.gov/api/v1/parks?q=${parkName}%20national%20park&sort=-name&api_key=${apiKey}`;
    fetch(apiUrl)
        .then(function (response) {
            if (!response.ok) {
                // some alert message
                return Promise.reject(response);
            }
            else {
                return response.json();
            }
        })
        .then(function (response) {
            var parkId = response.data[0].parkCode;
            var parkLong = response.data[0].longitude;
            var parkLat = response.data[0].latitude;
            //should probably display url of park when page loads and message
            // instructing users to click link for information on park and campground fees
            var parkUrl = response.data[0].url
            $("#search-park-input, #forecast-park").html(`<a href=${parkUrl}>${parkName.toUpperCase()} NATIONAL PARK</a>`);
            // send park coordinates to get 7 day forecast
            getParkWeatherData(parkLat, parkLong);
            var apiCampgroundUrl = `https://developer.nps.gov/api/v1/campgrounds?parkCode=${parkId}&api_key=${apiKey}`;
            return fetch(apiCampgroundUrl);
        })
        .then(function (response) {
            if (!response.ok) {
                // some alert message
                return Promise.reject(response);
            }
            else {
                return response.json();
            }
        })
        .then(function (response) {
            // get campground data
            var campArray = response.data;
            // put campground info into array and send to its own function for processing 
            // send inputted park name to function to put in local storage
            displayCampgroundInfo(campArray);
            savParkName(parkName);
        })
        .catch(function (error) {
            console.log(error);
        })
}
function displayCampgroundInfo(campArray) {
    var campInfo = ("#bullet-point");
    $(campInfo).empty();
    $("#park-description").empty();
    // use a for loop to determine which campgrounds allow rv's
    for (var i = 0; i < campArray.length; i++) {
        if (campArray[i].accessibility.rvAllowed = 1) {
            var listItemEl = $("<li>").addClass("camp-items").attr("id", "camp-item");
            var campName = campArray[i].name;
            var campUrl = campArray[i].url;
            var campUrlEl = $("<a>").attr("id", "camp-url");
            $(campUrlEl).html(`<a href=${campUrl}>${campName}</a>`);
            $(listItemEl).append(campUrlEl);
            var campReserve = campArray[i].reservationUrl;
            if (!campReserve) {
                var campReserveEl = $("<p>").attr("style", "margin:0px")
                    .text("Campsites available only on a first come first serve basis!");
            }
            else {
                campReserveEl = $("<a>").attr("id", "camp-reserve-url");
                $(campReserveEl).html(`<a href=${campReserve}>Reservations</a>`);
            }
            var listSpace = $("<div>").text(" ");
            $(listItemEl).append(listSpace);
            $(listItemEl).append(campReserveEl);
            $(campInfo).append(listItemEl);
            var campDesc = campArray[i].description;
            var campImg = campArray[i].images[0];
            if (!campImg) {
                var campImgEl = $("<p>").html("<p> No Image Available <br></p>")
                    .addClass("no-camp-pic").attr("id", "no-pic-camp");
            }
            else {
                campImgUrl = campArray[i].images[0].url
                campImgEl = $("<img>").addClass("park-image")
                    .attr("id", "park-img").attr("src", campImgUrl);
            }
            $("#park-description").append(campImgEl);
            $("#park-description").append(campDesc);
        }
    }
}
function savParkName(parkName) {
    // save parks to local storage, max of 10, last park entered is first in array
    // last park in array is sliced out of array
    if (!parkArray.includes(parkName)) {
        parkArray.unshift(parkName);
    }
    parkArray = parkArray.slice(0, 10);
    localStorage.setItem("parksKey", JSON.stringify(parkArray));
}
// daily weather forecast for the next 7 days
function getParkWeatherData(lat, lon) {
    var apiWeatherKey = "d26f4f6b4558c822bbb01131aac44003";
    // plug in coordinates to get data with all needed information
    var apiUrlCoord = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minute&units=imperial&appid=${apiWeatherKey}`
    fetch(apiUrlCoord)
        .then(function (response) {
            if (!response.ok) {
                // alert("Weather for this city is not available");
                return Promise.reject(response);
            }
            else {
                return response.json();
            }
        })
        .then(function (response) {
            $("#forecast-prediction").empty();
            // use a for loop to get 7 day forecast, create cards dynamically
            for (var i = 0; i < 7; i++) {
                var dailyDivEl = $("<div>").addClass("daily-div");
                var dailyDate = moment().add(i, "days").format("MMMM Do");
                var dailyDateEl = $("<h4>").addClass("date-item").text(dailyDate);
                $(dailyDivEl).append(dailyDateEl);
                var iconUrl = `http://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}@2x.png`;
                var dailyIconEl = $("<img>").addClass("daily-icon").attr("src", iconUrl);
                $(dailyDivEl).append(dailyIconEl);
                var dailyHighEl = $("<p>").addClass("temp-max").text("High " + response.daily[i].temp.max + "F");
                var dailyLowEl = $("<p>").addClass("temp-min").text("Low " + response.daily[i].temp.min + "F");
                $(dailyDivEl).append(dailyHighEl).append(dailyLowEl);
                var dailyHumidity = $("<p>").addClass("daily-humidity").text("Humidity " + response.daily[i].humidity + "%");
                $(dailyDivEl).append(dailyHumidity);
                $("#forecast-prediction").append(dailyDivEl);
            }
        }).catch(function (error) {
            console.log(error);
        })
}

$(document).ready(function () {
    parkNameEl = $(".search-input");
    $("#search-btn").click(function (event) {
        event.preventDefault();
        getInputParkData();
    });
    //    loadParks();
})