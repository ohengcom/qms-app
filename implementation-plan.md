# QMS Implementation Plan

This document outlines the steps to implement the recommended improvements for the QMS project using free and open-source solutions.

## 1. Database Migration: SQLite to PostgreSQL
- **Objective:** Replace SQLite with PostgreSQL for better scalability and performance.
- **Steps:**
    1. Add PostgreSQL as a service in `docker-compose.yml`.
    2. Update the backend `Dockerfile` and `requirements.txt` to include the `psycopg2-binary` driver.
    3. Modify `backend/app/database.py` to connect to the PostgreSQL database, using environment variables for connection details.
    4. Create a migration script to move data from SQLite to PostgreSQL.

## 2. Asynchronous Task Queue: Celery and Redis
- **Objective:** Implement Celery with Redis for handling long-running tasks asynchronously.
- **Steps:**
    1. Add Redis as a service in `docker-compose.yml`.
    2. Add `celery` and `redis` to the backend `requirements.txt`.
    3. Create a `celery_worker.py` file to configure and define Celery tasks.
    4. Update the backend code to offload long-running tasks (e.g., report generation) to the Celery worker.

## 3. Configuration Management: Environment Variables
- **Objective:** Externalize configuration using environment variables.
- **Steps:**
    1. Create a `.env` file to store configuration variables (e.g., database URL, secret keys).
    2. Use a library like `python-dotenv` in the backend to load environment variables.
    3. Update the `docker-compose.yml` file to pass the `.env` file to the backend service.

## 4. Backend Data Filtering
- **Objective:** Move data filtering logic from the frontend to the backend.
- **Steps:**
    1. Modify the backend API endpoint for fetching quilts to accept filter parameters (e.g., season, status).
    2. Update the frontend `quilts.js` store to pass the filter parameters to the API call.

## 5. Enhanced Testing
- **Objective:** Improve test coverage for the backend.
- **Steps:**
    1. Write unit tests for the business logic in the backend services.
    2. Write integration tests for the API endpoints to ensure they behave as expected.

## 6. API Pagination
- **Objective:** Implement pagination for API endpoints that return lists of data.
- **Steps:**
    1. Modify the backend API endpoints to accept `page` and `size` parameters.
    2. Update the frontend to handle paginated responses and provide a user interface for navigating through pages.

## 7. Caching with Redis
- **Objective:** Implement a caching layer with Redis to improve performance.
- **Steps:**
    1. Use the same Redis instance from the Celery setup.
    2. In the backend, before fetching data from the database, check if it exists in the Redis cache.
    3. If the data is in the cache, return it directly. Otherwise, fetch it from the database, store it in the cache, and then return it.