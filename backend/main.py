"""Application entrypoint: wires middleware and routers, exposes health check."""

from fastapi import FastAPI

from middleware import setup_middleware
from models import HealthResponse
from routes import router as pipelines_router

app = FastAPI(title='VectorShift Pipeline API')

setup_middleware(app)
app.include_router(pipelines_router)


@app.get('/', response_model=HealthResponse, tags=['health'])
def read_root() -> HealthResponse:
    """Health check."""
    return HealthResponse()
