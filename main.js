let map;
let userPosition = null;
let taxiMarker = null;
let userTracker = null;
let routeControl = null;


// Initialize map with dummy center, will update later
map = L.map('map').setView([0, 0], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

const taxiIcon = L.icon({

    iconUrl: './img/red_marker.png',
    iconSize: [32, 32],

})


//Get user's location
navigator.geolocation.getCurrentPosition((position) => {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    userPosition = [lat, lng];

    map.setView(userPosition, 15);
    L.marker(userPosition).addTo(map)
        .bindPopup('You are here')
        .openPopup();

}), (err) => {

    alert("Failed to get your location: " + err.message);

}


// Handle Start Button
document.getElementById('startBtn').addEventListener('click', () => {

    if (!userPosition) return alert("Location not ready yet");

    //Add taxi marker
    taxiMarker = L.marker(userPosition, { icon: taxiIcon }).addTo(map)

    //Begin tracking movement
    navigator.geolocation.watchPosition((pos) => {

        const newPos = [pos.coords.latitude, pos.coords.longitude];

        // update user tracker marker
        if (!userTracker) {
            userTracker = L.marker(newPos).addTo(map)
        } else {
            userTracker.setLatLng(newPos);
        }

        // Draw route from taxi to current user location
        if (routeControl) {
            map.removeControl(routeControl);
        }

        routeControl = L.Routing.control({

            waypoints: [
                L.latLng(taxiMarker.getLatLng()),
                L.latLng(newPos)
            ],
            enableHighAccuracy: true,
            show: false,
            addWaypoints: false,

        }).on('routesfound', function (e) {
            const route = e.routes[0];
            const distanceInKm = (route.summary.totalDistance / 1000).toFixed(2); // km
            const durationInMin = (route.summary.totalTime / 60).toFixed(1); // minutes

            document.getElementById('info').innerHTML = `
		        <b>Distance:</b> ${distanceInKm} km<br>
		        <b>Estimated Time:</b> ${durationInMin} min
             `;
        }).addTo(map);

    }, (err) => {

        console.error("Tracking error", err);

    }, { enableHighAccuracy: true });

});