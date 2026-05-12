import requests
import os

SUPABASE_URL = "https://ubqoyoyonrvjlyonlvly.supabase.co"
SUPABASE_KEY = ""

rules = [
    {"key": "material_palette", "value": "Roble oscuro, acero negro laminado, ladrillo rojo visto, hormigón pulido."},
    {"key": "windows", "value": "Marcos de acero negro estilo Crittall con perfiles delgados."},
    {"key": "lighting", "value": "Tiras LED integradas cálidas (2700K), focos sobre arte, lámparas industriales."},
    {"key": "flooring", "value": "Parqué de roble oscuro en espiga en zonas nobles, microcemento en zonas húmedas."},
    {"key": "architecture", "value": "Vigas de acero negro vistas, paredes de ladrillo original como foco visual."}
]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

for rule in rules:
    resp = requests.post(f"{SUPABASE_URL}/rest/v1/style_bible", json=rule, headers=headers)
    print(f"Rule {rule['key']}: {resp.status_code}")

