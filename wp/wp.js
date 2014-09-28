android = {

}

var _data;

var notify = function(method) {
	return function(data) {
        window.external.notify(method + '|' + data)
	}
}

function setConfig(type, traffic, kmh, speed, lang) {
	android.getType = function() {
		return type;
	}
	android.traffic = function() {
		return traffic;
	}
	android.kmh = function() {
		return kmh;
	}
	android.speed = function() {
		return speed;
	}
	android.language = function() {
		return lang;
	}

	if (android.getLocation == null) {
		android.getLocation = function() {
		    if (window.navigator.geolocation) {
		        window.navigator.geolocation.watchPosition(function (position) {
		            var c = position.coords;
		            var data = c.latitude + ',' + c.longitude + ',' + c.accuracy;
		            android.getLocation = function () {
		                return data;
		            }
		            myLocation();
		        }, function (err) { })
		    }
		    return null;
		}
	}

	if (android.init == null)
		android.init = notify('init');
}

function setPart(part) {
    if (part == null)
        return;
	if (_data == null) {
		_data = part;
		return;
	}
	_data += part;
}

function setData(part) {
    setPart(part);
	(function(data) {
		android.getData = function() {
			return data;
		}
	})(_data);
	_data = null;
}

function setTrack(part) {
    setPart(part);
	(function (data) {
	    android.getTracks = function () {
	        return data;
	    }
	})(_data);
    _data = null;
}

function setTraffic(traffic) {
    android.traffic = function () {
        return traffic;
    }
    showTraffic();
}

function setMapType(type) {
    android.getType = function() {
        return type;
    }
    updateType();
}