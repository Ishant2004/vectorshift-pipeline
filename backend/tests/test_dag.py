"""Unit tests for the DAG detection function."""

from dag import is_dag


def edge(source, target):
    return {'source': source, 'target': target}


def nodes(*ids):
    return [{'id': node_id} for node_id in ids]


class TestIsDag:
    def test_empty_graph_is_dag(self):
        assert is_dag([], []) is True

    def test_single_node_no_edges_is_dag(self):
        assert is_dag(nodes('a'), []) is True

    def test_simple_chain_is_dag(self):
        # a -> b -> c
        assert is_dag(nodes('a', 'b', 'c'), [edge('a', 'b'), edge('b', 'c')]) is True

    def test_diamond_is_dag(self):
        # a -> b, a -> c, b -> d, c -> d
        graph = [edge('a', 'b'), edge('a', 'c'), edge('b', 'd'), edge('c', 'd')]
        assert is_dag(nodes('a', 'b', 'c', 'd'), graph) is True

    def test_two_node_cycle_is_not_dag(self):
        # a -> b -> a
        assert is_dag(nodes('a', 'b'), [edge('a', 'b'), edge('b', 'a')]) is False

    def test_self_loop_is_not_dag(self):
        assert is_dag(nodes('a'), [edge('a', 'a')]) is False

    def test_larger_cycle_is_not_dag(self):
        # a -> b -> c -> a
        graph = [edge('a', 'b'), edge('b', 'c'), edge('c', 'a')]
        assert is_dag(nodes('a', 'b', 'c'), graph) is False

    def test_disconnected_components_are_dag(self):
        # a -> b   and   c -> d  (two separate chains)
        graph = [edge('a', 'b'), edge('c', 'd')]
        assert is_dag(nodes('a', 'b', 'c', 'd'), graph) is True

    def test_edges_to_unknown_nodes_are_ignored(self):
        # Edge references a node id that isn't in the node list.
        assert is_dag(nodes('a'), [edge('a', 'ghost')]) is True
