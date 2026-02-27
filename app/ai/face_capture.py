import cv2
import os

dataset_path = "dataset"
if not os.path.isdir(dataset_path):
    os.mkdir(dataset_path)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cam.isOpened():
    print("Camera not opened")
    exit()

user_id = input("Enter Police Officer ID (numeric): ")
count = 0

while True:
    ret, frame = cam.read()
    if not ret:
        print("Failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        count += 1
        face = gray[y:y+h, x:x+w]
        file_name = f"{dataset_path}/{user_id}.{count}.jpg"
        cv2.imwrite(file_name, face)

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, f"Images: {count}", (10,30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    cv2.imshow("Face Capture", frame)

    if cv2.waitKey(1) == 27 or count >= 50:
        break

cam.release()
cv2.destroyAllWindows()

print("Face dataset collection completed:", count)
