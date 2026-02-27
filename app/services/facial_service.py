import cv2
import numpy as np
import os
from typing import List, Tuple, Optional
from fastapi import UploadFile

class FacialService:
    def __init__(self, dataset_path="ai/dataset", trainer_path="ai/trainer.yml"):
        self.dataset_path = dataset_path
        self.trainer_path = trainer_path
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        self.last_trainer_mtime = 0
        self._load_trainer_if_needed()

    def _load_trainer_if_needed(self):
        """Loads or reloads the trainer only if the file has changed on disk."""
        if not os.path.exists(self.trainer_path):
            return

        try:
            current_mtime = os.path.getmtime(self.trainer_path)
            if current_mtime > self.last_trainer_mtime:
                print(f"DEBUG: Loading/Reloading trainer from {self.trainer_path}")
                self.recognizer.read(self.trainer_path)
                self.last_trainer_mtime = current_mtime
        except Exception as e:
            print(f"Error loading trainer: {e}")

    def save_face_images(self, user_id: int, images: List[UploadFile]) -> int:
        """Saves a batch of images for a user to the dataset directory."""
        user_dir = os.path.join(self.dataset_path, str(user_id))
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
            
        count = 0
        for i, file in enumerate(images):
            try:
                contents = file.file.read()
                nparr = np.frombuffer(contents, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
                
                if img is not None:
                    # Optimized scaleFactor 1.3 for speed
                    faces = self.face_cascade.detectMultiScale(img, 1.3, 5)
                    for (x, y, w, h) in faces:
                        count += 1
                        face_roi = img[y:y+h, x:x+w]
                        # Standardize size for LBPH consistency
                        face_roi = cv2.resize(face_roi, (200, 200))
                        file_name = os.path.join(user_dir, f"{user_id}.{count}.jpg")
                        cv2.imwrite(file_name, face_roi)
            except Exception as e:
                print(f"Error processing image {i}: {e}")
        
        return count

    def train_model(self) -> bool:
        """Trains the LBPH model on all images in the dataset directory."""
        face_samples = []
        ids = []
        
        if not os.path.exists(self.dataset_path):
            return False
            
        # Iterate through user directories
        for user_id_str in os.listdir(self.dataset_path):
            user_dir = os.path.join(self.dataset_path, user_id_str)
            if not os.path.isdir(user_dir):
                continue
                
            user_id = int(user_id_str)
            for image_name in os.listdir(user_dir):
                if not image_name.endswith(('.jpg', '.jpeg', '.png')):
                    continue
                    
                image_path = os.path.join(user_dir, image_name)
                img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    # Ensure all training samples are consistent
                    if img.shape != (200, 200):
                        img = cv2.resize(img, (200, 200))
                    face_samples.append(img)
                    ids.append(user_id)
        
        if len(face_samples) > 0:
            print(f"DEBUG: Training model with {len(face_samples)} samples...")
            self.recognizer.train(face_samples, np.array(ids))
            self.recognizer.save(self.trainer_path)
            # Update mtime so we don't immediately reload what we just saved (though _load_trainer_if_needed would handle it)
            self.last_trainer_mtime = os.path.getmtime(self.trainer_path)
            return True
        return False

    def verify_face(self, file: UploadFile, expected_user_id: int) -> Tuple[bool, float]:
        """Verifies if the face in the image matches the expected user ID."""
        print(f"DEBUG: Starting face verification for user: {expected_user_id}")
        
        self._load_trainer_if_needed()
        
        if not os.path.exists(self.trainer_path):
            print(f"DEBUG ERROR: Trainer path does not exist: {self.trainer_path}")
            return False, 0.0
            
        try:
            contents = file.file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            
            if img is None:
                print("DEBUG ERROR: Failed to decode image")
                return False, 0.0
                
            # Optimized detection (1.3 is faster than 1.1)
            faces = self.face_cascade.detectMultiScale(img, 1.3, 5)
            
            if len(faces) == 0:
                print("DEBUG: No faces detected in image")
                return False, 0.0
                
            # Take the largest face if multiple detected
            faces = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)
            (x, y, w, h) = faces[0]
            face_roi = img[y:y+h, x:x+w]
            
            # Standardize size to 200x200 before prediction
            face_roi = cv2.resize(face_roi, (200, 200))
            
            try:
                predicted_id, confidence = self.recognizer.predict(face_roi)
                print(f"DEBUG: Predicted ID: {predicted_id}, Confidence: {confidence}")
            except Exception as cv_e:
                print(f"DEBUG ERROR in OpenCV predict: {cv_e}")
                return False, 0.0
            
            # Lower confidence is better for LBPH
            # Adjusted threshold - higher is more permissive
            CONF_THRESHOLD = 85.0 
            
            if predicted_id == expected_user_id and confidence < CONF_THRESHOLD:
                print(f"DEBUG: Face MATCHED (Confidence: {confidence:.2f})")
                return True, confidence
            else:
                reason = "MISMATCH" if predicted_id != expected_user_id else "LOW_CONFIDENCE"
                print(f"DEBUG: Global check FAILED. Reason: {reason}, Conf: {confidence:.2f}")
                
                # FALLBACK: 1:1 Verification
                # If global recognition failed (wrong person or low confidence), 
                # let's try to verify specifically against the claimed user.
                print(f"DEBUG: Attempting 1:1 verification for user {expected_user_id}...")
                is_match_specific, specific_conf = self.verify_specific_user(face_roi, expected_user_id)
                
                if is_match_specific:
                    print(f"DEBUG: 1:1 Verification PASSED (Confidence: {specific_conf:.2f})")
                    return True, specific_conf
                else:
                    print(f"DEBUG: 1:1 Verification FAILED (Confidence: {specific_conf:.2f})")
                    return False, confidence

        except Exception as e:
            print(f"DEBUG ERROR in Verification: {e}")
            import traceback
            traceback.print_exc()
            return False, 0.0

    def verify_specific_user(self, face_roi, user_id: int) -> Tuple[bool, float]:
        """
        Verifies a face against a SPECIFIC user's dataset by training a temporary model.
        This solves the issue where a user might look like someone else in the global model (mismatch),
        but is actually the correct user (high similarity to their own data).
        """
        try:
            user_dir = os.path.join(self.dataset_path, str(user_id))
            if not os.path.exists(user_dir):
                print(f"DEBUG: No dataset found for user {user_id}")
                return False, 0.0

            # Collect training data for THIS user only
            faces = []
            labels = []
            
            # We also need some negative samples to make the model robust, 
            # otherwise a 1-class model might always predict 'match' with 0 confidence.
            # However, LBPH calculates distance. If we only train on User X, 
            # the distance to the query image tells us how similar it is.
            # We don't need negative samples for distance calculation in 1-class config if we check threshold.
            
            valid_images = 0
            for image_name in os.listdir(user_dir):
                if not image_name.endswith(('.jpg', '.jpeg', '.png')):
                    continue
                image_path = os.path.join(user_dir, image_name)
                img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    if img.shape != (200, 200):
                        img = cv2.resize(img, (200, 200))
                    faces.append(img)
                    labels.append(user_id) # Label doesn't matter much for 1-class, but we use user_id
                    valid_images += 1
            
            if valid_images < 5:
                print(f"DEBUG: Not enough images for 1:1 verification ({valid_images} found)")
                return False, 0.0

            # Train a temp model
            # print(f"DEBUG: Training 1:1 model with {valid_images} images for user {user_id}")
            temp_recognizer = cv2.face.LBPHFaceRecognizer_create()
            temp_recognizer.train(faces, np.array(labels))
            
            # Predict
            # For 1-class training, predict will return the label (user_id) and distance.
            pred_label, pred_conf = temp_recognizer.predict(face_roi)
            
            # print(f"DEBUG: 1:1 Result - Label: {pred_label}, Dist: {pred_conf:.2f}")
            
            # We can use a stricter threshold for 1:1 verification to be safe, 
            # or the same threshold. Let's use 85.0 as well.
            SPECIFIC_THRESHOLD = 85.0
            
            if pred_label == user_id and pred_conf < SPECIFIC_THRESHOLD:
                return True, pred_conf
            
            return False, pred_conf

        except Exception as e:
            print(f"DEBUG ERROR in verify_specific_user: {e}")
            return False, 0.0

facial_service = FacialService()
