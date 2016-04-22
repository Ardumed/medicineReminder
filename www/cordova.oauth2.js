/*
 * cordova.oauth2.js - v0.1.1
 *
 * jQuery plugin to do Oauth2 login using either authorization code
 * grant or implicit grant method in a Cordova application
 *
 * Usage:
 *   $.oauth2(options, successCallback, errorCallback);
 *
 *   $.oauth2({
 *        auth_url: '',         // required
 *        response_type: '',    // required
 *        token_url: '',        // required if response_type = 'code'
 *        logout_url: '',       // recommended if available
 *        client_id: '',        // required
 *        client_secret: '',    // required if response_type = 'code'
 *        redirect_uri: '',     // required - some dummy url
 *        other_params: {}      // optional params object for scope, state, display...
 *    }, function(token, response){
 *          // do something with token and response
 *    }, function(error){
 *          // do something with error
 *    });
 *
 *
 *
 *
*/

(function($){
    $.oauth2 = function (options, successCallback, errorCallback) {

        // checks if all the required oauth2 params are defined
        var checkOauth2Params = function(options){
            var missing = "";
            if(!options.client_id) {missing += " client_id"}
            if(!options.auth_url) {missing += " auth_url"}
            if(!options.response_type) {missing += " response_type"}
            if(!options.client_secret && options.response_type == "code") {missing += " client_secret"}
            if(!options.token_url && options.response_type == "code") {missing += " token_url"}
            if(!options.redirect_uri) {missing += " redirect_uri"}
            if(missing){
                var error_msg = "Oauth2 parameters missing:" + missing;
                errorCallback(error_msg, {error:error_msg});
                return false;
            } else {
                return true;
            }
        }

        // performs logout after oauth redirect
        var oauth2Logout = function(options){
            if(options.logout_url){
                var s = document.createElement("script");
                s.src = options.logout_url;
                $("head").append(s);
            }
        }

        // String prototype to parse and get url params
        String.prototype.getParam = function( str ){
            str = str.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regex = new RegExp( "[\\?&]*"+str+"=([^&#]*)" );
            var results = regex.exec( this );
            if( results == null ){
                return "";
            } else {
                return results[1];
            }
        }

        // if params missing return
        if(!checkOauth2Params(options)) return;

        // build oauth login url
        var paramObj = {
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: options.response_type
        };
        $.extend(paramObj, options.other_params);
        var login_url = options.auth_url + '?' + $.param(paramObj);

        // open Cordova inapp-browser with login url
        var loginWindow = window.open(login_url, '_blank', 'location=yes');

        // check if redirect url has code, access_token or error
        $(loginWindow).on('loadstart', function(e) {
            var url = e.originalEvent.url;

            // if authorization code method check for code/error in url param
            if(options.response_type == "code"){
                url = url.split("#")[0];
                var code = url.getParam("code");
                var error = url.getParam("error");
                if (code || error){
                    loginWindow.close();
                    oauth2Logout(options);
                    if (code) {
                        $.ajax({
                            url: options.token_url,
                            data: {code:code, client_id:options.client_id, client_secret:options.client_secret, redirect_uri:options.redirect_uri, grant_type:"authorization_code"},
                            type: 'POST',
                            success: function(data){
                                var access_token;
                                if((data instanceof Object)){
                                    access_token = data.access_token;
                                } else {
                                    access_token = data.getParam("access_token");
                                }
                                successCallback(access_token, data);
                            },
                            error: function(error){
                                errorCallback(error, error);
                            }
                        });
                    } else if (error) {
                        errorCallback(error, url.split("?")[1]);
                    }
                }
            // if implicit method check for acces_token/error in url hash fragment
            } else if(options.response_type == "token") {
                var access_token = url.getParam("access_token");
                var error = url.getParam("error");
                if(access_token || error){
                    loginWindow.close();
                    oauth2Logout(options);
                    if(access_token){
                        successCallback(access_token, url.split("#")[1]);
                    } else if(error){
                        errorCallback(error, url.split("#")[1]);
                    }
                }
            }
        });
    };
}(jQuery));

// template for new oauth2 service
function oauth2_login() {
    $.oauth2({
        auth_url: 'https://accounts.google.com/o/oauth2/auth',           // required
        response_type: 'token',      // required - "code"/"token"
        token_url: '',          // required if response_type = 'code'
        logout_url: '',         // recommended if available
        client_id: '598206174272-k89f59obn673aaql9u6bjbn59lc19tnd.apps.googleusercontent.com',        // required
        client_secret: 'rxH9kB2M6pnN5HSDE7rAI3DE',    // required if response_type = 'code'
        redirect_uri: 'http://www.google.com',     // required - some dummy url
        other_params: {
          scope: 'https://www.googleapis.com/auth/calendar'
        }        // optional params object for scope, state, display...
    }, function(token, response){
        // do something with token or response

      ///////////////////////////
var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2016-04-19T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles'
  },
  'end': {
    'dateTime': '2016-04-19T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles'
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'}
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10}
    ]
  }
};

var request = gapi.client.calendar.events.insert({
  'calendarId': 'primary',
  'resource': event
});

request.execute(function(event) {
  appendPre('Event created: ' + event.htmlLink);
});

      //////////////////////////
        $('#login-container').remove();
        $('#medicine-form').fadeIn(2000);
    }, function(error, response){
        // do something with error object
        $('#login-container').fadeIn();
        $('#medicine-form').fadeOut();
    });
}

var medicineNumber = 0, oldMedicineNumber = 0, fromDate, toDate, fromDateCalendar, toDateCalendar;

$(function() {
  // get current date
  var currDate = new Date();

  // Set up calendar for "Prescription from"
  $('#datetimepicker1').datetimepicker({
    format: 'DD MMM YYYY',
    inline: true,
    minDate: currDate
  });
  fromDate = $('#datetimepicker1').data("DateTimePicker").date();
  fromDateCalendar = dateConverter(fromDate._d);
  document.patientForm.fromDate.value = fromDate;
  // Set up calendar for "Prescription to"
  $('#datetimepicker2').datetimepicker({
    format: 'DD MMM YYYY',
    inline: true,
    minDate: fromDate
  });
  toDate = $('#datetimepicker2').data("DateTimePicker").date();
  toDateCalendar = toDate._d.toJSON().substr(0,10);
  document.patientForm.toDate.value = toDate;
  // Get parent elements of calendars
  var fromDateParent = $('#datetimepicker1').parent();
  var toDateParent = $('#datetimepicker2').parent();

  // Update if change in FROM date
  fromDateParent.on('dp.change', function(e) {
    fromDate = e.date;
    fromDateCalendar = dateConverter(fromDate._d);
    document.patientForm.fromDate.value = e.date;
    // modify minimum date for TO calendar according to value from FROM calendar
    $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
  });

  // Update if change in TO date
  toDateParent.on('dp.change', function(e) {
    toDate = e.date;
    toDateCalendar = toDate._d.toJSON().substr(0,10);
    document.patientForm.toDate.value = e.date;
  });
});

$('.selectpicker').click(function () {
  // get updated number of medicines
  alert( "Handler for .change() called." );
  medicineNumber = $('.selectpicker').val();

  if(medicineNumber === 'Select') {
    medicineNumber = 0;
  }
  medicineNumber = parseInt(medicineNumber);
  oldMedicineNumber = parseInt(oldMedicineNumber);

  // Toggle hidden class
  if (medicineNumber !== 1 && medicineNumber !== 2 && medicineNumber !== 3) {
    $('.medicine-container').addClass('hidden');
    for (var i = 3; i > 0; i--) {
      $('#medicineName' + i).remove();
      $('#dosageTime' + i).addClass('hidden');
      $('#dosageQuantity' + i).addClass('hidden');
    }
  }
  else {
    $('.medicine-container').removeClass('hidden');
  }

  // if current medicine number is more than previous than add input element otherwise remove
  if(medicineNumber < oldMedicineNumber) {
    //remove old input boxes and hide corresponding fields
    for (var i = oldMedicineNumber; i > medicineNumber; i--) {
      $('#medicineName' + i).remove();
      $('#dosageTime' + i).addClass('hidden');
      $('#dosageQuantity' + i).addClass('hidden');
    }
  }
  else {
    // add new input fields according to the new medicine number and make the corresponding fields visible
    for (var i = oldMedicineNumber; i < medicineNumber; i++) {
      $('.medicine-container').append('<div class="col-sm-4 color-label color-label' + (i+1) + '" id="medicineName' + (i+1) + '"><input type="text" name="medicineName' + (i+1) + '" class="form-control medicine-input" placeholder="Medicine Name ' + (i+1) + '" required="required"></div>');
      $('#dosageTime' + (i+1)).removeClass('hidden');
      $('#dosageQuantity' + (i+1)).removeClass('hidden');
    }
  }

  // update old medicine number for deletion in next iteration
  oldMedicineNumber = medicineNumber;
});

function createAllEvent()
{
  if($('#patientName').val() == '')
  {
    alert("Enter Patient Name");
    return false;
  }
  var summary = "Medicine Reminder";
  var description = ["","",""];
  for(var i=0;i<medicineNumber;i++)
  {
    if($('#morningCheckbox' + (i+1)).prop('checked'))
      description[0] += " Medicine " + (i+1) + ": " + $('#medicineName' + (i+1) + ' input').val();
    if($('#noonCheckbox' + (i+1)).prop('checked'))
      description[1] += " Medicine " + (i+1) + ": " + $('#medicineName' + (i+1) + ' input').val();
    if($('#nightCheckbox' + (i+1)).prop('checked'))
      description[2] += " Medicine " + (i+1) + ": " + $('#medicineName' + (i+1) + ' input').val();
  }
  var startDate = [];
  var endDate = [];
  startDate[0] = fromDateCalendar + 'T08:00:00';
  startDate[1] = fromDateCalendar + 'T13:00:00';
  startDate[2] = fromDateCalendar + 'T20:00:00';
  endDate[0] = fromDateCalendar + 'T09:00:00';
  endDate[1] = fromDateCalendar + 'T14:00:00';
  endDate[2] = fromDateCalendar + 'T21:00:00';
  var reccur =  Math.floor(( Date.parse(toDate) - Date.parse(fromDate) ) / 86400000) +1;
  var reccurence = "RRULE:FREQ=DAILY;COUNT="+reccur.toString();
  var event;
  for(var i=0;i<3;i++)
  {
    if(description[i].localeCompare("")!=0)
    {
      event = {
        'summary': summary,
        'description': description[i],
        'transparency': 'transparent',
        'visibility': 'public',
        'start': {
          'dateTime': startDate[i],
          'timeZone': 'Asia/Kolkata'
        },
        'end': {
          'dateTime': endDate[i],
          'timeZone': 'Asia/Kolkata'
        },
        'recurrence': [
          reccurence
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [{
            'method': 'email',
            'minutes': 60
          }, {
            'method': 'popup',
            'minutes': 10
          }]
        }
      };
      addNewEvent(event);
    }
  }
}

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '598206174272-k89f59obn673aaql9u6bjbn59lc19tnd.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/userinfo.profile"];

/**
 * Check if current user has authorized this application.
 */
$(function() {
  function checkAuth() {
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
  }
});

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    document.getElementById("login-container").style.display = "none";
    document.getElementById("medicine-form").style.display = "block";
    // window.location="./DashboardForm.html";
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    document.getElementById("login-container").style.display = "block";
    document.getElementById("medicine-form").style.display = "none";
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
  },
                      handleAuthResult);
  return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  var request = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var events = resp.items;
    appendPre('Upcoming events:');

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var when = event.start.dateTime;
        if (!when) {
          when = event.start.date;
        }
        appendPre(event.summary + ' (' + when + ')')
      }
    } else {
      appendPre('No upcoming events found.');
    }

  });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  //  pre.appendChild(textContent);
}

function addNewEvent(event) {
  var CLIENT_ID = '598206174272-k89f59obn673aaql9u6bjbn59lc19tnd.apps.googleusercontent.com';

  var SCOPES = ["https://www.googleapis.com/auth/calendar"];
  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });

  request.execute(function(event) {
    appendPre('Event created: ' + event.htmlLink);
  });
}

function dateConverter(passedDate) {
  var months = {
    'Jan' : '01',
    'Feb' : '02',
    'Mar' : '03',
    'Apr' : '04',
    'May' : '05',
    'Jun' : '06',
    'Jul' : '07',
    'Aug' : '08',
    'Sep' : '09',
    'Oct' : '10',
    'Nov' : '11',
    'Dec' : '12',
  };

  var month = passedDate.toString().substr(4,3);
  month = months[month];

  var day = passedDate.toString().substr(8,2);

  var year = passedDate.toString().substr(11,4);

  var date = year+ '-' +month+ '-' +day;
  return date;
}
  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }
