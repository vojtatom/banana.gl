
from passlib.context import CryptContext
from secrets import token_bytes
import binascii


class UserAuthenticator:
    def __init__(self, path: str):
        #TODO
        self.user_dir = fs.user_dir(workspace_path)
        self.config = fs.read_json(fs.security_config(workspace_path))
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    @staticmethod
    def generate(workspace_path: str):
        config = fs.security_config(workspace_path)
        fs.write_json(config, {
            'secret': binascii.hexlify(token_bytes(32)).decode("ascii")
        })

    def get_user(self, username):
        file = fs.user_file(self.user_dir, username)
        if fs.file_exists(file):
            return fs.read_json(file)
        return None

    @property
    def secret(self):
        return self.config['secret']

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_user(self, username, fullname, password, email):
        file = fs.user_file(self.user_dir, username)
        if fs.file_exists(file):
            raise Exception("User already exists")

        user = {
            'username': username,
            'full_name': fullname,
            'password': self.get_password_hash(password),
            'email': email
        }
        fs.write_json(file, user)

    def verify_user(self, username, password):
        user = self.get_user(username)
        if not user:
            return None
        if not self.verify_password(password, user['password']):
            return None
        return user
