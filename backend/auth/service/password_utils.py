import re

def validate_password(pw: str) -> bool:
    lengthCheck = len(pw) >= 8
    numberCheck = bool(re.search(r"[0-9]", pw))
    lowerCheck = bool(re.search(r"[a-z]", pw))
    upperCheck = bool(re.search(r"[A-Z]", pw))
    specialCheck = bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", pw))
    return lengthCheck and numberCheck and lowerCheck and upperCheck and specialCheck
