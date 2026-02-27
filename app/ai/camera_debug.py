import cv2

# Try different camera backends
cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)

print("Camera opened:", cam.isOpened())

while True:
    ret, frame = cam.read()
    print("Frame read:", ret)

    if not ret:
        print("Camera frame not received")
        break

    cv2.imshow("Camera Debug", frame)

    if cv2.waitKey(1) == 27:
        break

cam.release()
cv2.destroyAllWindows()
