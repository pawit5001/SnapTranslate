from gtts import gTTS
import os

def generate_tts(text, lang_code):
    os.makedirs("tts_cache", exist_ok=True)
    filename = f"{lang_code}_{abs(hash(text))}.mp3"
    path = os.path.join("tts_cache", filename)
    if not os.path.exists(path):
        tts = gTTS(text, lang=lang_code)
        tts.save(path)
    return f"/audio/{filename}"
