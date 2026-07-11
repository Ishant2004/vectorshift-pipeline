"""Integration tests for the HTTP routes via the FastAPI test client."""


class TestHealthRoute:
    def test_health_check(self, client):
        response = client.get('/')
        assert response.status_code == 200
        assert response.json() == {'Ping': 'Pong'}


class TestParseRoute:
    def test_parse_valid_dag(self, client):
        payload = {
            'nodes': [{'id': 'a'}, {'id': 'b'}, {'id': 'c'}],
            'edges': [
                {'source': 'a', 'target': 'b'},
                {'source': 'b', 'target': 'c'},
            ],
        }
        response = client.post('/pipelines/parse', json=payload)
        assert response.status_code == 200
        assert response.json() == {'num_nodes': 3, 'num_edges': 2, 'is_dag': True}

    def test_parse_cycle(self, client):
        payload = {
            'nodes': [{'id': 'a'}, {'id': 'b'}],
            'edges': [
                {'source': 'a', 'target': 'b'},
                {'source': 'b', 'target': 'a'},
            ],
        }
        response = client.post('/pipelines/parse', json=payload)
        assert response.status_code == 200
        assert response.json() == {'num_nodes': 2, 'num_edges': 2, 'is_dag': False}

    def test_parse_empty_pipeline(self, client):
        response = client.post('/pipelines/parse', json={'nodes': [], 'edges': []})
        assert response.status_code == 200
        assert response.json() == {'num_nodes': 0, 'num_edges': 0, 'is_dag': True}

    def test_parse_defaults_when_fields_missing(self, client):
        # nodes/edges default to empty lists when omitted.
        response = client.post('/pipelines/parse', json={})
        assert response.status_code == 200
        assert response.json() == {'num_nodes': 0, 'num_edges': 0, 'is_dag': True}

    def test_response_schema_shape(self, client):
        response = client.post('/pipelines/parse', json={'nodes': [{'id': 'a'}], 'edges': []})
        body = response.json()
        assert set(body.keys()) == {'num_nodes', 'num_edges', 'is_dag'}
        assert isinstance(body['num_nodes'], int)
        assert isinstance(body['num_edges'], int)
        assert isinstance(body['is_dag'], bool)
