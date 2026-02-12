import time
import requests
import sys

BASE_URL = "http://localhost:8080/api"

def wait_for_backend():
    print("⏳ Waiting for backend to be ready...")
    for i in range(30):
        try:
            response = requests.get(f"{BASE_URL}/products")
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(2)
    print("❌ Backend failed to start.")
    sys.exit(1)

def run_tests():
    # 1. Create Raw Material
    print("\n📦 Creating Raw Material...")
    rm_payload = {
        "code": "RM001",
        "name": "Madeira de Carvalho",
        "stockQuantity": 100.0
    }
    rm_resp = requests.post(f"{BASE_URL}/raw-materials", json=rm_payload)
    if rm_resp.status_code != 201:
        print(f"❌ Failed to create Raw Material: {rm_resp.text}")
        return
    rm_id = rm_resp.json()['id']
    print(f"✅ Created Raw Material ID: {rm_id}")

    # 2. Create Product
    print("\n🔨 Creating Product...")
    prod_payload = {
        "code": "PROD001",
        "name": " Cadeira de Madeira",
        "value": 150.00
    }
    prod_resp = requests.post(f"{BASE_URL}/products", json=prod_payload)
    if prod_resp.status_code != 201:
        print(f"❌ Failed to create Product: {prod_resp.text}")
        return
    prod_id = prod_resp.json()['id']
    print(f"✅ Created Product ID: {prod_id}")

    # 3. Link Raw Material to Product (Recipe)
    print("\n🔗 Linking Raw Material to Product...")
    link_payload = {
        "rawMaterialId": rm_id,
        "quantity": 2.0  # Needs 2 units of Wood per Chair
    }
    link_resp = requests.post(f"{BASE_URL}/products/{prod_id}/raw-materials", json=link_payload)
    if link_resp.status_code == 200:
        print("✅ Linked successfully")
    else:
        print(f"❌ Failed to link: {link_resp.text}")

    # 4. Get Production Suggestion
    print("\n💡 Fetching Production Suggestion...")
    sugg_resp = requests.get(f"{BASE_URL}/production/suggestion")
    if sugg_resp.status_code == 200:
        data = sugg_resp.json()
        print(f"✅ Suggestion Response: {data}")
        
        # Validation
        # 100 wood / 2 per chair = 50 chairs max
        items = data.get('items', [])
        if items and items[0]['quantity'] == 50:
             print("✅ LOGIC VERIFIED: Suggestion correctly calculated 50 units.")
        else:
             print(f"⚠️ LOGIC CHECK: Expected 50 units, got {items[0]['quantity'] if items else 'None'}")
    else:
        print(f"❌ Failed to get suggestion: {sugg_resp.text}")

if __name__ == "__main__":
    wait_for_backend()
    run_tests()
