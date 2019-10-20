// These variables will have to change depending
// on the output of the `server.py` script and your Pi's IP
const HOST = "192.168.1.92";
const PORT = 32045;

let bgColor;
let targetColor;

function setup() {
  createCanvas(windowWidth, windowHeight);

  bgColor = color(255, 255, 255);
  targetColor = color(255, 255, 255);

  // Create a new websocket
  const socket = new window.WebSocket("ws://" + HOST + ":" + PORT);
  // When we get new data, parse it as JSON
  socket.onmessage = message => {
    try {
      data = JSON.parse(message.data);
      targetColor = color(data.rgb);
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
  bgColor = lerpColor(bgColor, targetColor, factor);
  background(bgColor);
}
