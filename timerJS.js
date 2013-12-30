/*jslint browser:true */
'use strict';

//created by tcha-tcho
function TimerJS(selector,config) {
  this.defaults = {
     on_end: function( el ){}
    ,in_progress: function( el ){}
    ,end_text: "end"
    ,time_null: ".:..:..:.."
    ,alert_end1: 120000
    ,alert_end2: 60000
    ,alert_end3: 20000
    ,alert_color: "#ff2600"
    ,alert_background: "#660000"
    ,prog_color: "#76d6ff"
    ,prog_background: "#011993"
    ,blink: false
  }
  this.init(selector,config);
}

TimerJS.prototype.extend = function() {
  for(var i=1; i<arguments.length; i++)
    for(var key in arguments[i])
      if(arguments[i].hasOwnProperty(key))
        arguments[0][key] = arguments[i][key];
  return arguments[0];
}

String.prototype.repeat = function( num ) {
  if (num < 0) return "";
  return new Array( num + 1 ).join( this );
}

TimerJS.prototype.init = function (selector,config) {
  var _self = this;
  this.o = this.extend(this.defaults, config);
  var elements = document.querySelectorAll(selector);
  this.timerList = [];
  this.now = new Date().getTime();
  window.clearInterval(window.timerjs_interval);
  if (elements.length < 1) return;
  for (var i = 0; i < elements.length; i += 1) {
    var d_timer = new Date();
    d_timer.setMilliseconds(this.parse_mil(elements[i],"data-timer"));
    var d_dur = new Date(d_timer.getTime())
    d_dur.setMilliseconds(this.parse_mil(elements[i],"data-dur"));
    this.timerList.push({
       clock: elements[i]
      ,d_timer: d_timer
      ,d_dur: d_dur
      ,in_progress: false
      ,show: true
    });
  };
  if (elements.length) {
    window.clearInterval(window.timerjs_interval);
    window.timerjs_interval = window.setInterval(function(){
      _self.process_timer();
    },1000)
  };
  window.onfocus = function () { 
    if (elements.length) _self.process_timer();
  }; 
  window.onpageshow = function () { 
    if (elements.length) _self.process_timer();
  }; 
  document.visibilityChange = function () { 
    if (elements.length) _self.process_timer();
  }; 
};

TimerJS.prototype.two = function (numb) {
  return ((numb>9)?"":"0")+numb;
};

TimerJS.prototype.time = function (ms,colon) {
  if (ms > 0) {
    var sec = Math.floor(ms/1000)
    ms = ms % 1000
    var min = Math.floor(sec/60)
    sec = sec % 60
    var t = this.two(sec);
    var hr = Math.floor(min/60)
    min = min % 60
    t = this.two(min) + colon + t
    var day = Math.floor(hr/60)
    hr = hr % 60
    t = this.two(hr) + colon + t
    t = day + colon + t
    return t
  } else {
    return this.o.time_null;
  };
};

TimerJS.prototype.parse_mil = function (el,attr) {
  var mil = el.getAttribute(attr)
  return mil?parseInt(mil):false;
};

TimerJS.prototype.process_timer = function () {
  if (!this.timerList.length){
    window.clearInterval(window.timerjs_interval)
  } else {
    var colon = ":";
    if (this.o.blink) colon = (this.blink ^= true)?":":" ";
    for (var i = this.timerList.length - 1; i >= 0; i--) {
      var mil = (this.timerList[i].d_timer.getTime() - (new Date().getTime()));
      var clock = this.timerList[i].clock;
      var prog = this.timerList[i].in_progress;
      var color = (prog?this.o.prog_color:this.o.alert_color)
      var background = (prog?this.o.prog_background:this.o.alert_background)
      clock.innerHTML = this.time(mil,colon);
      if (mil < this.o.alert_end1) {
        if(!this.timerList[i].show && mil < this.o.alert_end2) {
          clock.innerHTML = this.o.time_null;
          this.timerList[i].show = true;
        }else{
          this.timerList[i].show = false;
        }
        clock.style.color = color;
        clock.style.background = background;
        if (mil < this.o.alert_end3){
          if (this.timerList[i].show) {
            clock.style.color = background;
            clock.style.background = color;
          }
        }
        if (mil < 1) {
          if (this.timerList[i].d_dur && !this.timerList[i].in_progress) {
            clock.style.color = this.o.prog_color;
            clock.style.background = this.o.prog_background;
            this.timerList[i].in_progress = true;
            this.timerList[i].d_timer = this.timerList[i].d_dur;
            this.o.in_progress(this.timerList[i].clock);
          } else {
            var dots = ".".repeat((this.o.end_text.length -10)*-1);
            clock.innerHTML = dots + this.o.end_text;
            clock.style.color = color;
            clock.style.background = background;
            this.o.on_end(this.timerList[i].clock);
            this.timerList.splice(i, 1);
          };
        }
      }
    };
  };
};
