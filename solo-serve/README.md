# solo-serve

Django REST API backend for Angular and external services.

## Project Structure

- `config/`: Django project settings and configuration.
- `api/`: Django app containing all API views, URLs, models, and tests.


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

- `GET /api/search/?q={free_text}` — Search songs by free text.
- `GET /api/search/?query={free_text}` — Alternate free text query parameter.
- `GET /api/search/?search={free_text}` — Alternate free text query parameter.
- `GET /api/search/?singers={name}` — Filter search results by singers.
- `GET /api/search/?music_directors={name}` — Filter by music directors.
- `GET /api/search/?lyricist={name}` — Filter by lyricists.
- `GET /api/search/?actors={name}` — Filter by actors.
- `GET /api/songs/` — List songs with pagination, filtering, and sorting.
- `GET /api/songs/{song_id}/` — Retrieve a single song.
- `GET /api/hello/` — Health-check endpoint.
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
