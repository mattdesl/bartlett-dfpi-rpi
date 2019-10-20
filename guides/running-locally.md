# Running Locally

To run the project locally, make sure you have a Pi setup with the required software. During the class, the Pi Zero's will already be setup for you, but you can see [Full Installation](./full-installation.md) for details on how it was set up.

Once you have your Pi, you can clone or download this repo and its JavaScript demos. Then install its dependencies:

```sh
# move into the folder
cd bartlett-dfpi-rpi

# install deps
npm install
```

Now you can serve the client scripts locally with the following:

```sh
npm run start
```

Go to [http://localhost:5000/](http://localhost:5000/) to see the different demos.

Now plug in your Raspberry Pi (in the class it should already be set up with dependencies) and SSH into it:

```sh
ssh pi@raspberrypi.local
```

Use the default password *raspberry*.

Once you are in, run the server, which has already been stored on the SD Cards provided:

```sh
python ~/enviro/server.py
```

It will print some variables for the `HOST` and `PORT`, which you will have to copy into your local `sketch.js` files inside [./demos](./demos).

See the different demos for:

- Accelerometer (3D rotation)
- Light Sensor
- Magnetometer (compass heading)
- RGB Color Sensor

## Advanced Arguments

When running the Pi server, you can pass in some flags for advanced uses, for example:

```sh
python ~/enviro/server.py --fps=20 --sensors=light --light=time=100
```

Possible options:

- `--fps=30` frame rate to sample at, usually use below 50
- `--host=192.168.1.1` allows you to specify a different host address
- `--port=3000` allows you to specify a different port
- `--sensors=light` a comma-separated list of sensors to enable, default `light,weather,motion,analog`
  - Choosing only one sensor such as `--sensors=light` will make sampling faster for that sensor
- `--light-time=5` interval to sample light meter between 2.4 ms and 612 ms, will affect the max light value sampled
- `--qnh=1013.25` pressure at your location for more accurate readings, defaults to mean sea level

# Going Offline

You have two ways of ensuring the Pi Zero data is sent thru the offline USB interface:

1. One way is to simply turn off the Pi's wifi interface (see [Handling WiFi](#handling-wifi)), and it will choose the local USB IP as a fallback.

2. Or, you can find the `usb0` IP address with the following:

```sh
ifconfig usb0
```

Then, use the `inet` number such as `169.254.159.255` in your server:

```sh
python server.py --host=169.254.159.255
```

# Handling WiFi

## Setting it Up

See here for full details:

- [Setting up WiFi via the Command Line](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md)

## Turn Off Raspberry Pi Wifi

```sh
sudo ifconfig wlan0 down
```

## Turn On Raspberry Pi Wifi

```sh
sudo ifconfig wlan0 up
```