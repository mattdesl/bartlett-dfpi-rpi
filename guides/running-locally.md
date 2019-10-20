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

Go to [http://localhost:5000/](http://localhost:5000/) to open the different demos. You can edit the `sketch.js` scripts inside the [./demos](./demos) folders and reload the browser to see the result.

# Plug in Pi

Now plug in your Raspberry Pi (in the class it should already be set up with dependencies).

Plug the power micro USB into the "PWR" jack and the other jack will connect with the USB interface on your computer.

Next, we need to SSH into it to have a shell that we can type in commands:

- On Windows, you may need to SSH via a tool like PuTTY:
  - [SSH using Windows](https://www.raspberrypi.org/documentation/remote-access/ssh/windows.md)
  - You will also need to install [Bonjour for Windows](https://support.apple.com/kb/DL999?locale=en_US)
  - Use `raspberrypi.local` as the Host Name or IP Address, `port` to 22, `Connection Type` to SSH, username as `pi` and password as `raspberry`
- On Mac, you should be able to login to your Pi like so:
```sh
ssh pi@raspberrypi.local
```

When logging into the Pi, the default password is *raspberry*.

# Run the Server

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

# Powering Off

Kill the Pi server with Ctrl + C.

Turn off the Pi with the following command, instead of unplugging it:

```sh
sudo poweroff
```

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

# Troubleshooting

Having trouble logging into your Pi? You can try Step 7 and 8 in this guide:

https://desertbot.io/blog/headless-raspberry-pi-3-bplus-ssh-wifi-setup

> :warning: Don't rename your Pi's hostname or password, just skip that part of the guide.

There are some other suggestions and troubleshooting information in this guide:

- https://learn.adafruit.com/turning-your-raspberry-pi-zero-into-a-usb-gadget/ethernet-gadget