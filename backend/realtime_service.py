from azure.messaging.webpubsubservice import WebPubSubServiceClient
import os
import json

client = WebPubSubServiceClient.from_connection_string(
    os.getenv("WEBPUBSUB_CONNECTION_STRING"),
    hub="orderhub"
)

def send_order_update(order_id: int, status: str):
    client.send_to_all(
        json.dumps({
            "order_id": order_id,
            "status": status
        }),
        content_type="application/json"
    )