"""Application middleware registration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def setup_middleware(app: FastAPI) -> None:
    """Attach middleware to the app.

    CORS is open so the React dev server (and the preview sandbox, which uses
    dynamic ports) can call this API from the browser.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['*'],
        allow_headers=['*'],
    )
