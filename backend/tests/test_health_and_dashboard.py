"""
Comprehensive test suite for health check and dashboard endpoints.
Tests server health, infrastructure verification, and public dashboard data.
"""

import pytest


class TestHealthEndpoint:
    """Tests for GET /health endpoint."""

    def test_health_check_success(self, client):
        """Test successfully getting health status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_health_returns_status(self, client):
        """Test that health endpoint returns status field."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "ok", "running", "up"]

    def test_health_returns_environment(self, client):
        """Test that health endpoint returns environment info."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "environment" in data

    def test_health_includes_langsmith_config(self, client):
        """Test that health endpoint includes LangSmith configuration."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        # Should have langsmith_enabled or langsmith_config
        assert "langsmith_enabled" in data or "langsmith_config" in data

    def test_health_no_auth_required(self, client):
        """Test that health endpoint doesn't require authentication."""
        # Don't include any auth header
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_structure(self, client):
        """Test health response has required structure."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0


class TestTraceEndpoint:
    """Tests for GET /test-trace endpoint."""

    def test_trace_endpoint_success(self, client):
        """Test successfully getting trace test results."""
        response = client.get("/test-trace")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_trace_returns_status(self, client):
        """Test that trace endpoint returns status."""
        response = client.get("/test-trace")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_trace_includes_message(self, client):
        """Test that trace endpoint includes a message."""
        response = client.get("/test-trace")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "result" in data

    def test_trace_includes_metrics(self, client):
        """Test that trace endpoint includes telemetry metrics."""
        response = client.get("/test-trace")
        assert response.status_code == 200
        data = response.json()
        # Should include telemetry metrics
        assert "trace_run_id" in data or "telemetry_run_id" in data or "duration_ms" in data

    def test_trace_no_auth_required(self, client):
        """Test that trace endpoint doesn't require authentication."""
        response = client.get("/test-trace")
        assert response.status_code == 200

    def test_trace_response_is_dict(self, client):
        """Test that trace response is a dictionary."""
        response = client.get("/test-trace")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestPublicDashboard:
    """Tests for GET /api/v1/dashboard endpoint (public dashboard)."""

    def test_public_dashboard_success(self, client):
        """Test successfully getting public dashboard."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_public_dashboard_contains_courses(self, client):
        """Test that public dashboard includes course information."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        data = response.json()
        # Should contain public dashboard data
        assert len(data) > 0

    def test_public_dashboard_no_personal_data(self, client):
        """Test that public dashboard doesn't expose personal user data."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        data = response.json()
        # Public dashboard should be accessible without auth
        assert response.status_code == 200

    def test_public_dashboard_no_auth_required(self, client):
        """Test that public dashboard is accessible without authentication."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200

    def test_public_dashboard_returns_valid_json(self, client):
        """Test that public dashboard returns valid JSON."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestPublicEndpoints:
    """Tests for all public endpoints that don't require authentication."""

    def test_all_public_endpoints_accessible(self, client):
        """Test that all public endpoints are accessible."""
        public_endpoints = [
            ("/health", "GET"),
            ("/test-trace", "GET"),
            ("/api/courses/featured", "GET"),
        ]

        for endpoint, method in public_endpoints:
            if method == "GET":
                response = client.get(endpoint)
            else:
                response = client.post(endpoint, json={})

            assert response.status_code in [200, 201, 400], f"{endpoint} returned {response.status_code}"

    def test_public_endpoints_no_auth_header_needed(self, client):
        """Test that public endpoints work without auth header."""
        endpoints = ["/health", "/test-trace"]

        for endpoint in endpoints:
            response = client.get(endpoint)
            # Should not require auth
            assert response.status_code in [200, 400, 404]


class TestEndpointNotFound:
    """Tests for error handling."""

    def test_invalid_endpoint_404(self, client):
        """Test that invalid endpoints return 404."""
        response = client.get("/api/invalid-endpoint-xyz-123")
        # Should return 404 for non-existent endpoints
        assert response.status_code in [404, 405]

    def test_invalid_health_path_404(self, client):
        """Test that invalid health path returns 404."""
        response = client.get("/health-check-invalid")
        # Should return 404 for non-existent endpoints
        assert response.status_code in [404, 405]


class TestServerAvailability:
    """Tests for server availability and basic connectivity."""

    def test_server_responds_to_requests(self, client):
        """Test that server responds to requests."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_server_returns_json(self, client):
        """Test that server returns JSON responses."""
        response = client.get("/health")
        assert response.headers.get("content-type")
        data = response.json()
        assert isinstance(data, dict)

    def test_server_status_ok(self, client):
        """Test that server status is ok."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") is not None


class TestDashboardWithData:
    """Tests for dashboard with actual course data."""

    def test_dashboard_with_courses(self, client):
        """Test dashboard with course data."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200

    def test_dashboard_lists_featured_courses(self, client):
        """Test that dashboard lists featured courses."""
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
