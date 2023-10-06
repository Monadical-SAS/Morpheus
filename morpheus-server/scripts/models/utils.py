from omegaconf import OmegaConf


def load_config_from_file(filename):
    return OmegaConf.load(filename)
