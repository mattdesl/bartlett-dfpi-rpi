# Setup

## Equipment

See the [Hardware List](./hardware-list.md) for which equipment you will need.

## 1. Format SD Card

Make sure your SD card is formatted. You can use the quick format option in this tool here:

https://www.sdcard.org/downloads/formatter/index.html

## 2. Download OS and Flash to SD Card

Download [Raspbian Buster with desktop and recommended software](https://www.raspberrypi.org/downloads/raspbian/) which is the operating system. Extract the `.img` to your Downloads folder.

Now we need to "flash" the `.img` onto the SD Card. You'll need to follow the steps here:

- [Installing Images](https://www.raspberrypi.org/documentation/installation/installing-images/)

## 3. SSH Into Pi over USB

After flashing to the SD Card, take it out and plug it back into your computer. Now we'll set it up to use a USB cable to connect to the Raspberry Pi. See here:

- [SSH Into Pi Zero over USB](https://desertbot.io/blog/ssh-into-pi-zero-over-usb)

Notes:

- I recommend also plugging in the Raspberry Pi to a power socket so it isn't only relying on your laptop for power.
- If you have already setup a different Raspberry Pi, you may have to open the `~/.ssh/known_hosts` file on your computer and remove the line related to `raspberrypi.local`

## 4. Connect to Wifi

Now that your Raspberry Pi is running in SSH, you need to set up a WiFi. I would recommend the `raspi-config` command, see here:

- [Setting up WiFi via the Command Line](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md)

## 5. Download envirophat Software

Next we need to download the `envirophat` software which controls the envrio pHAT device. See here:

- [pimoroni/enviro-phat](https://github.com/pimoroni/enviro-phat)

Specifically this command, *run from Pi Zero*.

```sh
curl https://get.pimoroni.com/envirophat | bash
```

## 6. Copy `server.py`

From the SSH in your Pi, make an empty folder:

```sh
mkdir ~/enviro/
```

From your computer, copy the `server.py` script into the Pi:

```sh
cd bartlett-dfpi-rpi
scp server/server.py pi@raspberrypi.local:enviro/
```

## 7. Install Server Software

Next we need to install a `websocket-server` utility inside the Pi:

```sh
pip install git+https://github.com/Pithikos/python-websocket-server
```

## Ready to run!

Now you can run it like normal, see the [Running Locally](./running-locally.md) guide for details.
