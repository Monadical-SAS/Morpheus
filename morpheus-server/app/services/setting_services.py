from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.schemas import Setting, SettingCreate
from app.repository.setting_repository import SettingRepository


class SettingService:
    def __init__(self):
        self.setting_repository = SettingRepository()

    async def create_setting(self, *, db: Session, setting: SettingCreate) -> Setting:
        return self.setting_repository.create_setting(db=db, setting=setting)

    async def get_settings(self, *, db: Session) -> List[Setting]:
        return self.setting_repository.get_settings(db=db)

    async def get_setting_by_id(self, *, db: Session, setting_id: UUID) -> Setting:
        return self.setting_repository.get_setting_by_id(db=db, setting_id=setting_id)

    async def get_setting_by_key(self, *, db: Session, setting_key: str) -> Setting:
        return self.setting_repository.get_setting_by_key(db=db, setting_key=setting_key)

    async def update_setting(self, *, db: Session, setting: SettingCreate) -> Setting:
        return self.setting_repository.update_setting(db=db, setting=setting)

    async def delete_setting_by_key(self, *, db: Session, setting_key: str) -> Setting:
        return self.setting_repository.delete_setting_by_key(db=db, setting_key=setting_key)