class GenerationNotFoundError(Exception):
    """ Raised when a generation is not found in the database """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The requested generation could not be found."

    def __str__(self):
        return self.msg
