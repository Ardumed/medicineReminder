var medicineNumber = 0,
  oldMedicineNumber = 0,
  fromDate, toDate, fromDateCalendar, toDateCalendar, recurrence;

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '598206174272-k89f59obn673aaql9u6bjbn59lc19tnd.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/userinfo.profile"];

// Check if current user has authorized this application.
var checkAuth = function() {
  $(function(){
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
  });
}

// * Initiate auth flow in response to user clicking authorize button.
// * @param {Event} event Button click event.
var handleAuthClick = function(event) {
  gapi.auth.authorize({
      client_id: CLIENT_ID,
      scope: SCOPES,
      immediate: false
    },
    handleAuthResult);
  return false;
}

// * Handle response from authorization server.
// * @param {Object} authResult Authorization result.
var handleAuthResult = function(authResult) {
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
};

// * Load Google Calendar client library. List upcoming events
// * once client library is loaded.
var loadCalendarApi = function() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

// * Print the summary and start datetime/date of the next ten events in
// * the authorized user's calendar. If no events are found an
// * appropriate message is printed.
var listUpcomingEvents = function() {
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

// * Append a pre element to the body containing the given message as its text node.
// * @param {string} message Text to be placed in pre element.
var appendPre = function(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  //  pre.appendChild(textContent);
}

// Configure datetimepicker calendar entries
var setUpCalendar = function() {
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
  toDateCalendar = toDate._d.toJSON().substr(0, 10);
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
    toDateCalendar = toDate._d.toJSON().substr(0, 10);
    document.patientForm.toDate.value = e.date;
  });
};

// Slice calendar date to convert to google calendar format
var dateConverter = function(passedDate) {
  var months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12',
  };

  var month = passedDate.toString().substr(4, 3);
  month = months[month];

  var day = passedDate.toString().substr(8, 2);

  var year = passedDate.toString().substr(11, 4);

  var date = year + '-' + month + '-' + day;
  return date;
}

// To display Medicine detail fields depending upon number of medicines.. triggered on change in number of medicines
var countMedicine = function() {
  // get updated number of medicines
  medicineNumber = $('.selectpicker').selectpicker('val');

  if (medicineNumber === 'Select') {
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
      $('#recurrenceMed' + i).addClass('hidden');
    }
  } else {
    $('.medicine-container').removeClass('hidden');
  }

  // if current medicine number is more than previous than add input element otherwise remove
  if (medicineNumber < oldMedicineNumber) {
    //remove old input boxes and hide corresponding fields
    for (var i = oldMedicineNumber; i > medicineNumber; i--) {
      $('#medicineName' + i).remove();
      $('#dosageTime' + i).addClass('hidden');
      $('#dosageQuantity' + i).addClass('hidden');
      $('#recurrenceMed' + i).addClass('hidden');
    }
  } else {
    // add new input fields according to the new medicine number and make the corresponding fields visible
    for (var i = oldMedicineNumber; i < medicineNumber; i++) {
      $('.medicine-container').append('<div class="col-sm-4 color-label color-label' + (i + 1) + '" id="medicineName' + (i + 1) + '"><input type="text" name="medicineName' + (i + 1) + '" class="form-control medicine-input" placeholder="Medicine Name ' + (i + 1) + '" required="required"></div>');
      $('#dosageTime' + (i + 1)).removeClass('hidden');
      $('#dosageQuantity' + (i + 1)).removeClass('hidden');
      $('#recurrenceMed' + (i + 1)).removeClass('hidden');
    }
  }

  // update old medicine number for deletion in next iteration
  oldMedicineNumber = medicineNumber;
}

// Create events for all the medicine times.. triggered on submit from HTML
var createAllEvent = function() {
  if ($('#patientName').val() === '') {
    alert("Enter Patient Name");
    return false;
  }
  var summary = "Medicine Reminder";
  var description = ["", "", ""];
  for (var i = 0; i < medicineNumber; i++) {
    if ($('#morningCheckbox' + (i + 1)).prop('checked'))
      description[0] += " Medicine " + (i + 1) + ": " + $('#medicineName' + (i + 1) + ' input').val();
    if ($('#noonCheckbox' + (i + 1)).prop('checked'))
      description[1] += " Medicine " + (i + 1) + ": " + $('#medicineName' + (i + 1) + ' input').val();
    if ($('#nightCheckbox' + (i + 1)).prop('checked'))
      description[2] += " Medicine " + (i + 1) + ": " + $('#medicineName' + (i + 1) + ' input').val();
  }
  var startDate = [];
  var endDate = [];
  startDate[0] = fromDateCalendar + 'T08:00:00';
  startDate[1] = fromDateCalendar + 'T13:00:00';
  startDate[2] = fromDateCalendar + 'T20:00:00';
  endDate[0] = fromDateCalendar + 'T09:00:00';
  endDate[1] = fromDateCalendar + 'T14:00:00';
  endDate[2] = fromDateCalendar + 'T21:00:00';
  var reccur = Math.floor((Date.parse(toDate) - Date.parse(fromDate)) / 86400000) + 1;
  var reccurence = "RRULE:FREQ=DAILY;COUNT=" + reccur.toString();
  var event;
  for (var i = 0; i < 3; i++) {
    if (description[i].localeCompare("") !== 0) {
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
  window.location = 'http://localhost:3000/simulation';
}

// Add a new event in user's google calendar
var addNewEvent = function(event) {
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

// Initial setup
var init = function() {
  checkAuth();
  setUpCalendar();
};

$(function() {
  init();
});
