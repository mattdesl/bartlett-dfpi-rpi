#!/usr/bin/env python
import argparse
import os
import time

DEFAULT_PORT = 32045

# env vars override CLI flags
port = os.environ.get('PORT', '')
host = os.environ.get('HOST', '')

parser = argparse.ArgumentParser(description='Start sending envirophat data to a websocket server')
parser.add_argument('--fps', default=30, type=float,
                    help='frame rate to sample at')
parser.add_argument('--unit', default='hPa',
                    help='pressure unit, hPa (hectopascals, default) or Pa (pascals)')
parser.add_argument('--reconnect', default=2, type=float,
                    help='reconnect delay in seconds, default 2')
parser.add_argument('--host', default='',
                    help='websocket server host, such as 192.168.1.2')
parser.add_argument('--port', default='',
                    help='websocket server port, default 32045')
parser.add_argument('--sensors', default='light,weather,motion,analog',
                    help='comma-separate which modules to enable (default: light,weather,motion,analog)')
parser.add_argument('--light-time', default=5, type=float,
                    help='light polling integration time, affects max value')
parser.add_argument('--qnh', default=1013.25, type=float,
                    help='pressure at your location, defaults to mean sea level')

args = parser.parse_args()

import socket
def get_ip():
  s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  try:
    # doesn't even have to be reachable
    s.connect(('10.255.255.255', 1))
    IP = s.getsockname()[0]
  except:
    IP = '127.0.0.1'
  finally:
    s.close()
  return IP

ip = get_ip()
host = host or args.host or ip
port = port or args.port or DEFAULT_PORT

if not port:
  raise ValueError('Must specify PORT environment variable or --port CLI flag')

from envirophat import light, weather, motion, analog, leds
from datetime import datetime
import json
import logging
from socket import error as SocketError
import threading
from websocket_server import WebsocketServer

unit = args.unit # Pressure unit, can be either hPa (hectopascals) or Pa (pascals)
fps = args.fps
uri = "ws://%s:%s" % (host, port)
light_integration_time = args.light_time
if light_integration_time < 2.4:
  print('WARN: --light-time clamped to 2.4 ms')
  light_integration_time = 2.4
if light_integration_time > 612:
  print('WARN: --light-time clamped to 612 ms')
  light_integration_time = 612

sensors = [x.strip() for x in args.sensors.lower().split(',')]

use_motion = 'motion' in sensors
use_analog = 'analog' in sensors
use_weather = 'weather' in sensors
use_light = 'light' in sensors

# This value is necessary to calculate the correct height above sealevel
# its also included in airport weather information ATIS named as QNH
# The default is equivilent to the air pressure at mean sea level
# in the International Standard Atmosphere (ISA).
# See: https://en.wikipedia.org/wiki/Pressure_altitude
QNH=args.qnh # hpA

is_running = True

def get_data ():
  data = {
    'time': datetime.now()
  }

  if use_motion:
    # more efficiently extract values
    motion.heading()
    heading = motion._tilt_heading_degrees
    mag_values = motion._mag
    acc_values = motion._accel
    data['heading'] = heading
    data['magnetometer'] = [ mag_values[0], mag_values[1], mag_values[2] ]
    data['accelerometer'] = [ acc_values[0], acc_values[1], acc_values[2] ]

  if use_light:
    # more efficiently extract RGB and light value
    CH_CLEAR = 3
    rgbc = light.raw()
    light_value = rgbc[CH_CLEAR]
    light_scaled = tuple([float(x) / rgbc[CH_CLEAR] for x in rgbc]) if rgbc[CH_CLEAR] > 0 else (0, 0, 0)
    rgb = [int(x * 255) for x in light_scaled][:CH_CLEAR]
    data['light'] = light_value
    data['rgb'] = rgb

  if use_weather:
    data['unit'] = unit
    data['altitude'] = weather.altitude(qnh=QNH)
    data['temperature'] = weather.temperature()
    data['pressure'] = weather.pressure(unit=unit)

  if use_analog:
    analog_values = analog.read_all()
    data['analog'] = [ analog_values[0], analog_values[1], analog_values[2] ]

  return data

def message_loop(server):
  global is_running

  while is_running:
    if server.clients:
      data = get_data()
      message = json.dumps(data, default=str)

      for client in server.clients:
        try:
          server.send_message(client, message)
        except SocketError as err:
          print('Socket Error sending message to client, most likely closed')
        except Exception as err:
          print('Error sending message to client')

    time.sleep(1.0 / fps)

# make integration much faster
def setup_light():
  ADDR = 0x29
  REG_CMD = 0b10000000
  REG_CMD_AUTO_INC = 0b00100000
  REG_CLEAR_L = REG_CMD | REG_CMD_AUTO_INC | 0x14
  REG_RED_L = REG_CMD | REG_CMD_AUTO_INC | 0x16
  REG_GREEN_L = REG_CMD | REG_CMD_AUTO_INC | 0x18
  REG_BLUE_L = REG_CMD | REG_CMD_AUTO_INC | 0x1A
  REG_ENABLE = REG_CMD | 0
  REG_ATIME = REG_CMD | 1
  REG_CONTROL = REG_CMD | 0x0f
  REG_STATUS = REG_CMD | 0x13
  REG_CONTROL_GAIN_1X = 0b00000000
  REG_CONTROL_GAIN_4X = 0b00000001
  REG_CONTROL_GAIN_16X = 0b00000010
  REG_CONTROL_GAIN_60X = 0b00000011
  REG_ENABLE_INTERRUPT = 1 << 4
  REG_ENABLE_WAIT = 1 << 3
  REG_ENABLE_RGBC = 1 << 1
  REG_ENABLE_POWER = 1

  light._is_setup = True
  light.i2c_bus.write_byte_data(ADDR, REG_ENABLE, REG_ENABLE_RGBC | REG_ENABLE_POWER)
  light._atime = int(round(light_integration_time / 2.4))
  light._max_count = min(65535, (256 - light._atime) * 1024)
  light.i2c_bus.write_byte_data(ADDR, REG_ATIME, 256 - light._atime)

setup_light()

server = WebsocketServer(port, host=host, loglevel=logging.WARNING)

print("""
Running Websocket Server on %s

Use the following variables in your sketch:

const HOST = "%s";
const PORT = %s;

Type Ctrl + C to close the server.
""" % (uri, host, port))

message_thread = threading.Thread(target=message_loop, args=[server])
message_thread.start()

server.run_forever()
is_running = False