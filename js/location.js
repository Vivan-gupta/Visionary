// Assuming you have included the Azure Maps control scripts in your HTML
document.addEventListener('DOMContentLoaded', function () {
    // Initialize a map instance.
    var map = new atlas.Map('myMap', {
        center: [77.2090, 28.6139],
        zoom: 13,
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: '_QsHASv09lqprGn6f0GlItJbM6QYkd4pMQNRebPy10o'
        }
    });

    map.events.add('ready', function () {
        // Add a marker to the map
        var markerHtmlContent = '<div class="custom-marker"><span class="marker-text">You are here</span></div>';

        var marker = new atlas.HtmlMarker({
            htmlContent: markerHtmlContent,
            position: [77.2090, 28.6139],
            popup: new atlas.Popup({
                content: '<div class="popup-content">You are here</div>',
                pixelOffset: [0, -30]
            })
        });
    
        map.markers.add(marker);

        document.getElementById('getLocationButton').addEventListener('click', function() {
            if (!navigator.geolocation) {
                document.getElementById('locationDisplay').textContent = 'Geolocation is not supported by your browser';
            } else {
                document.getElementById('locationDisplay').textContent = 'Locating…';
                navigator.geolocation.getCurrentPosition(function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Update the marker position
                    marker.setOptions({
                        position: [longitude, latitude]
                    });
                    map.setCamera({
                        center: [longitude, latitude],
                        zoom: 13
                    });

                    // Use Azure Maps Search service for reverse geocoding
                    var searchURL = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&query=${latitude},${longitude}&subscription-key=_QsHASv09lqprGn6f0GlItJbM6QYkd4pMQNRebPy10o`;
                    fetch(searchURL)
                    .then(response => response.json())
                    .then(data => {
                        var address = data.addresses[0].address.freeformAddress;
                        document.getElementById('locationDisplay').textContent = `Latitude: ${latitude}, Longitude: ${longitude}, Location: ${address}`;
                        
                        // Prepare the data including the address
                        const locationData = {
                            latitude: latitude,
                            longitude: longitude,
                            address: address // This includes the area and place
                        };
                        // Send the location data to the server
                        fetch('/add-location', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(locationData),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Success:', data);
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    })
                    .catch((error) => {
                        document.getElementById('locationDisplay').textContent = 'Location found, but address unavailable';
                    });
                }, function () {
                    document.getElementById('locationDisplay').textContent = 'Unable to retrieve your location';
                });
            }
        });
    });
});
