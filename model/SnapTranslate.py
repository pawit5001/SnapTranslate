from googletrans import Translator

def translate_text(text, target_lang):
    translator = Translator()
    result = translator.translate(text, dest=target_lang)
    return result.text

if __name__ == "__main__":
    text = "Hello world"
    target_lang = "th"  # รหัสภาษาไทย
    translated = translate_text(text, target_lang)
    print(f'Original: {text}')
    print(f'Translated: {translated}')
