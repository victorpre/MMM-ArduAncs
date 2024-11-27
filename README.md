# MMM-ArduAncs
This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/tree/develop) smart mirror project.

This module provides Arduino serial communication support with Raspberry PI for [ANCs](https://developer.apple.com/library/archive/documentation/CoreBluetooth/Reference/AppleNotificationCenterServiceSpecification/Specification/Specification.html) usage.


| Status  | Version | Date       | Maintained? | Minimum MagicMirror² Version |
|:------- |:------- |:---------- |:----------- |:---------------------------- |
| Working | `1.0.0` | 2024-04-17 | Yes         |`2.0.0`                       |

## Screenshots

![MMM-ArduAncs Running](screenshots/mmmarduport_running.png?raw=true "Screenshot")

![MMM-ArduAncs Running](screenshots/mmmarduport_waiting-module.png?raw=true "Screenshot")

![MMM-ArduAncs Running](screenshots/mmmarduport_waiting-arduino.png?raw=true "Screenshot")

![MMM-ArduAncs Running](screenshots/mmmarduport_starting.png?raw=true "Screenshot")

## Dependencies

- [python-shell](https://www.npmjs.com/package/python-shell)

- [pyserial](https://pypi.org/project/pyserial)

## Installation

To install the module, use your terminal to:

1. Navigate to your MagicMirror's `modules` folder. If you are using the default installation directory, use the command:
```
cd ~/MagicMirror/modules
```

2. Clone the module to your computer by executing the following command:
```
git clone https://github.com/victorpre/MMM-ArduAncs.git
```

3. Install the `python-shell` library by executing the following command:
```
npm install
```

* Configure the module in your `config.js` file.

## Using the module

### MagicMirror² Configuration

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        ...
        {
            module: "MMM-ArduAncs",
            position: "bottom_right",
            header: "MMM-ArduAncs",
            config: {
                // See below for more Configuration Options
            }
        },
        ...
    ]
}
```
### Configuration Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
      <th>Value</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>portname</code></td>
      <td><strong>REQUIRED</strong><br>The port name to which the Arduino will be connected<br><br><strong>Example:</strong> <code>"/dev/ttyUSB0"</code></td>
      <td>string</td>
      <td><code>NULL</code></td>
    </tr>
    <tr>
      <td><code>displayIcons</code></td>
      <td>Shows specific icons of the sensors<br><br></td>
      <td>boolean</td>
      <td><code>NULL</code></td>
    </tr>
    <tr>
      <td><code>showDescription</code></td>
      <td>Shows the descriptions of the sensors<br></td>
      <td>boolean</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>hideLoading</code></td>
      <td>Hide loding animation<br></td>
      <td>boolean</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>hideWaiting</code></td>
      <td>Hide waiting animation if the sensor did not send any data yet<br></td>
      <td>boolean</td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>useColors</code></td>
      <td>Use colorful texts<br></td>
      <td>boolean</td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>appsWhitelist</code></td>
      <td><strong>REQUIRED</strong><br>Array of apps which you want to receive notification<br><br><strong>NOTE:</strong> Leave it empty to receive all notifications</td>
      <td>array</td>
      <td><code>NULL</code></td>
    </tr>
    <tr>
      <td><code>latestNotifications</code></td>
      <td><strong>REQUIRED</strong><br>Array where the latest notifications will be stored<br><br></td>
      <td>array</td>
      <td><code>NULL</code></td>
    </tr>

  </tbody>
</table>

Here is an example of an entry in `config.js` with full-feature.

```
...
        {
	          module: 'MMM-ArduAncs',
	          position: 'bottom_left',
              header: 'Arduino Sensors',
              config: {
                portname: "/dev/tty.usbmodem21203",
                updateInterval: 1, //second
		            animationSpeed: 1000,
                displayIcons: true,
	              iconSize: 'small',
		            labelSize: 'medium',
                showDescription: false,
		            appsWhitelist: [],
		            latestNotifications: [],
                developerMode: false
            }
        },
...
```

## Using the Arduino

To communicate between `Arduino` and `MMM-ArduAncs`, serial communication must be in this format:

```

{
        "type": "notification",
        "content": {
            "id": 1, // integer
            "category" : "string",
            "app_id": "string",
            "message": "string",
            "title": "string",
            "subtitle": "string",
            "removed": true // bolean
        }
}
```

OR

```
{
        "type": "setup",
        "content": {
            "status": "starting" // "waiting", "connected", "disconnected"
        }
}
```


### Starting the module

**IMPORTANT:** Do not any send sensor data in the `setup()` function.

In order to start the module, the Arduino's `setup()` function must be completed.

- To send `starting` signal: `{"type": "setup", "content": { "status": "starting" } }`

- To send `connected` signal: `{"type": "setup", "content": { "status": "connected" } }`

- To send `failed` signal: `{"type": "setup", "content": { "status": "failed" } }`


### Sending data to module

**IMPORTANT:** If you don't want to shown notification from a specific application, do not add the `app_id` to the `appsWhitelist` array.


### Full CircuitPython Example

Can be found in this [repository](https://github.com/victorpre/ancs-py/blob/a79024eaea0f064261d4787d60a022c32f099893/code.py#L57)

## Known Issues

- ISSUE: When the Arduino's reset button is pressed, sometimes the connection is terminated.
- FIX:
```
1. Disconnect the Arduino from the PC
2. Close the MagicMirror
3. Re-open the MagicMirror again
4. Connect Arduino to PC again
```

## Special Thanks

- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror²](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [Jeff Clarke](https://github.com/jclarke0000/MMM-MyCommute) for creating awesome module design (that i use in this project) and inspires me to do this module.
- [Furkan 'Dentrax' Türkal](https://github.com/Dentrax) for creating the initial module which was the foundation and basis for this project, the whole infrastructure, CSS, Python <-> JS communication was done by him.

