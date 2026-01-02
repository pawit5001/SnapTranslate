import os
import requests
import asyncio
from dotenv import load_dotenv
from deep_translator import GoogleTranslator

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_NAME = "stabilityai/stable-diffusion-xl-base-1.0"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

def translate_to_english(text: str) -> str:
    return GoogleTranslator(source='auto', target='en').translate(text)

def sync_generate_image_from_text(prompt: str) -> bytes:
    api_url = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"
    payload = {"inputs": prompt}
    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"HuggingFace API Error: {response.status_code} - {response.text}")
    return response.content

async def generate_image_from_text(user_prompt: str) -> str:
    try:
        prompt_en = translate_to_english(user_prompt)
        image_bytes = await asyncio.to_thread(sync_generate_image_from_text, prompt_en)

        os.makedirs("output", exist_ok=True)
        output_path = "output/generated.png"
        with open(output_path, "wb") as f:
            f.write(image_bytes)

        return output_path
    except Exception as e:
        print("Error in generate_image_from_text:", e)
        raise e
