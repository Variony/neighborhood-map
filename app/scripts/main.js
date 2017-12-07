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
let infowindow;
const CLIENT_ID = 'MAZXEDFONLQ5HUFMTJ3NKH42QB22IXH0M2GXM2A22DSPEWH0';
const CLIENT_SECRET = 'PAT52K3EHSGPQQHCM0OLUSOJEQDFM1QMQSLTVEU3OZXZQEEZ';

function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 8
	});

	infowindow = new google.maps.InfoWindow();

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
	if(infowindow.marker === marker) return;
	infowindow.marker = marker;
	const title = marker.getTitle();
	const lat = marker.getPosition().lat();
	const lng = marker.getPosition().lng();


	$.ajax({
		url: `https://api.foursquare.com/v2/venues/explore?v=20170801&ll=${lat},${lng}&limit=2&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
	}).done(function(data) {
		showRecommendPlaces(marker, data);
	}).fail(function() {
		alert('No info');
	});	
}

function showRecommendPlaces(marker, data) {
	if(data.meta.code === 200) {
		const items = data.response.groups[0].items;
		let innerHTML = '<h2> Recommend Place for You </h2>';
		for(let i = 0; i < items.length; i ++) {
			const venue = items[i].venue;
			innerHTML += `<h3>${venue.name}</h3>`;
			innerHTML += `<ul><li>phone: ${venue.contact.phone}</li><li>address: ${venue.location.address}</li><li>time: ${venue.hours.status}</li></ul>`;
		}

		infowindow.setContent(innerHTML);
		infowindow.open(map, marker);
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});
	}else{
		alert('No Info');
	}
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
	self.filterText = ko.observable('');
	self.locations = ko.observableArray(locations);
	self.zoom = function(index) {
		zoomToSelect(markers[index]);
	};

	self.filterText.subscribe(function () {
		alert(self.filterText());
	});

}

ko.applyBindings(new MapViewModel());


