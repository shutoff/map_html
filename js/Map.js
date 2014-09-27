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

var mapLayer;

function loaded() {
    mapLayer = new L.Google('ROADMAP');
    map.addLayer(mapLayer);
}

function updateType() {
    if (mapLayer != null) {
        map.removeLayer(mapLayer);
        mapLayer = null;
    }
    var type = android.getType();
    if (type == 'OSM') {
        mapLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
            maxZoom: 18
        });
        map.addLayer(mapLayer);
    }
    if (type == 'Yandex') {
        loadScript('http://api-maps.yandex.ru/2.0/?load=package.map&lang=' + android.language(), function() {
            mapLayer = new L.Yandex();
            map.addLayer(mapLayer);
        });
    }
    if (type == 'Google') {
        var url = 'https://maps.googleapis.com/maps/api/js?v=3.9&callback=loaded&language=' + android.language();
        if (scripts[url] == 1) {
            window.loaded();
            return;
        }
        loadScript(url);
    }
    if (type == 'Bing') {
        mapLayer = new L.BingLayer("Avl_WlFuKVJbmBFOcG3s4A2xUY1DM2LFYbvKTcNfvIhJF7LqbVW-VsIE4IJQB0Nc", {
            type: 'Road',
            culture: android.language()
        });
        map.addLayer(mapLayer);
    }
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
    updateType();

    showTraffic();
    if (android.getTracks == null)
        myLocation();

    notify("init");
}

function notify(method, data) {
    android[method](data);
}

function init() {
    if (android.getZone != null) {
        getBounds = zoneGetBounds;
        initialize();
        showZone();
        return;
    }
    if (android.getTracks != null) {
        getBounds = trackGetBounds;
        initialize();
        showTracks();
        return;
    }
    if (android.getData != null) {
        getBounds = pointsGetBounds;
        initialize();
        showPoints();
        center();
        return;
    }
}