from django.shortcuts import render
from urllib3 import request
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from .permissions import *
from utils.request_models import *
from django.utils import timezone
from django.db.models import Q
from utils.ResumeExtractor import ResumeExtractor
from utils.Evaluator import Evaluator
from utils.FinalEvaluator import FinalEvaluator
from utils.FollowUpdecider import FollowUpDecider
import requests
from PyPDF2 import PdfReader
from django.core.files.base import ContentFile

# Create your views here.
class CustomInterviewView(APIView):
    permission_classes = [IsAuthenticated, IsOrganization]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        serializer = CustomInterviewSerializer(data=request.data)
        if serializer.is_valid():
            # Get the first organization associated with the user
            org_instance = request.user.organization.first()
            
            serializer.save(org=org_instance)
            return Response({"message": "Interview created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, id):
        try:
            interview = Custominterviews.objects.get(id=id)
        except Custominterviews.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)
        if interview.org.org != request.user:
            return Response({"error": "You do not have permission to update this interview."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CustomInterviewSerializer(interview, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Interview updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, id):
        try:
            interview = Custominterviews.objects.get(id=id)
        except Custominterviews.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)
        if interview.org.org != request.user:
            return Response({"error": "You do not have permission to view this interview."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CustomInterviewSerializer(interview)
        return Response(serializer.data, status=status.HTTP_200_OK)
class getInterview(APIView):
    permission_classes = [IsAuthenticated, IsOrganization]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        interviews = Custominterviews.objects.filter(org__org=request.user)
        serializer = CustomInterviewSerializer(interviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class InterviewSessionInitializerView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, id):
        try:
            interview = Custominterviews.objects.get(id=id)
        except Custominterviews.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)
        interview = Application.objects.filter(user=request.user, interview=interview).first()
        if not interview:
            return Response({"error": "You have not applied for this interview."}, status=status.HTTP_403_FORBIDDEN)
        if not interview.approved:
            return Response({"error": "Application not approved."}, status=status.HTTP_403_FORBIDDEN)
        if interview.interview.startTime > timezone.now() or interview.interview.endTime < timezone.now():
            return Response({"error": "Interview time has passed."}, status=status.HTTP_400_BAD_REQUEST)
        session = InterviewSession.objects.filter(Application=interview).first()
        if session:
            return Response({"error": "Interview session already exists."}, status=status.HTTP_400_BAD_REQUEST)
        session = InterviewSession.objects.create(Application=interview)
        question = Customquestion.objects.filter(interview=interview.interview).first()
        if question:
            session.current_question_index = 0
            session.status = "ongoing"
            session.save()
            interaction = Interaction.objects.create(session=session, Customquestion=question)
            follow_up = FollowUpQuestions.objects.create(Interaction=interaction, question=question.question)
        return Response({"message": "Interview session initialized successfully.", "session_id": session.id, "question": question.question}, status=status.HTTP_201_CREATED)

class InterviewSessionView(APIView):
    permission_classes = [IsAuthenticated]  
    authentication_classes = [TokenAuthentication]

    def post(self, request, id):
        try:
            session = InterviewSession.objects.get(id=id)
        except InterviewSession.DoesNotExist:
            return Response({"error": "Interview session not found."}, status=status.HTTP_404_NOT_FOUND)
        if request.user != session.Application.user:
            return Response({"error": "You do not have permission to access this session."}, status=status.HTTP_403_FORBIDDEN)
        if session.status != 'ongoing':
            return Response({"error": "Session is not ongoing."}, status=status.HTTP_400_BAD_REQUEST)
        current_index = session.current_question_index
        questions = Customquestion.objects.filter(interview=session.Application.interview)
        current_question = questions[current_index] if current_index < len(questions) else None
        
        if not current_question:
            return Response({"error": "No current question found."}, status=status.HTTP_400_BAD_REQUEST)
        
        interaction = Interaction.objects.filter(session=session, Customquestion=current_question).first()
        
        if not interaction:
            # Create new interaction if it doesn't exist
            interaction = Interaction.objects.create(
                session=session,
                Customquestion=current_question
            )
        follow_up = FollowUpQuestions.objects.filter(Interaction=interaction).last()
        follow_up.answer = request.query_params.get('answer', None)
        follow_up.save()
        
        # Build conversation context from follow-up questions
        follow_up_questions = FollowUpQuestions.objects.filter(Interaction=interaction).order_by('created_at')
        conversation_context = []
        for follow_up in follow_up_questions:
            conversation_context.append(f"Q: {follow_up.question}")
            if follow_up.answer:
                conversation_context.append(f"A: {follow_up.answer}")
        
        count = follow_up_questions.count()
        llm = Evaluator()
        
        if count >= 3:
            # Use the evaluate_answer method from InterviewManager
            req = EvaluationRequest(
                position=session.Application.interview.post,
                experience=session.Application.interview.experience,
                question=current_question.question,
                conversation_context=conversation_context,
                expected_answer=current_question.answer
            )
            
            try:
                response = llm.evaluate(req)
                interaction.score = response.score
                interaction.feedback = response.feedback
                interaction.save()
            except Exception as e:
                return Response({"error": f"Evaluation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            session.current_question_index += 1
            session.save()
            
            if questions.count() > session.current_question_index:
                next_question = questions[session.current_question_index].question
                next_interaction = Interaction.objects.create(
                    session=session,
                    Customquestion=questions[session.current_question_index]
                )
                follow_up = FollowUpQuestions.objects.create(
                    Interaction=next_interaction, 
                    question=next_question
                )
                return Response({
                    "session_id": session.id, 
                    "current_question": next_question,
                    "completed": False
                }, status=status.HTTP_200_OK)
            else:
                # Interview completed - perform final evaluation
                session.status = 'completed'
                session.save()
                
                # Perform final evaluation
                final_evaluation_response = self.perform_final_evaluation(session)
                
                return Response({
                    "completed": True
                }, status=status.HTTP_200_OK)
        else:
            # Use the follow_up_decider method from InterviewManager
            req = FollowUpRequest(
                position=session.Application.interview.post,
                experience=session.Application.interview.experience,
                expected_answer=current_question.answer,
                conversation_context=conversation_context
            )
            
            try:
                llm = FollowUpDecider()
                follow_up_decision = llm.evaluate(req)
                
                if follow_up_decision.needs_followup and follow_up_decision.followup_question:
                    # Create follow-up question
                    next_question_obj = FollowUpQuestions.objects.create(
                        Interaction=interaction, 
                        question=follow_up_decision.followup_question
                    )
                    return Response({
                        "session_id": session.id, 
                        "current_question": follow_up_decision.followup_question,
                        "completed": False
                    }, status=status.HTTP_200_OK)
                else:
                    eval_req = EvaluationRequest(
                        position=session.Application.interview.post,
                        experience=session.Application.interview.experience,
                        question=current_question.question,
                        conversation_context=conversation_context,
                        expected_answer=current_question.answer
                    )
                    
                    try:
                        llm = Evaluator()
                        evaluation_response = llm.evaluate(eval_req)
                        interaction.score = evaluation_response.score
                        interaction.feedback = evaluation_response.feedback
                        interaction.save()
                    except Exception as e:
                        return Response({"error": f"Evaluation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    session.current_question_index += 1
                    session.save()
                    
                    if questions.count() > session.current_question_index:
                        next_question = questions[session.current_question_index].question
                        next_interaction = Interaction.objects.create(
                            session=session,
                            Customquestion=questions[session.current_question_index]
                        )
                        next_question_obj = FollowUpQuestions.objects.create(
                            Interaction=next_interaction, 
                            question=next_question
                        )
                        return Response({
                            "session_id": session.id, 
                            "current_question": next_question,
                            "completed": False


                        }, status=status.HTTP_200_OK)
                    else:
                        # Interview completed - perform final evaluation
                        session.status = 'completed'
                        session.save()
                        
                        final_evaluation_response = self.perform_final_evaluation(session)
                        
                        return Response({
                            "completed": True
                        }, status=status.HTTP_200_OK)
                        
            except Exception as e:
                return Response({"error": f"Follow-up decision failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def perform_final_evaluation(self, session):
        """
        Performs final evaluation of the completed interview session
        """
        try:
            # Get all interactions for this session
            interactions = Interaction.objects.filter(session=session).order_by('created_at')
            
            if not interactions.exists():
                return {"error": "No interactions found for final evaluation"}
            
            # Build comprehensive interview history
            interview_history = []
            
            for interaction in interactions:
                question_data = {
                    "main_question": interaction.Customquestion.question,
                    "expected_answer": interaction.Customquestion.answer,
                    "individual_score": interaction.score,
                    "individual_feedback": interaction.feedback
                }
                
                interview_history.append(question_data)
            
            llm = FinalEvaluator()
            
            req = FinalEvaluationRequest(
                position=session.Application.interview.post,
                experience=session.Application.interview.experience,
                interview_history=interview_history
            )
            
            final_evaluation = llm.evaluate(req)
            
            # Save final evaluation to session
            session.score = final_evaluation.overall_score
            session.feedback = final_evaluation.overall_feedback
            session.strengths = final_evaluation.strengths
            session.recommendation = final_evaluation.recommendation
            session.save()
            
            return {
                "overall_score": final_evaluation.overall_score,
                "overall_feedback": final_evaluation.overall_feedback,
                "strengths": final_evaluation.strengths,
                "recommendation": final_evaluation.recommendation,
                "individual_scores": [
                    {
                        "question": interaction.Customquestion.question,
                        "score": interaction.score,
                        "feedback": interaction.feedback
                    } for interaction in interactions
                ]
            }
            
        except Exception as e:
            return {"error": f"Final evaluation failed: {str(e)}"}

class GetAllInterviewsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        interviews = Custominterviews.objects.filter(
            Q(submissionDeadline__gt=timezone.now()) |
            Q(applications__user=request.user)
        ).distinct()
        serializer = InterviewSerializer(interviews, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApplicationView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, id):
        try:
            interview = Custominterviews.objects.get(id=id)
        except Custominterviews.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)

        if Application.objects.filter(user=request.user, interview=interview).exists():
            return Response({"error": "You have already applied for this interview."}, status=status.HTTP_400_BAD_REQUEST)

        if interview.submissionDeadline < timezone.now():
            return Response({"error": "Submission deadline has passed."}, status=status.HTTP_400_BAD_REQUEST)

        # Expect 'resume_url' in request data
        resume_url = request.data.get("resume_url")
        if not resume_url:
            return Response({"error": "Missing resume URL."}, status=status.HTTP_400_BAD_REQUEST)

        # Download the resume
        try:
            response = requests.get(resume_url)
            response.raise_for_status()
        except requests.RequestException as e:
            return Response({"error": f"Failed to download resume: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Read PDF content
        try:
            pdf_reader = PdfReader(ContentFile(response.content))
            extracted_text = ""
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() or ""
        except Exception as e:
            return Response({"error": f"Failed to process PDF: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate and save the application
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save(
                user=request.user,
                interview=interview,
            )
            req = resumeExtractionRequest(
                resume_text=extracted_text,
                job_title=interview.post,
                job_description=interview.desc,
                experience=interview.experience
            )
            llm = ResumeExtractor()
            try:
                response = llm.evaluate(req)
                print("Resume extraction response:", response)
                application.resume = resume_url
                application.extratedResume = response.extracted_standardized_resume
                application.score = response.score
                application.feedback = response.feedback
                try:
                    application.shortlisting_decision = response.shortlisting_decision
                except Exception as e:
                    application.shortlisting_decision = False
                application.save()
            except Exception as e:
                return Response({"error": f"Failed to extract resume information: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                "message": "Application created successfully.",
                "application_id": application.id,
                "extracted_resume_text": extracted_text[:500]  # Optionally show a preview
            }, status=status.HTTP_201_CREATED)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, id):
        try:
            interview = Custominterviews.objects.get(id=id)
        except Custominterviews.DoesNotExist:
            return Response({"error" : "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
        org = interview.org
        if request.user != org.org:
            return Response({"error" : "You are not authorized to view this interview"}, status=status.HTTP_403_FORBIDDEN)
        applications = Application.objects.filter(interview=interview)
        serializer = ApplicationSerializer(applications,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put(self, request, id):
        try:
            application = Application.objects.get(id=id)
        except Application.DoesNotExist:
            return Response({"error" : "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        if request.user != application.interview.org.org:
            return Response({"error" : "You are not authorized to update this application"}, status=status.HTTP_403_FORBIDDEN)
        application.approved = not application.approved
        application.save()
        return Response({"message" : "Application status updated"}, status=status.HTTP_200_OK)
    
class LeaderBoardView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request, id):
        interview = Custominterviews.objects.get(id=id)
        if request.user != interview.org.org:
            return Response({"error": "You are not authorized to view this leaderboard"}, status=status.HTTP_403_FORBIDDEN)

        application = Application.objects.filter(interview=interview)
        session = InterviewSession.objects.filter(Application__in=application)
        try:
            serializer = LeaderBoardSerializer(session, many=True)          
                    
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({serializer.data, 
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheatingDetection(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def put(self, request, id):
        try:
            session = InterviewSession.objects.get(id=id)
            if request.user != session.Application.user:
                return Response({"error": "You are not authorized to access this session"}, status=status.HTTP_403_FORBIDDEN)
            session.status = 'cheated'
            session.save()
            return Response({"message": "Session marked as cheated"}, status=status.HTTP_200_OK)
        except InterviewSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

class SessionDsaQuestions(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request, id):
        try:
            session = InterviewSession.objects.get(id=id)
            interview = Custominterviews.objects.get(id=session.Application.interview.id)

            dsa_questions = DsaTopics.objects.filter(interview=interview)
            serializer = DSAQuestionsSerializer(dsa_questions, many=True)
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Custominterviews.DoesNotExist:
            return Response({"error": "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
    def post(self, request, id,dsa_id):
        try:
            session = InterviewSession.objects.get(id=id)
        except InterviewSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            dsa_topic = DsaTopics.objects.get(id=dsa_id)
        except DsaTopics.DoesNotExist:
            return Response({"error": "DSA Topic not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            dsa_interaction = DSAInteractions.objects.get(session=session, topic=dsa_topic)
            if dsa_interaction:
                return Response({"error": "DSA interaction already exists for this session and topic"}, status=status.HTTP_400_BAD_REQUEST)
        except DSAInteractions.DoesNotExist:
            dsa_interaction = DSAInteractions.objects.create(
                session=session,
                topic=dsa_topic,
                question=request.data.get("question", ""),
                score=request.data.get("score"),
                code=request.data.get("code"),
        )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "DSA interaction created", "id": dsa_interaction.id}, status=status.HTTP_201_CREATED)