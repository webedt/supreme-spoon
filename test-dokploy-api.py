#!/usr/bin/env python3
"""
Dokploy API Test Script (Python)
Demonstrates how to interact with Dokploy API using Python
"""

import os
import json
import sys

try:
    import requests
except ImportError:
    print("Note: 'requests' library not available. Install with: pip install requests")
    print("Showing example usage without making actual requests...\n")
    requests = None

# Configuration
DOKPLOY_URL = os.environ.get('DOKPLOY_URL', 'https://dokploy.etdofresh.com').rstrip('/')
DOKPLOY_API_KEY = os.environ.get('DOKPLOY_API', 'your-api-key-here')

print("=" * 60)
print("Dokploy API Test Script (Python)")
print("=" * 60)
print(f"API Base URL: {DOKPLOY_URL}")
print(f"API Key: {DOKPLOY_API_KEY[:20]}...")
print("")


def make_request(method, endpoint, data=None):
    """Make a request to Dokploy API"""
    url = f"{DOKPLOY_URL}/{endpoint}"
    headers = {
        'accept': 'application/json',
        'x-api-key': DOKPLOY_API_KEY
    }

    if data:
        headers['Content-Type'] = 'application/json'

    print(f"Request: {method} {url}")

    if requests is None:
        print("Would make request with headers:", json.dumps(headers, indent=2))
        if data:
            print("With data:", json.dumps(data, indent=2))
        print("(Skipping actual request - requests library not available)")
        return None

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            try:
                return response.json()
            except:
                return response.text
        else:
            print(f"Error: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None


def test_get_all_projects():
    """Test 1: Get all projects"""
    print("\n" + "=" * 60)
    print("Test 1: Get All Projects")
    print("=" * 60)

    result = make_request('GET', 'api/project.all')

    if result:
        print("\nProjects retrieved successfully!")
        print(json.dumps(result, indent=2)[:500] + "...")
    else:
        print("\nExample response format:")
        print(json.dumps({
            "projects": [
                {
                    "projectId": "example-project-id",
                    "name": "My Project",
                    "applications": [
                        {
                            "applicationId": "example-app-id",
                            "name": "My App"
                        }
                    ]
                }
            ]
        }, indent=2))


def test_deploy_application(app_id=None):
    """Test 2: Deploy an application"""
    print("\n" + "=" * 60)
    print("Test 2: Deploy Application")
    print("=" * 60)

    if not app_id:
        print("No applicationId provided - showing example only")
        print("\nExample usage:")
        print("  test_deploy_application('your-application-id')")
        print("\nExample curl equivalent:")
        print(f"""
curl -X POST \\
  '{DOKPLOY_URL}/api/trpc/application.deploy' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: {DOKPLOY_API_KEY}' \\
  -d '{{"json": {{"applicationId": "your-app-id"}}}}'
        """)
        return

    data = {
        "json": {
            "applicationId": app_id
        }
    }

    result = make_request('POST', 'api/trpc/application.deploy', data)

    if result:
        print("\nDeployment triggered successfully!")
        print(json.dumps(result, indent=2))


def test_database_operations():
    """Test 3: Database operations examples"""
    print("\n" + "=" * 60)
    print("Test 3: Database Operations (Examples)")
    print("=" * 60)

    operations = {
        "PostgreSQL": {
            "start": "api/trpc/postgres.start",
            "stop": "api/trpc/postgres.stop",
            "id_key": "postgresId"
        },
        "MySQL": {
            "start": "api/trpc/mysql.start",
            "stop": "api/trpc/mysql.stop",
            "id_key": "mysqlId"
        },
        "Redis": {
            "start": "api/trpc/redis.start",
            "stop": "api/trpc/redis.stop",
            "id_key": "redisId"
        },
        "MongoDB": {
            "start": "api/trpc/mongo.start",
            "stop": "api/trpc/mongo.stop",
            "id_key": "mongoId"
        }
    }

    for db_name, endpoints in operations.items():
        print(f"\n{db_name}:")
        print(f"  Start: {DOKPLOY_URL}/{endpoints['start']}")
        print(f"  Stop: {DOKPLOY_URL}/{endpoints['stop']}")
        print(f"  Example data: {{'json': {{'{endpoints['id_key']}': 'your-id'}}}}")


def test_compose_operations():
    """Test 4: Docker Compose operations"""
    print("\n" + "=" * 60)
    print("Test 4: Docker Compose Operations (Examples)")
    print("=" * 60)

    print(f"\nStart Compose: {DOKPLOY_URL}/api/trpc/compose.start")
    print(f"Stop Compose: {DOKPLOY_URL}/api/trpc/compose.stop")
    print(f"Example data: {{'json': {{'composeId': 'your-compose-id'}}}}")


def main():
    """Run all tests"""
    try:
        test_get_all_projects()
        test_deploy_application()
        test_database_operations()
        test_compose_operations()

        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)

        if requests is None:
            print("\nNote: Install 'requests' library to make actual API calls:")
            print("  pip install requests")

    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
