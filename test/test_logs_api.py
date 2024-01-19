import json
import requests

API_URL = 'http://localhost:3001'


def test_get_log_files():
    logs_url = f"{API_URL}/logs/files"
    http_res = requests.get(logs_url)
    assert http_res.status_code == 200
    json_res = json.loads(http_res.content.decode())
    assert 'data' in json_res
    assert 'files' in json_res['data']


def test_read_log_file():
    logs_url = f"{API_URL}/logs/files/0"
    http_res = requests.get(logs_url)
    assert http_res.status_code == 200
    json_res = json.loads(http_res.content.decode())
    assert 'data' in json_res
    assert 'logs' in json_res['data']


def _test_create_account():
    reg_user_account = f"{API_URL}/auth/register"
    http_res = requests.post(reg_user_account, json={
        'username': 'eslam',
        'password': 'test_pass',
        'firstname': 'Eslam',
        'lastname': 'Elsharkawy',
        'email': 'elshareslam@gmail.com',
    })
    assert http_res.status_code == 200


def test_create_auth_token():
    reg_user_account = f"{API_URL}/auth/login"
    http_res = requests.post(reg_user_account, json={
        'username': 'eslam',
        'password': 'test_pass',
    })
    assert http_res.status_code == 200
    json_res = json.loads(http_res.content.decode())
    token = json_res['idToken']
    print(token)


def test_trigger_sync():
    auth_http_res = requests.post(f"{API_URL}/auth/login", json={
        'username': 'eslam',
        'password': 'test_pass',
    })
    auth_json_res = json.loads(auth_http_res.content.decode())
    token = auth_json_res['idToken']

    sync_url = f"{API_URL}/sync/run"
    headers = {'Authorization': f"Bearer {token}"}
    http_res = requests.post(sync_url, headers=headers)
    assert http_res.status_code == 200
