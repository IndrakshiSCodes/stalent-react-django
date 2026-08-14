from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('student/', views.student_home, name='student_home'),
    
    # REST API endpoints
    path('api/auth/signup/', views.api_signup, name='api_signup'),
    path('api/auth/login/', views.api_login, name='api_login'),
    
    path('api/student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('api/student/apply/', views.student_apply, name='student_apply'),
    path('api/student/apply-company/', views.student_apply_company, name='student_apply_company'),
    path('api/student/opportunities/<int:opportunity_id>/bookmark/', views.student_toggle_bookmark, name='student_toggle_bookmark'),
    path('api/student/conversations/', views.student_conversations, name='student_conversations'),
    
    path('api/startup/dashboard/', views.startup_dashboard, name='startup_dashboard'),
    path('api/startup/update-status/', views.startup_update_status, name='startup_update_status'),
    path('api/startup/candidate-action/', views.startup_candidate_action, name='startup_candidate_action'),
    path('api/startup/post-project/', views.startup_post_project, name='startup_post_project'),
    path('api/startup/save-settings/', views.startup_save_settings, name='startup_save_settings'),
    
    path('api/messages/', views.get_messages, name='get_messages'),
    path('api/messages/send/', views.send_message, name='send_message'),

    # Profiles
path('api/profile/student/<int:student_id>/', views.student_public_profile, name='student_public_profile'),
path('api/profile/startup/<int:startup_id>/', views.startup_public_profile, name='startup_public_profile'),
path('api/student/update-profile/', views.student_update_profile, name='student_update_profile'),
path('api/student/contributions/add/', views.student_add_contribution, name='student_add_contribution'),
path('api/student/contributions/<int:contribution_id>/delete/', views.student_delete_contribution, name='student_delete_contribution'),
path('api/student/experience/add/', views.student_add_experience, name='student_add_experience'),
path('api/student/experience/<int:experience_id>/delete/', views.student_delete_experience, name='student_delete_experience'),
path('api/student/certifications/add/', views.student_add_certification, name='student_add_certification'),
path('api/student/certifications/<int:certification_id>/delete/', views.student_delete_certification, name='student_delete_certification'),
path('api/student/education/add/', views.student_add_education, name='student_add_education'),
path('api/student/education/<int:education_id>/update/', views.student_update_education, name='student_update_education'),
path('api/student/education/<int:education_id>/delete/', views.student_delete_education, name='student_delete_education'),
path('api/student/startups/<int:startup_id>/bookmark/', views.student_toggle_company_bookmark, name='student_toggle_company_bookmark'),

# Invitations
path('api/startup/invite/', views.startup_invite, name='startup_invite'),
path('api/startup/students/', views.list_students, name='list_students'),
path('api/student/startups/', views.list_startups, name='list_startups'),
path('api/student/peers/', views.list_peer_students, name='list_peer_students'),
path('api/student/teamup/request/', views.student_teamup_request, name='student_teamup_request'),
path('api/student/teamup/respond/', views.student_teamup_respond, name='student_teamup_respond'),
path('api/student/invitations/<int:invitation_id>/respond/', views.student_respond_invitation, name='student_respond_invitation'),
path('api/student/invite-teammate/', views.student_invite_teammate, name='student_invite_teammate'),

# Notifications
path('api/student/notifications/', views.student_notifications, name='student_notifications'),
path('api/startup/notifications/', views.startup_notifications, name='startup_notifications'),
path('api/notifications/read/', views.mark_notifications_read, name='mark_notifications_read'),
]
