class GenerationNotFoundError(Exception):
    """ Raised when a generation is not found in the database """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The requested generation could not be found."

    def __str__(self):
        return self.msg


class RayCapacityExceededError(Exception):
    """ Raised when the Ray backend is at full capacity """

    def __init__(self, msg=None):
        self.msg = (
            msg
            if msg
            else "There is no capacity at the moment. Please try again later."
        )

    def __str__(self):
        return self.msg
