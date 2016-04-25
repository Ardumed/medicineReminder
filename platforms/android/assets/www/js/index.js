$(document).ready(function() {

  /*---------------------------------Multi Form JavaScript-------------------------------------------*/

  //jQuery time
  var current_fs, next_fs, previous_fs; //fieldsets
  var left, opacity, scale; //fieldset properties which we will animate
  var animating; //flag to prevent quick multi-click glitches

  $(".next").click(function(){
      if(animating) return false;
      animating = true;

      current_fs = $(this).parent();
      next_fs = $(this).parent().next();

      //activate next step on progressbar using the index of next_fs
      $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

      //show the next fieldset
      next_fs.show();
      //hide the current fieldset with style
      current_fs.animate({opacity: 0}, {
          step: function(now, mx) {
              //as the opacity of current_fs reduces to 0 - stored in "now"
              //1. scale current_fs down to 80%
              scale = 1 - (1 - now) * 0.2;
              //2. bring next_fs from the right(50%)
              left = (now * 50)+"%";
              //3. increase opacity of next_fs to 1 as it moves in
              opacity = 1 - now;
              current_fs.css({'transform': 'scale('+scale+')'});
              next_fs.css({'left': left, 'opacity': opacity});
          },
          duration: 800,
          complete: function(){
              current_fs.hide();
              animating = false;
          },
          //this comes from the custom easing plugin
          easing: 'easeInOutBack'
      });
  });

  $(".previous").click(function(){
      if(animating) return false;
      animating = true;

      current_fs = $(this).parent();
      previous_fs = $(this).parent().prev();

      //de-activate current step on progressbar
      $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

      //show the previous fieldset
      previous_fs.show();
      //hide the current fieldset with style
      current_fs.animate({opacity: 0}, {
          step: function(now, mx) {
              //as the opacity of current_fs reduces to 0 - stored in "now"
              //1. scale previous_fs from 80% to 100%
              scale = 0.8 + (1 - now) * 0.2;
              //2. take current_fs to the right(50%) - from 0%
              left = ((1-now) * 50)+"%";
              //3. increase opacity of previous_fs to 1 as it moves in
              opacity = 1 - now;
              current_fs.css({'left': left});
              previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
          },
          duration: 800,
          complete: function(){
              current_fs.hide();
              animating = false;
          },
          //this comes from the custom easing plugin
          easing: 'easeInOutBack'
      });
  });

  $(".submit").click(function(){
//    console.log($("#startDate").val());
    var sDate = new Date($("#startDate").val());
    var eDate = new Date($("#endDate").val());
    // prep some variables
  var startDate = new Date(sDate.getFullYear(),sDate.getMonth(),sDate.getDate(),18,30,0,0,0); // beware: month 0 = january, 11 = december
  var endDate = new Date(sDate.getFullYear(),sDate.getMonth(),sDate.getDate(),19,30,0,0,0);
  var title = $("#name").val() +"'s Medicine Reminder";
  var eventLocation = "Home";
  var notes = $(".medicineName").val() + " Dosage: " + $(".dosage").val();
  var success = function(message) { alert("Successfully Added Reminders to Calendar." + JSON.stringify(message)); $('#success-page').fadeIn();$('#medicine-form').fadeOut();};
  var error = function(message) { alert("Error: " + message); };
  var calOptions = window.plugins.calendar.getCalendarOptions(); // grab the defaults
  calOptions.firstReminderMinutes = 120; // default is 60, pass in null for no reminder (alarm)
  calOptions.secondReminderMinutes = 5;
  // Added these options in version 4.2.4:
  calOptions.recurrence = "daily"; // supported are: daily, weekly, monthly, yearly
  calOptions.recurrenceEndDate = new Date(eDate.getFullYear(),eDate.getMonth(),eDate.getDate(),0,0,0,0,0); // leave null to add events into infinity and beyond
  calOptions.calendarName = "MyCreatedCalendar"; // iOS only
  calOptions.calendarId = 1; // Android only, use id obtained from listCalendars() call which is described below. This will be ignored on iOS in favor of calendarName and vice versa. Default: 1.
  window.plugins.calendar.createEventWithOptions(title,eventLocation,notes,startDate,endDate,calOptions,success,error);

//    window.plugins.calendar.createEvent(title,eventLocation,notes,startDate,endDate,success,error);
      return false;
  })

  /*-------------------------------------------------------------------------------------------------*/
});
