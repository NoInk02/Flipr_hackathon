import dotenv
import os


# Load environment variables
# Ideally these should be imported from a dotenv file, but we are keeping it here because its a hackathon

class Settings():
    MONGO_URI = "YOUR MONGO HOST HERE"
    MASTER_DB_NAME = 'flipr-hackathon'
    ADMIN_LIST = 'admin_list'
    COMPANY_LIST = 'company_list'
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    JWT_SECRET_KEY = '9fsXWIn4SbNpqrpanTN8NnhfcuaE5dXjP5hlH1jW1WU4Yj76RNIloC7vNWDlOdrr' # Randomly generated, not an issue
    GEMINI_API_KEY = "YOUR GEMINI API KEY"


settings = Settings()