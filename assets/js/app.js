currentProperty = {
  lat: 0,
  lng: 0,
  googlePlaceID: "",
  ID: "",
  PID: "",
  enteredAddress: "",
  fullAddress: "",
  city: "Charlotte",
  zip: "00000"
}

function initPage() {
  // set up for user
  $("#currentHomePanel").hide();
}


$(document).ready(function() {

  initPage();

  $("#btnHomeInfo").click(function(event) {
    event.preventDefault();
    // use google maps to get the lat and long for the address
    // google maps api key AIzaSyBTTpB5r1BNUKiCXbfbbcSfX6M8s867_UY
    var formattedAddress = "address=" + $("#inputAddress").val().trim() + ",";
    formattedAddress += $("#inputCity").val().trim() + ",";;
    formattedAddress += $("#inputZip").val().trim() + ",";
    currentProperty.enteredAddress = $("#inputAddress").val().trim();
    // TODO Validate these inputs

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

        // what next?
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('jqXHR: ' + jqXHR);
        console.log('status: ' + textStatus);
        console.log('error: ' + errorThrown);
      });
  }


  $(window).resize(function() {
    // reSize();
  });

  // reSize();
});
