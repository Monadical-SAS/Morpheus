from typing import List

from sqlalchemy.orm import Session

from app.models.models import User, Prompt
from app.models.schemas import Prompt as PromptCreate


class PromptRepository:
    @classmethod
    def get_prompt(cls, *, db: Session, prompt_id: str) -> Prompt:
        return db.query(Prompt).filter(Prompt.id == prompt_id).first()

    @classmethod
    def get_prompts_by_owner(cls, *, db: Session, owner_id: str, skip: int = 0, limit: int = 100) -> List[Prompt]:
        return db.query(Prompt).filter(Prompt.owner_id == owner_id).offset(skip).limit(limit).all()

    @classmethod
    def get_or_create_prompt(cls, *, db: Session, prompt: PromptCreate, owner: User) -> Prompt:
        db_prompt = db.query(Prompt).filter(Prompt.owner_id == owner.id, Prompt.prompt == prompt.prompt).first()
        if db_prompt:
            return db_prompt
        return cls.create_prompt(db=db, prompt=prompt, owner=owner)

    @classmethod
    def create_prompt(cls, *, db: Session, prompt: PromptCreate, owner: User) -> Prompt:
        db_prompt = Prompt(
            prompt=prompt.prompt,
            model=prompt.model,
            sampler=prompt.sampler,
            negative_prompt=prompt.negative_prompt,
            width=prompt.width,
            height=prompt.height,
            num_inference_steps=prompt.num_inference_steps,
            guidance_scale=prompt.guidance_scale,
            num_images_per_prompt=prompt.num_images_per_prompt,
            generator=prompt.generator,
            strength=prompt.strength,
            owner_id=owner.id,
        )
        db.add(db_prompt)
        db.commit()
        return db_prompt
