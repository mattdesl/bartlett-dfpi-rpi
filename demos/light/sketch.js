// These variables will have to change depending
// on the output of the `server.py` script and your Pi's IP
const HOST = "192.168.1.92";
const PORT = 32045;

let teapot;
let data;

// See LightSensor.js for details
let light = new LightSensor({
  host: HOST,
  port: PORT
});

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  const dt = deltaTime / 1000;

  const cx = width / 2;
  const cy = height / 2;

  light.update();

  if (light.ready) {
    const value = light.value;
    const average = light.average;
    const maxDiam = min(width, height) * 0.5;

    // yellow color
    const c = color("#ffcf23");
    // get a 0..1 alpha value
    const alpha = constrain(value / average, 0, 1);
    c.setAlpha(alpha * 255);
    fill(c);
    noStroke();
    circle(cx, cy, maxDiam);
  }
}
