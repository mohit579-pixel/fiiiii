import h5py

with h5py.File('dentalFinalModel.h5', 'r') as f:
    if 'keras_version' in f.attrs:
        print('Keras version:', f.attrs['keras_version'])
    if 'backend' in f.attrs:
        print('Backend:', f.attrs['backend'])
    if 'tensorflow_version' in f.attrs:
        print('TensorFlow version:', f.attrs['tensorflow_version'])