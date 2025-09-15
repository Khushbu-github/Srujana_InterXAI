from typing import Any, Dict, List, Optional, TypedDict
from dataclasses import dataclass

@dataclass
class InterviewConfig:
    """Configuration for the interview session"""
    max_followups: int = 3
    min_score_threshold: int = 6
    llm_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    temperature: float = 0.7
    max_tokens: int = 2000
    groq_api_key: Optional[str] = None
