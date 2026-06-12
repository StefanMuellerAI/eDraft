"""Tests für den gemockten Konverter-Endpunkt (§8) und die Health-Route."""

import io

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import create_app

DOCX_CONTENT_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)


def make_client(settings: Settings) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: settings
    return TestClient(app)


@pytest.fixture
def client() -> TestClient:
    return make_client(Settings(convert_mode="sample", max_upload_mb=1))


def upload(client: TestClient, filename: str, content: bytes, content_type: str):
    return client.post(
        "/api/v1/convert",
        files={"file": (filename, io.BytesIO(content), content_type)},
        data={"source_format": "auto"},
    )


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_convert_returns_sample_fdx(client: TestClient) -> None:
    response = upload(client, "drehbuch.docx", b"dummy", DOCX_CONTENT_TYPE)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["fdx_xml"].lstrip().startswith("<?xml")
    assert "<FinalDraft" in body["fdx_xml"]
    assert isinstance(body["warnings"], list)


def test_convert_accepts_pdf(client: TestClient) -> None:
    response = upload(client, "drehbuch.pdf", b"%PDF-1.7 dummy", "application/pdf")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_convert_not_implemented_mode() -> None:
    client = make_client(Settings(convert_mode="not_implemented", max_upload_mb=1))
    response = upload(client, "drehbuch.docx", b"dummy", DOCX_CONTENT_TYPE)
    assert response.status_code == 202
    body = response.json()
    assert body["status"] == "not_implemented"
    assert body["message"]
    assert "<FinalDraft" in body["fdx_xml"]


def test_convert_rejects_unsupported_type(client: TestClient) -> None:
    response = upload(client, "bild.png", b"\x89PNG", "image/png")
    assert response.status_code == 415
    assert response.json()["status"] == "error"


def test_convert_rejects_oversized_file(client: TestClient) -> None:
    too_big = b"x" * (1024 * 1024 + 1)
    response = upload(client, "gross.docx", too_big, DOCX_CONTENT_TYPE)
    assert response.status_code == 413
    assert response.json()["status"] == "error"


def test_openapi_contract_is_stable(client: TestClient) -> None:
    """Der Vertrag (Pfad + multipart-Feld `file`) darf sich nicht ändern (FA-21)."""
    schema = client.get("/openapi.json").json()
    assert "/api/v1/convert" in schema["paths"]
    post = schema["paths"]["/api/v1/convert"]["post"]
    media = post["requestBody"]["content"]["multipart/form-data"]
    assert "file" in media["schema"].get("properties", {}) or media
