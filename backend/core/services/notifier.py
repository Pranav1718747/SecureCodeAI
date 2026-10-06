"""Real-time WebSocket notification service."""

import structlog

logger = structlog.get_logger(__name__)


class WebSocketNotifier:
    """Handles real-time WebSocket notifications."""
    
    def publish_progress(self, scan_id: str, stage_name: str, progress_pct: int = None, details: dict = None):
        """Publishes progress to the scan's WebSocket group."""
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            if not channel_layer:
                return
                
            data = {"type": "stage_update", "stage": stage_name}
            if progress_pct is not None:
                data["progress_pct"] = progress_pct
            if details:
                data.update(details)
                
            async_to_sync(channel_layer.group_send)(
                f"scan_{scan_id}",
                {
                    "type": "scan_update",
                    "data": data
                }
            )
        except Exception as e:
            logger.error("notifier.websocket.failed", error=str(e), scan_id=scan_id)
