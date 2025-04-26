import tensorflow as tf
import tensorflowjs as tfjs
import os

def convert_model_to_tfjs():
    # Load the model from the current directory
    model_path = "dentalFinalModel.h5"
    model = tf.keras.models.load_model(model_path, compile=False)
    
    # Output directory (relative)
    output_dir = './tfjs_model'
    os.makedirs(output_dir, exist_ok=True)
    
    tfjs.converters.save_keras_model(model, output_dir)
    print(f"Model converted and saved to {output_dir}")

if __name__ == '__main__':
    convert_model_to_tfjs()