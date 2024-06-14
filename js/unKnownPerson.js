document.addEventListener('DOMContentLoaded', () => {
    fetch('/unknown-images')
        .then(response => response.json())
        .then(files => {
            const gallery = document.querySelector('.gallery');
            files.forEach(file => {
                // Create the image card wrapper
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-card';

                // Create the image element
                const img = document.createElement('img');
                img.src = `/unknown_faces/${file}`;
                img.alt = 'Unknown Person';

                // Create the image name display
                const imageName = document.createElement('div');
                imageName.className = 'image-name';
                imageName.textContent = file; // Display the file name

                // Create the input field for naming
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Enter name';
                input.className = 'input-field';

                // Create the submit button for naming
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.className = 'submit-button';
                submitButton.onclick = () => submitName(file, input.value);

                // Create the delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.className = 'delete-button'; // Ensure this class matches your CSS for the delete button
                deleteBtn.onclick = () => {
                    fetch(`/delete-unknown-image?filename=${file}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                imgWrapper.remove(); // Remove the card from the gallery
                            } else {
                                alert('Error deleting image');
                            }
                        });
                };

                // Append elements to the image card wrapper
                imgWrapper.appendChild(deleteBtn);
                imgWrapper.appendChild(img);
                imgWrapper.appendChild(imageName);
                imgWrapper.appendChild(input);
                imgWrapper.appendChild(submitButton);

                // Append the image card to the gallery
                gallery.appendChild(imgWrapper);
            });
        })
        .catch(error => console.error('Error:', error));
});

// Function to handle the submission of the name
function submitName(fileName, personName) {
    if (!personName) {
        alert('Please enter a name.');
        return;
    }
    fetch('/move-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, personName })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        window.location.reload(); // Reload the page to reflect changes
    })
    .catch(error => console.error('Error:', error));
}
