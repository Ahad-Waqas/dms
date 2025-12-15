FROM python:3.13.2-slim

WORKDIR /

# Copy code into the container
COPY ./ /app


RUN pip install --no-cache-dir -r app/requirements.txt

CMD ["tail", "-f", "/dev/null"]
