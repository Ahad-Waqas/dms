# Use official Python image
FROM python:3.13.2

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into the container
COPY ./app /app

# Expose FastAPI port
EXPOSE 8000

WORKDIR /
# Run FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]