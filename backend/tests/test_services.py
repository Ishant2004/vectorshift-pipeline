"""Unit tests for the pipeline service layer."""

from models import ParseResponse, Pipeline
from services import parse_pipeline


class TestParsePipeline:
    def test_returns_parse_response(self):
        result = parse_pipeline(Pipeline(nodes=[], edges=[]))
        assert isinstance(result, ParseResponse)

    def test_counts_nodes_and_edges(self):
        pipeline = Pipeline(
            nodes=[{'id': 'a'}, {'id': 'b'}, {'id': 'c'}],
            edges=[{'source': 'a', 'target': 'b'}],
        )
        result = parse_pipeline(pipeline)
        assert result.num_nodes == 3
        assert result.num_edges == 1

    def test_flags_valid_dag(self):
        pipeline = Pipeline(
            nodes=[{'id': 'a'}, {'id': 'b'}],
            edges=[{'source': 'a', 'target': 'b'}],
        )
        assert parse_pipeline(pipeline).is_dag is True

    def test_flags_cycle_as_not_dag(self):
        pipeline = Pipeline(
            nodes=[{'id': 'a'}, {'id': 'b'}],
            edges=[{'source': 'a', 'target': 'b'}, {'source': 'b', 'target': 'a'}],
        )
        assert parse_pipeline(pipeline).is_dag is False

    def test_empty_pipeline(self):
        result = parse_pipeline(Pipeline())
        assert (result.num_nodes, result.num_edges, result.is_dag) == (0, 0, True)
