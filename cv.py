import sys
import cv2
import face_recognition
import os
import time
from ultralytics import YOLO

def load_images_from_folder(folder):
    images = []
    names = []
    for filename in os.listdir(folder):
        path = os.path.join(folder, filename)
        img = face_recognition.load_image_file(path)
        encoding = face_recognition.face_encodings(img)
        if len(encoding) > 0:
            images.append(encoding[0])
            names.append(os.path.splitext(filename)[0])
    return images, names

def process_frame(known_encodings, known_names, model, frame):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    name = "Unknown"
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = face_recognition.compare_faces(known_encodings, face_encoding)
        name = "Unknown"

        if True in matches:
            first_match_index = matches.index(True)
            name = known_names[first_match_index]

        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
        cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

    img_path = os.path.join("unknown_faces" if name == "Unknown" else "known_faces", f"{name}_{int(time.time())}.jpg")
    cv2.imwrite(img_path, frame)

    return img_path, name

def main(image_path):
    known_encodings, known_names = load_images_from_folder("known_faces")
    unknown_faces_dir = "unknown_faces"
    os.makedirs(unknown_faces_dir, exist_ok=True)

    frame = cv2.imread(image_path)
    if frame is None:
        print("Error: Could not read the image.")
        return

    img_path, name = process_frame(known_encodings, known_names, YOLO("yolov8n.pt"), frame)
    print(f"{img_path},{name}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python cv.py <image_path>")
    else:
        main(sys.argv[1])
