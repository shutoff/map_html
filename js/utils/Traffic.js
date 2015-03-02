var sphericalMercator
var wgs84Mercator

L.YandexLayer = L.TileLayer.extend({
	getTileUrl: function(tilePoint) {
		return L.Util.template(this._url, L.extend({
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options)) + '&tm=' + Math.round(new Date().getTime() / 1000)
	},

	_getTilePos: function(tilePoint) {

		var origin = this._map.getPixelOrigin(),
			tileSize = this._getTileSize();

		var p = tilePoint.multiplyBy(tileSize)			
		p = wgs84Mercator.fromGlobalPixels([ p.x, p.y], this._map._zoom);
		p = sphericalMercator.toGlobalPixels(p, this._map._zoom)
		return L.point(p[0], p[1]).subtract(origin);
	},

	_addTilesFromCenterOut: function (bounds) {
		return L.TileLayer.prototype._addTilesFromCenterOut.call(this, L.bounds(this.toYandex(bounds.min, false), this.toYandex(bounds.max, true)))
	},

	toYandex: function(p, ceil) {
		var tileSize = this._getTileSize()
		var tp = p.multiplyBy(tileSize)
		tp = sphericalMercator.fromGlobalPixels([ tp.x, tp.y], this._map._zoom);
		tp = wgs84Mercator.toGlobalPixels(tp, this._map._zoom)
		if (ceil){
			tp = L.point(Math.ceil(tp[0] / tileSize), Math.ceil(tp[1] / tileSize));
		}else{
			tp = L.point(Math.floor(tp[0] / tileSize), Math.floor(tp[1] / tileSize));
		}
		return tp
	}

})

var Traffic = {

	update: function() {
		if (android.traffic()) {
			if (this.traffic)
				return;
			var that = this;
			loadScript('http://api-maps.yandex.ru/2.0/?load=package.map&lang=' + android.language(), function() {
				if (ymaps.Map === undefined){
					return ymaps.load(["package.map"], that._initMapObject, that);
				}
				that._initMapObject()
			});
			return;
		}
		if (this.traffic == null)
			return;
		map.removeLayer(this.traffic);
		this.traffic = null;
	},

	_initMapObject: function() {
		sphericalMercator = ymaps.projection.sphericalMercator
		wgs84Mercator = ymaps.projection.wgs84Mercator
		this.traffic = new L.YandexLayer("http://jgo.maps.yandex.net/1.1/tiles?l=trf,trfe,trfl&lang=ru_RU&x={x}&y={y}&z={z}", {
			format: 'image/png',
			transparent: true
		});
		map.addLayer(this.traffic);
	}

}

function showTraffic() {
	Traffic.update();
}