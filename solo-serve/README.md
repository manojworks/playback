# solo-serve

Django REST API backend for Angular and external services.

## Setup

1. Create a `.env` file in the project root with your environment variables (see `.env` for an example).

2. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```

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
