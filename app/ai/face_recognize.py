import cv2

# ===============================
# LOAD TRAINED MODEL
# ===============================
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("trainer.yml")

# ===============================
# LOAD FACE DETECTOR
# ===============================
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ===============================
# OPEN CAMERA
# ===============================
cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cam.isOpened():
    print("Camera not opened")
    exit()

print("Camera started. Press ESC to exit.")

# ===============================
# LBPH CONFIDENCE THRESHOLD
# LOWER = BETTER MATCH
# ===============================
CONFIDENCE_THRESHOLD = 50

# ===============================
# START RECOGNITION LOOP
# ===============================
while True:
    ret, frame = cam.read()
    if not ret:
        print("Failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        face_roi = gray[y:y+h, x:x+w]

        # Predict face
        predicted_id, confidence = recognizer.predict(face_roi)

        # DEBUG PRINT (VERY IMPORTANT)
        print(f"Predicted ID: {predicted_id} | Confidence: {confidence:.2f}")

        # DECISION LOGIC
        if confidence < CONFIDENCE_THRESHOLD:
            label = f"AUTHORIZED ID: {predicted_id}"
            color = (0, 255, 0)  # Green
        else:
            label = "UNAUTHORIZED"
            color = (0, 0, 255)  # Red

        # DRAW RECTANGLE & LABEL
        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        cv2.putText(
            frame,
            label,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            color,
            2
        )

    cv2.imshow("Police Face Recognition", frame)

    # ESC to exit
    if cv2.waitKey(1) == 27:
        break

# ===============================
# CLEANUP
# ===============================
cam.release()
cv2.destroyAllWindows()
print("Camera stopped")
