document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('deleteButton').addEventListener('click', function() {
        // Remove all <p> tags
        document.querySelectorAll('p').forEach(p => p.remove());

        // Send a request to the server to make the change permanent
        fetch('/delete-locations', {
            method: 'POST', // Using POST to send the request
        })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
    });
});
