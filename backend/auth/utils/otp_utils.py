import random

def generate_otp(length: int = 6) -> str:
    """
    สร้าง OTP รหัสตัวเลขความยาวตามที่กำหนด (default 6 หลัก)
    คืนค่าเป็นสตริง
    """
    digits = "0123456789"
    otp = "".join(random.choice(digits) for _ in range(length))
    return otp
