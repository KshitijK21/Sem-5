import uuid


def test_get_me(client, auth):
    r = client.get("/api/users/me", headers=auth)
    assert r.status_code == 200
    assert r.json()["user"]["username"] == "admin"


def test_list_users_admin_only(client, auth, viewer_token):
    assert client.get("/api/users", headers=auth).status_code == 200
    viewer = {"Authorization": f"Bearer {viewer_token}"}
    assert client.get("/api/users", headers=viewer).status_code == 403


def test_register_and_change_password(client, auth):
    username = "u" + uuid.uuid4().hex[:8]
    reg = client.post(
        "/api/auth/register",
        json={"username": username, "password": "initial1", "role": "viewer"},
        headers=auth,
    )
    assert reg.status_code == 201

    token = client.post(
        "/api/auth/login", data={"username": username, "password": "initial1"}
    ).json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}

    wrong = client.patch(
        "/api/users/me",
        json={"current_password": "nope", "new_password": "newpass1"},
        headers=h,
    )
    assert wrong.status_code == 400

    ok = client.patch(
        "/api/users/me",
        json={"current_password": "initial1", "new_password": "newpass1"},
        headers=h,
    )
    assert ok.status_code == 200
    assert client.post("/api/auth/login", data={"username": username, "password": "newpass1"}).status_code == 200


def test_admin_can_change_role(client, auth):
    username = "r" + uuid.uuid4().hex[:8]
    client.post(
        "/api/auth/register",
        json={"username": username, "password": "pw123456", "role": "viewer"},
        headers=auth,
    )
    r = client.patch(f"/api/users/{username}/role", json={"role": "analyst"}, headers=auth)
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "analyst"
