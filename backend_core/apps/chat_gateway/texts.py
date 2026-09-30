"""
Fixed, backend-owned patient-facing texts. The clinic owns the wording (API.md §7.3).

The AI Service never produces booking codes, dates or booking confirmations (§5.2 rule 5).
"""
from django.conf import settings

# §7.3: the fallback MUST say the assistant is temporarily unavailable, give the clinic's
# phone number, and tell the patient to contact emergency services in an emergency.
FALLBACK_EN = (
    "The assistant is temporarily unavailable. Please call the clinic at {phone}. "
    "If this is an emergency, contact emergency services right away."
)
FALLBACK_FA = (
    "دستیار به‌طور موقت در دسترس نیست. لطفاً با کلینیک به شماره {phone} تماس بگیرید. "
    "در صورت اورژانسی بودن، بلافاصله با اورژانس تماس بگیرید."
)

def is_farsi(text: str) -> bool:
    return any("\u0600" <= ch <= "\u06FF" for ch in text)


def fallback_message(patient_text: str) -> str:
    template = FALLBACK_FA if is_farsi(patient_text) else FALLBACK_EN
    return template.format(phone=settings.CLINIC_PHONE_NUMBER)
