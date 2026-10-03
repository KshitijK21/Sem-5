def _login(client, username: str, password: str):
    return client.post("/api/auth/login", data={"username": username, "password": password})


def test_login_and_me(client):
    r = _login(client, "admin", "admin123")
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "admin"

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["user"]["username"] == "admin"


def test_bad_login_rejected(client):
    assert _login(client, "admin", "wrong-password").status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_admin_endpoint_enforces_role(client):
    viewer = _login(client, "viewer", "viewer123").json()["access_token"]
    forbidden = client.get("/api/auth/admin/users", headers={"Authorization": f"Bearer {viewer}"})
    assert forbidden.status_code == 403

    admin = _login(client, "admin", "admin123").json()["access_token"]
    ok = client.get("/api/auth/admin/users", headers={"Authorization": f"Bearer {admin}"})
    assert ok.status_code == 200
    assert all("hashed_password" not in u for u in ok.json()["users"])
