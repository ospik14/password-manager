import base64

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os




key = AESGCM.generate_key(bit_length=256)
print(key)