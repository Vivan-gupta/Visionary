document.getElementById('readDocumentButton').addEventListener('click', function() {
    const fileInput = document.getElementById('documentInput');
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('document', file);

        fetch('/process-document', { // Matches the server.js route
            method: 'POST',
            body: formData,
        })
        .then(response => response.text()) // Assuming the response is plain text
        .then(data => {
            // Display the extracted text
            document.getElementById('extractedText').textContent = data;

            // Check if the uploaded file is an image and display it
            if (file.type.startsWith('image/')) {
                const imgPreview = document.createElement('img');
                imgPreview.src = URL.createObjectURL(file);
                imgPreview.style.maxWidth = '100%'; // Ensure the image is not too large
                imgPreview.style.marginTop = '10px';

                // Insert the image preview after the "Read Document" button
                const readDocumentButton = document.getElementById('readDocumentButton');
                readDocumentButton.insertAdjacentElement('afterend', imgPreview);
            }

            // After displaying text and image, start speech synthesis
            if ('speechSynthesis' in window) {
                let msg = new SpeechSynthesisUtterance(data);
                window.speechSynthesis.speak(msg);
            } else {
                console.log('Speech synthesis not supported in this browser.');
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please upload a document first.');
    }
});
