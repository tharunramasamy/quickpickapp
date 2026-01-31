import os
import json
from azure.messaging.webpubsubservice import WebPubSubServiceClient

# Optional: Azure Web PubSub for real-time updates
try:
    PUBSUB_CONNECTION_STRING = os.getenv("PUBSUB_CONNECTION_STRING", "")
    if PUBSUB_CONNECTION_STRING:
        client = WebPubSubServiceClient.from_connection_string(PUBSUB_CONNECTION_STRING)
    else:
        client = None
except:
    client = None

def send_order_update(order_id: str, status: str):
    """
    Send real-time order update to connected clients.
    Uses Azure Web PubSub if available, otherwise logs.
    """
    try:
        message = {
            "order_id": order_id,
            "status": status,
            "timestamp": str(datetime.now())
        }
        
        if client:
            client.send_to_all(
                message=json.dumps(message),
                content_type="application/json"
            )
            print(f"✓ Sent update: Order {order_id} → {status}")
        else:
            # Fallback: just log it
            print(f"📢 Order Update: {order_id} → {status}")
            
    except Exception as e:
        print(f"⚠ Could not send real-time update: {e}")
        # Non-critical, so don't raise

def send_inventory_update(order_id: str, status: str):
    """Send inventory-specific update"""
    send_order_update(order_id, status)

def send_delivery_update(order_id: str, status: str):
    """Send delivery-specific update"""
    send_order_update(order_id, status)

from datetime import datetime