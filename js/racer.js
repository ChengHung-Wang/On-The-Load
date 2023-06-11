import { Track } from "./track.js";
import { Race } from "./race.js";
import { Camera } from "./camera.js";
import { TitleScreen } from "./titleScreen.js";
import { raceAudioInit } from "./audio.js";
import { speak } from "./speech.js";
import { outlineOnly } from "./render.js";

document.getElementById("gameCanvas").width = document.documentElement.clientWidth;
document.getElementById("gameCanvas").height = document.documentElement.clientHeight;

export const racer = {};

racer.canvas = document.getElementById("gameCanvas");
racer.context = racer.canvas.getContext("2d");
racer.racing = false;

racer.getTimestamp = function () {
  return performance.now();
}

racer.now = racer.getTimestamp();
racer.last = racer.getTimestamp();

racer.dt = 0;
racer.gdt = 0;

racer.cars = [];
racer.player = null;
racer.camera = new Camera();
racer.race = new Race();
racer.track = new Track();
racer.titleScreen = new TitleScreen(racer.canvas, racer.context);

racer.startGame = function (trackNumber) {
  raceAudioInit();
  speak("Start");
  racer.racing = true;
  racer.camera.reset();
  racer.race.start(trackNumber);
}

racer.titleScreen.init();

document.addEventListener("keydown", function (e) {
  if (racer.racing) {
    racer.race.keyDown(e);
  } else {
    racer.titleScreen.keyDown(e);
  }
});

document.addEventListener("keyup", function (e) {
  if (racer.racing) {
    racer.race.keyUp(e);
  } else {
    racer.titleScreen.keyUp(e);
  }
});

function frame() {
  racer.now = racer.getTimestamp();
  racer.dt = Math.min(1, (racer.now - racer.last) / 1000);
  racer.gdt = racer.gdt + racer.dt;

  if (!racer.racing) {
    racer.titleScreen.render(racer.dt);
    racer.gdt = 0;
  }
  else {
    outlineOnly.outlineOnly = false;

    const step = 1 / 180;
    while (racer.gdt > step) {
      racer.gdt = racer.gdt - step;
      racer.race.update(step);
    }

    racer.track.drawOverheadTrack();
    racer.race.render();

    racer.last = racer.now;
  }
  requestAnimationFrame(frame);
}

frame();