import os
import django
from langchain_core.output_parsers import JsonOutputParser
from .request_models import *
from .prompts import *
from .config import InterviewConfig
from .BaseAgent import InterviewManager
# Django setup
# sys.path.append('/home/sathwik/InterXAI-v2/')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class ResumeQuestionGenerator(InterviewManager):
    """Class for extracting information from resumes using LLMs"""
    
    def __init__(self, config: InterviewConfig = None):
        super().__init__(
            config=config,
            prompt=resume_question_generation_prompt,
            output_parser=JsonOutputParser(pydantic_object=ResumeQuestionResponse)
        )
    def evaluate(self, req: questionGenerationRequest) -> ResumeQuestionResponse:
            chain = self.prompt | self.llm | self.output_parser
            result = chain.invoke({
                "extracted_standardized_resume": req.extracted_standardized_resume,
                "job_title": req.job_title,
                "job_description": req.job_description,
                "experience": req.experience,
                "format_instructions": self.output_parser.get_format_instructions()
            })
            if isinstance(result, dict):
                return ResumeQuestionResponse(**result)
            return result
