/*eslint-disable no-unused-vars, no-undef*/

let locations = [
	{ title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
	{ title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
	{ title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
	{ title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
	{ title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
	{ title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
];

let map;
let markers = [];

function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 8
	});


	for(let i = 0; i < locations.length; i ++) {
		const position = locations[i].location;
		const title = locations[i].title;
		const marker = new google.maps.Marker({
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i,
			map: map
		});

		marker.addListener('click', function() {
			populateInfoWindow(this);
		});
		markers.push(marker);
	}
	showListings();	

}

function populateInfoWindow(marker) {
	if(marker.hasInfo) return;
	marker.hasInfo = true;
	const title = marker.getTitle();
	const infowindow = new google.maps.InfoWindow();
	infowindow.setContent(title);
	infowindow.open(map, marker);
	infowindow.addListener('closeclick', function() {
		infowindow.marker = null;
		marker.hasInfo = false;
	});
}

function showListings() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);
}

function zoomToSelect(marker) {
	const position = marker.getPosition();
	map.setCenter(position);
	map.setZoom(15);
	populateInfoWindow(marker);
}

function MapViewModel() {
	let self = this;
	self.locations = ko.observableArray(locations);
	self.zoom = function(index) {
		zoomToSelect(markers[index]);
	};

}

ko.applyBindings(new MapViewModel());


