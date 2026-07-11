"""Pipeline routes, exposed as a router included by main.py."""

from fastapi import APIRouter

from models import ParseResponse, Pipeline
from services import parse_pipeline

router = APIRouter(prefix='/pipelines', tags=['pipelines'])


@router.post('/parse', response_model=ParseResponse)
def parse(pipeline: Pipeline) -> ParseResponse:
    return parse_pipeline(pipeline)
