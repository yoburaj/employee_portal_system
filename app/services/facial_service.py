import cv2
import numpy as np
import json
from typing import List, Tuple
from fastapi import UploadFile

# DeepFace requires tensorflow or tf-keras
from deepface import DeepFace

class FacialService:
    def __init__(self):
        self.model_name = "Facenet"
        self.detector_backend = "ssd" # Switched to SSD (OpenCV Deep AI) to avoid 3.12 Mediapipe/Keras compatibility bugs while keeping high accuracy
        self.distance_metric = "cosine"
        self.threshold = 0.40  # Restored to optimal Facenet threshold (0.40)

    def extract_embedding(self, file: UploadFile) -> List[float]:
        """Extracts facial embedding using DeepFace and RetinaFace detector."""
        contents = file.file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image file provided.")

        try:
            # Stricter enforcement: if face isn't clearly detected, fail fast.
            objs = DeepFace.represent(
                img_path=img, 
                model_name=self.model_name, 
                detector_backend=self.detector_backend, 
                enforce_detection=True
            )
            
            if not objs or len(objs) == 0:
                raise ValueError("No face detected in the image.")
                
            # Take the primary face embedding if multiple people detected
            # (Usually we want to restrict to 1 face for employee portal)
            return objs[0]["embedding"]
        except Exception as e:
            raise ValueError(f"DeepFace processing error: {str(e)}")

    def generate_enrollment_embedding(self, files: List[UploadFile]) -> List[float]:
        """
        Takes multiple facial capture frames, extracts embeddings, 
        and averages them to generate a highly robust baseline enrollment embedding.
        Stops early to save computation time if enough high-quality frames are found.
        """
        embeddings = []
        
        # Retinaface is heavy. We don't need all 50 frames. Try up to 15 frames.
        max_attempts = min(len(files), 15)
        
        for index, file in enumerate(files[:max_attempts]):
            try:
                emb = self.extract_embedding(file)
                embeddings.append(emb)
                
                # 3 successful high-quality embeddings is plenty for a robust ArcFace average
                if len(embeddings) >= 3:
                    break
            except Exception as e:
                print(f"DEBUG: Skipping frame {index} for enrollment. Reason: {e}")

        if not embeddings:
            raise ValueError(f"Face could not be detected. Ensure your face is fully visible, well-lit, and the webcam is not covered.")

        # Average the embeddings across the captured frames for robustness
        avg_embedding = np.mean(embeddings, axis=0)
        return avg_embedding.tolist()

    def find_cosine_distance(self, source_rep: List[float], test_rep: List[float]) -> float:
        """Manual cosine distance calculation for two representation arrays."""
        a = np.matmul(np.transpose(source_rep), test_rep)
        b = np.sum(np.multiply(source_rep, source_rep))
        c = np.sum(np.multiply(test_rep, test_rep))
        return 1 - (a / (np.sqrt(b) * np.sqrt(c)))

    def verify_face(self, file: UploadFile, stored_embedding_json: str) -> Tuple[bool, float]:
        """
        Compares dynamic input against mathematically stored embedding.
        Returns Tuple(is_match, artificial_confidence_percentage).
        """
        if not stored_embedding_json:
            print("DEBUG ERROR: Stored embedding JSON is empty.")
            return False, 0.0

        try:
            stored_embedding = json.loads(stored_embedding_json)
        except json.JSONDecodeError:
            print("DEBUG ERROR: Failed to decode stored embedding JSON.")
            return False, 0.0

        try:
            current_embedding = self.extract_embedding(file)
        except Exception as e:
            print(f"DEBUG: Verification check failed extracting face: {e}")
            return False, 0.0

        distance = self.find_cosine_distance(stored_embedding, current_embedding)
        
        is_match = distance < self.threshold

        # Format a pseudo-confidence percentage: closer to 0 distance means higher confidence
        # Max out near 99.9%
        confidence_percentage = max(0.0, 100.0 * (1.0 - (distance / 2.0)))

        print("\n" + "="*50)
        print("🔍 FACIAL RECOGNITION DIAGNOSTICS")
        print(f"📊 Calculated Distance: {distance:.5f}")
        print(f"🎯 Required Threshold:  < {self.threshold}")
        print(f"✅ Is Match:            {'YES' if is_match else 'NO'}")
        print(f"📈 Confidence Score:    {confidence_percentage:.2f}%")
        print("="*50 + "\n")

        return bool(is_match), float(confidence_percentage)

facial_service = FacialService()
