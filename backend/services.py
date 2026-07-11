"""Business logic for the pipeline routes, kept separate from routing."""

from dag import is_dag
from models import ParseResponse, Pipeline


def parse_pipeline(pipeline: Pipeline) -> ParseResponse:
    """Count the pipeline's nodes/edges and check whether it's a DAG."""
    return ParseResponse(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(pipeline.nodes, pipeline.edges),
    )
