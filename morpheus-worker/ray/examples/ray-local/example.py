import ray
import os

@ray.remote
def example():
	message = "This is a test"
	return message

ray.init()
print(ray.get(example.remote()))
print(os.getenv('PROMPT', "NA"))
