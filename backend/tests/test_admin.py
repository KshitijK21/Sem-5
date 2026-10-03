def test_system_status_admin_only(client, auth, viewer_token):
    r = client.get("/api/admin/system/status", headers=auth)
    assert r.status_code == 200
    body = r.json()
    assert body["app"]
    assert "version" in body and "database" in body

    viewer = {"Authorization": f"Bearer {viewer_token}"}
    assert client.get("/api/admin/system/status", headers=viewer).status_code == 403


def test_etl_status(client, auth):
    r = client.get("/api/admin/data/etl/status", headers=auth)
    assert r.status_code == 200
    body = r.json()
    assert "loaded" in body
    assert "tables" in body
