import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..main import app
from ..database import Base, get_db
from .. import models

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "QMS API"}

def test_create_user():
    response = client.post(
        "/auth/users/",
        json={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_login():
    # First, create a user
    client.post(
        "/auth/users/",
        json={"username": "testuser", "password": "testpassword"},
    )
    # Then, login
    response = client.post(
        "/auth/token",
        data={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def get_auth_headers():
    # Create user and login to get token
    client.post("/auth/users/", json={"username": "testuser", "password": "testpassword"})
    response = client.post("/auth/token", data={"username": "testuser", "password": "testpassword"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_quilt():
    headers = get_auth_headers()
    response = client.post(
        "/api/quilts/",
        headers=headers,
        json={
            "item_number": 1,
            "name": "Test Quilt",
            "season": "winter",
            "weight_grams": 1000,
            "location": "Test Location",
            "length_cm": 200,
            "width_cm": 150,
            "fill_material": "cotton",
            "color": "white"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Quilt"
    assert data["item_number"] == 1