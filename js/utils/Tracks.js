function showTracks() {
	Tracks.update();
}

function saveTrack() {
	var bounds = map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	android.save(sw.lat + ',' + ne.lat + ',' + sw.lng + ',' + ne.lng);
}

function shareTrack() {
	var bounds = map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	android.share(sw.lat + ',' + ne.lat + ',' + sw.lng + ',' + ne.lng);
}

function trackGetBounds() {
	if (!Tracks.points)
		Tracks.init();
	return [
		[Tracks.min_lat, Tracks.min_lng],
		[Tracks.max_lat, Tracks.max_lng]
	];
}