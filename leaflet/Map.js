var scripts = {};

function loadScript(name, cb) {
    if (scripts[name] != null) {
        if (scripts[name] && cb)
            cb();
        return;
    }
    scripts[name] = 0;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = name;
    var r = false;
    script.onload = script.onreadystatechange = function() {
        if (!r && (!this.readyState || this.readyState == 'complete')) {
            r = true;
            scripts[name] = 1;
            if (cb)
                cb();
        }
    }
    document.body.appendChild(script);
}

function getFile(name, cb) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
            cb(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", "../../" + name, true);
    xmlhttp.send();
}

function getConfig(cb) {
    console.log('getConfig' + getConfig.caller);
    if (window.android != null) {
        Config = {};
        if (android.getType != null)
            Config.type = android.getType() + '';
        if (android.traffic != null)
            Config.traffic = android.traffic() + '';
        if (android.kmh != null)
            Config.kmh = android.kmh() + '';
        if (android.speed != null)
            Config.speed = android.speed() + '';
        if (android.language != null)
            Config.language = android.language() + '';
        if (android.getZone != null)
            Config.action = 'zone';
        if (android.getTracks != null)
            Config.action = 'track';
        if (android.getData != null)
            Config.action = 'point';
        cb();
        return;
    }
    getFile('config.json', function(res) {
        Config = JSON.parse(res);
    })
}

function getZone(cb) {
    if (window.android != null) {
        cb(android.getZone() + "")
        return;

    }
    getFile('zone', cb);
}

function getTrack(cb) {
    if (window.android != null) {
        cb(android.getTracks() + "")
        return;

    }
    getFile('track', cb);
}

function getPoints(cb) {
    if (window.android != null) {
        cb(android.getPoints() + "")
        return;

    }
    getFile('points', cb);
}

function getLocation(cb) {
    if (window.android != null) {
        cb(android.getLocation() + "")
        return;

    }
    getFile('location', cb);
}

var mapLayer;

function loaded() {
    mapLayer = new L.Google('ROADMAP');
    map.addLayer(mapLayer);
}

function loadMapLayer() {
    if (mapLayer != null) {
        map.removeLayer(mapLayer);
        mapLayer = null;
    }
    if (Config.type == 'OSM') {
        mapLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
            maxZoom: 18
        });
        map.addLayer(mapLayer);
    }
    if (Config.type == 'Yandex') {
        loadScript('http://api-maps.yandex.ru/2.0/?load=package.map&lang=' + Config.language, function() {
            mapLayer = new L.Yandex();
            map.addLayer(mapLayer);
        });
    }
    if (Config.type == 'Google') {
        var url = 'https://maps.googleapis.com/maps/api/js?v=3.9&callback=loaded&language=' + Config.language;
        if (scripts[url] == 1) {
            window.loaded();
            return;
        }
        loadScript(url);
    }
    if (Config.type == 'Bing') {
        mapLayer = new L.BingLayer("Avl_WlFuKVJbmBFOcG3s4A2xUY1DM2LFYbvKTcNfvIhJF7LqbVW-VsIE4IJQB0Nc", {
            type: 'Road',
            culture: Config.language
        });
        map.addLayer(mapLayer);
    }
}

function updateType() {
    getConfig(loadMapLayer);
}

function initialize() {
    var bounds = getRect(getBounds());

    var p1 = bounds[0];
    var lat1 = p1[0];
    var lng1 = p1[1];

    var p2 = bounds[1];
    var lat2 = p2[0];
    var lng2 = p2[1];

    var lat = (lat1 + lat2) / 2;
    var lng = (lng1 + lng2) / 2;

    var d_lat = lat2 - lat;
    var d_lng = lng2 - lng;

    map = L.map('map', {
        center: [lat, lng],
        zoom: 15
    });

    var zoom = map.getBoundsZoom([
        [lat1 - d_lat, lng1 - d_lng],
        [lat2 + d_lat, lng2 + d_lng]
    ]);
    if (zoom > 16)
        zoom = 16;
    map.setZoom(zoom);
    loadMapLayer();

    _showTraffic();
    if (Config.track == null)
        myLocation();

    notify("init");
}

function init() {
    getConfig(function() {
        console.log(Config.action)
        if (Config.action == 'zone') {
            getBounds = zoneGetBounds;
            initialize();
            showZone();
            return;
        }
        if (Config.action == 'track') {
            getBounds = trackGetBounds;
            initialize();
            showTracks();
            return;
        }
        if (Config.action == 'points') {
            getBounds = pointsGetBounds;
            initialize();
            showPoints();
            center();
            return;
        }
    })
}

function notify(method, data) {
    if (window.android != null) {
        android[method](data);
        return;
    }
    console.log(method, data);
}