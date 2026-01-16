import json
import requests
import paho.mqtt.client as mqtt

# ================= FIREBASE CONFIG =================
PROJECT_ID = "cpc357project-29ccf"  # Replace with your Firebase project ID
API_KEY = "AIzaSyAFYGSZjbjL0YXbRTXPMeAwBUwGbDdR1Ns"    # Replace with your Web API key
COLLECTION_NAME = "drain_data"

FIREBASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION_NAME}?key={API_KEY}"

# ================= MQTT CONFIG =================
MQTT_BROKER = "34.70.130.230"  # Your GCP VM public IP
MQTT_PORT = 1883
MQTT_TOPIC = "iot/drain_data"

# ---------------- MQTT CALLBACKS ----------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(MQTT_TOPIC)
    else:
        print("Failed to connect, rc=", rc)


def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        print("Received MQTT message:", data)

        # Correct Firestore format
        firestore_payload = {"fields": {}}
        for k, v in data.items():
            if isinstance(v, bool):
                firestore_payload["fields"][k] = {"booleanValue": v}
            elif isinstance(v, (int, float)):
                firestore_payload["fields"][k] = {"doubleValue": float(v)}
            else:
                firestore_payload["fields"][k] = {"stringValue": str(v)}

        response = requests.post(FIREBASE_URL, json=firestore_payload)
        if response.status_code in [200, 201]:
            print("✅ Data stored in Firestore!")
        else:
            print("❌ Failed to store data:", response.status_code, response.text)

    except Exception as e:
        print("Error:", e)
# ---------------- MQTT CLIENT ----------------
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()
