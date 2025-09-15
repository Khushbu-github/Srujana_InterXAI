import json
import os
import sys
import django
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TypedDict
from dataclasses import dataclass
from django.conf import settings
# LangChain and LangGraph imports
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field
from .request_models import *
from .prompts import *
from .config import InterviewConfig
# Django setup
# sys.path.append('/home/sathwik/InterXAI-v2/')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class InterviewManager:
    """Main class for managing interview sessions"""
    
    def __init__(self, config: InterviewConfig = None):
        self.config = config or InterviewConfig()
        
        # Setup Groq API key
        groq_api_key = settings.GROQ_API_KEY 
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable must be set or passed in config")
        
        # Initialize ChatGroq instead of Ollama
        self.llm = ChatGroq(
            model=self.config.llm_model,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            groq_api_key=groq_api_key
        )
        self.EvaluationParser = JsonOutputParser(pydantic_object=EvaluationResult)
        self.FollowUpParser = JsonOutputParser(pydantic_object=FollowUpDecision)
        self.FinalEvaluationParser = JsonOutputParser(pydantic_object=FinalEvaluationResponse)
        self.resumeExtractionRequest = JsonOutputParser(pydantic_object=resumeExtractionRequest)
        self.resumeExtractionResponse = JsonOutputParser(pydantic_object=resumeExtractionResponse)
        self.setup_prompts()
    
    def setup_prompts(self):
        """Setup LangChain prompts for different interview stages"""
        self.final_evaluation_prompt = evaluation_prompt
        self.follow_up_decider = follow_up_decider
        self.context_prompt = context_prompt
        self.resume_extraction_prompt = resume_extraction_prompt

    
    def final_evaluate_interview(self, req: FinalEvaluationRequest) -> FinalEvaluationResponse:
        """
        Provides final evaluation of complete interview session
        """
        
        evaluation_chain = self.final_evaluation_prompt | self.llm | self.FinalEvaluationParser
        result = evaluation_chain.invoke({
            "position": req.position,
            "experience": req.experience,
            "interview_history": json.dumps(req.interview_history, indent=2),
            "format_instructions": self.FinalEvaluationParser.get_format_instructions()
        })
        
        return FinalEvaluationResponse(
            overall_score=result["overall_score"],
            overall_feedback=result["overall_feedback"],
            strengths=result["strengths"],
            recommendation=result["recommendation"]
        )
    def resume_extraction(self, req: resumeExtractionRequest) -> resumeExtractionResponse:
        """
        Extracts structured information from the candidate's resume
        """
        extraction_chain = self.resume_extraction_prompt | self.llm | self.resumeExtractionResponse
        result = extraction_chain.invoke({
            "resume_text": req.resume_text,
            "job_title": req.job_title,
            "job_description": req.job_description,
            "experience": req.experience,
            "format_instructions": self.resumeExtractionResponse.get_format_instructions()
        })
        print(result)
        return resumeExtractionResponse(
            extracted_standardized_resume=result["extracted_standardized_resume"],
            score=result.get("score", 0),
            shortlisting_decision=result.get("shortlisting_decision", "Reject"),
            feedback=result.get("feedback", "No feedback provided")
        )
    
    def follow_up_decider_node(self, req: FollowUpRequest) -> FollowUpDecision:
        """Decide whether a follow-up question is needed based on the candidate's answer"""
        
        print("\n🤖 Evaluating your answer using Groq AI...")
        
        # Create fallback result
        fallback_result = FollowUpDecision(
            needs_followup=False,
            followup_question=None
        )
        
        try:
            # Prepare evaluation prompt
            follow_up_chain = self.follow_up_decider | self.llm | self.FollowUpParser

            result = follow_up_chain.invoke({
                "position": req.position,
                "experience": req.experience,
                "conversation_context": req.conversation_context,
                "format_instructions": self.FollowUpParser.get_format_instructions(),
                "expected_answer": req.expected_answer,
            })

            # Ensure result is FollowUpDecision object
            if isinstance(result, dict):
                result = FollowUpDecision(**result)
            
        except Exception as e:
            print(f"Error during follow up decision: {e}")
            print("Using fallback decision...")

            # Display fallback results
            print(f"\n📊 Fallback Follow Up Decision Results:")
            print(f"Needs Follow Up: {fallback_result.needs_followup}")
            print(f"Follow Up Question: {fallback_result.followup_question}")
        
        return FollowUpDecision(
            needs_followup=result.needs_followup if hasattr(result, 'needs_followup') else fallback_result.needs_followup,
            followup_question=result.followup_question if hasattr(result, 'followup_question') else fallback_result.followup_question
        )
    def evaluate_answer(self, req: EvaluationRequest) -> EvaluationResult:
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
            evaluation_chain = self.evaluation_prompt | self.llm | self.EvaluationParser

            result = evaluation_chain.invoke({
                "position": req.position,
                "experience": req.experience,
                "conversation_context": req.conversation_context,
                "question": req.question,
                "format_instructions": self.EvaluationParser.get_format_instructions(),
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