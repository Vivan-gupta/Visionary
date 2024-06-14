document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.querySelector('.file-input');
    const dropArea = document.querySelector('.drag-area');
    const fileLabel = document.querySelector('.custom-file-upload');
    const form = document.getElementById('upload-form');
    const videoElement = document.getElementById('videoElement');
    const recognitionResult = document.getElementById('recognitionResult'); // Ensure this element is in your HTML

    // Drag and Drop Handlers
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('active');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('active');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        fileInput.files = event.dataTransfer.files;
        showFiles(fileInput.files);
        dropArea.classList.remove('active');
    });

    fileInput.addEventListener('change', () => {
        showFiles(fileInput.files);
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const imageNameInput = document.getElementById('imageName').value.trim();
        if (imageNameInput) {
            formData.append('imageName', imageNameInput);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) // Assuming the server responds with JSON
        .then(data => {
            showModal('Your file has been uploaded successfully!');
            // Call update functions if they exist in the response
            if(data.faceRecognition) {
                updateFaceRecognitionResult(data.faceRecognition);
            }
            if(data.objectRecognition) {
                updateObjectRecognitionResult(data.objectRecognition);
            }
        })
        .catch((error) => {
            showModal('Your file have been uploaded successfully');
        });
    });

    // Functions for existing features
    function showFiles(files) {
        fileLabel.textContent = files.length > 1 ? `${files.length} files selected` : files[0].name;
    }

    function showModal(message) {
        const modal = document.getElementById('uploadModal');
        const modalText = document.getElementById('modal-text');
        const closeButton = document.querySelector('.close');

        modalText.textContent = message;
        modal.style.display = 'block';

        closeButton.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    }

    function updateFaceRecognitionResult(data) {
        const resultDiv = document.getElementById('faceRecognitionResult');
        if (data.imagePath) {
            resultDiv.innerHTML = `<img src="${data.imagePath}" alt="${data.personName}" style="max-width: 100%;"><p>${data.personName}</p>`;
        } else {
            resultDiv.textContent = data.personName || 'No face detected or recognition failed.';
        }
    }

    // New function to display object recognition results
    function updateObjectRecognitionResult(data) {
        const resultDiv = document.getElementById('objectRecognitionResult'); // Ensure this element exists in your HTML
        if (data.imagePath) {
            resultDiv.innerHTML = `<img src="${data.imagePath}" alt="Detected Objects" style="max-width: 100%;">`;
            if (data.detectedObjects.length > 0) {
                resultDiv.innerHTML += `<p>Detected Objects: ${data.detectedObjects.join(', ')}</p>`;
            } else {
                resultDiv.innerHTML += `<p>No objects detected.</p>`;
            }
        } else {
            resultDiv.textContent = 'No objects detected or recognition failed.';
        }
    }

    // Webcam access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch(error => {
                console.error('Error accessing the webcam', error);
            });
    } else {
        console.error('getUserMedia not supported');
    }

    // Face Recognition Button Handler
    document.getElementById('faceRecognitionButton').addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('frame', blob);
    
            fetch('/upload-frame', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Update the UI for face recognition
                const faceResultSpan = document.getElementById('resultName');
                faceResultSpan.textContent = data.faceRecognition.personName || 'Unknown';
    
                // Update the UI for object detection
                const objectResultDiv = document.getElementById('objectRecognitionResult');
                if (data.objectRecognition && data.objectRecognition.detectedObjects.length > 0) {
                    objectResultDiv.innerHTML = `<p>${data.objectRecognition.detectedObjects.join(', ')}</p>`;
                } else {
                    objectResultDiv.textContent = 'No objects detected.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }, 'image/jpeg');
    });    
});
