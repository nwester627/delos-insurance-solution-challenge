# Wildfire Risk API - Delos Insurance Assignment

This service provides a backend API to process physical addresses, determine their geographic coordinates, and assess nearby wildfire risks using satellite data. It is built with NestJS, TypeScript, and PostgreSQL.

## System Architecture

The application integrates two external data sources:

1. **Google Geocoding API**: Normalizes input strings into formatted addresses and GPS coordinates.
2. **NASA FIRMS API**: Queries the `VIIRS_SNPP_NRT` satellite data within a 7-day window to identify thermal anomalies in a 0.5-degree bounding box around the target location.

## Local Setup

### Infrastructure

The project requires a PostgreSQL database. A Docker Compose configuration is provided to spin up a pre-configured instance.

1. **Start the database:**
   `docker-compose up -d`

2. **Environment Variables: Create a .env file in the root directory. Use the following structure:**

DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=wildfire_db

GOOGLE_GEOCODING_API_KEY=your_key_here
NASA_FIRMS_API_KEY=your_key_here

3. **Install and Run:**
   npm install
   npm run start:dev

## API Specification

The service includes an interactive Swagger UI. Once the application is running, you can explore and test the endpoints directly from your browser:

- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)

- **POST /addresses**: Processes a new address. Integrates Google Geocoding and NASA FIRMS data. Supports `upsert` logic to prevent duplicates.
- **GET /addresses**: Returns a paginated summary of all stored locations.
  - _Query Params_: `?page=1&limit=10`
- **GET /addresses/:id**: Returns full details for a specific record, including historical wildfire risk metadata.

**Validation:** Implemented via class-validator. Rejects empty or malformed strings.

**Deduplication:** Uses a Sequelize upsert strategy. If the same physical address is submitted multiple times, the system refreshes the existing record with new wildfire data rather than creating duplicates.

## Technical Decisions

**Database Constraints:** A unique constraint was applied to the address column at the database level. This ensures data integrity and supports the ON CONFLICT logic used for risk data refreshes.

**Satellite Selection:** The implementation specifically utilizes the VIIRS_SNPP_NRT satellite as requested, providing higher resolution thermal anomaly data compared to older MODIS instruments.

**Error Handling:** The service uses the built-in NestJS Logger to track API lifecycle events. External API failures are caught gracefully to prevent unhandled exceptions, and custom HttpExceptions provide clear feedback for 404 and 400 errors.

**Validation Pipe:** Global validation pipes are enabled in main.ts to ensure that incoming DTOs match the expected schema before reaching the service layer.
