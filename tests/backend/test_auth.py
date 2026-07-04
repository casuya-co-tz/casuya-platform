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
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate():
    client.post("/auth/register", json={
        "email": "dup@test.com",
        "password": "test123",
        "full_name": "Test User",
    })
    resp = client.post("/auth/register", json={
        "email": "dup@test.com",
        "password": "test123",
        "full_name": "Test User",
    })
    assert resp.status_code == 409


def test_login():
    client.post("/auth/register", json={
        "email": "login@test.com",
        "password": "test123",
        "full_name": "Test User",
    })
    resp = client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "test123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid():
    resp = client.post("/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_refresh():
    reg = client.post("/auth/register", json={
        "email": "refresh@test.com",
        "password": "test123",
        "full_name": "Test User",
    })
    refresh_token = reg.json()["refresh_token"]
    resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
