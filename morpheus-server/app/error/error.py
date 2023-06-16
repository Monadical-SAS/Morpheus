class ModelLoadError(Exception):
    """
    Error while loading the model: This error occurs when there is a problem loading a model,
    such as an incorrect file format, a missing or corrupted model file, or insufficient system resources.
    To resolve this issue, ensure the model file is in the correct format, verify the model file's integrity,
    and check if your system has enough memory and processing power to load the model.
    """

    def __init__(self, msg=None):
        self.msg = msg if msg else "Something failed when loading the model. Please try again later."

    def __str__(self):
        return self.msg


class OutOfMemoryGPUError(Exception):
    """
    GPU out of memory: The system encountered insufficient GPU memory to perform the requested operation.
    To resolve this issue, consider reducing the model size, lowering the batch size, closing other
    GPU-intensive applications, or using a GPU with more available memory.
    """

    def __init__(self, msg=None):
        user_message = """
        Our image generation server is currently at full capacity and cannot accept new requests at this time.
        Please try again later.
        """
        self.msg = msg if msg else user_message

    def __str__(self):
        return self.msg


class UserNotFoundError(Exception):
    """
    User not found: The specified user could not be located or loaded by the system.
    To resolve this issue, consider verifying the user's email,and ensuring the user exists in the database.
    """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The requested user could not be found."

    def __str__(self):
        return self.msg


class ModelNotFoundError(Exception):
    """
    Model not found: The specified machine learning model could not be located or loaded by the system.
    To resolve this issue, consider verifying the model name, ensuring the model file is present in the
    correct location, and checking if the model file is corrupted or damaged.
    """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The requested model could not be found."

    def __str__(self):
        return self.msg


class ImageNotProvidedError(Exception):
    """
    Image not provided: The system did not receive the required image. To resolve this issue,
    consider ensuring the image is provided in the correct format and that the image is not corrupted or damaged.
    """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The required image was not provided."

    def __str__(self):
        return self.msg


class WorkerNotAvailableError(Exception):
    """
    No worker available: The system could not find any worker to process the task.
    """

    def __init__(self, msg=None):
        self.msg = msg if msg else "No worker available at this moment."

    def __str__(self):
        return self.msg
