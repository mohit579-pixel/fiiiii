import tensorflow as tf
from tensorflow.keras.models import load_model

# Load the model
model = load_model("model.h5", compile=False)

# Save as TensorFlow SavedModel
model.save("saved_model", save_format="tf")
