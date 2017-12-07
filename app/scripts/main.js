/*eslint-disable no-unused-vars, no-undef*/

const locations = [
	{ title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
	{ title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
	{ title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
	{ title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
	{ title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
	{ title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
];

let filterLocations = locations.slice();

let map;
let markers = {};
let infowindow;
const CLIENT_ID = 'MAZXEDFONLQ5HUFMTJ3NKH42QB22IXH0M2GXM2A22DSPEWH0';
const CLIENT_SECRET = 'PAT52K3EHSGPQQHCM0OLUSOJEQDFM1QMQSLTVEU3OZXZQEEZ';

//Initialize map ande pre-processing the markers
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 40.7413549, lng: -73.9980244 },
		zoom: 8
	});

	infowindow = new google.maps.InfoWindow();

	for (let i = 0; i < locations.length; i++) {
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
			this.setAnimation(google.maps.Animation.DROP);
		});
		markers[title] = marker;
	}
	showListings(locations);
}

function populateInfoWindow(marker) {
	if (infowindow.marker === marker) return;
	infowindow.marker = marker;
	const title = marker.getTitle();
	const lat = marker.getPosition().lat();
	const lng = marker.getPosition().lng();

	//Using jQuery ajax to get data from foursquare api
	$.ajax({
		url: `https://api.foursquare.com/v2/venues/explore?v=20170801&ll=${lat},${lng}&limit=2&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
	}).done(function(data) {
		showRecommendPlaces(marker, data);
	}).fail(function() {
		alert('No info');
	});
}

function showRecommendPlaces(marker, data) {
	if (data.meta.code === 200) {
		const items = data.response.groups[0].items;
		let innerHTML = '<h2> Recommend Place for You </h2>';
		for (let i = 0; i < items.length; i++) {
			const venue = items[i].venue;
			innerHTML += `<h3>${venue.name}</h3>`;
			innerHTML += `<ul><li>phone: ${venue.contact.phone}</li><li>address: ${venue.location.address}</li><li>time: ${venue.hours.status}</li></ul>`;
		}

		infowindow.setContent(innerHTML);
		infowindow.open(map, marker);
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});
	} else {
		alert('No Info');
	}
}



function showListings(location) {

	for(let key in markers) {
		markers[key].setMap(null);
	}

	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (let i = 0; i < filterLocations.length; i++) {
		markers[filterLocations[i].title].setMap(map);
		bounds.extend(filterLocations[i].location);
	}
	map.fitBounds(bounds);
}

function zoomToSelect(marker) {
	const position = marker.getPosition();
	map.setCenter(position);
	map.setZoom(15);
	marker.setAnimation(google.maps.Animation.DROP);
	populateInfoWindow(marker);
}

function MapViewModel() {
	let self = this;
	self.filterText = ko.observable('');
	self.filterLocations = ko.observableArray(filterLocations);
	self.zoom = function(data) {
		zoomToSelect(markers[data.title]);
	};

	self.filterText.subscribe(function() {
		const word = self.filterText().toLowerCase();
		self.filterLocations.removeAll();
		for (let i = 0; i < locations.length; i++) {
			if (locations[i].title.toLowerCase().indexOf(word) !== -1) {
				self.filterLocations.push(locations[i]);
			}

		}
	});

	self.go = function() {
		showListings(self.filterLocations());
	};

}

ko.applyBindings(new MapViewModel());

$('.menu-icon').click(function() {
	$('aside.sidebar').toggle();
	$('.map-container').toggleClass('expand-map-container');
	var currCenter = map.getCenter();
	google.maps.event.trigger(map, 'resize');
	map.setCenter(currCenter);
});
