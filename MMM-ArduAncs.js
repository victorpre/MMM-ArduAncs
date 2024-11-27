Module.register("MMM-ArduAncs", {

    logPrefix: '[MMM-ArduAncs]:: ',

    defaults: {
        portname: "/dev/tty.usbmodem21201",
        updateInterval: 1, //second
		animationSpeed: 1000,
        displayIcons: true,
	    iconSize: 'small',
		labelSize: 'medium',
        showDescription: false,
		appsWhitelist: [],
		latestNotifications: [],
        developerMode: true
    },

    start: function() {
		    Log.info('Starting module: ' + this.name);

        const self = this;

        this.loading = true;
        this.isArduinoStarting = false;
        this.isArduinoStarted = false;
        this.isArduinoBleConnected = false;
        this.isArduinoConnected = false;

		    this.sendSocketNotification('CONFIG', this.config);
		    this.sendSocketNotification('INITIALIZE', null);

		    self.log(("[MMM-ArduAncs::START()]: data: " + JSON.stringify(self.data, null, 4)), "dev");
		    self.log(("[MMM-ArduAncs::START()]: config: " + JSON.stringify(self.config, null, 4)), "dev");
	  },

    getTranslations: function() {
		    return {
			      en: "translations/en.json"
		    };
	  },

    getStyles: function() {
		    return [
            'https://use.fontawesome.com/releases/v5.6.3/css/all.css',
            'MMM-ArduAncs.css'
        ];
	  },

    socketNotificationReceived: function(notification, payload) {
        const self = this;

        switch(notification){
        case 'status':
            if(payload.type == 'setup'){
				var status = payload.content.status;
                if(status == 'starting'){
                    self.log("[socketNotificationReceived::status]: starting");
                    this.isArduinoConnected = true;
                    this.isArduinoStarting = true;
                    this.isArduinoBleConnected = false;
                } else if (status == 'connected'){
                    this.isArduinoStarting = false;
                    this.isArduinoStarted = true;
                    this.isArduinoBleConnected = false;
                    // this.sendNotification("SHOW_ALERT", {type: "notification", imageFA: 'fa-microchip', title: self.translate("ARDUINO_CONNECTED")});
                } else if (status == 'failed'){
                    self.log("[socketNotificationReceived::status]: failed");
                    this.isArduinoStarting = false;
                    this.isArduinoStarted = false;
                    this.isArduinoBleConnected = false;
                }
					self.updateDom({ options: { speed: self.config.animationSpeed } });
            }
            if(payload.type == 'status'){
                if(payload.content.status == 'connected'){
                    self.log("[socketNotificationReceived::status]: connected");
                    this.isArduinoConnected = true;
                    this.isArduinoStarted = true;
                    this.isArduinoBleConnected = true;
                } else if(payload.content.status == 'disconnected'){
                    self.log("[socketNotificationReceived::status]: disconnected");
                    this.isArduinoConnected = false;
                    // this.sendNotification("SHOW_ALERT", {type: "notification", imageFA: 'fa-microchip', title: self.translate("ARDUINO_DISCONNECTED")});
                }
            }
            if(payload.content.status == 'initialized'){
                this.loading = false;
            }
            // self.updateDom({ options: { speed: self.config.animationSpeed } });
            break;

        case 'ble_notification':
            if(this.isArduinoConnected && this.isArduinoStarted && this.isArduinoBleConnected){
                self.log("[socketNotificationReceived::notification]: ");

				this.config.latestNotifications.push(payload.content);

				self.updateDom({ options: { speed: self.config.animationSpeed } });
			}
			break;

        case 'error':
            console.log("[socketNotificationReceived::error]:");

            if(payload == 'pyshell-throw'){
                this.message = 'Error : PyShell down!';
                this.isArduinoConnected = false;
                this.isArduinoStarted = false;
            }

			self.updateDom({ options: { speed: self.config.animationSpeed } });
            break;
        }
    },

    formatRow: function(bleNotification) {
		var self = this;
        console.log(JSON.stringify(bleNotification, null, 4));

		var row = document.createElement("div");
		row.classList.add("row");

		// Title of the notification
		var title = document.createElement("span");
		title.className = "notif-title bright";

		title.innerHTML = bleNotification.title;
		row.appendChild(title);

		// Mesage of the notification
		var msg = document.createElement("div");
		msg.classList.add("notif-msg");

		msg.innerHTML = bleNotification.message;
		row.appendChild(msg);

		// Name of the App
		var nameEl = document.createElement("span");
		nameEl.classList.add("app-name");

		let getLastElement = function(arr) { return arr[arr.length - 1]; };
		var name = getLastElement(bleNotification.app_id.split('.'));
		var upcaseName = name.charAt(0).toUpperCase() + name.slice(1);


        if (bleNotification != null) {
			nameEl.innerHTML = upcaseName;
        } else {
            nameEl.innerHTML = self.translate("ARDUINO_WAITING_DATA");
            nameEl.classList.add("value-waiting");
        }

		row.appendChild(nameEl);


        return row;
    },

    getSensorIcon: function(sensor) {

    },

    getDom: function() {
        var self = this;

        var wrapper = document.createElement("div");
		wrapper.classList.add("notif-rows")

        if (self.loading) {
            var loading = document.createElement("div");
				    loading.innerHTML += self.translate("LOADING");
            loading.className = "dimmed light small";
            wrapper.appendChild(loading);
				    return wrapper;
			  } else if (!self.isArduinoConnected) {
            var waiting = document.createElement("div");
				    waiting.innerHTML += self.translate("ARDUINO_WAITING_CONNECTION");
				    waiting.classList.add("waiting");
				    waiting.classList.add("small");
            wrapper.appendChild(waiting);
				    return wrapper;
			  } else if (self.isArduinoStarting) {
            var starting = document.createElement("div");
				    starting.innerHTML += self.translate("ARDUINO_STARTING");
				    starting.classList.add("starting");
				    starting.classList.add("small");
            wrapper.appendChild(starting);
				    return wrapper;
        }


		if (self.isArduinoStarted && self.isArduinoBleConnected) {
			console.log("connected, ready to update dom")
			var numberOfNotifications = this.config.latestNotifications.length;
			var i = numberOfNotifications - 1;
			// iterate from last to first
            while(i >= 0){
                notif = this.config.latestNotifications[i];
				var formattedRow = this.formatRow(notif);

                wrapper.appendChild(formattedRow);
				i--;
            }

		        return wrapper;
        }
    },

    log: function(message, type) {
		    var self = this;
		    if (self.config.developerMode) {
			      var date = new Date();
			      var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
			      message = self.name + ": (" + self.data.index + ")(" + time + ") " + message;
		    } else { message = self.name + ": " + message; }
		    switch (type) {
			  case "error": Log.error(this.logPrefix + message); break;
			  case "warn": Log.warn(this.logPrefix + message); break;
			  case "info": Log.info(this.logPrefix + message); break;
			  case "dev": if (self.config.developerMode) { Log.log(this.logPrefix + message); } break;
			  default: Log.log(this.logPrefix + message);
		    }
	}
});
