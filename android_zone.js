android = {

	getLocation: function() {
		return "60.011,30.009,500"
	},

	getZone: function() {
		return "60.011,30.009,60.122,30.110"
	},

	getType: function() {
		return 'Google';
	},

	traffic: function() {
		return true;
	},

	kmh: function() {
		return "km/h"
	},

	speed: function() {
		return true;
	},

	language: function() {
		return 'ru'
	},

	init: function(data) {
		console.log('init', data)
	},

	setZone: function(data) {
		console.log('setZone', data)
	}

}