# Here is a bcrypt security feature. We will hash every user password and then validate it. Edge cases are handled
# Import the dependencies to be used in the password hashing
import bcrypt

def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt.

    Args:
        password (str): The plain text password to hash.

    Returns:
        str: The hashed password.
    """
    # Ensure password is not empty or whitespace
    if not password.strip():
        raise RuntimeError("Password cannot be empty or whitespace")
    
    # Generate a salt and hash the password
    try:
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except ValueError as ve:
        # Handle specific ValueError exceptions if needed
        raise RuntimeError("Invalid value provided for password hashing") from ve
    except Exception as e:
        # Handle any other unexpected exceptions
        raise RuntimeError("An error occurred while hashing the password") from e
    
def verify_password(password: str, hashed: str) -> bool:
    """
    Checks if a plain text password matches a hashed password.

    Args:
        password (str): The plain text password to check.
        hashed (str): The hashed password to compare against.

    Returns:
        bool: True if the passwords match, False otherwise.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))