"""Application middleware registration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS


def setup_middleware(app: FastAPI) -> None:
    """Attach middleware to the app.

    CORS origins come from the ALLOWED_ORIGINS env var. Locally this defaults
    to "*"; in production set it to the deployed frontend URL.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_methods=['*'],
        allow_headers=['*'],
    )
