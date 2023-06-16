from random import choices
from string import ascii_lowercase


def c_print(data: any):
    print("-" * 100)
    print(data)
    print("-" * 100)


def random_str(k: int = 10) -> str:
    return "".join(choices(ascii_lowercase, k=k))


if __name__ == "__main__":
    c_print(random_str(5))
