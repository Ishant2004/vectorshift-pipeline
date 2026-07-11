"""Shared pytest fixtures.

Living at the backend root, this file also puts the backend package directory
on sys.path so tests can `import main`, `import dag`, etc.
"""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> TestClient:
    """A FastAPI test client bound to the application."""
    return TestClient(app)
