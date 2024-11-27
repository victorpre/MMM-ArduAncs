#!/usr/bin/env python
# coding: utf-8

import sys
import serial
import time
import json
import re

from arduancs import to_node

from threading import Thread

rgxData = re.compile("[\[][a-zA-Z0-9-].*[\:][a-zA-Z0-9-].*[\:][a-zA-Z0-9-].*[\]]")

LF = '\n'
CR = '\r'

class Arduino(object):

    def __init__(self, portname, baudrate):
        self.arduino = serial.Serial(
             port = portname,
             baudrate = baudrate,
             timeout = 5,
             xonxoff = False,
             rtscts = False,
             dsrdtr = False,
             writeTimeout = 2
        )

    def open(self, max_attempt = 3):
        attempt = 0

        while attempt < max_attempt:
            try:
                if not self.arduino.isOpen():
                    self.arduino.open()
                if self.arduino.isOpen():
                    self.arduino.flushInput()
                    self.arduino.flushOutput()
                    return True
                if not self.arduino.isOpen():
                    continue
            except Exception as e:
                attempt = attempt + 1
                if attempt == max_attempt:
                    return False

            time.sleep(1)

    def close(self):
        try:
            if self.arduino.isOpen():
                self.arduino.close()
                return True
        except Exception as e:
            return False

    def on_data_received(self, data):
        msg = json.loads(data)
        to_node(msg)

    def start_serial(self):
        while True:
            try:
                if (self.arduino.isOpen()):
                    if (self.arduino.readable() and self.arduino.in_waiting > 0):
                        incoming = self.arduino.readline(self.arduino.in_waiting).decode('utf8')
                        self.on_data_received(incoming)
            except OSError as e:
                break

            time.sleep(0.1)