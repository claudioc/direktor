/*
* Direktor
* http://github.com/claudioc/jingo
*
* Copyright 2013 Claudio Cicali <claudio.cicali@gmail.com>
* Released under the MIT license
*/

(function() {
  
  "use strict";

  var Direktor = {};

  /* Emitter */

  Direktor.Emitter = function() {
    this.value = 0;
    this.callback = null;
  }

  Direktor.Emitter.prototype.receive = function(callback) {
    this.callback = callback;
  }

  Direktor.Emitter.prototype.emit = function(value) {
    if (value && isNaN(value)) {
      return;
    }
    if (typeof value != 'undefined') {
      this.value = value;
    } else {
      this.value += 1;
    }
    this.callback && this.callback.call(null, this.value);
  }

  Direktor.Emitter.prototype.stop = function() {
  }

  Direktor.Emitter.prototype.start = function() {
  }

  Direktor.Emitter.prototype.reset = function() {
    this.value = 0;
  }

  /* TRACK */

  Direktor.Track = function() {
    var nop = function() {};
    this.callbacks = {
      "enter":    nop,
      "exit":     nop,
      "forward":  nop,
      "backward": nop
    };
  };

  Direktor.Track.prototype.on = function(action, callback) {
    if (Object.keys(this.callbacks).indexOf(action) > -1) {
      this.callbacks[action] = callback;
      return true;
    }
    return false;
  };

  Direktor.Track.prototype.trigger = function(action, value) {
    this.callbacks[action].call(null, value);
  };

  /* PLAYER */

  Direktor.Player = function(Emitter, tracks) {
    this.dataline = [];
    this.Emitter = null;
    this.dir = "forward";
    this.prev = 0;
  }

  Direktor.Player.prototype.run = function(Emitter) {
    this.Emitter = Emitter;
    this.Emitter.receive(function(value) {
      if (value == this.prev) {
        return;
      }
      this.dir = this.prev < value ? 'forward' : 'backward';
      this.prev = value;
      this.dataline.forEach(function(data) {
        var lowest = data.lowest, highest = data.highest;

        if (this.dir == 'forward') {

          if (value === lowest) {
            data.track.trigger("enter", value);
            data.pointer = 'inside';
          }

          if (value > lowest) {
            if (value > highest) {
              if (data.pointer == 'inside') {
                data.track.trigger("exit", value);
                data.pointer = 'outside';
              }
            } else {
              data.track.trigger("forward", value);
              data.pointer = 'inside';
            }
          }

        }

        if (this.dir == 'backward') {

          if (value === highest) {
            data.track.trigger("enter", value);
            data.pointer = 'inside';
          }

          if (value < highest) {
            if (value >= lowest) {
              data.track.trigger("backward", value);
              data.pointer = 'inside';
            } else {
              if (data.pointer == 'inside') {
                data.track.trigger("exit", value);
                data.pointer = 'outside';
              }
            }

          }

        }

      }.bind(this));
    }.bind(this));
    this.Emitter.start();
  }

  Direktor.Player.prototype.stop = function() {
    this.Emitter.stop();
  }

  Direktor.Player.prototype.addTrack = function(track, lowest, highest) {
    lowest = parseInt(lowest, 10);
    highest = parseInt(highest,10);
    if (isNaN(lowest)) {
      lowest = 0;
    }
    if (isNaN(highest)) {
      highest = 0;
    }
    if (typeof highest == "undefined") {
      highest = lowest;
    }
    if (lowest > highest) {
      highest = lowest;
    }
    this.dataline.push({
      pointer: 'outside',
      track: track,
      lowest: lowest,
      highest: highest
    });
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Direktor;
  } else {
    window.Direktor = Direktor;
  }

})();

