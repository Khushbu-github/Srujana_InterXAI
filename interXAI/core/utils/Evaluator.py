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

class Evaluator(InterviewManager):
    """Class to evaluate answer"""
    
    def __init__(self, config: InterviewConfig = None):
            super().__init__(
                config=config,
                prompt=evaluation_prompt,
                output_parser=JsonOutputParser(pydantic_object=EvaluationResult)
            )
    
    
    def evaluate(self, req: EvaluationRequest) -> EvaluationResult:
        """Evaluate the candidate's answer using Groq LLM"""
        
        print("\n🤖 Evaluating your answer using Groq AI...")
        
        # Create fallback result
        fallback_result = EvaluationResult(
            score=5,
            feedback="Could not evaluate automatically due to technical error",
            reasoning="Technical error occurred during AI evaluation"
        )
        
        try:
            # Prepare evaluation prompt
            evaluation_chain = self.prompt | self.llm | self.output_parser

            result = evaluation_chain.invoke({
                "position": req.position,
                "experience": req.experience,
                "conversation_context": req.conversation_context,
                "question": req.question,
                "format_instructions": self.output_parser.get_format_instructions(),
                "expected_answer": req.expected_answer,
            })
            
            # Ensure result is EvaluationResult object
            if isinstance(result, dict):
                result = EvaluationResult(**result)
            
            # Clean up any truncated text in the response
            if hasattr(result, 'feedback') and result.feedback:
                result.feedback = result.feedback.replace('<|header_start|>', '').replace('<|end|>', '').strip()
            
            if hasattr(result, 'reasoning') and result.reasoning:
                result.reasoning = result.reasoning.replace('<|header_start|>', '').replace('<|end|>', '').strip()
            
            # Validate the result has required fields
            if not hasattr(result, 'score') or not hasattr(result, 'feedback') or not hasattr(result, 'reasoning'):
                raise ValueError("Missing required fields in evaluation result")
            
            if not result.feedback or not result.reasoning:
                raise ValueError("Empty feedback or reasoning in evaluation result")
            
            # Ensure score is within valid range
            if not isinstance(result.score, float) or result.score < 0 or result.score > 10:
                print(f"Warning: Invalid score {result.score}, using fallback")
                result.score = 5
            
            # Display feedback with proper formatting
            print(f"\n📊 Evaluation Results:")
            print(f"Score: {result.score}/10")
            print(f"Feedback: {result.feedback}")
            print(f"Reasoning: {result.reasoning}")
            
        except Exception as e:
            print(f"Error during evaluation: {e}")
            print("Using fallback evaluation...")
            
            
            # Display fallback results
            print(f"\n📊 Fallback Evaluation Results:")
            print(f"Score: {fallback_result.score}/10")
            print(f"Feedback: {fallback_result.feedback}")
            print(f"Reasoning: {fallback_result.reasoning}")
        
        return EvaluationResult(
            score=result.score if hasattr(result, 'score') else fallback_result.score,
            feedback=result.feedback if hasattr(result, 'feedback') else fallback_result.feedback,
            reasoning=result.reasoning if hasattr(result, 'reasoning') else fallback_result.reasoning
        )