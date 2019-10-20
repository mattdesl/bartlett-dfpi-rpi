// A utility to sample light values from the enviro pHAT
// Here we are doing two things:
// 1: An exponential rolling average over N frames
//    e.g. So as the sun sets the average will adjust.
// 2: An exponetially interpolated "smoothed" value
//    e.g. Get the current value but with less jitter.

class LightSensor {
  constructor(opt = {}) {
    this.count = 0;
    this.average = null;
    this.value = null;
    this.rawAverage = null;
    this.rawValue = null;
    this._lastTime = performance.now();

    const {
      sampleCount = 60 * 30,
      interpolation = 5,
      averageInterpolation = 1,
      host,
      port
    } = opt;

    this.sampleCount = sampleCount;
    this.interpolation = interpolation;
    this.averageInterpolation = averageInterpolation;

    // Create a new websocket
    this.socket = new WebSocket("ws://" + host + ":" + port);

    // When we get new data, parse it as JSON
    this.socket.onmessage = message => {
      try {
        let ready = this.ready;
        data = JSON.parse(message.data);
        // Update with new data
        this.sample(data.light);
      } catch (err) {
        console.error(err);
      }
    };

    // When socket closes, reset the data values
    this.socket.onclose = () => {
      console.warn("WebSocket closed, no longer receiving data.");
      this.reset();
    };

    this._smooth = () => this.smooth();
  }

  // Linear interpolation
  _lerp(start, stop, amt) {
    return amt * (stop - start) + start;
  }

  // Springs A toward B with a power, accepting deltaTime
  _spring(a, b, power, dt) {
    return this._lerp(a, b, 1 - Math.exp(-power * dt));
  }

  get ready() {
    return (
      this.socket.readyState === WebSocket.OPEN &&
      this.rawValue != null &&
      this.rawAverage != null
    );
  }

  reset() {
    this.count = 0;
    this.rawAverage = null;
    this.rawValue = null;
    this.average = null;
    this.value = null;
    this._lastTime = performance.now();
  }

  update() {
    if (!this.ready) {
      return;
    }

    // get delta time in seconds
    const now = performance.now();
    const dt = (now - this._lastTime) / 1000;
    this._lastTime = now;

    // update smooth value
    if (this.value == null) {
      this.value = this.rawValue;
    } else {
      this.value = this._spring(
        this.value,
        this.rawValue,
        this.interpolation,
        dt
      );
    }

    if (this.average == null) {
      this.average = this.rawAverage;
    } else {
      this.average = this._spring(
        this.average,
        this.rawAverage,
        this.averageInterpolation,
        dt
      );
    }
  }

  sample(data) {
    this.rawValue = data;

    // Update with a moving exponential average
    this.count++;
    if (this.rawAverage == null) {
      this.rawAverage = data;
    } else {
      this.rawAverage =
        this.rawAverage +
        (data - this.rawAverage) / min(this.count, this.sampleCount);
    }
  }
}
