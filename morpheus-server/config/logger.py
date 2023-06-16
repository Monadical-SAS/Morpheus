import logging
import sys
from pathlib import Path

import loguru
import yaml


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = loguru.logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        loguru.logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


class InitLogger:
    @classmethod
    def read_config(cls, filepath: Path):
        config = yaml.safe_load(filepath.read_text())
        return config

    @classmethod
    def create_logger(cls, cfg_path: Path):
        config = cls.read_config(filepath=cfg_path)
        config_logger = config.get("logger")
        logger = cls.build_logger(config_logger)
        return logger

    @classmethod
    def build_logger(cls, cfg):
        loguru_format = loguru._defaults.LOGURU_FORMAT
        have_format = not (cfg.get("format") is None)
        loguru.logger.remove()
        loguru.logger.add(
            sys.stdout,
            enqueue=True,
            backtrace=True,
            level=cfg.get("level").upper(),
            format=cfg.get("format") if have_format else loguru_format,
        )

        # catch external logging and send to loguru handler
        logging.basicConfig(handlers=[InterceptHandler()], level=0)
        logging.root.setLevel(cfg.get("level").upper())
        logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
        for log in ["uvicorn", "uvicorn.error", "fastapi", "gunicorn", "gunicorn.access", "gunicorn.error"]:
            _logger = logging.getLogger(log)
            _logger.handler = [InterceptHandler()]

        return loguru.logger.bind(request_id=None, method=None)
