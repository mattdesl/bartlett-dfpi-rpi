// These variables will have to change depending
// on the output of the `server.py` script and your Pi's IP
const HOST = "192.168.1.92";
const PORT = 32045;

let heading = 0;
let targetHeading = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create a new websocket
  const socket = new window.WebSocket("ws://" + HOST + ":" + PORT);
  // When we get new data, parse it as JSON
  socket.onmessage = message => {
    try {
      data = JSON.parse(message.data);
      targetHeading = data.heading;
    } catch (err) {
      console.error(err);
    }
  };
  socket.onclose = () => {
    console.warn("WebSocket closed, no longer receiving data.");
    data = null;
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  const factor = 0.15;
  heading = lerpAngle(heading, targetHeading, factor);

  background(255);

  const cx = width / 2;
  const cy = height / 2;

  const dim = min(width, height);
  const length = dim * 0.25;
  strokeWeight(dim * 0.0175);
  strokeCap(SQUARE);
  noFill();
  stroke("tomato");

  const angle = radians(heading);
  const x = cx + cos(angle) * length;
  const y = cy + sin(angle) * length;
  line(cx, cy, x, y);

  stroke(0);
  strokeWeight(dim * 0.0025);
  circle(cx, cy, length * 2);

  noStroke();
  fill(0);
  circle(cx, cy, dim * 0.075);
}

// Interpolate from angle A to B with value 't'
// But wrap around 0-360 degrees
function lerpAngle(a, b, t) {
  const d = b - a;
  let num = d - floor(d / 360) * 360;
  if (num > 180.0) num -= 360;
  return a + num * constrain(t, 0, 1);
}
