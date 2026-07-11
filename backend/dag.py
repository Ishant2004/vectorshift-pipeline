"""Directed-acyclic-graph detection."""

from collections import deque
from typing import Any, Dict, List


def is_dag(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
    """Return True if the nodes/edges form a directed acyclic graph.

    Uses Kahn's algorithm: repeatedly remove nodes with no incoming edges.
    If every node can be removed this way there is no cycle, so it's a DAG.
    """
    node_ids = {node.get('id') for node in nodes}

    adjacency: Dict[Any, List[Any]] = {node_id: [] for node_id in node_ids}
    in_degree: Dict[Any, int] = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        source, target = edge.get('source'), edge.get('target')
        # Only consider edges that connect two known nodes.
        if source in node_ids and target in node_ids:
            adjacency[source].append(target)
            in_degree[target] += 1

    queue = deque(node_id for node_id in node_ids if in_degree[node_id] == 0)
    visited = 0
    while queue:
        current = queue.popleft()
        visited += 1
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(node_ids)
