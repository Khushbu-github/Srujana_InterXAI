from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class EvaluationResult(BaseModel):
    score: float = Field(description="Score from 1-10 for the answer")
    feedback: str = Field(description="Detailed feedback on the answer")
    reasoning: str = Field(description="Explanation of the evaluation")
class FollowUpDecision(BaseModel):
    needs_followup: bool = Field(description="Whether a follow-up question is needed")
    followup_question: Optional[str] = Field(
        default=None, description="The follow-up question to ask if needed"
    )
class FollowUpRequest(BaseModel):
    position: str = Field(description="Position for which the interview is being conducted")
    experience: str = Field(description="Required experience level for the position")
    # question: str = Field(description="The main question asked to the candidate")
    expected_answer: str = Field(description="The expected answer for the question")
    conversation_context: List[str] = Field(description="The context for the follow-up question")

class FinalEvaluationRequest(BaseModel):
    position: str = Field(description="Position for which the interview is being conducted")
    experience: str = Field(description="Required experience level for the position")
    interview_history: List[Dict[str, Any]] = Field(
        description="Complete interview history including questions, answers, scores, and feedback"
    )

class FinalEvaluationResponse(BaseModel):
    overall_score: float = Field(description="Overall score from 1-10 for the interview")
    overall_feedback: str = Field(description="Comprehensive feedback on the candidate's performance")
    strengths: str = Field(description="Key strengths observed during the interview")
    recommendation: str = Field(
        description="Final recommendation based on the interview performance (HIRE/REJECT/FURTHER_EVALUATION)"
    )
class EvaluationRequest(BaseModel):
    position: str = Field(description="Position for which the interview is being conducted")
    experience: str = Field(description="Required experience level for the position")
    question: str = Field(description="The intial question asked to the candidate if there are more questions in the conversation History then they were follow up questions because the candidates response was not satisfied")
    conversation_context: List[str] = Field(description="The context for the follow-up question")
    expected_answer: str = Field(description="The expected answer for the question")
class resumeExtractionRequest(BaseModel):
    resume_text: str = Field(description="The text content of the resume extracted")
    job_title : str = Field(description="The job title for which the resume is being extracted")
    job_description: str = Field(description="The job description for the position")
    experience: int = Field(description="The experience level required for the position")

class resumeExtractionResponse(BaseModel):
    extracted_standardized_resume: str = Field(description="The standardized resume extracted from the resume text")
    score: float = Field(description="The score of the extracted resume based on the job description")
    shortlisting_decision: bool = Field(
        description="Decision on whether to shortlist the candidate based on the extracted resume and job description"
    )
    feedback: str = Field(description="Feedback on the extracted resume")
class questionGenerationRequest(BaseModel):
    extracted_standardized_resume: str = Field(description="The standardized resume extracted from the resume text")
    job_title : str = Field(description="The job title for which the resume is being extracted")
    job_description: str = Field(description="The job description for the position")
    experience: int = Field(description="The experience level required for the position") 

class ResumeQuestionResponse(BaseModel):
    extractedQAndA: List[str] = Field(description="List containing alternating questions and answers (Q1, A1, Q2, A2, etc.)")
