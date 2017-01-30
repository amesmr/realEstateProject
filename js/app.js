"use strict"
var currentProperty = {
    lat: 0,
    lng: 0,
    googlePlaceID: "",
    googlePlaceLocation: {},
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

var propertyArry = [{}];
var panorama;
var vlat = 35.225218;
var vlng = -80.847322;

function initPage() {
    // set up for user
    $("#currentHomePanel").hide();
}


$(document).ready(function() {

    initPage();

    $("#getProperty").click(function(event) {
        event.preventDefault();
         $('#genInfo').hide();
         $('#addressInput').hide();
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
                currentProperty.fullAddress = results[0].formatted_address;
                currentProperty.lat = results[0].geometry.location.lat;
                currentProperty.lng = results[0].geometry.location.lng;
                currentProperty.googlePlaceID = results[0].place_id;
                currentProperty.googlePlaceLocation = results[0].geometry.location;
                currentProperty.zip = results[0].address_components[8].long_name;
                // console.log("currentProperty: ");
                // console.log(currentProperty);
                getPID();

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('jqXHR: ' + jqXHR);
                console.log('status: ' + textStatus);
                console.log('error: ' + errorThrown);
            });

    });

    $("body").on("click touch", ".prop-info", function() {

        console.log("propAry:");
        console.log(propertyArry);
        console.log("this.id:");
        console.log($(this).attr("id"));
        console.log("this.location:");
        console.log(propertyArry[$(this).attr("id")].googlePlaceLocation);
        createStreetMap(propertyArry[$(this).attr("id")].googlePlaceLocation);

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
            // console.log("getPID: ");
            // console.log(response);
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
            // console.log("getPropertyUse: ");
            // console.log(response);
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
            // console.log("getBuildingInfo: ");
            // console.log(response);
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
//------------------------------------------------------------------------//

function getGreatSchoolInfo() {
    var queryURL = "http://api.greatschools.org/schools/nearby?key=[vkyg4cq5fpsynnc7fmellgxx]&state=NC&lat=" + lat + "&lon=" + lng;

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .done(function(response) {

            // console.log("getAppraisalInfo: ");
            // console.log(response);
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

            // clear out the inputs for the user

            $("#street-name").val("");
            $("#city").val("");
            $("#zip-code").val("");
            $("#street-name").val("");
            // TODO Validate these inputs
            $("#city").val("");

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
    tr.tooltip({ 
        tip: "#tipTxt", 
        delay: 0 
    });

    // add the row to the table
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

    createStreetMap(propertyArry[googleID].googlePlaceLocation);
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
function createStreetMap(location){
   var panorama;
   var map;

   //once the document is loaded, see if google has a streetview image within 50 meters of the given location, and load that panorama
   var sv = new google.maps.StreetViewService();
   

   sv.getPanoramaByLocation(location, 50, function(data, status) {
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
            center: {lat: currentProperty.lat, lng: currentProperty.lng},
            zoom: 8,
            scrollwheel: false,
            zoom: 14
           };

           var panorama = new google.maps.StreetViewPanorama(document.getElementById("street-view"), panoramaOptions);
           var map = new google.maps.Map(document.getElementById('map-view'), mapOptions);
           var marker = new google.maps.Marker({
             map: map,
             position: {lat: currentProperty.lat, lng: currentProperty.lng},
             title: 'Target!'
           });
       }
       else{
           //no google streetview image for this location, so hide the streetview div
           $('#' + "street-view").parent().hide();
           $('#' + "map-view").parent().hide();
       }
   });

}


// ********************************** Gil's Code END******************************

// ********************************** Houssein's Code ********************************

    var propertyAddress = "12135+Darby+Chase+Dr";
    var propertyCity = "Charlotte";
    var propertyState = "NC";

    var propertyInfo = {};
    var subresponse1 = {};
    var subresponse2 = {};
    var subresponse3 = {};
    var subresponse4 = {};
    var subresponse4IsValid = true;
    var zpid;
    $("#button").on("click",function() {

        var queryURL = "https://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&rentzestimate=true&address=" + propertyAddress + "&citystatezip=" + propertyCity + "%2C+" + propertyState;

        $.ajax({
            url: queryURL,
            method: "GET"
            // dataType: "jsonp"
        }).done(function(response) { 
            //console.log(response);  
            //Converting to Json
            var jsonresp1 = xmlToJson(response);
            //console.log(jsonresp1); // Whole Json object
            var obj1 = jsonresp1;
            //console.log(obj1[Object.keys(obj1)[0]]); // Part of Json object
            var deepSearchErrorCode = obj1[Object.keys(obj1)[0]].message.code["#text"];
            var deepSearchErrorText = obj1[Object.keys(obj1)[0]].message.text["#text"];
            console.log("Deep Search " + deepSearchErrorText + " - Error Code: " + deepSearchErrorCode);
            var responseObj1 = obj1[Object.keys(obj1)[0]].response;
            subresponse1 = responseObj1.results.result;
            console.log("-------- Deep Search Results --------");
            //console.log(subresponse1);// usefull part of the Json Object
            // Adding the usefull info to the global object
            propertyInfo.errorCode = deepSearchErrorCode;
            console.log("Deep Search Error Code: " + propertyInfo.errorCode);
            propertyInfo.errorText = deepSearchErrorText;
            console.log("Deep Search Error Text: " + propertyInfo.errorText);
            propertyInfo.subjectStreetAddress = subresponse1.address.street["#text"];
            console.log("subjectStreetAddress: " + propertyInfo.subjectStreetAddress);
            propertyInfo.subjectCity = subresponse1.address.city["#text"];
            console.log("subjectCity: " + propertyInfo.subjectCity);
            propertyInfo.subjectState = subresponse1.address.state["#text"];
            console.log("subjectState: " + propertyInfo.subjectState);      
            propertyInfo.subjectZipCode = subresponse1.address.zipcode["#text"];
            console.log("subjectZipCode: " + propertyInfo.subjectZipCode);
            propertyInfo.subjectLatitude = subresponse1.address.latitude["#text"];
            console.log("subjectLatitude: " + propertyInfo.subjectLatitude);
            propertyInfo.subjectLongitude = subresponse1.address.longitude["#text"];
            console.log("subjectLongitude: " + propertyInfo.subjectLongitude);
            propertyInfo.subjectNeighborhoodName = subresponse1.localRealEstate.region["@attributes"].name;
            console.log("subjectNeighborhoodName: " + propertyInfo.subjectNeighborhoodName);
            propertyInfo.subjectNeighborhoodType = subresponse1.localRealEstate.region["@attributes"].type;
            console.log("subjectNeighborhoodType: " + propertyInfo.subjectNeighborhoodType);
            propertyInfo.subjectPropertyType = subresponse1.useCode["#text"];
            console.log("subjectPropertyType: " + propertyInfo.subjectPropertyType);
            propertyInfo.subjectBedrooms = subresponse1.bedrooms["#text"];
            console.log("subjectBedrooms: " + propertyInfo.subjectBedrooms);
            propertyInfo.subjectBathrooms = subresponse1.bathrooms["#text"];
            console.log("subjectBathrooms: " + propertyInfo.subjectBathrooms);      
            propertyInfo.subjectHeatedSqFt = subresponse1.finishedSqFt["#text"];
            console.log("subjectHeatedSqFt: " + propertyInfo.subjectHeatedSqFt);
            propertyInfo.subjectLotSize = subresponse1.lotSizeSqFt["#text"];
            console.log("subjectLotSize: " + propertyInfo.subjectLotSize);
            propertyInfo.subjectYearBuilt = subresponse1.yearBuilt["#text"];
            console.log("subjectYearBuilt: " + propertyInfo.subjectYearBuilt);
            propertyInfo.subjectTaxValue = subresponse1.taxAssessment["#text"];
            console.log("subjectTaxValue: " + propertyInfo.subjectTaxValue);
            propertyInfo.subjectLastSoldPrice = subresponse1.lastSoldPrice["#text"];
            console.log("subjectLastSoldPrice: " + propertyInfo.subjectLastSoldPrice);
            propertyInfo.subjectLastSoldDate = subresponse1.lastSoldDate["#text"];
            console.log("subjectLastSoldDate: " + propertyInfo.subjectLastSoldDate);
            propertyInfo.subjectZestimate = subresponse1.zestimate.amount["#text"];
            console.log("subjectZestimate: " + propertyInfo.subjectZestimate);
            propertyInfo.subjectZestimateDate = subresponse1.zestimate["last-updated"]["#text"];
            console.log("subjectZestimateDate: " + propertyInfo.subjectZestimateDate);
            propertyInfo.subjectZestimateRangeHigh = subresponse1.zestimate.valuationRange.high["#text"];
            console.log("subjectZestimateRangeHigh: " + propertyInfo.subjectZestimateRangeHigh);
            propertyInfo.subjectZestimateRangeLow = subresponse1.zestimate.valuationRange.low["#text"];
            console.log("subjectZestimateRangeLow: " + propertyInfo.subjectZestimateRangeLow);      
            propertyInfo.subjectRentZestimate = subresponse1.rentzestimate.amount["#text"];
            console.log("subjectRentZestimate: " + propertyInfo.subjectRentZestimate);
            propertyInfo.subjectZPID = subresponse1.zpid["#text"];
            console.log("subjectZPID: " + propertyInfo.subjectZPID);
            zpid = propertyInfo.subjectZPID;
            console.log("-------------------------------------");

        }).then(function() {

            var queryURL = "http://www.zillow.com/webservice/GetChart.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&unit-type=percent&zpid=" + zpid + "&width=300&height=150";

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
                var chartErrorCode = responseObj2.message.code["#text"];
                var chartErrorText = responseObj2.message.text["#text"];
                console.log("Chart Search " + chartErrorText + " - Error Code: " + chartErrorCode);
                subresponse2 = responseObj2.response;
                console.log("--------------- Chart ---------------");
                //console.log(subresponse2);
                propertyInfo.subjectChangeOfValueGraph = subresponse2.url["#text"];
                console.log("subjectChangeOfValueGraph: " + propertyInfo.subjectChangeOfValueGraph);
                console.log("-------------------------------------");

            });
        }).then(function() {

            var queryURL = "http://www.zillow.com/webservice/GetDeepComps.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&zpid=" + zpid + "&count=5";

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
                var deepCompErrorCode = responseObj3.message.code["#text"];
                var deepCompErrorText = responseObj3.message.text["#text"];
                console.log("Deep Comp Search " + deepCompErrorText + " - Error Code: " + deepCompErrorCode);
                subresponse3 = responseObj3.response;
                console.log("------------ Deep Comps ------------");
                //console.log(subresponse3); // usefull part of Json object
                propertyInfo.comp1Score = subresponse3.properties.comparables.comp["0"]["@attributes"].score;
                console.log("Comp1 Score: " + propertyInfo.comp1Score);
                propertyInfo.comp1HeatedSqFt = subresponse3.properties.comparables.comp["0"].finishedSqFt["#text"];
                console.log("Comp1 Heated SqFt: " + propertyInfo.comp1HeatedSqFt);
                propertyInfo.comp1LastSoldPrice = subresponse3.properties.comparables.comp["0"].lastSoldPrice["#text"];
                console.log("Comp1 Last Sold Price: " + propertyInfo.comp1LastSoldPrice);
                propertyInfo.comp1LastSoldDate = subresponse3.properties.comparables.comp["0"].lastSoldDate["#text"];
                console.log("Comp1 Last Sold Date: " + propertyInfo.comp1LastSoldDate);
                propertyInfo.comp1LotSize = subresponse3.properties.comparables.comp["0"].lotSizeSqFt["#text"];
                console.log("Comp1 Lot Size: " + propertyInfo.comp1LotSize);
                propertyInfo.comp1Zestimate = subresponse3.properties.comparables.comp["0"].zestimate.amount["#text"];
                console.log("Comp1 Zestimate: " + propertyInfo.comp1Zestimate);
                propertyInfo.comp1Zpid = subresponse3.properties.comparables.comp["0"].zpid["#text"];
                console.log("Comp1 Zpid: " + propertyInfo.comp1Zpid);

                propertyInfo.comp2Score = subresponse3.properties.comparables.comp["1"]["@attributes"].score;
                console.log("Comp2 Score: " + propertyInfo.comp2Score);
                propertyInfo.comp2HeatedSqFt = subresponse3.properties.comparables.comp["1"].finishedSqFt["#text"];
                console.log("Comp2 Heated SqFt: " + propertyInfo.comp2HeatedSqFt);
                propertyInfo.comp2LastSoldPrice = subresponse3.properties.comparables.comp["1"].lastSoldPrice["#text"];
                console.log("Comp2 Last Sold Price: " + propertyInfo.comp2LastSoldPrice);
                propertyInfo.comp2LastSoldDate = subresponse3.properties.comparables.comp["1"].lastSoldDate["#text"];
                console.log("Comp2 Last Sold Date: " + propertyInfo.comp2LastSoldDate);
                propertyInfo.comp2LotSize = subresponse3.properties.comparables.comp["1"].lotSizeSqFt["#text"];
                console.log("Comp2 Lot Size: " + propertyInfo.comp2LotSize);
                propertyInfo.comp2Zestimate = subresponse3.properties.comparables.comp["1"].zestimate.amount["#text"];
                console.log("Comp2 Zestimate: " + propertyInfo.comp2Zestimate);
                propertyInfo.comp2Zpid = subresponse3.properties.comparables.comp["1"].zpid["#text"];
                console.log("Comp2 Zpid: " + propertyInfo.comp2Zpid);

                propertyInfo.comp3Score = subresponse3.properties.comparables.comp["2"]["@attributes"].score;
                console.log("Comp3 Score: " + propertyInfo.comp3Score);
                propertyInfo.comp3HeatedSqFt = subresponse3.properties.comparables.comp["2"].finishedSqFt["#text"];
                console.log("Comp3 Heated SqFt: " + propertyInfo.comp3HeatedSqFt);
                propertyInfo.comp3LastSoldPrice = subresponse3.properties.comparables.comp["2"].lastSoldPrice["#text"];
                console.log("Comp3 Last Sold Price: " + propertyInfo.comp3LastSoldPrice);
                propertyInfo.comp3LastSoldDate = subresponse3.properties.comparables.comp["2"].lastSoldDate["#text"];
                console.log("Comp3 Last Sold Date: " + propertyInfo.comp3LastSoldDate);
                propertyInfo.comp3LotSize = subresponse3.properties.comparables.comp["2"].lotSizeSqFt["#text"];
                console.log("Comp3 Lot Size: " + propertyInfo.comp3LotSize);
                propertyInfo.comp3Zestimate = subresponse3.properties.comparables.comp["2"].zestimate.amount["#text"];
                console.log("Comp3 Zestimate: " + propertyInfo.comp3Zestimate);
                propertyInfo.comp3Zpid = subresponse3.properties.comparables.comp["2"].zpid["#text"];
                console.log("Comp3 Zpid: " + propertyInfo.comp3Zpid);

                propertyInfo.comp4Score = subresponse3.properties.comparables.comp["3"]["@attributes"].score;
                console.log("Comp4 Score: " + propertyInfo.comp4Score);
                propertyInfo.comp4HeatedSqFt = subresponse3.properties.comparables.comp["3"].finishedSqFt["#text"];
                console.log("Comp4 Heated SqFt: " + propertyInfo.comp4HeatedSqFt);
                propertyInfo.comp4LastSoldPrice = subresponse3.properties.comparables.comp["3"].lastSoldPrice["#text"];
                console.log("Comp4 Last Sold Price: " + propertyInfo.comp4LastSoldPrice);
                propertyInfo.comp4LastSoldDate = subresponse3.properties.comparables.comp["3"].lastSoldDate["#text"];
                console.log("Comp4 Last Sold Date: " + propertyInfo.comp4LastSoldDate);
                propertyInfo.comp4LotSize = subresponse3.properties.comparables.comp["3"].lotSizeSqFt["#text"];
                console.log("Comp4 Lot Size: " + propertyInfo.comp4LotSize);
                propertyInfo.comp4Zestimate = subresponse3.properties.comparables.comp["3"].zestimate.amount["#text"];
                console.log("Comp4 Zestimate: " + propertyInfo.comp4Zestimate);
                propertyInfo.comp4Zpid = subresponse3.properties.comparables.comp["3"].zpid["#text"];
                console.log("Comp4 Zpid: " + propertyInfo.comp4Zpid);

                propertyInfo.comp5Score = subresponse3.properties.comparables.comp["4"]["@attributes"].score;
                console.log("Comp5 Score: " + propertyInfo.comp5Score);
                propertyInfo.comp5HeatedSqFt = subresponse3.properties.comparables.comp["4"].finishedSqFt["#text"];
                console.log("Comp5 Heated SqFt: " + propertyInfo.comp5HeatedSqFt);
                propertyInfo.comp5LastSoldPrice = subresponse3.properties.comparables.comp["4"].lastSoldPrice["#text"];
                console.log("Comp5 Last Sold Price: " + propertyInfo.comp5LastSoldPrice);
                propertyInfo.comp5LastSoldDate = subresponse3.properties.comparables.comp["4"].lastSoldDate["#text"];
                console.log("Comp5 Last Sold Date: " + propertyInfo.comp5LastSoldDate);
                propertyInfo.comp5LotSize = subresponse3.properties.comparables.comp["4"].lotSizeSqFt["#text"];
                console.log("Comp5 Lot Size: " + propertyInfo.comp5LotSize);
                propertyInfo.comp5Zestimate = subresponse3.properties.comparables.comp["4"].zestimate.amount["#text"];
                console.log("Comp5 Zestimate: " + propertyInfo.comp5Zestimate);
                propertyInfo.comp5Zpid = subresponse3.properties.comparables.comp["4"].zpid["#text"];
                console.log("Comp5 Zpid: " + propertyInfo.comp5Zpid);
                console.log("-------------------------------------");

            });
        }).then(function() {

            var queryURL = "http://www.zillow.com/webservice/GetUpdatedPropertyDetails.htm?zws-id=X1-ZWz1fm57445z4b_1sm5d&zpid=" + zpid;

            $.ajax({
              url: queryURL,
              method: "GET"
              // dataType: "jsonp"
            }).done(function(response) {
                //console.log(response);  // raw object
                var jsonresp4 = xmlToJson(response);
                //console.log(jsonresp4); // Whole Json object
                var obj4 = jsonresp4;
                console.log("------ Updated Property Details -----");
                console.log("--Details available only if the property has been listed recently --");
                console.log(obj4[Object.keys(obj4)[0]]);  
                var responseObj4message = obj4[Object.keys(obj4)[0]].message.code["#text"];
                if(responseObj4message === 0) {
                    subresponse4 = responseObj4.request;
                    //console.log("------ Updated Property Details -----");
                    //console.log("--Details available if hous has been listed recently --");
                    console.log(subresponse4);
                    console.log("-------------------------------------");
                }else {
                    console.log("Error: no updated data is available for this property");
                    subresponse4IsValid = false
                }
            });
        });

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
                for(var i = 0; i < xml.childNodes.length; i++) {
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

    });








  /*function getGreatSchoolRating() {           
         var queryURL = "http://api.greatschools.org/schools/nearby?key=[vkyg4cq5fpsynnc7fmellgxx]&state=NC& "&lon=" + lng;

            $.ajax({
                     url: queryURL,
                      method: "GET"
                   })
             .done(function(response) {
               console.log("getGreatSchoolRating ");                  
               console.log(response); 
               */                          
               //--------------------------------------------
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
                                    if (googleID == undefined) {
                                        return false; }
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
