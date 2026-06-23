from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.utils.jwt_handler import verify_token
from app.logger import get_logger

logger = get_logger(__name__)

# Public endpoints that don't require authentication
PUBLIC_ENDPOINTS = [
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/verify-token",
    "/api/v1/dashboard",
    "/api/courses/featured",
    "/api/courses/",
    "/api/courses/generate",
    "/health",
    "/test-trace",
    "/docs",
    "/openapi.json",
    "/redoc",
]


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware that requires authentication for all endpoints except public ones.
    Verifies JWT token in Authorization header for all protected routes.
    """

    async def dispatch(self, request: Request, call_next):
        # Check if the endpoint is public
        if self._is_public_endpoint(request.url.path):
            response = await call_next(request)
            return response

        # Get the Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            logger.warning(f"Unauthorized access attempt to {request.url.path} - no token")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required. Please provide a valid token."},
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Extract the token from "Bearer <token>"
        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                logger.warning(f"Invalid authorization header format: {request.url.path}")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid authorization header. Use: Authorization: Bearer <token>"},
                    headers={"WWW-Authenticate": "Bearer"}
                )
            token = parts[1]
        except ValueError:
            logger.warning(f"Malformed authorization header: {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authorization header format"},
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Verify the token
        is_valid, payload, message = verify_token(token)

        if not is_valid:
            logger.warning(f"Invalid token for {request.url.path}: {message}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": message},
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Store the user info in request state for later use
        request.state.user = payload
        logger.info(f"Authenticated request to {request.url.path} by user: {payload.get('email')}")

        # Call the next middleware/route handler
        response = await call_next(request)
        return response

    @staticmethod
    def _is_public_endpoint(path: str) -> bool:
        """Check if the endpoint is in the public list."""
        # Exact match
        if path in PUBLIC_ENDPOINTS:
            return True

        # Check with/without trailing slash
        path_with_slash = path if path.endswith("/") else path + "/"
        path_without_slash = path.rstrip("/")

        if path_with_slash in PUBLIC_ENDPOINTS:
            return True
        if path_without_slash in PUBLIC_ENDPOINTS:
            return True

        # Check if path starts with any public endpoint
        for endpoint in PUBLIC_ENDPOINTS:
            if endpoint.endswith("/") and (path.startswith(endpoint) or path_without_slash == endpoint.rstrip("/")):
                return True

        return False
