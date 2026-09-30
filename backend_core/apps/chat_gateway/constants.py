"""
Constants that mirror the AI Service API contract (API.md, v1).
Section numbers in comments refer to that document.
"""

# ── Triage levels (§4.6, §5) ───────────────────────────────────────────
UNKNOWN = "unknown"
OUT_OF_SCOPE = "out_of_scope"
LOW_PRIORITY = "low_priority"
HIGH_PRIORITY = "high_priority"
URGENT = "urgent"

TRIAGE_LEVELS = [UNKNOWN, OUT_OF_SCOPE, LOW_PRIORITY, HIGH_PRIORITY, URGENT]

# Severity order (§5.1): low_priority < high_priority < urgent.
# unknown / out_of_scope are not part of the ladder.
SEVERITY = {LOW_PRIORITY: 1, HIGH_PRIORITY: 2, URGENT: 3}

# Levels that have a backend action and therefore always carry a summary (§4.6).
ACTIONABLE_LEVELS = [LOW_PRIORITY, HIGH_PRIORITY, URGENT]

# ── Request limits (§4.2, §4.3, §4.4) ──────────────────────────────────
MESSAGE_MIN_LENGTH = 1
MESSAGE_MAX_LENGTH = 4000
HISTORY_MAX_ITEMS = 100
PATIENT_NAME_MAX_LENGTH = 100
PATIENT_AGE_MIN = 0
PATIENT_AGE_MAX = 120
