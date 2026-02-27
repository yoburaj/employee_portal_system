import cv2
import numpy as np
import os

dataset_path = "dataset"

recognizer = cv2.face.LBPHFaceRecognizer_create()
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def get_images_and_labels(path):
    image_paths = [os.path.join(path, f) for f in os.listdir(path)]
    face_samples = []
    ids = []

    for image_path in image_paths:
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue

        id = int(os.path.basename(image_path).split(".")[0])
        faces = face_cascade.detectMultiScale(img)

        for (x, y, w, h) in faces:
            face_samples.append(img[y:y+h, x:x+w])
            ids.append(id)

    return face_samples, ids

faces, ids = get_images_and_labels(dataset_path)

recognizer.train(faces, np.array(ids))
recognizer.save("trainer.yml")

print("✅ Model training completed and saved as trainer.yml")
