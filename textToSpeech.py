import sys  # Import the sys module to access command-line arguments
import os
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer

# Set up your Azure credentials
COMPUTER_VISION_SUBSCRIPTION_KEY = "decaf1b743f7432fb47e734ab936f80a"
COMPUTER_VISION_ENDPOINT = "https://visionarycomputervisionapi.cognitiveservices.azure.com/"
SPEECH_SUBSCRIPTION_KEY = "ce8b0a8e8e354e32a187dfe2d1fea77b"
SPEECH_SERVICE_REGION = "centralindia"

# Initialize Computer Vision client
computervision_client = ComputerVisionClient(
    COMPUTER_VISION_ENDPOINT,
    CognitiveServicesCredentials(COMPUTER_VISION_SUBSCRIPTION_KEY)
)

# Initialize Speech client
speech_config = SpeechConfig(subscription=SPEECH_SUBSCRIPTION_KEY, region=SPEECH_SERVICE_REGION)
speech_synthesizer = SpeechSynthesizer(speech_config=speech_config)

def extract_text_from_image(image_path):
    with open(image_path, "rb") as image_stream:
        recognize_printed_results = computervision_client.read_in_stream(image_stream, raw=True)
        
    # Get the operation location (URL with an ID at the end)
    operation_location_remote = recognize_printed_results.headers["Operation-Location"]
    # Grab the ID from the URL
    operation_id = operation_location_remote.split("/")[-1]
    
    # Call the "GET" API and wait for the OCR to retrieve the results 
    while True:
        get_printed_text_results = computervision_client.get_read_result(operation_id)
        if get_printed_text_results.status not in ['notStarted', 'running']:
            break
    
    # Extract and compile text from the results
    text = []
    if get_printed_text_results.status == 'succeeded':
        for text_result in get_printed_text_results.analyze_result.read_results:
            for line in text_result.lines:
                text.append(line.text)
    return "\n".join(text)

def text_to_speech(text):
    speech_synthesizer.speak_text_async(text).get()

def process_file(file_path):
    text = extract_text_from_image(file_path)
    if text:
        print("Extracted Text:\n", text)  # Print the extracted text for the server to capture
        text_to_speech(text)  # Convert the text to speech
    else:
        print("No text extracted.")

if __name__ == "__main__":
    if len(sys.argv) < 2:  # Check if an image path is provided as a command-line argument
        print("Usage: python textToSpeech.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]  # Get the image path from the command-line argument
    process_file(image_path)  # Process the image and extract text
