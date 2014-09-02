var scripts = {};

function loadScript(name, cb) {
    console.log('load', name, scripts[name])
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

function getConfig(cb) {

    if (window.android != null){
        Config = {};
        if (android.getLocation != null)
            Config.location = android.getLocation() + '';
        if (android.getData != null)
            Config.points = android.getData() + '';
        if (android.getTracks != null)
            Config.track = android.getTracks() + '';
        if (android.getZone != null)
            Config.zone = android.getZone() + '';
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
        cb();
        return;
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
            var res = xmlhttp.responseText;
            Config = JSON.parse(res);
            cb();
        }
    }
    xmlhttp.open("GET", "../../config.json", true);
    xmlhttp.send();
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
        loadScript('https://maps.googleapis.com/maps/api/js?v=3.9&callback=loaded&language=' + Config.language);
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
    console.log('initialzie')

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
        Location.update();

    notify("init");
}

function init() {
    console.log('init');
    getConfig(function() {
        console.log(Config);
        if (Config.zone != null) {
            console.log('zone')
            loadScript('../leaflet/Zone.js', function() {
                getBounds = zoneGetBounds;
                initialize();
                showZone();
                return;
            });
        }
        if (Config.track != null) {
            console.log('tracks')
            loadScript('../leaflet/Tracks.js', function() {
                getBounds = tracksGetBounds;
                initialize();
                Tracks.update();
                return;
            })
        }
        if (Config.points != null) {
            console.log('point');
            loadScript('../leaflet/Points.js', function() {
                getBounds = pointsGetBounds;
                initialize();
                Points.update();
                center();
                return;
            })
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