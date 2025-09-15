# import os
# import django
# from langchain_core.output_parsers import JsonOutputParser
# from .request_models import *
# from .prompts import *
# from .config import InterviewConfig
# from .BaseAgent import InterviewManager
# import logging
# from groq import InternalServerError
# from requests.exceptions import RequestException
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)
# # Django setup
# # sys.path.append('/home/sathwik/InterXAI-v2/')
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
# django.setup()

# class FollowUpDecider(InterviewManager):
#     """Class to decide check whether to find follow up or not"""
    
#     def __init__(self, config: InterviewConfig = None):
#         super().__init__(
#             config=config,
#             prompt=follow_up_decider,
#             output_parser=JsonOutputParser(pydantic_object=FollowUpDecision)
#         )
#         self.max_retries = 3
#     def evaluate(self, req: FollowUpRequest) -> FollowUpDecision:
#         """Decide whether a follow-up question is needed based on the candidate's answer"""
        
#         try:
#             logger.info("🔍 Starting follow-up evaluation...")
            
#             # Validate input
#             if not self._validate_input(req):
#                 return self._create_fallback_decision("Invalid input")
            
#             # Log input request details
#             logger.info(f"📥 Input - Position: {req.position}, Experience: {req.experience}")
#             logger.debug(f"Conversation Context: {req.conversation_context}")
#             logger.debug(f"Expected Answer: {req.expected_answer[:100]}...")
            
#             # Prepare input for LLM
#             format_instructions = self.output_parser.get_format_instructions()
#             llm_input = {
#                 "position": req.position,
#                 "experience": req.experience,
#                 "conversation_context": req.conversation_context,
#                 "format_instructions": format_instructions,
#                 "expected_answer": req.expected_answer,
#             }
            
#             logger.info("🚀 Invoking follow-up chain...")
            
#             # Create the chain
#             follow_up_chain = self.prompt | self.llm | self.output_parser
            
#             # Execute with retry logic
#             result = self._retry_with_backoff(follow_up_chain.invoke, llm_input)
            
#             logger.info("✅ Successfully received result from follow-up chain")
#             logger.debug(f"Raw result: {result}")
            
#             # Convert to FollowUpDecision if necessary
#             if isinstance(result, dict):
#                 result = FollowUpDecision(**result)
#             elif not isinstance(result, FollowUpDecision):
#                 logger.warning(f"Unexpected result type: {type(result)}")
#                 return self._create_fallback_decision("Unexpected result type")
            
#             # Log the final parsed result
#             logger.info(f"📊 Final Decision - Needs Follow Up: {result.needs_followup}")
#             if result.followup_question:
#                 logger.info(f"Follow Up Question: {result.followup_question}")
            
#             return result
            
#         except InternalServerError as e:
#             logger.error(f"❌ Groq API Internal Server Error: {e}")
#             return self._create_fallback_decision("Groq API error")
        
#         except RequestException as e:
#             logger.error(f"❌ Network/Request Error: {e}")
#             return self._create_fallback_decision("Network error")
        
#         except Exception as e:
#             logger.error(f"❌ Unexpected error during follow-up decision: {e}")
#             logger.debug("Full traceback:", exc_info=True)
#             return self._create_fallback_decision("Unexpected error")
        
#     def _validate_input(self, req: FollowUpRequest) -> bool:
#         """Validate input request"""
#         try:
#             if not req.position or not req.experience:
#                 logger.warning("Missing required fields: position or experience")
#                 return False
            
#             if not req.conversation_context or len(req.conversation_context) == 0:
#                 logger.warning("Empty conversation context")
#                 return False
            
#             if not req.expected_answer:
#                 logger.warning("Missing expected answer")
#                 return False
            
#             return True
#         except Exception as e:
#             logger.error(f"Input validation error: {e}")
#             return False
    
#     def _create_fallback_decision(self, reason: str = "Error occurred") -> FollowUpDecision:
#         """Create a safe fallback decision"""
#         logger.info(f"Creating fallback decision: {reason}")
#         return FollowUpDecision(
#             needs_followup=False,
#             followup_question=None
#         )
    
#     def _retry_with_backoff(self, func, *args, **kwargs):
#         """Retry function with exponential backoff"""
#         for attempt in range(self.max_retries):
#             try:
#                 return func(*args, **kwargs)
#             except (InternalServerError, RequestException, Exception) as e:
#                 if attempt == self.max_retries - 1:
#                     logger.error(f"All retry attempts failed. Last error: {e}")
#                     raise
                
#                 wait_time = self.retry_delay * (2 ** attempt)
#                 logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s...")
#                 time.sleep(wait_time)


import os
import django
import time
import logging
from typing import Optional
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from groq import InternalServerError
from requests.exceptions import RequestException
from .prompts import follow_up_decider
from .request_models import *
from .BaseAgent import *
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class FollowUpDecider(InterviewManager):
    """Enhanced class to decide check whether to find follow up or not with better error handling"""
    
    def __init__(self, config=None):
        super().__init__(
            config=config,
            prompt=follow_up_decider,
           output_parser=JsonOutputParser(pydantic_object=FollowUpDecision)
       )
        self.max_retries = 3
        self.retry_delay = 1  # seconds
    
    
    def _validate_input(self, req: FollowUpRequest) -> bool:
        """Validate input request"""
        try:
            if not req.position or not req.experience:
                logger.warning("Missing required fields: position or experience")
                return False
            
            if not req.conversation_context or len(req.conversation_context) == 0:
                logger.warning("Empty conversation context")
                return False
            
            if not req.expected_answer:
                logger.warning("Missing expected answer")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Input validation error: {e}")
            return False
    
    def _create_fallback_decision(self, reason: str = "Error occurred") -> FollowUpDecision:
        """Create a safe fallback decision"""
        logger.info(f"Creating fallback decision: {reason}")
        return FollowUpDecision(
            needs_followup=False,
            followup_question=None
        )
    
    def _retry_with_backoff(self, func, *args, **kwargs):
        """Retry function with exponential backoff"""
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except (InternalServerError, RequestException, Exception) as e:
                if attempt == self.max_retries - 1:
                    logger.error(f"All retry attempts failed. Last error: {e}")
                    raise
                
                wait_time = self.retry_delay * (2 ** attempt)
                logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s...")
                time.sleep(wait_time)
    
    def evaluate(self, req: FollowUpRequest) -> FollowUpDecision:
        """Decide whether a follow-up question is needed based on the candidate's answer"""
        
        try:
            logger.info("🔍 Starting follow-up evaluation...")
            
            # Validate input
            if not self._validate_input(req):
                return self._create_fallback_decision("Invalid input")
            
            # Log input request details
            logger.info(f"📥 Input - Position: {req.position}, Experience: {req.experience}")
            logger.debug(f"Conversation Context: {req.conversation_context}")
            logger.debug(f"Expected Answer: {req.expected_answer[:100]}...")
            
            # Prepare input for LLM (removed format_instructions to avoid schema pollution)
            llm_input = {
                "position": req.position,
                "experience": req.experience,
                "conversation_context": req.conversation_context,
                "expected_answer": req.expected_answer,
            }
            
            logger.info("🚀 Invoking follow-up chain...")
            
            # Create the chain
            follow_up_chain = self.prompt | self.llm | self.output_parser
            
            # Execute with retry logic
            result = self._retry_with_backoff(follow_up_chain.invoke, llm_input)
            
            logger.info("✅ Successfully received result from follow-up chain")
            logger.debug(f"Raw result: {result}")
            
            # Handle malformed responses (common LLM issue)
            result = self._parse_llm_response(result)
            
            # Convert to FollowUpDecision if necessary
            if isinstance(result, dict):
                # Clean the dict in case it has wrapped structure
                cleaned_result = self._clean_response_dict(result)
                result = FollowUpDecision(**cleaned_result)
            elif not isinstance(result, FollowUpDecision):
                logger.warning(f"Unexpected result type: {type(result)}")
                return self._create_fallback_decision("Unexpected result type")
            
            # Log the final parsed result
            logger.info(f"📊 Final Decision - Needs Follow Up: {result.needs_followup}")
            if result.followup_question:
                logger.info(f"Follow Up Question: {result.followup_question}")
            
            return result
            
        except InternalServerError as e:
            logger.error(f"❌ Groq API Internal Server Error: {e}")
            return self._create_fallback_decision("Groq API error")
        
        except RequestException as e:
            logger.error(f"❌ Network/Request Error: {e}")
            return self._create_fallback_decision("Network error")
        
        except Exception as e:
            logger.error(f"❌ Unexpected error during follow-up decision: {e}")
            logger.debug("Full traceback:", exc_info=True)
            return self._create_fallback_decision("Unexpected error")
    
    def _clean_response_dict(self, response: dict) -> dict:
        """Clean malformed response dict that might have schema wrapper"""
        if "properties" in response and isinstance(response["properties"], dict):
            # LLM included schema structure, extract the actual data
            logger.warning("Detected schema wrapper in response, extracting actual data")
            properties = response["properties"]
            
            # Extract needs_followup
            needs_followup = None
            if "needs_followup" in properties:
                needs_followup_data = properties["needs_followup"]
                if isinstance(needs_followup_data, dict) and "default" in needs_followup_data:
                    needs_followup = needs_followup_data["default"]
                elif isinstance(needs_followup_data, bool):
                    needs_followup = needs_followup_data
                else:
                    needs_followup = False
            
            # Extract followup_question
            followup_question = None
            if "followup_question" in properties:
                question_data = properties["followup_question"]
                if isinstance(question_data, dict) and "default" in question_data:
                    followup_question = question_data["default"]
                elif isinstance(question_data, str):
                    followup_question = question_data
            
            return {
                "needs_followup": needs_followup if needs_followup is not None else False,
                "followup_question": followup_question
            }
        
        # Response is already in correct format
        return response
    
    def _parse_llm_response(self, result) -> dict:
        """Parse and clean LLM response"""
        if isinstance(result, str):
            try:
                import json
                result = json.loads(result)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON string: {e}")
                raise ValueError(f"Invalid JSON response: {result}")
        
        if not isinstance(result, dict):
            raise ValueError(f"Expected dict response, got {type(result)}")
        
        return result
       