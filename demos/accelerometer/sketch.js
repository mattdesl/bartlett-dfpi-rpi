// These variables will have to change depending
// on the output of the `server.py` script and your Pi's IP
const HOST = "192.168.1.92";
const PORT = 32045;

let teapot;
let data;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  teapot = loadModel("monkey.obj", true);

  // Create a new websocket
  const socket = new window.WebSocket("ws://" + HOST + ":" + PORT);
  // When we get new data, parse it as JSON
  socket.onmessage = message => {
    try {
      data = JSON.parse(message.data);
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
  background(205, 102, 94);

  let rotationX = 0;
  let rotationZ = PI;

  if (data) {
    const [a, b] = data.accelerometer;
    rotationX -= a;
    rotationZ += b;
  }

  rotateX(rotationX);
  rotateZ(rotationZ);

  normalMaterial(); // For effect
  model(teapot);
}
