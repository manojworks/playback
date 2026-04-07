# solo-serve

Django REST API backend for Angular and external services.

## Setup

1. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```

2. Set Postgres environment variables or use defaults:
   - `POSTGRES_DB` (default: `solo_serve_db`)
   - `POSTGRES_USER` (default: `postgres`)
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST` (default: `localhost`)
   - `POSTGRES_PORT` (default: `5432`)

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API

- `GET /api/hello/` — Returns a JSON greeting.
- `GET /api/schema/` — OpenAPI schema.
- `GET /api/docs/` — Swagger UI.

## Testing

Run tests with:
```bash
pytest
```

Run coverage with:
```bash
coverage run -m pytest
coverage report
```
