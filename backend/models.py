"""Pydantic models: request bodies and a response model per API route."""

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class Pipeline(BaseModel):
    """Request body for POST /pipelines/parse."""

    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Response model for the GET / health check."""

    Ping: str = 'Pong'


class ParseResponse(BaseModel):
    """Response model for POST /pipelines/parse."""

    num_nodes: int
    num_edges: int
    is_dag: bool
