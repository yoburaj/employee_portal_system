from fastapi import FastAPI
import cv2

app = FastAPI(title="Police Facial Surety AI Service")

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("trainer.yml")

# Load face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

CONFIDENCE_THRESHOLD = 50

@app.get("/")
def root():
    return {"status": "AI service running"}

@app.post("/verify-face")
def verify_face():
    cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not cam.isOpened():
        return {"status": "error", "message": "Camera not accessible"}

    ret, frame = cam.read()
    cam.release()

    if not ret:
        return {"status": "error", "message": "Failed to capture image"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {"status": "no_face_detected"}

    (x, y, w, h) = faces[0]
    face_roi = gray[y:y+h, x:x+w]

    predicted_id, confidence = recognizer.predict(face_roi)

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "status": "authorized",
            "police_id": predicted_id,
            "confidence": confidence
        }
    else:
        return {
            "status": "unauthorized",
            "confidence": confidence
        }
