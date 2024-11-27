// ====================================================
// MMM-arduancs Copyright(C) 2019 Furkan Türkal
// This program comes with ABSOLUTELY NO WARRANTY; This is free software,
// and you are welcome to redistribute it under certain conditions; See
// file LICENSE, which is part of this source code package, for details.
// ====================================================

'use strict';

const NodeHelper = require('node_helper');

const {PythonShell} = require('python-shell');

var pythonStarted = false;

module.exports = NodeHelper.create({

    consolePrefix: '[MMM-ArduAncs]:: ',

    start: function() {
        console.log(this.consolePrefix + "Starting node_helper for module [" + this.name + "]");
        this.initialized = false;
    },

    python_start: function () {
        const self = this;
        const pyshell = new PythonShell('modules/' + this.name + '/arduancs/arduancs.py', { mode: 'json', args: [JSON.stringify(this.config)]});

        pyshell.on('message', function (message) {

            if (message.type == 'debug'){
                console.log(this.consolePrefix + "[" + self.name + "] " + message.content.status);
            }
			if (message.type == 'status'){
                self.sendSocketNotification('status', message);
			}
            if (message.type == 'notification'){
                if(self.initialized){
                    self.sendData(message);
                }
            }
        });
        pyshell.end(function (err) {
            if (err) throw err;
            console.log("[" + self.name + "] " + 'finished running...');
            self.sendSocketNotification('error', 'pyshell-throw');
        });
    },

    sendData: function(message){
		    const self = this;

			if (this.config.appsWhitelist.length === 0 || this.config.appsWhitelist.find(x => x === message.app_id)) {
				self.sendSocketNotification('ble_notification', message);
			}
    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;

        if (notification === 'CONFIG') {
			      this.config = payload;
		    } else if (notification === "INITIALIZE" && this.config !== null){
            this.python_start();
			self.sendSocketNotification('status', {"type": "setup", "content": {"status": "initialized"}})
            this.initialized = true;
		    }
    }
});
