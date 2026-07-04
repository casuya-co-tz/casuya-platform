from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_register():
    resp = client.post("/auth/register", json={
        "email": "test@test.com",
        "password": "test123",
        "full_name": "Test User",
        "role": "student",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate():
    resp = client.post("/auth/register", json={
        "email": "test@test.com",
        "password": "test123",
        "full_name": "Test User",
    })
    assert resp.status_code == 409


def test_login():
    resp = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "test123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data


def test_login_invalid():
    resp = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
