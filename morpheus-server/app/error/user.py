class UserNotFoundError(Exception):
    """ Raised when a user is not found in the database """

    def __init__(self, msg=None):
        self.msg = msg if msg else "The requested user could not be found."

    def __str__(self):
        return self.msg
