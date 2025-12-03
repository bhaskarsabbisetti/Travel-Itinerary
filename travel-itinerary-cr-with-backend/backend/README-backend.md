# Django Backend for Travel Itinerary Creator

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # and update values
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

The React frontend calls endpoints like `/api/auth/login`, `/api/itineraries`, `/api/generate-itinerary`.
During development you can run Vite on port 5173 and Django on 8000, and use a proxy in `vite.config.js`
to forward `/api` to `http://localhost:8000`.
