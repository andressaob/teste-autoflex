import requests
import sys

BASE_URL = "http://localhost:8080/api"

def create_raw_material(code, name, stock):
    print(f"Creating Raw Material: {name}...")
    payload = {"code": code, "name": name, "stockQuantity": stock}
    resp = requests.post(f"{BASE_URL}/raw-materials", json=payload)
    if resp.status_code == 201:
        print(f"✅ Success! ID: {resp.json()['id']}")
        return resp.json()['id']
    else:
        print(f"⚠️  Skipped/Error (might already exist): {resp.text}")
        return None

def create_product(code, name, value):
    print(f"Creating Product: {name}...")
    payload = {"code": code, "name": name, "value": value}
    resp = requests.post(f"{BASE_URL}/products", json=payload)
    if resp.status_code == 201:
        print(f"✅ Success! ID: {resp.json()['id']}")
        return resp.json()['id']
    else:
        print(f"⚠️  Skipped/Error (might already exist): {resp.text}")
        return None

def link_material(product_id, material_id, quantity):
    if not product_id or not material_id:
        return
    print(f"Linking Product {product_id} with Material {material_id} (Qty: {quantity})...")
    payload = {"rawMaterialId": material_id, "quantity": quantity}
    resp = requests.post(f"{BASE_URL}/products/{product_id}/raw-materials", json=payload)
    if resp.status_code == 200:
        print("✅ Linked successfully")
    elif resp.status_code == 500: # Usually means duplicate key if already linked, which is fine for idempotent
         print("⚠️  Already linked or server error")
    else:
        print(f"❌ Error linking: {resp.text}")

def seed():
    print("🌱 Seeding Database...\n")

    # 1. Raw Materials
    wood_id = create_raw_material("MP001", "Madeira (m²)", 500.0)
    iron_id = create_raw_material("MP002", "Ferro (kg)", 200.0)
    plastic_id = create_raw_material("MP003", "Plástico (kg)", 300.0)
    screw_id = create_raw_material("MP004", "Parafuso (un)", 1000.0)
    fabric_id = create_raw_material("MP005", "Tecido (m²)", 150.0)

    print("-" * 30)

    # 2. Products
    chair_id = create_product("PROD001", "Cadeira de Madeira", 150.00)
    table_id = create_product("PROD002", "Mesa de Jantar", 450.00)
    stool_id = create_product("PROD003", "Banco Industrial", 85.00)

    print("-" * 30)

    # 3. Recipes (Links)
    
    # Chair: 2 Wood, 4 Screws, 0.5 Fabric
    link_material(chair_id, wood_id, 2.0)
    link_material(chair_id, screw_id, 4.0)
    link_material(chair_id, fabric_id, 0.5)

    # Table: 10 Wood, 2 Iron, 8 Screws
    link_material(table_id, wood_id, 10.0)
    link_material(table_id, iron_id, 2.0)
    link_material(table_id, screw_id, 8.0)

    # Stool: 2 Plastic, 1 Iron
    link_material(stool_id, plastic_id, 2.0)
    link_material(stool_id, iron_id, 1.0)

    print("\n✅ Seeding complete! Go to http://localhost:3000 to view data.")

if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"\n❌ Error connecting to backend: {e}")
        print("Make sure Docker is running on localhost:8080")
