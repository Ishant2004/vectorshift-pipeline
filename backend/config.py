"""Environment-driven configuration.

Reads settings from environment variables. Locally these come from a `.env`
file (see `.env.example`); in production they come from the platform's
dashboard (e.g. Railway service variables).
"""

import os

from dotenv import load_dotenv

# Load a local .env if present. On a hosting platform there is no .env file,
# so this is a no-op and os.environ (the dashboard variables) is used instead.
load_dotenv()


def _split_origins(raw: str) -> list[str]:
    return [origin.strip() for origin in raw.split(',') if origin.strip()]


# Comma-separated list of allowed CORS origins.
# Local default is "*"; in production set this to your Vercel URL, e.g.
#   ALLOWED_ORIGINS=https://your-app.vercel.app
ALLOWED_ORIGINS = _split_origins(os.getenv('ALLOWED_ORIGINS', '*'))

# Port the server binds to. Railway injects PORT automatically.
PORT = int(os.getenv('PORT', '8000'))
