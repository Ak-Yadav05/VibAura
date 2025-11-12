import os
from pathlib import Path
from dotenv import load_dotenv
from logger import info, error, critical

# Load environment variables
load_dotenv()

# Define required environment variables
REQUIRED_ENV_VARS = {
    "SPOTIFY_CLIENT_ID": "Spotify API Client ID",
    "SPOTIFY_CLIENT_SECRET": "Spotify API Client Secret",
    "CLOUDINARY_CLOUD_NAME": "Cloudinary Cloud Name",
    "CLOUDINARY_API_KEY": "Cloudinary API Key",
    "CLOUDINARY_API_SECRET": "Cloudinary API Secret",
    "MONGODB_URI": "MongoDB Connection URI",
}

# Optional variables with defaults
OPTIONAL_ENV_VARS = {
    "CLOUDINARY_FOLDER": "vibAura_songs",
    "MONGODB_DB_NAME": "VibAura",
    "MAX_WORKERS": "4",
    "DOWNLOAD_FOLDER": "downloaded-songs",
    "SPOTIFY_RATE_LIMIT_DELAY": "0.1",
    "MAX_RETRIES": "3",
    "RETRY_DELAY": "2",
    "DEBUG": "false",
}

def validate_env():
    """Validate all required environment variables at startup"""
    info("Validating environment variables...")
    
    missing_vars = []
    for var_name, description in REQUIRED_ENV_VARS.items():
        if not os.getenv(var_name):
            missing_vars.append(f"  ❌ {var_name}: {description}")
    
    if missing_vars:
        error("Missing required environment variables:")
        for var in missing_vars:
            error(var)
        critical("Please set all required variables in .env file")
        exit(1)
    
    info("✅ All required environment variables are set")

def get_config():
    """Get validated configuration"""
    validate_env()
    
    config = {
        # Required
        "SPOTIFY_CLIENT_ID": os.getenv("SPOTIFY_CLIENT_ID"),
        "SPOTIFY_CLIENT_SECRET": os.getenv("SPOTIFY_CLIENT_SECRET"),
        "CLOUDINARY_CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "CLOUDINARY_API_KEY": os.getenv("CLOUDINARY_API_KEY"),
        "CLOUDINARY_API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
        "MONGODB_URI": os.getenv("MONGODB_URI"),
        
        # Optional with defaults
        "CLOUDINARY_FOLDER": os.getenv("CLOUDINARY_FOLDER", "vibAura_songs"),
        "MONGODB_DB_NAME": os.getenv("MONGODB_DB_NAME", "VibAura"),
        "MAX_WORKERS": int(os.getenv("MAX_WORKERS", "4")),
        "DOWNLOAD_FOLDER": os.getenv("DOWNLOAD_FOLDER", "downloaded-songs"),
        "SPOTIFY_RATE_LIMIT_DELAY": float(os.getenv("SPOTIFY_RATE_LIMIT_DELAY", "0.1")),
        "MAX_RETRIES": int(os.getenv("MAX_RETRIES", "3")),
        "RETRY_DELAY": int(os.getenv("RETRY_DELAY", "2")),
        "DEBUG": os.getenv("DEBUG", "false").lower() == "true",
    }
    
    info(f"Configuration loaded: {len(config)} settings")
    return config