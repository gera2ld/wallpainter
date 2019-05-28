import logging

logging.basicConfig(format='[server] %(levelname)s: %(message)s')
logger = logging.getLogger(__package__)
logger.setLevel(logging.INFO)
