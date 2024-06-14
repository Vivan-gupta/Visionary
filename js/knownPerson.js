document.addEventListener('DOMContentLoaded', () => {
    fetch('/known-images')
        .then(response => response.json())
        .then(files => {
            const gallery = document.querySelector('.gallery');
            files.forEach(file => {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-card';

                const img = document.createElement('img');
                img.src = `/known_faces/${file}`;
                img.alt = 'Known Person';

                const imageName = document.createElement('div');
                imageName.className = 'image-name';
                imageName.textContent = file; // Display the file name
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X'; // Or use an icon
                deleteButton.className = 'delete-button';
                deleteButton.onclick = function() {
                    fetch(`/delete-image?filename=${file}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                imgWrapper.remove(); // Remove the card from the gallery
                            } else {
                                alert('Error deleting image');
                            }
                        });
                };

                imgWrapper.appendChild(deleteButton);
                imgWrapper.appendChild(img);
                imgWrapper.appendChild(imageName);
                gallery.appendChild(imgWrapper);
            });
        })
        .catch(error => console.error('Error:', error));
});
