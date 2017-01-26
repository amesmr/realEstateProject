currentProperty = {
    lat: 0,
    lng: 0,
    googlePlaceID: "",
    ID: "",
    PID: "",
    enteredAddress: "",
    fullAddress: "",
    city: "",
    zip: "",
    tax_value: "", // via Mecklenberg Co. API
    year_assessed: "", // via Mecklenberg Co. API
    total_value: "", // Zillow API
    sqFeet: "", // via Mecklenberg Co. API
    full_baths: "", // via Mecklenberg Co. API
    three_quarter_baths: "", // via Mecklenberg Co. API
    half_baths: "", // via Mecklenberg Co. API
    neighborhood: "", // via Mecklenberg Co. API
    year_built: "", // via Mecklenberg Co. API
    stories: "", // via Mecklenberg Co. API
    school_ratings: "", // via ???
}

propertyArry = [{}];

function initPage() {
    // set up for user
    $("#currentHomePanel").hide();
}


$(document).ready(function() {

    initPage();

    $("#submit-button").click(function(event) {
        event.preventDefault();
        // use google maps to get the lat and long for the address
        // google maps api key AIzaSyBTTpB5r1BNUKiCXbfbbcSfX6M8s867_UY
        var formattedAddress = "address=" + $("#street-name").val().trim() + ",";
        formattedAddress += $("#city").val().trim() + ",";;
        formattedAddress += $("#zip-code").val().trim() + ",";
        currentProperty.enteredAddress = $("#street-name").val().trim();
        // TODO Validate these inputs
        currentProperty.city=$("#city").val().trim();
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?";
        queryURL += formattedAddress;
        queryURL += "&key=AIzaSyBTTpB5r1BNUKiCXbfbbcSfX6M8s867_UY";
        // console.log("Unencoded URL: " + queryURL);
        queryURL = encodeURI(queryURL);
        // console.log("Encoded URL: " + queryURL);

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            .done(function(response) {
                console.log("btnHomeInfo.click:");
                console.log(response);
                var results = response.results;
                // add the lat and long to the global
                currentProperty.fullAddress = results[0].formatted_address;
                currentProperty.lat = results[0].geometry.location.lat;
                currentProperty.lng = results[0].geometry.location.lng;
                currentProperty.googlePlaceID = results[0].place_id;
                currentProperty.zip = results[0].address_components[8].long_name;
                console.log("currentProperty: ");
                console.log(currentProperty);
                getPID();

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('jqXHR: ' + jqXHR);
                console.log('status: ' + textStatus);
                console.log('error: ' + errorThrown);
            });

    });

  $("body").on("click touch", ".prop-info", function() {
    initialize($(this).attr("id"));
  });

    $(window).resize(function() {
        // reSize();
    });

    // reSize();
});

function getPID() {
    var formattedAddress = currentProperty.enteredAddress.toLowerCase();

    var queryURL = "http://maps.co.mecklenburg.nc.us/api/search/v1/" + formattedAddress + "?tables=address&limit=1"
    queryURL = encodeURI(queryURL);
    // console.log("maps.co.mecklenburg URL: " + queryURL);

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .done(function(response) {
            console.log("getPID: ");
            console.log(response);
            // add the lat and long to the global
            currentProperty.PID = response[0].pid;
            currentProperty.ID = response[0].id;
            getPropertyUse();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: ' + jqXHR);
            console.log('status: ' + textStatus);
            console.log('error: ' + errorThrown);
        });
}

function getPropertyUse() {
    var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_landuse.php?pid=" + currentProperty.PID;

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .done(function(response) {
            console.log("getPropertyUse: ");
            console.log(response);
            if ((response[0].land_use != "SINGLE FAMILY RESIDENTIAL") || parseInt((response[0].units) != 1)) {
                // this is not a private home.  Tell the user, reset the page and exit
                alert("Sorry this is not a private home.  Please enter a new address.");
                initPage();
                return false;
            } else {
                // show the panel and fill its header
                $("#currentHome").html("<h3>" + currentProperty.fullAddress + "</h3>");
                $("#currentHomePanel").show();
                // push any data to the page
                // available fields:

                // "land_use": "SINGLE FAMILY RESIDENTIAL",
                // "units": "1.00000",
                // "neighborhood_code": "L118",
                // "neighborhood": "ALAMANCE",
                // "land_unit_type": "LT"
                currentProperty.neighborhood = response[0].neighborhood;
                getBuildingInfo();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: ' + jqXHR);
            console.log('status: ' + textStatus);
            console.log('error: ' + errorThrown);
        });
}

function getBuildingInfo() {
    var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_building.php?pid=" + currentProperty.PID;

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .done(function(response) {
            console.log("getBuildingInfo: ");
            console.log(response);
            // push any data to the page
            // available fields:

            // "parcel_id": "11111111",
            // "common_parcel_id": "11111111",
            // "card_number": "1",
            // "property_use_description": "Single-Fam",
            // "units": "1",
            // "year_built": "1970",
            // "total_square_feet": "1664.00000",
            // "heated_square_feet": "1664.00000",
            // "foundation_description": "CRAWL SPACE",
            // "exterior_wall_description": "FACE BRICK",
            // "heat_type": "AIR-DUCTED",
            // "ac_type": "AC-CENTRAL",
            // "stories": "1 STORY",
            // "bedrooms": "3",
            // "full_baths": "2",
            // "three_quarter_baths": "0",
            // "half_baths": "0",
            // "building_type": "RES",
            // "building_value": "87400"
            var sqft = response[0].heated_square_feet.split(".");
            currentProperty.sqFeet = sqft[0];
            currentProperty.year_built = response[0].year_built;
            currentProperty.stories = response[0].stories;
            currentProperty.bedrooms = response[0].bedrooms;
            currentProperty.full_baths = response[0].full_baths;
            currentProperty.three_quarter_baths = response[0].three_quarter_baths;
            currentProperty.half_baths = response[0].half_baths;

            getAppraisalInfo();

        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: ' + jqXHR);
            console.log('status: ' + textStatus);
            console.log('error: ' + errorThrown);
        });
}

function getAppraisalInfo() {
    var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_appraisal.php?pid=" + currentProperty.PID;

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .done(function(response) {
            console.log("getAppraisalInfo: ");
            console.log(response);
            // push any data to the page
            // available fields:

            // "tax_year": "2011",
            // "building_value": "87400",
            // "extra_features_value": "11900",
            // "land_value": "19400",
            // "total_value": "118700.00000"
            currentProperty.year_assessed = response[0].tax_year;
            currentProperty.tax_value = response[0].total_value.slice(0, -3);
            // now we (hopefully) have all of the data, add it to the array
            // using its google maps place ID as the array key
            propertyArry[currentProperty.googlePlaceID] = currentProperty;
            propertyInfoTable(currentProperty.googlePlaceID);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: ' + jqXHR);
            console.log('status: ' + textStatus);
            console.log('error: ' + errorThrown);
        });
}

function propertyInfoTable(googleID) {
    var tr = $("<tr>");
    var td_address = $("<td>");
    var td_city = $("<td>");
    var td_neighborhood = $("<td>");
    var td_sqFeet = $("<td>");
    var td_ppsf = $("<td>");
    var td_school_ratings = $("<td>");
    var td_tax_value = $("<td>");
    var td_estimated_value = $("<td>"); // From Zillow?
    var td_year_built = $("<td>");
    var td_stories = $("<td>");
    var td_bedrooms = $("<td>");
    var td_full_baths = $("<td>");
    var td_three_quarter_baths = $("<td>");
    var td_half_baths = $("<td>");

    // configure the row
    tr.attr("id", googleID);
    tr.attr("class", "prop-info");
    $("#properties-list").append(tr);

    // configure the table details
    td_address.html(propertyArry[googleID].enteredAddress);
    td_city.html(propertyArry[googleID].city);
    td_neighborhood.html(propertyArry[googleID].neighborhood);
    td_sqFeet.html(propertyArry[googleID].sqFeet);
    td_ppsf.html("$" + propertyArry[googleID].total_value / propertyArry[googleID].sqFeet);
    td_school_ratings.html(propertyArry[googleID].td_school_ratings);
    td_tax_value.html("$" + parseInt(propertyArry[googleID].tax_value).toLocaleString() + " (" + propertyArry[googleID].year_assessed + ")");
    td_estimated_value.html("$" + propertyArry[googleID].total_value);
    td_year_built.html(propertyArry[googleID].year_built);
    td_stories.html(propertyArry[googleID].stories);
    td_bedrooms.html(propertyArry[googleID].bedrooms);
    td_full_baths.html(propertyArry[googleID].full_baths);
    td_three_quarter_baths.html(propertyArry[googleID].three_quarter_baths);
    td_half_baths.html(propertyArry[googleID].half_baths);

    // append INSDIE the table row
    td_address.appendTo(tr);
    td_city.appendTo(tr);
    td_neighborhood.appendTo(tr);
    td_sqFeet.appendTo(tr);
    td_ppsf.appendTo(tr);
    td_school_ratings.appendTo(tr);
    td_tax_value.appendTo(tr);
    td_estimated_value.appendTo(tr);
    td_year_built.appendTo(tr);
    td_stories.appendTo(tr);
    td_bedrooms.appendTo(tr);
    td_full_baths.appendTo(tr);
    td_three_quarter_baths.appendTo(tr);
    td_half_baths.appendTo(tr);
    initialize(googleID);
}




// ********************************** Gil's Code ********************************

function initialize(googleID) {
    if (googleID == undefined) {return false;}
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
            position: { lat: propertyArry[googleID].lat, lng: propertyArry[googleID].lng },
            pov: { heading: 165, pitch: 0 },
            //   zoom: 1,
            linksControl: false,
            panControl: false,
            enableCloseButton: false
        });
}




// ********************************** Gil's Code END******************************

// ********************************** Houssein's Code ********************************






// ********************************** Houssein's Code END******************************
