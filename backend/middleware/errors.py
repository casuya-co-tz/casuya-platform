from fastapi import Request
from fastapi.responses import JSONResponse

from backend.config.settings import get_settings


def _add_cors_headers(response: JSONResponse, request: Request) -> JSONResponse:
    origin = request.headers.get("origin")
    if origin and origin in get_settings().allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response


async def unhandled_exception_handler(request: Request, exc: Exception):
    response = JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "detail": "An unexpected error occurred"},
    )
    return _add_cors_headers(response, request)


async def http_exception_handler(request: Request, exc):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"error": "http_error", "detail": exc.detail},
    )
    return _add_cors_headers(response, request)


def register_error_handlers(app):
    from fastapi.exceptions import HTTPException

    app.add_exception_handler(Exception, unhandled_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
