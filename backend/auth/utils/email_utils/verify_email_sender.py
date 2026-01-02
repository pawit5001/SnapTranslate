# backend/auth/utils/email_utils/verify_email_sender.py

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from dotenv import load_dotenv
import asyncio
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "verify_snaptranslate@outlook.com")

executor = ThreadPoolExecutor()

def send_verification_email_sync(to_email: str, verification_code: str):
    subject = "ยืนยันอีเมลของคุณ - SnapTranslate"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #004aad;">ยืนยันอีเมลของคุณ</h2>
        <p>เรียน ผู้ใช้งาน,</p>
        <p>ขอบคุณที่สมัครใช้งาน SnapTranslate กรุณาใช้รหัสยืนยันอีเมล (Verification Code) ด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
        <p style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 10px; display: inline-block;">{verification_code}</p>
        <p>รหัสนี้จะหมดอายุใน 10 นาที</p>
        <p>หากคุณไม่ได้ร้องขอ กรุณาไม่ต้องดำเนินการใด ๆ</p>
        <hr>
        <p style="font-size: 12px; color: #888;">
          นี่คือข้อความอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้<br>
          &copy; 2025 SnapTranslate. สงวนลิขสิทธิ์
        </p>
      </body>
    </html>
    """

    message = Mail(
        from_email=Email(FROM_EMAIL, "SnapTranslate Support"),
        to_emails=To(to_email),
        subject=subject,
        html_content=Content("text/html", html_content)
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"ส่งอีเมล OTP ({verification_code}) ไปที่ {to_email} สำเร็จ (status {response.status_code})")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน: {e}")
        raise

async def send_verification_email(to_email: str, verification_code: str):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(executor, send_verification_email_sync, to_email, verification_code)
