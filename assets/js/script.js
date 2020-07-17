
var parkArray = [];
var parkNameEl;
var nationalPark = "";
var parkNameBody = document.querySelector("#parkName-btn")
var savePark = [];
var parkNameInput = "";
var parkBtnId = [];
var counter = 0;
var parkNum = 9;

// retrieve park name from user input and pass to fetch
function getInputParkData() {
    var parkName = $(parkNameEl).val().trim();
    if (!parkName) {

        // Adds class to pull up modal if nothing is put input
        $("#modal-popup").addClass("is-active");
        window.setTimeout(disablemodal, 5000);
        console.log("no park name ");
    }
    else {
        getParkData(cleanParkInput(parkName));
    };
}
// Turn the Modal off after 5 seconds
function disablemodal() {
    $("#modal-popup").removeClass("is-active");
}

function cleanParkInput(parkName) {
    var cleanInput = parkName.split(" ");
    var cleanName = cleanInput.filter(noSpaces => noSpaces !== "");
    return cleanName.join(" ").toLowerCase();
}

var apiKey = ""
// first fetch to get park code and coordinates
function getParkData(parkName) {
    var apiUrl = `https://developer.nps.gov/api/v1/parks?q=${parkName}%20national%20park&sort=-name&api_key=${apiKey}`;
    fetch(apiUrl)
        .then(function (response) {
            if (!response.ok) {
                $("#modal-popup").addClass("is-active");
                window.setTimeout(disablemodal, 5000);
                console.log("no park name ");
                return Promise.reject(response);
            }
            else {
                return response.json();
            }
        })
        .then(function (response) {
            // If misspelled or no park is found modal is brought up 
            if (response.data[0] === undefined) {
                $("#modal-popup").addClass("is-active");
                window.setTimeout(disablemodal, 5000);
                console.log("no park name ");
            }
            var parkId = response.data[0].parkCode;
            var parkLong = response.data[0].longitude;
            var parkLat = response.data[0].latitude;
            //should probably display url of park when page loads and message
            // instructing users to click link for information on park and campground fees
            var parkUrl = response.data[0].url
            $("#search-park-input, #forecast-park").html(`<a href=${parkUrl} target="_blank">${parkName.toUpperCase()} NATIONAL PARK</a>`);
            // send park coordinates to get 7 day forecast
            getParkWeatherData(parkLat, parkLong);
            var apiCampgroundUrl = `https://developer.nps.gov/api/v1/campgrounds?parkCode=${parkId}&api_key=${apiKey}`;
            return fetch(apiCampgroundUrl);
        })
        .then(function (response) {
            if (!response.ok) {
                $("#modal-popup").addClass("is-active");
                window.setTimeout(disablemodal, 5000);
                console.log("no park name ");
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
            saveParkData();
        })
        .catch(function (error) {
            //    alertModal();
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
            $(campUrlEl).html(`<a href=${campUrl} target="_blank">${campName}</a>`);
            $(listItemEl).append(campUrlEl);
            var campReserve = campArray[i].reservationUrl;
            if (!campReserve) {
                var campReserveEl = $("<p>").attr("style", "margin:0px")
                    .text("Campsites available only on a first come first serve basis!");
            }
            else {
                campReserveEl = $("<a>").attr("id", "camp-reserve-url");
                $(campReserveEl).html(`<a href=${campReserve} target="_blank">Reservations</a>`);
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
// daily weather forecast for the next 7 days
function getParkWeatherData(lat, lon) {
    var apiWeatherKey = "";
    // plug in coordinates to get data with all needed information
    var apiUrlCoord = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minute&units=imperial&appid=${apiWeatherKey}`
    fetch(apiUrlCoord)
        .then(function (response) {
            if (!response.ok) {
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
            //    alertModal();
            console.log(error);
        });
}
var saveParkData = function () {
    if (!nationalPark || savePark.includes(nationalPark)) {
        return
    } else {
        //save data to local storage giving us a max of 10 parks
        savePark.unshift(nationalPark);
        if (savePark.length === 11) {
            savePark.pop();
        };
        localStorage.setItem("parks", JSON.stringify(savePark));
    }
    getParkName();
}
var getParkName = function () {
    //retrieve the parks saved in local storage
    var savedParkName = localStorage.getItem("parks");
    if (savedParkName) {
        savedParkName = JSON.parse(savedParkName);
        $("#parkName-btn").empty();
        for (var i = 0; i < savedParkName.length; i++) {
            var parkNameId = savedParkName[i] + "btn";
            displayButton(savedParkName[i], parkNameId);
            savePark.push(savedParkName[i]);
        }
    }
}
var displayButton = function (savedParkName, parkBtn) {
    //creating the buttons from the saved parks
    parkBtn = document.createElement("button");
    parkBtn.innerHTML = savedParkName;
    parkNameBody.appendChild(parkBtn);
    parkNameInput = savedParkName;
    parkBtn.id = savedParkName;
    parkBtnId.unshift(savedParkName);
    $(parkBtn).addClass('camp-btn').attr('onclick', 'buttonOnClick(this.id);');
}
var buttonOnClick = function (id) {
    getParkData(id);
}
$(document).ready(function () {
    parkNameEl = $(".search-input");
    $("#search-btn").click(function (event) {
        nationalPark = document.querySelector("#parkName").value;
        event.preventDefault();
        getInputParkData();
    });
    getParkName();
})
