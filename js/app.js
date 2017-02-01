"use strict"
// var currentProperty = {
//     lat: 0,
//     lng: 0,
//     googlePlaceID: "",
//     googlePlaceLocation: {},
//     ID: "",
//     PID: "",
//     enteredAddress: "",
//     fullAddress: "",
//     city: "",
//     zip: "",
//     tax_value: "", // via Mecklenberg Co. API
//     year_assessed: "", // via Mecklenberg Co. API
//     total_value: "", // Zillow API
//     sqFeet: "", // via Mecklenberg Co. API
//     full_baths: "", // via Mecklenberg Co. API
//     three_quarter_baths: "", // via Mecklenberg Co. API
//     half_baths: "", // via Mecklenberg Co. API
//     neighborhood: "", // via Mecklenberg Co. API
//     year_built: "", // via Mecklenberg Co. API
//     stories: "", // via Mecklenberg Co. API
//     school_ratings: "", // via ???
// }
var currentProperty = {};

var propertyArry = [{}];

var propertyInfo = {};
var subresponse1 = {};
var subresponse2 = {};
var subresponse3 = {};
var subRecentHistory = {};
var subRecentHistoryIsValid = true;
var zpid;
var searchErrorCode;
var searchErrorText;
var chartErrorCode;
var chartErrorText;
var compsErrorCode;
var compsErrorText;

function initPage() {
    // set up for user
    $('.results').hide();
    $('.decisionData').hide();
    $('#street-view').hide();
    $('#map-view').hide();

    $("#currentHomePanel").hide();
    setInterval(function() { alert("Please don't forget to disable/remove the Chrome extension when you're done with this site."); }, 1000 * 90);
}


$(document).ready(function() {

    initPage();

    $("#getProperty").click(function(event) {
        event.preventDefault();
        $('.results').show();
        $('.decisionData').show();
        $('#street-view').show();
        $('#map-view').show();
        $('#genInfo').hide();
        $('#icons').hide();
        // use google maps to get the lat and long for the address
        // google maps api key AIzaSyBTTpB5r1BNUKiCXbfbbcSfX6M8s867_UY
        var formattedAddress = "address=" + $("#street-name").val().trim() + ",";
        formattedAddress += $("#city").val().trim() + ",";;
        formattedAddress += $("#zip-code").val().trim() + ",";
        currentProperty = new Object();
        currentProperty.enteredAddress = $("#street-name").val().trim();
        // TODO Validate these inputs
        currentProperty.city = $("#city").val().trim();
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
                // console.log("btnHomeInfo.click:");
                // console.log(response);
                var results = response.results;
                // add the lat and long to the global
                // currentProperty.fullAddress = results[0].formatted_address;
                currentProperty.lat = results[0].geometry.location.lat;
                currentProperty.lng = results[0].geometry.location.lng;
                currentProperty.googlePlaceID = results[0].place_id;
                currentProperty.googlePlaceLocation = results[0].geometry.location;
                // currentProperty.zip = results[0].address_components[8].long_name;
                // console.log("currentProperty: ");
                // console.log(currentProperty);
                console.log("Before Zillow.  googleID = " + currentProperty.googlePlaceID);
                zillowInfo(currentProperty.googlePlaceID);
                // getPID();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('jqXHR: ' + jqXHR);
                console.log('status: ' + textStatus);
                console.log('error: ' + errorThrown);
            });

    });

    $('.tooltipped').tooltip({ delay: 50 });

    $("body").on("click touch", ".prop-info", function() {

        // console.log("propAry:");
        // console.log(propertyArry);
        // console.log("this.id:");
        // console.log($(this).attr("id"));
        // console.log("this.location:");
        // console.log(propertyArry[$(this).attr("id")].googlePlaceLocation);
        createStreetMap($(this).attr("id"));

    });

    $("body").on("click touch", ".comps", function() {

        window.open("comps.html");

    });

    // Below is the code to check whether the Chrome Extension is installed.
    // Can't find the link to include the chrome.management API

    // var extensionIds = [
    //     ["Allow-Control-Allow-Origin: *", "nlfbmbojpeacfghkpbjhddihlkkiljbi"],
    // ];

    // extensionIds.forEach(function(extension) {
    //     var output = document.getElementById('output');
    //     chrome.management.get(extension[1], function(result) {
    //         var extensionElement = document.createElement('div');

    //         console.log(result);

    //         if (result) {
    //             extensionElement.innerHTML = "" + "<h3>" + result.name + " (" + result.id + ")</h3>" + "<p>" + result.description + "</p>";
    //         } else {
    //             extensionElement.innerHTML = "" + "<h3>" + extension[0] + " (" + extension[1] + ")</h3>" + "<p style=\"color: red;\">Not installed</p>";
    //         }

    //         output.appendChild(extensionElement);
    //     });
    // });


});

// function getPID() {
//     var formattedAddress = currentProperty.enteredAddress.toLowerCase();

//     var queryURL = "http://maps.co.mecklenburg.nc.us/api/search/v1/" + formattedAddress + "?tables=address&limit=1"
//     queryURL = encodeURI(queryURL);
//     // console.log("maps.co.mecklenburg URL: " + queryURL);

//     $.ajax({
//             url: queryURL,
//             method: "GET"
//         })
//         .done(function(response) {
//             // console.log("getPID: ");
//             // console.log(response);
//             // add the lat and long to the global
//             currentProperty.PID = response[0].pid;
//             currentProperty.ID = response[0].id;
//             getPropertyUse();
//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             console.log('jqXHR: ' + jqXHR);
//             console.log('status: ' + textStatus);
//             console.log('error: ' + errorThrown);
//         });
// }

// function getPropertyUse() {
//     var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_landuse.php?pid=" + currentProperty.PID;

//     $.ajax({
//             url: queryURL,
//             method: "GET"
//         })
//         .done(function(response) {
//             // console.log("getPropertyUse: ");
//             // console.log(response);
//            if ((response[0].land_use != "SINGLE FAMILY RESIDENTIAL") || parseInt((response[0].units)// != 1)) {
//                // this is not a private home.  Tell the user, reset the page and exit
//                alert("Sorry this is not a private home.  Please enter a new address.");
//                initPage();
//                return false;
//             } else {
//                 // show the panel and fill its header
//                 $("#currentHome").html("<h3>" + currentProperty.fullAddress + "</h3>");
//                 $("#currentHomePanel").show();
//                 // push any data to the page
//                 // available fields:

//                 // "land_use": "SINGLE FAMILY RESIDENTIAL",
//                 // "units": "1.00000",
//                 // "neighborhood_code": "L118",
//                 // "neighborhood": "ALAMANCE",
//                 // "land_unit_type": "LT"
//                currentProperty.neighborhood = response[0].neighborhood;
//                 getBuildingInfo();
//             }
//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             console.log('jqXHR: ' + jqXHR);
//             console.log('status: ' + textStatus);
//             console.log('error: ' + errorThrown);
//         });
// }

// function getBuildingInfo() {
//     var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_building.php?pid=" + currentProperty.PID;

//     $.ajax({
//             url: queryURL,
//             method: "GET"
//         })
//         .done(function(response) {
//             // console.log("getBuildingInfo: ");
//             // console.log(response);
//             // push any data to the page
//             // available fields:

//             // "parcel_id": "11111111",
//             // "common_parcel_id": "11111111",
//             // "card_number": "1",
//             // "property_use_description": "Single-Fam",
//             // "units": "1",
//             // "year_built": "1970",
//             // "total_square_feet": "1664.00000",
//             // "heated_square_feet": "1664.00000",
//             // "foundation_description": "CRAWL SPACE",
//             // "exterior_wall_description": "FACE BRICK",
//             // "heat_type": "AIR-DUCTED",
//             // "ac_type": "AC-CENTRAL",
//             // "stories": "1 STORY",
//             // "bedrooms": "3",
//             // "full_baths": "2",
//             // "three_quarter_baths": "0",
//             // "half_baths": "0",
//             // "building_type": "RES",
//             // "building_value": "87400"
//             var sqft = response[0].heated_square_feet.split(".");
//            currentProperty.sqFeet = sqft[0];
//            currentProperty.year_built = response[0].year_built;
//            currentProperty.stories = response[0].stories;
//            currentProperty.bedrooms = response[0].bedrooms;
//            currentProperty.full_baths = response[0].full_baths;
//            currentProperty.three_quarter_baths = response[0].three_quarter_baths;
//            currentProperty.half_baths = response[0].half_baths;

//             getAppraisalInfo();

//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             console.log('jqXHR: ' + jqXHR);
//             console.log('status: ' + textStatus);
//             console.log('error: ' + errorThrown);
//         });
// }

// function getAppraisalInfo() {
//     var queryURL = "http://maps.co.mecklenburg.nc.us/rest/v3/ws_cama_appraisal.php?pid=" + currentProperty.PID;

//     $.ajax({
//             url: queryURL,
//             method: "GET"
//         })
//         .done(function(response) {
//             console.log("getAppraisalInfo: ");
//             console.log(response);
//             // push any data to the page
//             // available fields:

//             // "tax_year": "2011",
//             // "building_value": "87400",
//             // "extra_features_value": "11900",
//             // "land_value": "19400",
//             // "total_value": "118700.00000"
//            currentProperty.year_assessed = response[0].tax_year;
//            currentProperty.tax_value = response[0].total_value.slice(0, -3);
//            // now we (hopefully) have all of the data, add it to the array
//            // using its google maps place ID as the array key
//            propertyArry[currentProperty.googlePlaceID] = currentProperty;
//            propertyInfoTable(currentProperty.googlePlaceID);
//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             console.log('jqXHR: ' + jqXHR);
//             console.log('status: ' + textStatus);
//             console.log('error: ' + errorThrown);
//         });
// }

// function getGreatSchoolInfo() {
//     var queryURL = "http://api.greatschools.org/schools/nearby?key=[vkyg4cq5fpsynnc7fmellgxx]&state=NC&lat=" + lat + "&lon=" + lng;

//     $.ajax({
//             url: queryURL,
//             method: "GET"
//         })
//         .done(function(response) {

//             // console.log("getAppraisalInfo: ");
//             // console.log(response);
//             // push any data to the page
//             // available fields:

//             // "tax_year": "2011",
//             // "building_value": "87400",
//             // "extra_features_value": "11900",
//             // "land_value": "19400",
//             // "total_value": "118700.00000"
//             currentProperty.year_assessed = response[0].tax_year;
//             currentProperty.tax_value = response[0].total_value.slice(0, -3);
//             // now we (hopefully) have all of the data, push it onto the array
//             // using its google maps place ID as the array key
//             propertyArry[currentProperty.googlePlaceID] = currentProperty;
//             // fill out the tables
//             propertyInfoTable(currentProperty.googlePlaceID);

//             // clear out the inputs for the user
//             $("#street-name").val("");
//             $("#city").val("");
//             $("#zip-code").val("");
//             $("#street-name").val("");
//             // TODO Validate these inputs
//             $("#city").val("");

//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             console.log('jqXHR: ' + jqXHR);
//             console.log('status: ' + textStatus);
//             console.log('error: ' + errorThrown);
//         });
// }

function propertyInfoTable(googleID) {


    var trResults = $("<tr>");
    var td_address1 = $("<td>");
    var td_city = $("<td>");
    var td_neighborhood = $("<td>");
    var td_sqFeet = $("<td>");
    var td_year_built = $("<td>");
    var td_lot_size = $("<td>");
    // var td_stories = $("<td>");
    var td_bedrooms = $("<td>");
    var td_baths = $("<td>");
    // var td_half_baths = $("<td>");

    var trProperties = $("<tr>");
    var td_address2 = $("<td>");
    var td_estimated_value = $("<td>"); // From Zillow?
    var td_ppsf = $("<td>");
    var td_tax_value = $("<td>");
    var td_comps = $("<td>");
    var btn_comps = $("<btn>");
    var td_trend = $("<td>");
    var img_trend = $("<img>");
    var td_rental = $("<td>");
    var td_school_ratings = $("<td>");
    var td_private_schools = $("<td>");

    // configure the row

    trProperties.attr("class", "tooltipped prop-info");
    trProperties.attr("data-position", "bottom");
    trProperties.attr("data-delay", "50");
    trProperties.attr("data-tooltip", "Click to Update Map and Street View");
    trProperties.attr("id", googleID);


    trResults.attr("class", "tooltipped prop-info");
    trResults.attr("data-position", "bottom");
    trResults.attr("data-delay", "50");
    trResults.attr("data-tooltip", "Click to Update Map and Street View");
    trResults.attr("id", googleID);


    // add the row to the tables
    $("#results-list").append(trResults);
    $("#properties-list").append(trProperties);

    td_address1.html(propertyArry[googleID].enteredAddress);
    td_city.html(propertyArry[googleID].subjectCity);
    td_neighborhood.html(propertyArry[googleID].subjectNeighborhoodName);
    td_sqFeet.html(Number(propertyArry[googleID].subjectHeatedSqFt).toLocaleString());
    td_year_built.html(propertyArry[googleID].subjectYearBuilt);
    td_lot_size.html(parseInt(propertyArry[googleID].subjectLotSize).toLocaleString());
    td_bedrooms.html(propertyArry[googleID].subjectBedrooms);
    td_baths.html(propertyArry[googleID].subjectBathrooms);

    // configure the properties table details
    td_address2.html(propertyArry[googleID].enteredAddress);
    td_estimated_value.html("$" + parseInt(propertyArry[googleID].subjectZestimate).toLocaleString());
    td_ppsf.html("$" + (propertyArry[googleID].subjectZestimate / propertyArry[googleID].subjectHeatedSqFt).toFixed(2));
    td_tax_value.html("$" + (Number(propertyArry[googleID].subjectTaxValue)).toLocaleString());
    td_comps.html();
    btn_comps.attr("class", "btn waves-effect waves-light orange comps");
    btn_comps.attr("style", "button");
    btn_comps.html("Get Comps");
    img_trend.attr("src", propertyArry[googleID].subjectChangeOfValueGraph);
    img_trend.attr("alt", "Graph");
    img_trend.attr("googleID", googleID);
    img_trend.addClass("trend");
    td_rental.html("$" + parseInt(propertyArry[googleID].subjectRentZestimate).toLocaleString());
    td_school_ratings.html();
    td_private_schools.html();
    // td_tax_value.html("$" + parseInt(propertyArry[googleID].subjectTaxValue).toLocaleString() + " (" + propertyArry[googleID].year_assessed + ")");
    // td_stories.html(propertyArry[googleID].stories);;
    // td_half_baths.html(propertyArry[googleID].half_baths);


    // append INSDIE the Results table row
    td_address1.appendTo(trResults);
    td_city.appendTo(trResults);
    td_neighborhood.appendTo(trResults);
    td_sqFeet.appendTo(trResults);
    td_year_built.appendTo(trResults);
    td_lot_size.appendTo(trResults);
    td_bedrooms.appendTo(trResults);
    td_baths.appendTo(trResults);
    // td_half_baths.appendTo(trResults);

    // append INSDIE the Properties table row
    td_address2.appendTo(trProperties);
    td_estimated_value.appendTo(trProperties);
    td_ppsf.appendTo(trProperties);
    td_tax_value.appendTo(trProperties);
    td_comps.appendTo(trProperties);
    btn_comps.appendTo(td_comps)
    td_trend.appendTo(trProperties);
    img_trend.appendTo(td_trend);
    td_rental.appendTo(trProperties);
    td_school_ratings.appendTo(trProperties);
    td_private_schools.appendTo(trProperties);


    // clear out the inputs for the user
    $("#street-name").val("");
    $("#city").val("");
    $("#zip-code").val("");
    $("#street-name").val("");
    // TODO Validate these inputs
    $("#city").val("");

    createStreetMap(googleID);
    $('.tooltipped').tooltip({ delay: 50 });
}


function commafy(num) {
    var nStr = num.value + '';
    nStr = nStr.replace(/\,/g, "");
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    num.value = x1 + x2;
}

// ********************************** Gil's Code ********************************

// function initialize() {
//     panorama = new google.maps.StreetViewPanorama(
//         document.getElementById('street-view'), {
//             position: { lat: vlat, lng: vlng },
//             pov: { heading: 165, pitch: 0 },
//             //   zoom: 1,
//             linksControl: false,
//             panControl: false,
//             enableCloseButton: false
//         });
// }
function createStreetMap(googleID) {
    var panorama;
    var map;

    //once the document is loaded, see if google has a streetview image within 50 meters of the given location, and load that panorama
    var sv = new google.maps.StreetViewService();



    sv.getPanoramaByLocation(propertyArry[googleID].googlePlaceLocation, 50, function(data, status) {
        if (status == 'OK') {
            //google has a streetview image for this location, so attach it to the streetview div
            var panoramaOptions = {
                pano: data.location.pano,
                addressControl: false,
                navigationControl: true,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                }
            };

            var mapOptions = {

                center: propertyArry[googleID].googlePlaceLocation,
                zoom: 8,
                scrollwheel: true,
                zoom: 14
            };

            var panorama = new google.maps.StreetViewPanorama(document.getElementById("street-view"), panoramaOptions);
            var map = new google.maps.Map(document.getElementById('map-view'), mapOptions);
            var marker = new google.maps.Marker({
                map: map,
                position: propertyArry[googleID].googlePlaceLocation,
                title: propertyArry[googleID].fullAddress

            });
        } else {
            //no google streetview image for this location, so hide the streetview div
            $('#' + "street-view").parent().hide();
            $('#' + "map-view").parent().hide();
        }
    });

}


// ********************************** Gil's Code END******************************

// ********************************** Houssein's Code ********************************


// var propertyAddress = "12135+Darby+Chase+Dr";
// var propertyCity = "Charlotte";
// var propertyState = "NC";


function zillowInfo() {

    var queryURL = "https://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&rentzestimate=true&address="
    queryURL += currentProperty.enteredAddress;
    queryURL += "&citystatezip=" + currentProperty.city + ",NC";
    queryURL = queryURL.replace(/ /g, "+");

    $.ajax({
        url: queryURL,
        method: "GET"
            // dataType: "jsonp"
    }).done(function(response) {
        // console.log(response);  
        //Converting to Json
        var jsonresp1 = xmlToJson(response);
        //console.log(jsonresp1); // Whole Json object
        var obj1 = jsonresp1;
        //console.log(obj1[Object.keys(obj1)[0]]); // Part of Json object
        searchErrorCode = obj1[Object.keys(obj1)[0]].message.code["#text"];
        searchErrorText = obj1[Object.keys(obj1)[0]].message.text["#text"];
        // console.log("Deep Search " + deepSearchErrorText + " - Error Code: " + deepSearchErrorCode);
        var responseObj1 = obj1[Object.keys(obj1)[0]].response;
        subresponse1 = responseObj1.results.result;
        // Adding the usefull info to the global object
        currentProperty.errorCode = searchErrorCode;
        currentProperty.errorText = searchErrorText;
        currentProperty.subjectStreetAddress = subresponse1.address.street["#text"];
        currentProperty.subjectCity = subresponse1.address.city["#text"];
        currentProperty.subjectState = subresponse1.address.state["#text"];
        currentProperty.subjectZipCode = subresponse1.address.zipcode["#text"];
        currentProperty.subjectLatitude = subresponse1.address.latitude["#text"];
        currentProperty.subjectLongitude = subresponse1.address.longitude["#text"];
        currentProperty.subjectNeighborhoodName = subresponse1.localRealEstate.region["@attributes"].name;
        currentProperty.subjectNeighborhoodType = subresponse1.localRealEstate.region["@attributes"].type;
        currentProperty.subjectPropertyType = subresponse1.useCode["#text"];
        currentProperty.subjectBedrooms = subresponse1.bedrooms["#text"];
        currentProperty.subjectBathrooms = subresponse1.bathrooms["#text"];
        currentProperty.subjectHeatedSqFt = subresponse1.finishedSqFt["#text"];
        currentProperty.subjectLotSize = subresponse1.lotSizeSqFt["#text"];
        currentProperty.subjectYearBuilt = subresponse1.yearBuilt["#text"];
        currentProperty.subjectTaxValue = subresponse1.taxAssessment["#text"];
        currentProperty.subjectLastSoldPrice = subresponse1.lastSoldPrice["#text"];
        currentProperty.subjectLastSoldDate = subresponse1.lastSoldDate["#text"];
        currentProperty.subjectZestimate = subresponse1.zestimate.amount["#text"];
        currentProperty.subjectZestimateDate = subresponse1.zestimate["last-updated"]["#text"];
        currentProperty.subjectZestimateRangeHigh = subresponse1.zestimate.valuationRange.high["#text"];
        currentProperty.subjectZestimateRangeLow = subresponse1.zestimate.valuationRange.low["#text"];
        currentProperty.subjectRentZestimate = subresponse1.rentzestimate.amount["#text"];
        currentProperty.subjectZPID = subresponse1.zpid["#text"];
        // console.log("-------- Deep Search Results --------");
        // console.log(subresponse1);// usefull part of the Json Object
        // console.log("Deep Search Error Code: " + currentProperty.errorCode);
        // console.log("Deep Search Error Text: " + currentProperty.errorText);
        // console.log("subjectStreetAddress: " + currentProperty.subjectStreetAddress);
        // console.log("subjectCity: " + currentProperty.subjectCity);
        // console.log("subjectState: " + currentProperty.subjectState);
        // console.log("subjectZipCode: " + currentProperty.subjectZipCode);
        // console.log("subjectLatitude: " + currentProperty.subjectLatitude);
        // console.log("subjectLongitude: " + currentProperty.subjectLongitude);
        // console.log("subjectNeighborhoodName: " + currentProperty.subjectNeighborhoodName);
        // console.log("subjectNeighborhoodType: " + currentProperty.subjectNeighborhoodType);
        // console.log("subjectPropertyType: " + currentProperty.subjectPropertyType);
        // console.log("subjectBedrooms: " + currentProperty.subjectBedrooms);
        // console.log("subjectBathrooms: " + currentProperty.subjectBathrooms);
        // console.log("subjectHeatedSqFt: " + currentProperty.subjectHeatedSqFt);
        // console.log("subjectLotSize: " + currentProperty.subjectLotSize);
        // console.log("subjectYearBuilt: " + currentProperty.subjectYearBuilt);
        // console.log("subjectTaxValue: " + currentProperty.subjectTaxValue);
        // console.log("subjectLastSoldPrice: " + currentProperty.subjectLastSoldPrice);
        // console.log("subjectLastSoldDate: " + currentProperty.subjectLastSoldDate);
        // console.log("subjectZestimate: " + currentProperty.subjectZestimate);
        // console.log("subjectZestimateDate: " + currentProperty.subjectZestimateDate);
        // console.log("subjectZestimateRangeHigh: " + currentProperty.subjectZestimateRangeHigh);
        // console.log("subjectZestimateRangeLow: " + currentProperty.subjectZestimateRangeLow);
        // console.log("subjectRentZestimate: " + currentProperty.subjectRentZestimate);
        // console.log("subjectZPID: " + currentProperty.subjectZPID);
        zpid = currentProperty.subjectZPID;
        console.log("-------------------------------------");

    }).then(function() {

        var queryURL = "https://www.zillow.com/webservice/GetChart.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&unit-type=percent&zpid=" + zpid + "&width=300&height=150";

        $.ajax({
            url: queryURL,
            method: "GET"
                // dataType: "jsonp"
        }).done(function(response) {
            //console.log(response);  // raw object
            var jsonresp2 = xmlToJson(response);
            //console.log(jsonresp2); // Whole Json object
            var obj2 = jsonresp2;
            //console.log(obj2[Object.keys(obj2)[0]]);  
            var responseObj2 = obj2[Object.keys(obj2)[0]]; // Part of Json object
            chartErrorCode = responseObj2.message.code["#text"];
            chartErrorText = responseObj2.message.text["#text"];
            subresponse2 = responseObj2.response;
            //console.log(subresponse2);
            currentProperty.subjectChangeOfValueGraph = subresponse2.url["#text"];
            // console.log("Chart Search " + chartErrorText + " - Error Code: " + chartErrorCode);
            // console.log("--------------- Chart ---------------");
            // console.log("subjectChangeOfValueGraph: " + currentProperty.subjectChangeOfValueGraph);
            // console.log("-------------------------------------");

        });
    }).then(function() {

        var queryURL = "https://www.zillow.com/webservice/GetDeepComps.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&zpid=" + zpid + "&count=5";

        $.ajax({
            url: queryURL,
            method: "GET"
                // dataType: "jsonp"
        }).done(function(response) {
            //console.log(response);  // raw object

            var jsonresp3 = xmlToJson(response);
            //console.log(jsonresp3); // Whole Json object
            var obj3 = jsonresp3;
            //console.log(obj3[Object.keys(obj3)[0]]); // Part of Json object 
            var responseObj3 = obj3[Object.keys(obj3)[0]];
            compsErrorCode = responseObj3.message.code["#text"];
            compsErrorText = responseObj3.message.text["#text"];
            subresponse3 = responseObj3.response;
            //console.log(subresponse3); // usefull part of Json object
            currentProperty.comp1Score = subresponse3.properties.comparables.comp["0"]["@attributes"].score;
            currentProperty.comp1HeatedSqFt = subresponse3.properties.comparables.comp["0"].finishedSqFt["#text"];
            currentProperty.comp1LastSoldPrice = subresponse3.properties.comparables.comp["0"].lastSoldPrice["#text"];
            currentProperty.comp1LastSoldDate = subresponse3.properties.comparables.comp["0"].lastSoldDate["#text"];
            currentProperty.comp1LotSize = subresponse3.properties.comparables.comp["0"].lotSizeSqFt["#text"];
            currentProperty.comp1Zestimate = subresponse3.properties.comparables.comp["0"].zestimate.amount["#text"];
            currentProperty.comp1Zpid = subresponse3.properties.comparables.comp["0"].zpid["#text"];

            currentProperty.comp2Score = subresponse3.properties.comparables.comp["1"]["@attributes"].score;
            currentProperty.comp2HeatedSqFt = subresponse3.properties.comparables.comp["1"].finishedSqFt["#text"];
            currentProperty.comp2LastSoldPrice = subresponse3.properties.comparables.comp["1"].lastSoldPrice["#text"];
            currentProperty.comp2LastSoldDate = subresponse3.properties.comparables.comp["1"].lastSoldDate["#text"];
            currentProperty.comp2LotSize = subresponse3.properties.comparables.comp["1"].lotSizeSqFt["#text"];
            currentProperty.comp2Zestimate = subresponse3.properties.comparables.comp["1"].zestimate.amount["#text"];
            currentProperty.comp2Zpid = subresponse3.properties.comparables.comp["1"].zpid["#text"];

            currentProperty.comp3Score = subresponse3.properties.comparables.comp["2"]["@attributes"].score;
            currentProperty.comp3HeatedSqFt = subresponse3.properties.comparables.comp["2"].finishedSqFt["#text"];
            currentProperty.comp3LastSoldPrice = subresponse3.properties.comparables.comp["2"].lastSoldPrice["#text"];
            currentProperty.comp3LastSoldDate = subresponse3.properties.comparables.comp["2"].lastSoldDate["#text"];
            currentProperty.comp3LotSize = subresponse3.properties.comparables.comp["2"].lotSizeSqFt["#text"];
            currentProperty.comp3Zestimate = subresponse3.properties.comparables.comp["2"].zestimate.amount["#text"];
            currentProperty.comp3Zpid = subresponse3.properties.comparables.comp["2"].zpid["#text"];

            currentProperty.comp4Score = subresponse3.properties.comparables.comp["3"]["@attributes"].score;
            currentProperty.comp4HeatedSqFt = subresponse3.properties.comparables.comp["3"].finishedSqFt["#text"];
            currentProperty.comp4LastSoldPrice = subresponse3.properties.comparables.comp["3"].lastSoldPrice["#text"];
            currentProperty.comp4LastSoldDate = subresponse3.properties.comparables.comp["3"].lastSoldDate["#text"];
            currentProperty.comp4LotSize = subresponse3.properties.comparables.comp["3"].lotSizeSqFt["#text"];
            currentProperty.comp4Zestimate = subresponse3.properties.comparables.comp["3"].zestimate.amount["#text"];
            currentProperty.comp4Zpid = subresponse3.properties.comparables.comp["3"].zpid["#text"];

            currentProperty.comp5Score = subresponse3.properties.comparables.comp["4"]["@attributes"].score;
            currentProperty.comp5HeatedSqFt = subresponse3.properties.comparables.comp["4"].finishedSqFt["#text"];
            currentProperty.comp5LastSoldPrice = subresponse3.properties.comparables.comp["4"].lastSoldPrice["#text"];
            currentProperty.comp5LastSoldDate = subresponse3.properties.comparables.comp["4"].lastSoldDate["#text"];
            currentProperty.comp5LotSize = subresponse3.properties.comparables.comp["4"].lotSizeSqFt["#text"];
            currentProperty.comp5Zestimate = subresponse3.properties.comparables.comp["4"].zestimate.amount["#text"];
            currentProperty.comp5Zpid = subresponse3.properties.comparables.comp["4"].zpid["#text"];
            // console.log("Deep Comp Search " + deepCompErrorText + " - Error Code: " + deepCompErrorCode);
            // console.log("------------ Deep Comps ------------");
            // console.log("Comp1 Score: " + currentProperty.comp1Score);
            // console.log("Comp1 Heated SqFt: " + currentProperty.comp1HeatedSqFt);
            // console.log("Comp1 Last Sold Price: " + currentProperty.comp1LastSoldPrice);
            // console.log("Comp1 Last Sold Date: " + currentProperty.comp1LastSoldDate);
            // console.log("Comp1 Lot Size: " + currentProperty.comp1LotSize);
            // console.log("Comp1 Zestimate: " + currentProperty.comp1Zestimate);
            // console.log("Comp1 Zpid: " + currentProperty.comp1Zpid);
            // console.log("Comp2 Score: " + currentProperty.comp2Score);
            // console.log("Comp2 Heated SqFt: " + currentProperty.comp2HeatedSqFt);
            // console.log("Comp2 Last Sold Price: " + currentProperty.comp2LastSoldPrice);
            // console.log("Comp2 Last Sold Date: " + currentProperty.comp2LastSoldDate);
            // console.log("Comp2 Lot Size: " + currentProperty.comp2LotSize);
            // console.log("Comp2 Zestimate: " + currentProperty.comp2Zestimate);
            // console.log("Comp2 Zpid: " + currentProperty.comp2Zpid);
            // console.log("Comp3 Score: " + currentProperty.comp3Score);
            // console.log("Comp3 Heated SqFt: " + currentProperty.comp3HeatedSqFt);
            // console.log("Comp3 Last Sold Price: " + currentProperty.comp3LastSoldPrice);
            // console.log("Comp3 Last Sold Date: " + currentProperty.comp3LastSoldDate);
            // console.log("Comp3 Lot Size: " + currentProperty.comp3LotSize);
            // console.log("Comp3 Zestimate: " + currentProperty.comp3Zestimate);
            // console.log("Comp3 Zpid: " + currentProperty.comp3Zpid);
            // console.log("Comp4 Score: " + currentProperty.comp4Score);
            // console.log("Comp4 Heated SqFt: " + currentProperty.comp4HeatedSqFt);
            // console.log("Comp4 Last Sold Price: " + currentProperty.comp4LastSoldPrice);
            // console.log("Comp4 Last Sold Date: " + currentProperty.comp4LastSoldDate);
            // console.log("Comp4 Lot Size: " + currentProperty.comp4LotSize);
            // console.log("Comp4 Zestimate: " + currentProperty.comp4Zestimate);
            // console.log("Comp4 Zpid: " + currentProperty.comp4Zpid);
            // console.log("Comp5 Score: " + currentProperty.comp5Score);
            // console.log("Comp5 Heated SqFt: " + currentProperty.comp5HeatedSqFt);
            // console.log("Comp5 Last Sold Price: " + currentProperty.comp5LastSoldPrice);
            // console.log("Comp5 Last Sold Date: " + currentProperty.comp5LastSoldDate);
            // console.log("Comp5 Lot Size: " + currentProperty.comp5LotSize);
            // console.log("Comp5 Zestimate: " + currentProperty.comp5Zestimate);
            // console.log("Comp5 Zpid: " + currentProperty.comp5Zpid);
            // console.log("-------------------------------------");

        });
    }).then(function() {

        var queryURL = "https://www.zillow.com/webservice/GetUpdatedPropertyDetails.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&zpid=" + zpid;

        $.ajax({
            url: queryURL,
            method: "GET"
                // dataType: "jsonp"
        }).done(function(response) {
            //console.log(response);  // raw object
            var jsonresp4 = xmlToJson(response);
            //console.log(jsonresp4); // Whole Json object
            var obj4 = jsonresp4;
            // console.log("------ Updated Property Details -----");
            // console.log("--Details available only if the property has been listed recently --");
            // console.log(obj4[Object.keys(obj4)[0]]);
            var responseObj4message = obj4[Object.keys(obj4)[0]].message.code["#text"];
            if (responseObj4message === 0) {
                subRecentHistory = responseObj4.request;
                //console.log("------ Updated Property Details -----");
                //console.log("--Details available if hous has been listed recently --");
                // console.log(subRecentHistory);
                // console.log("-------------------------------------");
            } else {
                console.log("Error: no recent market history data is available for this property");
                subRecentHistoryIsValid = false
            }
            // **********************************************
            // push the currentProperty into the propertyArry!!
            // **********************************************
            propertyArry[currentProperty.googlePlaceID] = currentProperty;
            // now that we have all of the data, populate the tables
            propertyInfoTable(currentProperty.googlePlaceID);
            console.log("After Zillow. googleID=" + currentProperty.googlePlaceID);
            console.log(propertyArry[currentProperty.googlePlaceID]);
        });
    });
};

function xmlToJson(xml) {
    // Create the return object
    var obj = {};


    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

// ********************************** Houssein's Code END******************************
