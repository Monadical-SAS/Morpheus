import json
import logging

import requests
from firebase_admin import auth

from app.config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)


class FirebaseRepository:
    def __init__(self):
        self.auth = auth
        self.FIREBASE_WEB_API_KEY = settings.firebase_web_api_key
        self.rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

    def register_firebase_user(self, *, email, password) -> any:
        try:
            user = self.auth.create_user(
                email=email,
                password=password,
            )
            return user
        except Exception as e:
            logger.error(e)
            return None

    def get_firebase_user(self, *, email) -> any:
        try:
            user = self.auth.get_user_by_email(email)
            return user
        except Exception as e:
            logger.error(e)
            return None

    def remove_firebase_user(self, *, email) -> bool:
        try:
            user = self.auth.get_user_by_email(email)
            self.auth.delete_user(user.uid)
            return True
        except Exception as e:
            logger.error(e)
            return False

    async def sign_in_with_email_and_password(self, email: str = None, password: str = None):
        payload = json.dumps({"email": email, "password": password, "returnSecureToken": True})

        response = requests.post(self.rest_api_url, params={"key": self.FIREBASE_WEB_API_KEY}, data=payload)
        return response.json()
