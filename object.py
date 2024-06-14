import sys
import cv2
from ultralytics import YOLO

def load_model():
    # Initialize and return the YOLO model
    return YOLO("yolov8n.pt")

def process_image(model, image_path):
    # Read the image file
    frame = cv2.imread(image_path)
    if frame is None:
        print("Error: Could not read the image.")
        return None

    # Perform object detection
    detections = model(frame, device="cpu", verbose=False)[0]

    # Initialize a list to keep track of detected objects
    detected_objects = []

    for detection in detections.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = map(int, detection[:6])
        object_name = model.names[class_id]  # Get the name of the detected object

        # Draw a rectangle and label on the frame
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
        cv2.putText(frame, object_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        detected_objects.append(object_name)

    # Save the processed image
    output_path = f"processed_{image_path}"
    cv2.imwrite(output_path, frame)

    return output_path, detected_objects

def main(image_path):
    model = load_model()
    output_path, detected_objects = process_image(model, image_path)

    if detected_objects is not None:
        print(f"Processed Image: {output_path}, Detected Objects: {', '.join(detected_objects)}")
    else:
        print("No objects detected.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python object.py <image_path>")
        sys.exit(1)
    main(sys.argv[1])
