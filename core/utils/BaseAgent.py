from abc import ABC, abstractmethod
import os
import django
from typing import Any
from django.conf import settings
from langchain_groq import ChatGroq
from .request_models import *
from .prompts import *
from .config import InterviewConfig
# Django setup
# sys.path.append('/home/sathwik/InterXAI-v2/')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class InterviewManager(ABC):
    """Main class for managing interview sessions"""

    def __init__(self, config: InterviewConfig = None,prompt=None,output_parser=None):
        self.config = config or InterviewConfig()
        
        groq_api_key = settings.GROQ_API_KEY 
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable must be set or passed in config")
        
        # Initialize ChatGroq 
        self.llm = ChatGroq(
            model=self.config.llm_model,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            groq_api_key=groq_api_key
        )
        self.output_parser = output_parser
        self.prompt = prompt
    @abstractmethod
    def evaluate(self, req: Any) -> Any:
        """
        Subclasses must implement this method.
        """
        pass
    
