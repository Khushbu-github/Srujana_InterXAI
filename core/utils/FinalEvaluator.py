import json
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

class FinalEvaluator(InterviewManager):
    """Class for Final evaluation of the interview"""
    
    def __init__(self, config: InterviewConfig = None):
        super().__init__(
            config=config,
            prompt=final_evaluation_prompt,
            output_parser=JsonOutputParser(pydantic_object=FinalEvaluationResponse)
        )
        
    
    def evaluate(self, req: FinalEvaluationRequest) -> FinalEvaluationResponse:
        """
        Provides final evaluation of complete interview session
        """
        
        evaluation_chain = self.prompt | self.llm | self.output_parser
        result = evaluation_chain.invoke({
            "position": req.position,
            "experience": req.experience,
            "interview_history": json.dumps(req.interview_history, indent=2),
            "format_instructions": self.output_parser.get_format_instructions()
        })
        
        return FinalEvaluationResponse(
            overall_score=result["overall_score"],
            overall_feedback=result["overall_feedback"],
            strengths=result["strengths"],
            recommendation=result["recommendation"]
        )
    