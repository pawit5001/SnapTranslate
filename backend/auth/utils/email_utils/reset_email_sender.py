# backend/auth/utils/email_utils/reset_email_sender.py

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from dotenv import load_dotenv
import asyncio
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_RESET_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL_RESET", "reset_snaptranslate@outlook.com")

executor = ThreadPoolExecutor()

def send_reset_email_sync(to_email: str, otp_code: str):
    subject = "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #004aad;">การรีเซ็ตรหัสผ่าน</h2>
        <p>เรียน ผู้ใช้งาน,</p>
        <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านของคุณ กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อดำเนินการต่อ:</p>
        <p style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 10px; display: inline-block;">{otp_code}</p>
        <p>รหัส OTP นี้จะหมดอายุใน 10 นาที</p>
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
        print(f"ส่งอีเมล OTP ไปที่ {to_email} สำเร็จ (status {response.status_code})")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการส่งอีเมล: {e}")
        raise

async def send_reset_email(to_email: str, otp_code: str):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(executor, send_reset_email_sync, to_email, otp_code)
