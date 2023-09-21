import random
import uuid

from app.settings.settings import get_settings

settings = get_settings()

PROMPTS = [
    "a beautiful cat with blue eyes, artwork, fujicolor, trending on artstation",
    "An astronaut cycling on the moon, Abstract Expressionism",
    "A Man looking at the Starry Sky by Vincent Van Gogh",
    "A giant panda in between a celestial war by Anna Dittmann, trending on artstation",
    "A stag standing on top of the world, Pencil drawing",
    "A landscape view of a river from a forest cave, Classicism painting",
    "A war scene from the ancient times",
    "A person transported to another world through a wormhole",
    "A futuristic landscape of a city",
    "A photographic image of a village in Japan",
    "A Beautiful landscaping drawings from an anime",
    "A huge road in between mountains with a futuristic automobile",
    "A Greek Statue made from clay, Renaissance style",
]


def generate_random_prompt():
    size = random.choice([480, 512, 768, 1024])
    return {
        "task_id": str(uuid.uuid4()),
        "prompt": random.choice(PROMPTS),
        "negative_prompt": "bad, low res, ugly, deformed",
        "width": size,
        "height": size,
        "num_inference_steps": random.randint(10, 150),
        "guidance_scale": random.randint(5, 20),
        "num_images_per_prompt": random.randint(1, 4),
        "generator": -1,
        "strength": 0.75,
        "pipeline": settings.default_pipeline,
        "scheduler": settings.default_scheduler,
        "model_id": settings.default_model,
        "user_id": "ray@morpheus.com",
    }
