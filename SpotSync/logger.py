import logging
import os
from datetime import datetime

# Configure logging
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors and timestamps"""
    
    COLORS = {
        "DEBUG": "\033[36m",      # Cyan
        "INFO": "\033[32m",       # Green
        "WARNING": "\033[33m",    # Yellow
        "ERROR": "\033[31m",      # Red
        "CRITICAL": "\033[35m",   # Magenta
    }
    RESET = "\033[0m"
    
    def format(self, record):
        timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        level = record.levelname
        color = self.COLORS.get(level, self.RESET)
        
        log_msg = f"[{timestamp}] [{color}{level}{self.RESET}] {record.getMessage()}"
        
        if record.exc_info:
            log_msg += f"\n{self.formatException(record.exc_info)}"
        
        return log_msg

# Setup logger
logger = logging.getLogger("SpotSync")
logger.setLevel(logging.DEBUG if DEBUG else logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG if DEBUG else logging.INFO)
console_handler.setFormatter(ColoredFormatter())
logger.addHandler(console_handler)

# Export convenience functions
def debug(msg, *args):
    logger.debug(msg, *args)

def info(msg, *args):
    logger.info(msg, *args)

def warn(msg, *args):
    logger.warning(msg, *args)

def error(msg, *args):
    logger.error(msg, *args)

def critical(msg, *args):
    logger.critical(msg, *args)