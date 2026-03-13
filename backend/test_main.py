"""Tests for PL-6: multi-document support."""
import pytest
from httpx import AsyncClient, ASGITransport
from main import app, extract_fields, CATALOG


# --- Unit tests for field extractor ---

def test_extract_fields_basic():
    content = '<span class="orderform_link">Provider</span> and <span class="orderform_link">Customer</span>'
    assert extract_fields(content) == ['Provider', 'Customer']


def test_extract_fields_deduplication():
    content = '<span class="orderform_link">Provider</span> foo <span class="orderform_link">Provider</span>'
    assert extract_fields(content) == ['Provider']


def test_extract_fields_strips_possessives():
    content = '<span class="orderform_link">Customer\u2019s</span> and <span class="orderform_link">Customer</span>'
    # "Customer's" normalizes to "Customer"; duplicate removed
    assert extract_fields(content) == ['Customer']


def test_extract_fields_strips_apostrophe_s():
    content = "<span class=\"orderform_link\">Provider's</span> rights"
    assert extract_fields(content) == ['Provider']


def test_extract_fields_multiple_link_types():
    content = (
        '<span class="coverpage_link">Governing Law</span> '
        '<span class="keyterms_link">Fee</span>'
    )
    assert extract_fields(content) == ['Governing Law', 'Fee']


def test_extract_fields_ignores_non_link_spans():
    content = '<span class="header_2">Section Title</span>'
    assert extract_fields(content) == []


def test_extract_fields_with_id_attribute():
    """Spans with id attribute should still be extracted."""
    content = '<span class="coverpage_link" id="5.5.a">Customer</span>'
    assert extract_fields(content) == ['Customer']


# --- API integration tests ---

@pytest.mark.asyncio
async def test_template_endpoint_pilot():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        r = await client.get('/api/template/Pilot-Agreement.md')
    assert r.status_code == 200
    data = r.json()
    assert 'content' in data
    assert 'fields' in data
    assert 'Provider' in data['fields']
    assert 'Customer' in data['fields']
    assert 'Pilot Period' in data['fields']


@pytest.mark.asyncio
async def test_template_endpoint_unknown():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        r = await client.get('/api/template/nonexistent.md')
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_template_all_catalog_docs_have_fields():
    """All non-NDA-coverpage templates should extract at least 1 field."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        for filename in CATALOG:
            if filename == 'Mutual-NDA-coverpage.md':
                continue  # uses different placeholder format, served by NDA creator
            r = await client.get(f'/api/template/{filename}')
            assert r.status_code == 200, f'Failed for {filename}'
            data = r.json()
            assert len(data['fields']) > 0, f'No fields extracted for {filename}'


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        r = await client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'
