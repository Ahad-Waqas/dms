# Earthquake Monitoring and Ingestion System

This repository contains a system for monitoring, ingesting, and analyzing earthquake data. It includes a backend API, ingestion pipelines, and a frontend for visualizing earthquake events.

## Features

- **Ingestion Pipelines**: Fetch real-time and historical earthquake data from external APIs (e.g., USGS, GDACS).
- **Backend API**: Provides endpoints for querying earthquake data.
- **Frontend**: Visualizes earthquake data on an interactive map.

## Repository Structure

```
backend/       # Backend API code
ingestion/     # Ingestion pipelines for earthquake data
REIS_Frontend/ # Frontend for visualizing earthquake data
docker-compose.yml # Docker Compose configuration
Dockerfile     # Dockerfile for building the application
```

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/alihucayn/idara-backend.git
cd dms
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```env
POSTGRES_USER=youruser
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=primary_db
DATABASE_URL=postgresql://youruser:yourpassword@db:5432/primary_db
GET_HISTORICAL=true
MIGRATE_DB=true
REALTIME_FETCH_INTERVAL=300
```

### 3. Build and Start the Application

Use Docker Compose to build and start the application:

```bash
docker-compose up --build
```

### 4. Access the Application

- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`

### 5. Stopping the Application

To stop the application, run:

```bash
docker-compose down
```

### 6. Run the Ingestion Container for the First Time

After starting all services, you need to run the ingestion container for the first time to initialize the database and start ingestion pipelines. Use the following command:

```bash
docker exec -it ingestion python -m app
```

This will:

- Perform database migrations (if enabled via `MIGRATE_DB` environment variable).
- Fetch historical earthquake data (if enabled via `GET_HISTORICAL` environment variable).
- Start the real-time ingestion pipeline.

## Backend API

The backend API provides endpoints for querying earthquake data. You can access the API documentation at `http://localhost:8000/docs`.

## Ingestion Pipelines

The ingestion pipelines fetch real-time and historical earthquake data from external APIs. These pipelines are configured to run automatically when the application starts.

## Frontend

The frontend visualizes earthquake data on an interactive map. It is built using Next.js and can be accessed at `http://localhost:3000`.

## License

This project is closed-source.
