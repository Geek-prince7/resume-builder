import json
import logging
import os
from datetime import datetime

import boto3
import watchtower


APP_ENV = os.getenv("APP_ENV", "dev")
SERVICE_NAME = "resume-builder-ai-service"


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": SERVICE_NAME,
            "env": APP_ENV,
            "message": record.getMessage(),
        }
        standard_attrs = {
            "name",
            "msg",
            "args",
            "levelname",
            "levelno",
            "pathname",
            "filename",
            "module",
            "exc_info",
            "exc_text",
            "stack_info",
            "lineno",
            "funcName",
            "created",
            "msecs",
            "relativeCreated",
            "thread",
            "threadName",
            "processName",
            "process",
        }
        for key, value in record.__dict__.items():
            if key not in standard_attrs and key not in payload:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def setup_logging() -> None:
    logger = logging.getLogger()
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
    logger.handlers = []

    formatter = JsonFormatter()
    is_cloud_env = APP_ENV in ("testapp", "prod")

    if APP_ENV == "dev":
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
        return

    if is_cloud_env:
        log_group = os.getenv("CLOUDWATCH_LOG_GROUP", f"resume-builder-{APP_ENV}")
        log_stream = os.getenv(
            "CLOUDWATCH_AI_LOG_STREAM", f"ai-service-{datetime.utcnow().strftime('%Y-%m-%d')}"
        )
        region = os.getenv("AWS_REGION", "us-east-1")

        try:
            cloudwatch_handler = watchtower.CloudWatchLogHandler(
                log_group_name=log_group,
                stream_name=log_stream,
                boto3_client=boto3.client("logs", region_name=region),
            )
            cloudwatch_handler.setFormatter(formatter)
            logger.addHandler(cloudwatch_handler)
        except Exception:
            # Safe fallback to console if CloudWatch init fails.
            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(formatter)
            logger.addHandler(stream_handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
