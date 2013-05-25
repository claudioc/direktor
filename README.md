Direktor
========

Direktor is a technique - in the form of a JavaScript library - to make it possible to
bind functions execution when a certain number in inside a range of values.

You define an `Emitter` which will be the thing that emits the numbers and a whichever number
of `tracks`, which are basically the functions that need to be executed when that number
reaches a certain value (and stays inside the range).

The track works by defining a callback for the `enter`, `exit`, `forward` and `backward` event
they will receive by the engine. Each of these event callback will also receive the value itself.

Once you defined the tracks, you attach them to the Direktor `Player` which will start
emitting the number and running the tracks. When attaching the tracks to the Player you also
define the range of numbers where the tracks will be executed into (in the form of a `lowest` and a `highest` value).

An example it's worth a million words, in this case

```javascript

// Let's assume that we already have an emitter (more on that later)

// Define a new Track

var t1 = new Direktor.Track();

// When the number will enter the range defined for the track
t1.on("enter", function(value) {
  console.log("Entering Track1 with value %d", value);
})

// When the number will exit the range defined for the track
t1.on("exit", function(value) {
  console.log("Exiting Track1 with value %d", value);
})

// When the number is increasing, but still in the range defined for the track
t1.on("forward", function(value) {
  console.log("Forward on the Track1 with value %d", value);
})

// When the number is decreasing, but still in the range defined for the track
t1.on("backward", function(value) {
  console.log("Backward on the Track1 with value %d", value);
})

// Once the track is defined, bind it to the Direktor player
// We bind the track on the 3-30 interval of the number
var player = new Direktor.Player();
player.addTrack(t1, 3, 30);

// We could also have bound the track only on one specific number
player.addTrack(t1, 42);

// Run the player using MyEmitter
player.run(MyEmitter);

```

If the number are emitted in a discrete way, without "holes", everything will work as expected. But if we have
holes the behavior is a bit tricky: if, for example, I define a track in the 5-50 interval and for some reason the emitter
will _jump over_ that interval (say, goes from the value 2 to the value 70 in one step), the track will NOT run.


Creating an emitter
-------------------

The simplest emitter that I can think of is a time based one. An emitter that emits a number every half a second, for example.

This is the very minimum that you need to do to define such emitter:

```javascript

var timedEmitter = new Direktor.Emitter();

// The start method will be automatically run by the player on Player.run()
timedEmitter.start = function() {
  setInterval(function() {
    this.emit();
  }.bind(this), 500);
}
```

You probably better doing something like that, so you're able to eventually stop your emitter:

```javascript

var timedEmitter = new Direktor.Emitter();

timedEmitter.start = function() {
  this.interval = setInterval(function() {
    // The emitter will increase or decrease the value internally
    this.emit();
  }.bind(this), 500);
}

timedEmitter.stop = function() {
  clearInterval(this.interval);
}
```

A more interesting emitter would be one bound to the scroll event of a div (using a bit of jquery):

```javascript

var scrollEmitter = new Direktor.Emitter();

$("#wrap").on("scroll", function(e) {
  // The tracks will receive the value of the scollLeft
  scrollEmitter.emit(e.target.scrollLeft);
});

```

Or you can manually control everything, using buttons:

```javascript

var btnEmitter = new Direktor.Emitter();

$("#btn-fwd").on("click", function() {
  btnEmitter.emit();
});

$("#btn-fwd-5").on("click", function() {
  // The emitter value is publicly exposed
  btnEmitter.emit(btnEmitter.value + 5);
});

$("#btn-bwd").on("click", function() {
  btnEmitter.emit();
});

$("#btn-bwd-5").on("click", function() {
  btnEmitter.emit(btnEmitter.value - 5);
});
```

Dependencies
------------

Direktor can be run on a browser or in Node.js and does not need any other library.

I've used some EcmaScript 5 methods, so it will only probably run in modern browsers.

