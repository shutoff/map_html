var Traffic = {

	update: function() {
		console.log('traffic update')
		if (android.traffic()) {
			if (this.traffic)
				return;
			loadScript('http://api-maps.yandex.ru/2.0/?load=package.map&lang=' + android.language(), function() {
				this.traffic = new L.Yandex("null", {
					traffic: true,
					opacity: 0.8,
					overlay: true
				});
				map.addLayer(this.traffic);
			});
			return;
		}
		if (this.traffic == null)
			return;
		map.removeLayer(this.traffic);
		this.traffic = null;
	}

}

function showTraffic() {
	Traffic.update();
}

console.log('traffic')