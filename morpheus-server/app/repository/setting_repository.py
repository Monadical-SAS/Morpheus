from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Setting
from app.models.schemas import SettingCreate


class SettingRepository:

    @classmethod
    def create_model(cls, *, db: Session, setting: SettingCreate) -> Setting:
        setting = Setting(
            key=setting.key,
            value=setting.value,
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting
    
    @classmethod
    def get_setting_by_id(cls, *, db: Session, setting_id: UUID) -> Setting:
        return db.query(Setting).filter(Setting.id == setting_id, Setting.is_active).first()
    
    @classmethod
    def get_setting_by_key(cls, *, db: Session, setting_key: UUID) -> Setting:
        return db.query(Setting).filter(Setting.id == setting_key, Setting.is_active).first()

    @classmethod
    def update_setting(cls, *, db: Session, setting: SettingCreate) -> Setting:
        query = db.query(Setting).filter(Setting.source == setting.source)
        query.update(setting.dict(), synchronize_session="fetch")
        db.commit()
        return query.first()

    @classmethod
    def delete_setting(cls, *, db: Session, setting_id: UUID) -> bool:
        setting = SettingRepository.get_setting_by_id(db=db, setting_id=setting_id)
        if not setting:
            return True

        db.delete(setting)  # Physical deletion
        db.commit()
        return True

    @classmethod
    def delete_setting_by_key(cls, *, db: Session, setting_key: str) -> Setting:
        print(f"{setting_key=}")
        record = cls.get_setting_by_key(db=db, setting_key=setting_key)
        db.delete(record)
        db.commit()
        return record