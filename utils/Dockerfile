FROM python:3.8

WORKDIR /workspace

COPY . .

RUN pip install --no-cache-dir tensorflow keras tensorflowjs protobuf
CMD ["python", "convert_model.py"]