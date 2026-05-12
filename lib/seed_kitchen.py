import requests
import os

SUPABASE_URL = "https://jnwjmuahutzmixddtskx.supabase.co"
SUPABASE_KEY = "sb_publishable_VJsS_z8frD83md1MQLbnnQ_Dy99k7jY"

rules = [
    {"key": "kitchen_island", "value": "Monolithic black stone island with waterfall edges."},
    {"key": "kitchen_cabinets", "value": "Handleless dark fumed oak cabinetry, matte finish."},
    {"key": "kitchen_backsplash", "value": "Textured volcanic stone or matching black marble."},
    {"key": "kitchen_appliances", "value": "Fully integrated Gaggenau or similar, hidden behind oak panels."},
]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

for rule in rules:
    resp = requests.post(f"{SUPABASE_URL}/rest/v1/style_bible", json=rule, headers=headers)
    print(f"Kitchen Rule {rule['key']}: {resp.status_code}")

