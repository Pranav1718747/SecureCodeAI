"""WebSocket consumers for real-time streaming."""

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ScanStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.scan_id = self.scope['url_route']['kwargs']['scan_id']
        self.room_group_name = f'scan_{self.scan_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def scan_update(self, event):
        """Receive message from room group and send to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'scan_update',
            'data': event['data']
        }))
