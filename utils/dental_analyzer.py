import os
import sys
import json
import numpy as np
from PIL import Image
import tensorflow as tf

# Get model path from environment variable or use default
MODEL_PATH = os.getenv('DENTAL_MODEL_PATH', 'models/dental_model.h5')

# Class names for predictions
CLASS_NAMES = [
    'Caries',
    'Calculus',
    'Gingivitis',
    'Normal',
    'Periodontitis'
]

def load_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        return model
    except Exception as e:
        print(json.dumps({
            'error': f'Failed to load model: {str(e)}',
            'model_path': MODEL_PATH
        }))
        sys.exit(1)

def preprocess_image(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((224, 224))
        img_array = np.array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        print(json.dumps({
            'error': f'Failed to preprocess image: {str(e)}'
        }))
        sys.exit(1)

def make_prediction(model, image_array):
    try:
        predictions = model.predict(image_array)
        return predictions[0]
    except Exception as e:
        print(json.dumps({
            'error': f'Failed to make prediction: {str(e)}'
        }))
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            'error': 'Please provide an image path as argument'
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    
    try:
        model = load_model()
        image_array = preprocess_image(image_path)
        predictions = make_prediction(model, image_array)
        
        results = {
            'predictions': [
                {
                    'class': CLASS_NAMES[i],
                    'confidence': float(predictions[i])
                }
                for i in range(len(CLASS_NAMES))
            ]
        }
        
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({
            'error': f'Analysis failed: {str(e)}'
        }))
        sys.exit(1)

if __name__ == '__main__':
    main() 