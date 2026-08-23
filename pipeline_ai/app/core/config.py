import os

class Settings:
    PROJECT_NAME: str = "SmartCart AI Engine Pipeline"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base paths
    APP_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BASE_DIR: str = os.path.dirname(APP_DIR)
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    INTENT_MODEL_PATH: str = os.path.join(MODELS_DIR, "intent_model.tflite")
    
    # ViText2SQL Data
    VITEXT2SQL_DIR: str = os.path.join(DATA_DIR, "vitext2sql")
    VITEXT2SQL_DATA_DIR: str = os.path.join(VITEXT2SQL_DIR, "syllable-level")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgres://postgres:123@localhost:5432/csmart_db")

settings = Settings()
