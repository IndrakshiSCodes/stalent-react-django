import json
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from .models import Student, Startup, Opportunity, Application, Message, ProjectGroup, Invitation, Notification, StudentContribution, TeamUp, Experience, Certification, Education
from django.utils import timezone


def humanize_timeago(dt):
    """Turn a real timestamp into a short relative label ('5m ago', '3h ago', …)."""
    if not dt:
        return ""
    seconds = (timezone.now() - dt).total_seconds()
    if seconds < 60:
        return "just now"
    minutes = int(seconds // 60)
    if minutes < 60:
        return f"{minutes}m ago"
    hours = int(minutes // 60)
    if hours < 24:
        return f"{hours}h ago"
    days = int(hours // 24)
    if days < 30:
        return f"{days}d ago"
    months = int(days // 30)
    return f"{months}mo ago"



def human_time_ago(dt):
    """Turn a datetime into a short relative string like '5m ago', '3h ago', '2d ago'."""
    if not dt:
        return ""
    delta = timezone.now() - dt
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return "just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days < 30:
        return f"{days}d ago"
    months = days // 30
    return f"{months}mo ago"

def seed_database():
    # 1. Startup Seeding
    if Startup.objects.count() == 0:
        # Create standard startup user
        u, created = User.objects.get_or_create(username='orbitly', email='you@company.com')
        if created:
            u.set_password('password')
            u.first_name = 'Orbitly'
            u.save()
        s, _ = Startup.objects.get_or_create(
            user=u,
            name='Orbitly',
            tagline='The developer dashboard for engineering teams.',
            location='San Francisco, CA',
            website='orbitly.io',
            employees='12 employees',
            founded='Founded 2022',
            industry='SaaS / DevTools',
            logo_color='#5b5bf7'
        )
        
        # Add Opportunities
        Opportunity.objects.get_or_create(
            startup=s,
            title='Frontend Developer',
            description='Build responsive UI components and collaborate with the product team on new features.',
            industry='SaaS / DevTools',
            location='Remote',
            type='Part-time',
            duration='3 months',
            salary='$800/mo',
            tags='React, TypeScript, Tailwind',
            featured=True
        )
        
        Opportunity.objects.get_or_create(
            startup=s,
            title='Product Design Intern',
            description='Design user flows and prototypes for our email productivity suite.',
            industry='Productivity',
            location='Remote',
            type='Part-time',
            duration='2 months',
            salary='$650/mo',
            tags='Figma, UX Research',
            featured=True
        )

        Opportunity.objects.get_or_create(
            startup=s,
            title='ML Engineer',
            description='Assist with model training pipelines and data preprocessing for NLP features.',
            industry='AI / ML',
            location='Remote',
            type='Part-time',
            duration='4 months',
            salary='$900/mo',
            tags='Python, PyTorch',
            featured=False
        )

    # 2. Student Seeding
    if Student.objects.count() == 0:
        # We need Lena, Kai, Dev, Amara, Marco
        students_data = [
            {
                'username': 'lena',
                'email': 'lena@university.edu',
                'first_name': 'Lena',
                'last_name': 'Fischer',
                'university': 'TU Berlin',
                'major': 'MSc CS',
                'year': 2,
                'avatar_color': '#5b5bf7',
                'applied_to': 'Frontend Developer',
                'status': 'Pending',
                'quote': "I've shipped production React apps for 3 startups. Excited about Orbitly's vision.",
                'tags': 'React, TypeScript, Tailwind'
            },
            {
                'username': 'kai',
                'email': 'kai@university.edu',
                'first_name': 'Kai',
                'last_name': 'Nakamura',
                'university': 'University of Tokyo',
                'major': 'BSc CS',
                'year': 3,
                'avatar_color': '#10b981',
                'applied_to': 'Frontend Developer',
                'status': 'Pending',
                'quote': "Full-stack dev with a passion for great DX. Would love to contribute to the dashboard.",
                'tags': 'React, Vue, Node.js'
            },
            {
                'username': 'dev',
                'email': 'dev@university.edu',
                'first_name': 'Dev',
                'last_name': 'Sharma',
                'university': 'IIT Bombay',
                'major': 'BTech CS',
                'year': 4,
                'avatar_color': '#f59e0b',
                'applied_to': 'Frontend Developer',
                'status': 'Pending',
                'quote': "Built and scaled a SaaS product to 10k users. Looking for my next big challenge.",
                'tags': 'React, GraphQL, AWS'
            },
            {
                'username': 'amara',
                'email': 'amara@university.edu',
                'first_name': 'Amara',
                'last_name': 'Osei',
                'university': 'UCL London',
                'major': 'MSc',
                'year': 1,
                'avatar_color': '#ec4899',
                'applied_to': 'Product Design Intern',
                'status': 'Hired',
                'quote': "Redesigned three B2B SaaS products. Portfolio speaks for itself.",
                'tags': 'Figma, UX Research, Prototyping'
            },
            {
                'username': 'marco',
                'email': 'marco@university.edu',
                'first_name': 'Marco',
                'last_name': 'Rossi',
                'university': 'Bocconi University',
                'major': 'BSc Business',
                'year': 3,
                'avatar_color': '#8b5cf6',
                'applied_to': 'Frontend Developer',
                'status': 'Rejected',
                'quote': "Grew a newsletter from 0 to 12k subs in 4 months. Keen to apply that to Orbitly.",
                'tags': 'SEO, Growth, Marketing'
            }
        ]
        
        orbitly_startup = Startup.objects.first()
        
        # Also create a default student user "Alex Rivera" for dashboard login
        alex_u, created = User.objects.get_or_create(username='alex', email='you@university.edu')
        if created:
            alex_u.set_password('password')
            alex_u.first_name = 'Alex'
            alex_u.last_name = 'Rivera'
            alex_u.save()
        Student.objects.get_or_create(
            user=alex_u,
            university='Stanford University',
            major='CS',
            year=3,
            profile_complete=98,
            avatar_color='#5b5bf7'
        )

        for sd in students_data:
            su, _ = User.objects.get_or_create(username=sd['username'], email=sd['email'])
            su.set_password('password')
            su.first_name = sd['first_name']
            su.last_name = sd['last_name']
            su.save()
            
            stud = Student.objects.create(
                user=su,
                university=sd['university'],
                major=sd['major'],
                year=sd['year'],
                avatar_color=sd['avatar_color']
            )
            
            # Create application
            opp = Opportunity.objects.filter(title=sd['applied_to']).first()
            if opp:
                Application.objects.create(
                    student=stud,
                    opportunity=opp,
                    status=sd['status'],
                    cover_letter=sd['quote']
                )
                
                # Chat message history
                Message.objects.create(
                    sender=su,
                    receiver=orbitly_startup.user,
                    text=f"Hi Orbitly team, I applied for the {opp.title} role! " + sd['quote'],
                    is_unread=(sd['status'] == 'Pending')
                )

# Helper to get current authenticated user
def get_auth_user(request):
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
        try:
            data = TimestampSigner().unsign_object(token, max_age=60 * 60 * 24 * 7)  # 7 days
            return User.objects.filter(id=data.get('user_id')).first()
        except (BadSignature, SignatureExpired):
            return None
    return None

@csrf_exempt
def home(request):
    return JsonResponse({"status": "Stalent Django Backend API Server Running"})

@csrf_exempt
def student_home(request):
    return JsonResponse({"status": "Student API Home"})

@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        role = data.get('role') # student / startup
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "User with this email already exists"}, status=400)
            
        username = email.split('@')[0]
        # ensure unique username
        counter = 1
        orig_username = username
        while User.objects.filter(username=username).exists():
            username = f"{orig_username}{counter}"
            counter += 1
            
        u = User.objects.create_user(username=username, email=email, password=password)
        
        if role == 'student':
            u.first_name = data.get('studentName', '').split(' ')[0]
            u.last_name = ' '.join(data.get('studentName', '').split(' ')[1:])
            u.save()
            Student.objects.create(
                user=u,
                university=data.get('university', 'Your University'),
                major='CS',
                year=3,
                profile_complete=60,
                avatar_color='#5b5bf7'
            )
        else:
            u.first_name = data.get('companyName', '')
            u.save()
            Startup.objects.create(
                user=u,
                name=data.get('companyName', ''),
                employees=data.get('companySize', '1-10 employees'),
                tagline='Building the future.',
                location='San Francisco, CA',
                website='company.com',
                industry='Tech / SaaS'
            )
            
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            role = 'student' if hasattr(user, 'student_profile') else 'startup'
            if role == 'student':
                profile_info = {
                    "id": user.student_profile.id,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "initials": (user.first_name[0] if user.first_name else "") + (user.last_name[0] if user.last_name else ""),
                    "university": user.student_profile.university,
                    "major": user.student_profile.major,
                    "year": user.student_profile.year,
                    "profileComplete": user.student_profile.profile_complete,
                    "avatarColor": user.student_profile.avatar_color,
                    "role": "student"
                }
            else:
                profile_info = {
                    "id": user.startup_profile.id,
                    "name": user.startup_profile.name,
                    "initials": user.startup_profile.name[:2].upper(),
                    "industry": user.startup_profile.industry,
                    "role": "startup"
                }
                
            return JsonResponse({
                "token": TimestampSigner().sign_object({"user_id": user.id}),
                "user": {
                    **profile_info,
                    "email": user.email
                }
            })
        return JsonResponse({"error": "Invalid email or password"}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_or_create_general_opportunity(startup):
    """
    Every startup gets exactly one "General Application" placeholder role —
    used when a student applies directly to the company (Companies tab)
    rather than to a specific posted opportunity, and as a fallback when a
    startup wants to hire/reject a candidate before posting any real role.
    Reuses existing Application/Invitation/Notification machinery so the
    rest of the hire → accept/decline flow needs no special-casing.
    """
    opp = Opportunity.objects.filter(startup=startup, is_general=True).first()
    if opp:
        return opp
    return Opportunity.objects.create(
        startup=startup,
        title="General Application",
        description=f"A direct application to {startup.name}, not tied to a specific posted role.",
        industry=startup.industry,
        location=startup.location,
        type='Flexible',
        duration='TBD',
        salary='TBD',
        tags='General Application',
        featured=False,
        is_general=True,
    )


@csrf_exempt
def student_apply_company(request):
    """
    Student applies directly to a company from the Companies tab, with no
    specific opportunity selected. Reuses the Application model against an
    auto-created "General Application" placeholder role so it shows up
    both in the student's own Opportunities feed and in the startup's
    Candidates list, exactly like a normal application.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, 'student_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    startup_id = data.get('startupId')
    startup = Startup.objects.filter(id=startup_id).first()
    if not startup:
        return JsonResponse({"error": "Company not found"}, status=404)

    student = user.student_profile
    opp = get_or_create_general_opportunity(startup)

    app, created = Application.objects.get_or_create(
        student=student, opportunity=opp,
        defaults={'status': 'Pending', 'cover_letter': f"I'd like to apply directly to {startup.name}."}
    )

    if created:
        Message.objects.create(
            sender=user,
            receiver=startup.user,
            text=f"Hello! I've applied directly to {startup.name}. Looking forward to connecting."
        )
        Notification.objects.create(
            recipient=startup.user,
            type='application',
            title=f"New application from {user.first_name} {user.last_name}",
            body=f"{user.first_name} {user.last_name} applied directly to {startup.name}.",
        )

    return JsonResponse({"success": True, "applied": True})


@csrf_exempt
def student_dashboard(request):
    seed_database()
    user = get_auth_user(request)
    if not user or not hasattr(user, 'student_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)
        
    student = user.student_profile
    
    # Opportunities list
    opps = []
    bookmarked_ids = set(student.bookmarks.values_list('id', flat=True))
    student_skills = set(s.strip().lower() for s in student.skills.split(',') if s.strip())

    def compute_match_percent(opportunity):
        """Real match score based on overlap between the student's skills
        and the opportunity's tags — not a fixed featured/non-featured split."""
        if opportunity.is_general:
            return 100  # a direct application to the whole company, not a specific role
        opp_tags = set(t.strip().lower() for t in opportunity.tags.split(',') if t.strip())
        if not opp_tags or not student_skills:
            return 60  # neutral baseline — not enough data on either side to compare
        overlap = len(student_skills & opp_tags)
        return min(99, round(50 + (overlap / len(opp_tags)) * 50))

    # Real, posted opportunities are visible to everyone; "General
    # Application" placeholder roles (created when a student applies
    # directly to a company with no open posting) only show up for the
    # student(s) who actually applied through them.
    visible_opps = Opportunity.objects.filter(
        Q(is_general=False) | Q(applications__student=student)
    ).distinct()
    for opp in visible_opps:
        has_applied = Application.objects.filter(student=student, opportunity=opp).exists()
        opps.append({
            "id": opp.id,
            "startupId": opp.startup.id,
            "company": opp.startup.name,
            "initials": opp.startup.name[:2].upper(),
            "logoColor": opp.startup.logo_color,
            "industry": opp.startup.industry,
            "title": f"Direct application — {opp.startup.name}" if opp.is_general else opp.title,
            "description": opp.description,
            "matchPercent": compute_match_percent(opp),
            "featured": opp.featured,
            "location": opp.location,
            "type": opp.type,
            "duration": opp.duration,
            "salary": opp.salary,
            "tags": ["General Application"] if opp.is_general else [t.strip() for t in opp.tags.split(',')],
            "filters": [opp.location, opp.type, opp.startup.industry],
            "bookmarked": opp.id in bookmarked_ids,
            "applied": has_applied,
            "isGeneral": opp.is_general,
            "applicantCount": Application.objects.filter(opportunity=opp).count(),
        })
        
    # Unread messages waiting count
    unread_msg = Message.objects.filter(receiver=user, is_unread=True).count()

    # Real, time-of-day greeting instead of a hardcoded string
    hour = timezone.localtime().hour
    if hour < 12:
        greeting = "Good morning"
    elif hour < 18:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    # Real "new" opportunities — ones posted in the last 3 days that this
    # student can see, instead of a fixed placeholder number.
    recent_cutoff = timezone.now() - timezone.timedelta(days=3)
    new_matches_count = visible_opps.filter(created_at__gte=recent_cutoff).count()

    welcome = {
        "greeting": greeting,
        "newMatches": new_matches_count,
        "newMessages": unread_msg,
        "profileComplete": student.profile_complete,
        "applications": Application.objects.filter(student=student).count(),
        "matches": len(opps),
    }

    pending_count = Application.objects.filter(student=student, status='Pending').count()
    pending_offers_count = Invitation.objects.filter(student=student, status='pending').count()
    hired_count = Application.objects.filter(student=student, status='Hired').count()

    # Stats — all sourced from real data, no placeholder numbers
    quick_stats = [
        {"id": "profile-views", "label": "Profile Views", "value": student.profile_views, "subtext": "All-time profile visits", "icon": "chart", "accent": "#10b981"},
        {"id": "applications", "label": "Applications", "value": welcome["applications"], "subtext": f"{pending_count} under review", "icon": "briefcase", "accent": "#5b5bf7"},
        {"id": "offers", "label": "Offers", "value": pending_offers_count, "subtext": (f"{hired_count} accepted so far" if hired_count else "Awaiting your response" if pending_offers_count else "None yet"), "icon": "calendar", "accent": "#f59e0b"},
        {"id": "saved", "label": "Saved", "value": len(bookmarked_ids), "subtext": "Bookmarked for later", "icon": "heart", "accent": "#ec4899"}
    ]
    
    profile = {
        "id": student.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "initials": (user.first_name[0] if user.first_name else "") + (user.last_name[0] if user.last_name else ""),
        "university": student.university,
        "major": student.major,
        "year": student.year,
        "profileComplete": student.profile_complete,
        "avatarColor": student.avatar_color,
        "unreadMessages": unread_msg,
        "unreadNotifications": Notification.objects.filter(recipient=user, is_read=False).count()
    }
    
    # Recent activity — pulled straight from this student's own
    # notifications, newest first, with real relative timestamps. No more
    # hardcoded placeholder events.
    icon_by_notif_type = {
        'invitation': 'briefcase', 'invite_accepted': 'check', 'invite_declined': 'alert',
        'group_active': 'users', 'status_change': 'chart', 'message': 'message',
        'application': 'briefcase', 'teamup_request': 'users', 'teamup_accepted': 'check',
    }
    recent_activity = [
        {
            "id": n.id,
            "icon": icon_by_notif_type.get(n.type, 'bell'),
            "text": n.title,
            "timeAgo": humanize_timeago(n.created_at),
        }
        for n in Notification.objects.filter(recipient=user).order_by('-created_at')[:5]
    ]
    if not recent_activity:
        recent_activity = [{"id": 0, "icon": "bell", "text": "No activity yet — apply to a company to get started.", "timeAgo": ""}]

    # Filter chips built from what's actually been posted, not a fixed list.
    real_opp_qs = Opportunity.objects.filter(is_general=False)
    dyn_filters = ["All"]
    for field in ('location', 'type', 'industry'):
        for value in real_opp_qs.exclude(**{field: ''}).values_list(field, flat=True).distinct():
            if value and value not in dyn_filters:
                dyn_filters.append(value)

    profile_tip = None
    if student.profile_complete < 100:
        profile_tip = f"Your profile is {student.profile_complete}% complete — add more skills, a bio, or a past project to stand out to companies."

    # Companies this student has bookmarked ("saved"), fully dynamic —
    # sourced from Student.bookmarked_startups, no static/mock data.
    saved_companies = [
        {
            "id": s.id,
            "name": s.name,
            "initials": s.name[:2].upper(),
            "logoColor": s.logo_color,
            "tagline": s.tagline,
            "industry": s.industry,
            "location": s.location,
            "employees": s.employees,
            "openRolesCount": Opportunity.objects.filter(startup=s, is_general=False).count(),
            "bookmarked": True,
        }
        for s in student.bookmarked_startups.all()
    ]

    return JsonResponse({
        "profile": profile,
        "welcome": welcome,
        "quickStats": quick_stats,
        "opportunities": opps,
        "savedCompanies": saved_companies,
        "recentActivity": recent_activity,
        "filters": dyn_filters,
        "profileTip": profile_tip
    })

@csrf_exempt
def student_apply(request):
    if request.method == 'POST':
        user = get_auth_user(request)
        if not user or not hasattr(user, 'student_profile'):
            return JsonResponse({"error": "Unauthorized"}, status=401)
            
        data = json.loads(request.body)
        opp_id = data.get('opportunityId')
        opp = Opportunity.objects.filter(id=opp_id).first()
        if opp:
            Application.objects.get_or_create(
                student=user.student_profile,
                opportunity=opp,
                defaults={'status': 'Pending', 'cover_letter': 'Interested in applying for this project.'}
            )
            # Add message from student to startup on application
            Message.objects.create(
                sender=user,
                receiver=opp.startup.user,
                text=f"Hello! I've applied to your '{opp.title}' project. Looking forward to connecting."
            )
            return JsonResponse({"success": True})
    return JsonResponse({"error": "Bad request"}, status=400)

@csrf_exempt
def student_toggle_bookmark(request, opportunity_id):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, 'student_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    opp = Opportunity.objects.filter(id=opportunity_id).first()
    if not opp:
        return JsonResponse({"error": "Opportunity not found"}, status=404)

    student = user.student_profile
    if student.bookmarks.filter(id=opp.id).exists():
        student.bookmarks.remove(opp)
        bookmarked = False
    else:
        student.bookmarks.add(opp)
        bookmarked = True
    return JsonResponse({"success": True, "bookmarked": bookmarked})

@csrf_exempt
def student_toggle_company_bookmark(request, startup_id):
    """Save/un-save a company ('bookmark') from the Companies list — the
    bookmarked company then shows up under the student's Saved tab."""
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, 'student_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    startup = Startup.objects.filter(id=startup_id).first()
    if not startup:
        return JsonResponse({"error": "Company not found"}, status=404)

    student = user.student_profile
    if student.bookmarked_startups.filter(id=startup.id).exists():
        student.bookmarked_startups.remove(startup)
        bookmarked = False
    else:
        student.bookmarked_startups.add(startup)
        bookmarked = True
    return JsonResponse({"success": True, "bookmarked": bookmarked})

@csrf_exempt
def student_conversations(request):
    """
    Every company AND every other student this student can message — not
    just people they've already exchanged messages with. Each entry
    includes their last message / unread count if a conversation already
    exists, or blank/zero if it's a brand-new contact.
    """
    user = get_auth_user(request)
    if not user or not hasattr(user, 'student_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    student = user.student_profile

    companies = []
    for startup in Startup.objects.select_related('user').order_by('name'):
        last_msg = Message.objects.filter(
            Q(sender=user, receiver=startup.user) | Q(sender=startup.user, receiver=user)
        ).order_by('-timestamp').first()
        unread = Message.objects.filter(sender=startup.user, receiver=user, is_unread=True).count()
        companies.append({
            "type": "company",
            "id": startup.id,
            "startupId": startup.id,
            "name": startup.name,
            "initials": startup.name[:2].upper(),
            "logoColor": startup.logo_color,
            "lastMessage": last_msg.text if last_msg else "",
            "lastMessageTime": last_msg.timestamp.isoformat() if last_msg else None,
            "unread": unread,
        })

    peers = []
    for stud in Student.objects.exclude(id=student.id).select_related('user').order_by('user__first_name'):
        last_msg = Message.objects.filter(
            Q(sender=user, receiver=stud.user) | Q(sender=stud.user, receiver=user)
        ).order_by('-timestamp').first()
        unread = Message.objects.filter(sender=stud.user, receiver=user, is_unread=True).count()
        peers.append({
            "type": "student",
            "id": stud.id,
            "studentId": stud.id,
            "name": f"{stud.user.first_name} {stud.user.last_name}",
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "logoColor": stud.avatar_color,
            "lastMessage": last_msg.text if last_msg else "",
            "lastMessageTime": last_msg.timestamp.isoformat() if last_msg else None,
            "unread": unread,
        })

    companies.sort(key=lambda c: c["lastMessageTime"] or "", reverse=True)
    peers.sort(key=lambda c: c["lastMessageTime"] or "", reverse=True)

    # "conversations" kept for backwards compatibility with any older caller
    return JsonResponse({"conversations": companies, "companies": companies, "students": peers})

@csrf_exempt
def startup_dashboard(request):
    seed_database()
    user = get_auth_user(request)
    if not user or not hasattr(user, 'startup_profile'):
        return JsonResponse({"error": "Unauthorized"}, status=401)
        
    startup = user.startup_profile
    
    # ── Gather candidates: real applications first, then anyone the startup
    # has already invited but who hasn't applied, then every other student
    # on the platform (never contacted). This is what powers the merged
    # "Candidates" view — All / Pending / Hired / Rejected all
    # filter over this same list, and every student is browsable + actionable
    # from here, not just people who've applied.
    apps = []
    covered_student_ids = set()

    real_applications = Application.objects.filter(opportunity__startup=startup).order_by('id')
    for app in real_applications:
        stud = app.student
        covered_student_ids.add(stud.id)
        offer_pending = Invitation.objects.filter(
            student=stud, opportunity=app.opportunity, invited_by_startup=startup, status='pending'
        ).exists()
        apps.append({
            "id": app.id,
            "studentId": stud.id,
            "name": f"{stud.user.first_name} {stud.user.last_name}",
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "avatarColor": stud.avatar_color,
            "matchPercent": 95 if app.opportunity.featured else 80,
            "status": app.status,
            "university": stud.university,
            "degree": stud.major,
            "year": stud.year,
            "appliedFor": "General application" if app.opportunity.is_general else app.opportunity.title,
            "timeAgo": human_time_ago(app.created_at),
            "quote": app.cover_letter or "",
            "tags": ["General Application"] if app.opportunity.is_general else [t.strip() for t in app.opportunity.tags.split(',')],
            "hasApplication": True,
            "invitePending": False,
            "offerPending": offer_pending,
        })

    # Students already invited (via the Invite modal or a direct Hire click)
    # who haven't applied themselves — still pending their response.
    pending_invites = Invitation.objects.filter(
        invited_by_startup=startup, status='pending'
    ).exclude(student_id__in=covered_student_ids).select_related('student__user', 'opportunity')
    for inv in pending_invites:
        stud = inv.student
        if stud.id in covered_student_ids:
            continue
        covered_student_ids.add(stud.id)
        apps.append({
            "id": f"inv-{inv.id}",
            "studentId": stud.id,
            "name": f"{stud.user.first_name} {stud.user.last_name}",
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "avatarColor": stud.avatar_color,
            "matchPercent": 80,
            "status": "Pending",
            "university": stud.university,
            "degree": stud.major,
            "year": stud.year,
            "appliedFor": inv.opportunity.title,
            "timeAgo": "Invite sent",
            "quote": "",
            "tags": [t.strip() for t in inv.opportunity.tags.split(',')],
            "hasApplication": False,
            "invitePending": True,
        })

    # Every other student on the platform — visible + actionable even
    # though they haven't applied or been contacted yet.
    other_students = Student.objects.exclude(id__in=covered_student_ids).select_related('user').order_by('-id')
    for stud in other_students:
        apps.append({
            "id": f"student-{stud.id}",
            "studentId": stud.id,
            "name": f"{stud.user.first_name} {stud.user.last_name}",
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "avatarColor": stud.avatar_color,
            "matchPercent": 70,
            "status": "Pending",
            "university": stud.university,
            "degree": stud.major,
            "year": stud.year,
            "appliedFor": "Not yet contacted",
            "timeAgo": "",
            "quote": (stud.bio[:120] if stud.bio else ""),
            "tags": [t.strip() for t in stud.skills.split(",") if t.strip()],
            "hasApplication": False,
            "invitePending": False,
        })
        
    # Active Engagements (Hired) — duration/progress/status computed from
    # when the student was actually hired and the project's stated
    # duration, instead of fixed mock values.
    engs = []
    hired_apps = Application.objects.filter(opportunity__startup=startup, status='Hired')
    for ha in hired_apps:
        stud = ha.student
        start_date = ha.created_at.date()
        duration_match = re.search(r'\d+', ha.opportunity.duration or '')
        duration_months = int(duration_match.group()) if duration_match else 3
        total_days = max(duration_months * 30, 1)
        end_date = start_date + timezone.timedelta(days=total_days)
        elapsed_days = (timezone.now().date() - start_date).days
        progress = max(0, min(100, round((elapsed_days / total_days) * 100)))
        if progress >= 100:
            eng_status = "completed"
        elif progress >= 85:
            eng_status = "wrapping up"
        else:
            eng_status = "on track"
        engs.append({
            "id": ha.id,
            "opportunityId": ha.opportunity.id,
            "role": ha.opportunity.title,
            "studentName": f"{stud.user.first_name} {stud.user.last_name}",
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "avatarColor": stud.avatar_color,
            "duration": f"{start_date.strftime('%b')} {start_date.day} → {end_date.strftime('%b')} {end_date.day}",
            "progress": progress,
            "status": eng_status
        })
        
    # Unread messages
    unread_msg = Message.objects.filter(receiver=user, is_unread=True).count()
    unread_notifs = Notification.objects.filter(recipient=user, is_read=False).count()
    
    # Calculate stats — based on real applications only, not the full
    # merged candidates list (which includes every uncontacted student).
    stats = {
        "totalApplicants": real_applications.count(),
        "pendingApplicants": real_applications.filter(status='Pending').count(),
        "hiredStudents": len(engs),
        "activeProjects": len(Opportunity.objects.filter(startup=startup)),
        "unreadMessages": unread_msg,
        "unreadNotifications": unread_notifs
    }
    
    profile = {
        "name": startup.name,
        "initials": startup.name[:2].upper(),
        "logoColor": startup.logo_color,
        "tagline": startup.tagline,
        "about": startup.about,
        "location": startup.location,
        "website": startup.website,
        "employees": startup.employees,
        "founded": startup.founded,
        "industry": startup.industry,
        "linkedinUrl": startup.linkedin_url,
        "badges": ["Logged in as " + startup.name, "Verified Company", "Startup Pro"]
    }
    
    # Open postings owned by this startup — this is what the invite picker
    # should target (NOT engagements, which are already-hired applications).
    opportunities = [
        {
            "id": opp.id,
            "title": opp.title,
            "hiringMode": opp.hiring_mode,
            "location": opp.location,
            "type": opp.type,
            "applicantCount": Application.objects.filter(opportunity=opp).count(),
            "hiredCount": Application.objects.filter(opportunity=opp, status='Hired').count(),
            "pendingInvites": Invitation.objects.filter(opportunity=opp, status='pending').count(),
        }
        for opp in Opportunity.objects.filter(startup=startup).order_by('-id')
    ]

    # Students who've teamed up with each other (platform-wide, not tied to
    # this startup specifically) — surfaced in the Candidates page under
    # "Team Up Students" so a startup can consider hiring the pair together.
    team_ups = []
    for tu in TeamUp.objects.filter(status='accepted').select_related(
        'requester__user', 'recipient__user'
    ).order_by('-created_at'):
        a, b = tu.requester, tu.recipient
        team_ups.append({
            "id": tu.id,
            "members": [
                {
                    "id": a.id,
                    "name": f"{a.user.first_name} {a.user.last_name}",
                    "initials": (a.user.first_name[0] if a.user.first_name else "") + (a.user.last_name[0] if a.user.last_name else ""),
                    "avatarColor": a.avatar_color,
                    "university": a.university,
                    "major": a.major,
                },
                {
                    "id": b.id,
                    "name": f"{b.user.first_name} {b.user.last_name}",
                    "initials": (b.user.first_name[0] if b.user.first_name else "") + (b.user.last_name[0] if b.user.last_name else ""),
                    "avatarColor": b.avatar_color,
                    "university": b.university,
                    "major": b.major,
                },
            ],
            "teamedUpAgo": human_time_ago(tu.created_at),
        })

    return JsonResponse({
        "profile": profile,
        "applicants": apps,
        "engagements": engs,
        "opportunities": opportunities,
        "teamUps": team_ups,
        "stats": stats
    })

@csrf_exempt
def startup_update_status(request):
    if request.method == 'POST':
        user = get_auth_user(request)
        if not user or not hasattr(user, 'startup_profile'):
            return JsonResponse({"error": "Unauthorized"}, status=401)
            
        data = json.loads(request.body)
        app_id = data.get('applicantId')
        new_status = data.get('status') # Rejected, Hired
        if new_status == 'Interview':
            return JsonResponse({"error": "Interview stage is no longer supported."}, status=400)
        
        app = Application.objects.filter(id=app_id, opportunity__startup=user.startup_profile).first()
        if app:
            startup = user.startup_profile

            if new_status == 'Hired':
                # Don't hire outright — send an invitation/offer that the
                # student must accept or reject from their own notifications.
                # The Application only flips to Hired once they accept (see
                # student_respond_invitation).
                already_pending = Invitation.objects.filter(
                    student=app.student, opportunity=app.opportunity,
                    invited_by_startup=startup, status='pending'
                ).exists()
                if not already_pending:
                    inv = Invitation.objects.create(
                        opportunity=app.opportunity, student=app.student,
                        invited_by_startup=startup, mode='solo', status='pending'
                    )
                    Notification.objects.create(
                        recipient=app.student.user, type='invitation',
                        title=f"Project invitation from {startup.name}",
                        body=f"{startup.name} wants to hire you for '{app.opportunity.title}'. Accept or decline below.",
                        invitation=inv,
                    )
                    Message.objects.create(
                        sender=user, receiver=app.student.user,
                        text=f"Hi! We'd love to hire you for '{app.opportunity.title}'. Check your notifications to accept."
                    )
                return JsonResponse({"success": True, "status": "Pending", "offerSent": True})

            app.status = new_status
            app.save()

            if new_status == 'Rejected':
                # Withdraw any outstanding invitation/offer too
                Invitation.objects.filter(
                    student=app.student, opportunity=app.opportunity,
                    invited_by_startup=startup, status='pending'
                ).update(status='declined')

            # Send message confirmation to student
            msg_text = ""
            if new_status == 'Rejected':
                msg_text = f"Thank you for applying to '{app.opportunity.title}'. Unfortunately, we decided not to move forward."
                
            if msg_text:
                Message.objects.create(
                    sender=user,
                    receiver=app.student.user,
                    text=msg_text
                )
            return JsonResponse({"success": True})
    return JsonResponse({"error": "Bad request"}, status=400)


@csrf_exempt
def startup_candidate_action(request):
    """
    Hire or Reject a candidate straight from the merged Candidates list —
    covers students who don't have a real Application row yet (either
    they've never applied, or they were only invited).

    Body JSON: { "studentId": <id>, "action": "hire" | "reject" }

    "reject" is immediate: the candidate moves straight to Rejected.
    "hire" is NOT immediate — it sends an invitation (same mechanism as the
    Invite modal). The candidate stays in Pending until they accept it from
    their own notifications; only then do they move into Hired.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "startup_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    startup = user.startup_profile
    data = json.loads(request.body)
    student_id = data.get("studentId")
    action = data.get("action")

    if action not in ("hire", "reject"):
        return JsonResponse({"error": "Invalid action"}, status=400)

    student = Student.objects.filter(id=student_id).first()
    if not student:
        return JsonResponse({"error": "Student not found"}, status=404)

    # Prefer the startup's most recent real posting; fall back to (or
    # create) the general/direct-application placeholder so a startup can
    # hire or reject a candidate even before posting any project.
    opp = Opportunity.objects.filter(startup=startup, is_general=False).order_by('-id').first()
    if not opp:
        opp = get_or_create_general_opportunity(startup)

    if action == "reject":
        app, created = Application.objects.get_or_create(
            student=student, opportunity=opp,
            defaults={'status': 'Rejected', 'cover_letter': ''}
        )
        if not created:
            app.status = 'Rejected'
            app.save()
        # Withdraw any outstanding invitation too
        Invitation.objects.filter(student=student, invited_by_startup=startup, status='pending').update(status='declined')
        Message.objects.create(
            sender=user, receiver=student.user,
            text=f"Thank you for your interest. Unfortunately, {startup.name} has decided not to move forward at this time."
        )
        return JsonResponse({"success": True, "status": "Rejected"})

    # action == "hire" — send an invitation; don't hire outright.
    already_invited = Invitation.objects.filter(
        student=student, invited_by_startup=startup, opportunity=opp, status='pending'
    ).exists()
    if not already_invited:
        inv = Invitation.objects.create(
            opportunity=opp, student=student, invited_by_startup=startup,
            mode='solo', status='pending'
        )
        Notification.objects.create(
            recipient=student.user, type='invitation',
            title=f"Project invitation from {startup.name}",
            body=f"{startup.name} wants to hire you for '{opp.title}'. Accept or decline below.",
            invitation=inv,
        )
        Message.objects.create(
            sender=user, receiver=student.user,
            text=f"Hi! We'd love to hire you for our '{opp.title}' project. Check your notifications to accept."
        )

    # Track it as an Application too so it shows up consistently — it stays
    # Pending until the invitation above is accepted (see
    # student_respond_invitation, which flips this to Hired/Rejected).
    app, created = Application.objects.get_or_create(
        student=student, opportunity=opp,
        defaults={'status': 'Pending', 'cover_letter': ''}
    )
    if not created and app.status == 'Rejected':
        app.status = 'Pending'
        app.save()

    return JsonResponse({"success": True, "status": "Pending"})


@csrf_exempt
def startup_post_project(request):
    if request.method == 'POST':
        user = get_auth_user(request)
        if not user or not hasattr(user, 'startup_profile'):
            return JsonResponse({"error": "Unauthorized"}, status=401)

        data = json.loads(request.body)
        title = (data.get('role') or data.get('title') or '').strip()
        if not title:
            return JsonResponse({"error": "Title is required"}, status=400)

        Opportunity.objects.create(
            startup=user.startup_profile,
            title=title,
            description=(data.get('description') or '').strip() or "Collaborate with our product engineering team to build exciting features.",
            industry=(data.get('industry') or '').strip() or user.startup_profile.industry,
            location=(data.get('location') or '').strip() or 'Remote',
            type=(data.get('type') or '').strip() or 'Part-time',
            duration=(data.get('duration') or '').strip() or '3 months',
            salary=(data.get('salary') or '').strip() or '$800/mo',
            tags=(data.get('tags') or '').strip() or 'React, TypeScript'
        )
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Bad request"}, status=400)

@csrf_exempt
def startup_save_settings(request):
    if request.method == 'POST':
        user = get_auth_user(request)
        if not user or not hasattr(user, 'startup_profile'):
            return JsonResponse({"error": "Unauthorized"}, status=401)
            
        data = json.loads(request.body)
        s = user.startup_profile
        s.name = data.get('name', s.name)
        s.tagline = data.get('tagline', s.tagline)
        s.about = data.get('about', s.about)
        s.location = data.get('location', s.location)
        s.website = data.get('website', s.website)
        s.employees = data.get('employees', s.employees)
        s.founded = data.get('founded', s.founded)
        s.industry = data.get('industry', s.industry)
        s.logo_color = data.get('logoColor', s.logo_color)
        s.linkedin_url = data.get('linkedinUrl', s.linkedin_url)
        s.save()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Bad request"}, status=400)

@csrf_exempt
def get_messages(request):
    user = get_auth_user(request)
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)
        
    chat_with_name = request.GET.get('chat_with', '')
    
    # We find the target user by first/last name or name
    target_user = None
    if chat_with_name:
        # Search student by full name
        student_match = Student.objects.filter(user__first_name__icontains=chat_with_name.split(' ')[0]).first()
        if student_match:
            target_user = student_match.user
        else:
            # Search startup by name
            startup_match = Startup.objects.filter(name__icontains=chat_with_name).first()
            if startup_match:
                target_user = startup_match.user
                
    if not target_user:
        # Fallback: get some recent user we've chatted with or startup
        if hasattr(user, 'student_profile'):
            target_user = Startup.objects.first().user
        else:
            first_student = Student.objects.first()
            if first_student:
                target_user = first_student.user
                
    if not target_user:
        return JsonResponse({"messages": []})
        
    # Mark messages as read
    Message.objects.filter(sender=target_user, receiver=user).update(is_unread=False)
    
    msgs = Message.objects.filter(
        models.Q(sender=user, receiver=target_user) |
        models.Q(sender=target_user, receiver=user)
    ).order_by('timestamp')
    
    chat_log = []
    for m in msgs:
        sender_label = "Orbitly" if hasattr(m.sender, 'startup_profile') else f"{m.sender.first_name} {m.sender.last_name}"
        chat_log.append({
            "id": m.id,
            "senderName": sender_label,
            "avatarColor": m.sender.student_profile.avatar_color if hasattr(m.sender, 'student_profile') else m.sender.startup_profile.logo_color,
            "timeAgo": m.timestamp.strftime("%H:%M") if m.timestamp else "Just now",
            "text": m.text,
            "isUnread": m.is_unread
        })
        
    return JsonResponse({
        "messages": chat_log,
        "chattingWith": f"{target_user.first_name} {target_user.last_name}" if hasattr(target_user, 'student_profile') else target_user.startup_profile.name
    })

@csrf_exempt
def send_message(request):
    if request.method == 'POST':
        user = get_auth_user(request)
        if not user:
            return JsonResponse({"error": "Unauthorized"}, status=401)
            
        data = json.loads(request.body)
        chat_with_name = data.get('chat_with', '')
        text = data.get('text')
        
        target_user = None
        # Locate receiver User
        student_match = Student.objects.filter(user__first_name__icontains=chat_with_name.split(' ')[0]).first()
        if student_match:
            target_user = student_match.user
        else:
            startup_match = Startup.objects.filter(name__icontains=chat_with_name).first()
            if startup_match:
                target_user = startup_match.user
                
        if not target_user:
            # Fallback
            if hasattr(user, 'student_profile'):
                target_user = Startup.objects.first().user
            else:
                target_user = Student.objects.first().user
                
        if target_user and text:
            Message.objects.create(
                sender=user,
                receiver=target_user,
                text=text,
                is_unread=True
            )
            return JsonResponse({"success": True})
            
    return JsonResponse({"error": "Bad request"}, status=400)

# ─── PROFILE VIEWS ──────────────────────────────────────────────────────────

@csrf_exempt
def student_public_profile(request, student_id):
    """Public profile page for a student — visible to startups and other students."""
    student = Student.objects.filter(id=student_id).first()
    if not student:
        return JsonResponse({"error": "Student not found"}, status=404)

    # Track real profile views — skip when the student is viewing their own
    # profile so the count reflects actual outside interest.
    viewer = get_auth_user(request)
    if not viewer or not hasattr(viewer, "student_profile") or viewer.student_profile.id != student.id:
        student.profile_views = models.F('profile_views') + 1
        student.save(update_fields=['profile_views'])
        student.refresh_from_db()

    u = student.user
    applications_count = Application.objects.filter(student=student).count()

    # Real profile-completeness score, computed from what's actually filled
    # in — not a static DB field that never updates as the student edits.
    fields_to_check = [
        student.bio, student.skills, student.location,
        student.portfolio_url, student.linkedin_url, student.github_url, student.open_to,
    ]
    filled = sum(1 for f in fields_to_check if f and f.strip())
    has_contribution = student.contributions.exists()
    profile_complete = round(
        (filled + (1 if has_contribution else 0)) / (len(fields_to_check) + 1) * 100
    )

    return JsonResponse({
        "id": student.id,
        "firstName": u.first_name,
        "lastName": u.last_name,
        "initials": (u.first_name[0] if u.first_name else "") + (u.last_name[0] if u.last_name else ""),
        "avatarColor": student.avatar_color,
        "university": student.university,
        "major": student.major,
        "year": student.year,
        "bio": student.bio,
        "skills": [s.strip() for s in student.skills.split(",") if s.strip()],
        "location": student.location,
        "portfolioUrl": student.portfolio_url,
        "linkedinUrl": student.linkedin_url,
        "githubUrl": student.github_url,
        "openTo": [o.strip() for o in student.open_to.split(",") if o.strip()],
        "profileViews": student.profile_views,
        "applicationsCount": applications_count,
        "profileComplete": profile_complete,
        "contributions": [
            {
                "id": c.id,
                "title": c.title,
                "organization": c.organization,
                "description": c.description,
                "link": c.link,
            }
            for c in student.contributions.all()
        ],
        "experience": [
            {
                "id": e.id,
                "company": e.company,
                "role": e.role,
                "period": e.period,
                "type": e.employment_type,
                "desc": e.description,
                "tags": [t.strip() for t in e.tags.split(",") if t.strip()],
                "logoColor": e.logo_color,
                "initials": e.company[:2].upper() if e.company else "",
            }
            for e in student.experiences.all()
        ],
        "certifications": [
            {
                "id": c.id,
                "name": c.name,
                "issuer": c.issuer,
                "date": c.date,
            }
            for c in student.certifications.all()
        ],
        "education": [
            {
                "id": ed.id,
                "institution": ed.institution,
                "degree": ed.degree,
                "period": ed.period,
                "gpa": ed.gpa,
                "courses": [c.strip() for c in ed.courses.split(",") if c.strip()],
            }
            for ed in student.education_entries.all()
        ],
    })


@csrf_exempt
def student_add_contribution(request):
    """Let a logged-in student add a past project/contribution to their public profile."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    title = (data.get("title") or "").strip()
    link = (data.get("link") or "").strip()
    if not title or not link:
        return JsonResponse({"error": "Title and link are required"}, status=400)

    contribution = StudentContribution.objects.create(
        student=user.student_profile,
        title=title,
        link=link,
        organization=(data.get("organization") or "").strip(),
        description=(data.get("description") or "").strip(),
    )
    return JsonResponse({
        "success": True,
        "contribution": {
            "id": contribution.id,
            "title": contribution.title,
            "organization": contribution.organization,
            "description": contribution.description,
            "link": contribution.link,
        },
    })


@csrf_exempt
def student_delete_contribution(request, contribution_id):
    """Let a logged-in student remove one of their own contributions."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    deleted, _ = StudentContribution.objects.filter(
        id=contribution_id, student=user.student_profile
    ).delete()
    if not deleted:
        return JsonResponse({"error": "Contribution not found"}, status=404)
    return JsonResponse({"success": True})


@csrf_exempt
def student_add_experience(request):
    """Let a logged-in student add a work experience entry to their profile."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    company = (data.get("company") or "").strip()
    role = (data.get("role") or "").strip()
    if not company or not role:
        return JsonResponse({"error": "Company and role are required"}, status=400)

    exp = Experience.objects.create(
        student=user.student_profile,
        company=company,
        role=role,
        period=(data.get("period") or "").strip(),
        employment_type=(data.get("type") or "").strip(),
        description=(data.get("desc") or "").strip(),
        tags=(data.get("tags") or "").strip(),
    )
    return JsonResponse({
        "success": True,
        "experience": {
            "id": exp.id,
            "company": exp.company,
            "role": exp.role,
            "period": exp.period,
            "type": exp.employment_type,
            "desc": exp.description,
            "tags": [t.strip() for t in exp.tags.split(",") if t.strip()],
            "logoColor": exp.logo_color,
            "initials": exp.company[:2].upper() if exp.company else "",
        },
    })


@csrf_exempt
def student_delete_experience(request, experience_id):
    """Let a logged-in student remove one of their own experience entries."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    deleted, _ = Experience.objects.filter(
        id=experience_id, student=user.student_profile
    ).delete()
    if not deleted:
        return JsonResponse({"error": "Experience not found"}, status=404)
    return JsonResponse({"success": True})


@csrf_exempt
def student_add_certification(request):
    """Let a logged-in student add a certification/award to their profile."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    name = (data.get("name") or "").strip()
    if not name:
        return JsonResponse({"error": "Certificate name is required"}, status=400)

    cert = Certification.objects.create(
        student=user.student_profile,
        name=name,
        issuer=(data.get("issuer") or "").strip(),
        date=(data.get("date") or "").strip(),
    )
    return JsonResponse({
        "success": True,
        "certification": {
            "id": cert.id,
            "name": cert.name,
            "issuer": cert.issuer,
            "date": cert.date,
        },
    })


@csrf_exempt
def student_delete_certification(request, certification_id):
    """Let a logged-in student remove one of their own certifications."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    deleted, _ = Certification.objects.filter(
        id=certification_id, student=user.student_profile
    ).delete()
    if not deleted:
        return JsonResponse({"error": "Certification not found"}, status=404)
    return JsonResponse({"success": True})


@csrf_exempt
def student_add_education(request):
    """Let a logged-in student add an education entry to their profile."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    institution = (data.get("institution") or "").strip()
    if not institution:
        return JsonResponse({"error": "Institution is required"}, status=400)

    edu = Education.objects.create(
        student=user.student_profile,
        institution=institution,
        degree=(data.get("degree") or "").strip(),
        period=(data.get("period") or "").strip(),
        gpa=(data.get("gpa") or "").strip(),
        courses=(data.get("courses") or "").strip(),
    )
    return JsonResponse({
        "success": True,
        "education": {
            "id": edu.id,
            "institution": edu.institution,
            "degree": edu.degree,
            "period": edu.period,
            "gpa": edu.gpa,
            "courses": [c.strip() for c in edu.courses.split(",") if c.strip()],
        },
    })


@csrf_exempt
def student_update_education(request, education_id):
    """Let a logged-in student edit one of their own education entries."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    edu = Education.objects.filter(id=education_id, student=user.student_profile).first()
    if not edu:
        return JsonResponse({"error": "Education entry not found"}, status=404)

    data = json.loads(request.body)
    institution = (data.get("institution") or "").strip()
    if not institution:
        return JsonResponse({"error": "Institution is required"}, status=400)

    edu.institution = institution
    edu.degree = (data.get("degree") or "").strip()
    edu.period = (data.get("period") or "").strip()
    edu.gpa = (data.get("gpa") or "").strip()
    edu.courses = (data.get("courses") or "").strip()
    edu.save()

    return JsonResponse({
        "success": True,
        "education": {
            "id": edu.id,
            "institution": edu.institution,
            "degree": edu.degree,
            "period": edu.period,
            "gpa": edu.gpa,
            "courses": [c.strip() for c in edu.courses.split(",") if c.strip()],
        },
    })


@csrf_exempt
def student_delete_education(request, education_id):
    """Let a logged-in student remove one of their own education entries."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    deleted, _ = Education.objects.filter(
        id=education_id, student=user.student_profile
    ).delete()
    if not deleted:
        return JsonResponse({"error": "Education entry not found"}, status=404)
    return JsonResponse({"success": True})


@csrf_exempt
def startup_public_profile(request, startup_id):
    """Public profile page for a startup — visible to students."""
    startup = Startup.objects.filter(id=startup_id).first()
    if not startup:
        return JsonResponse({"error": "Startup not found"}, status=404)

    # Track real profile views — skip when the startup is viewing its own
    # profile so the count reflects actual outside interest.
    viewer = get_auth_user(request)
    if not viewer or not hasattr(viewer, "startup_profile") or viewer.startup_profile.id != startup.id:
        startup.profile_views = models.F('profile_views') + 1
        startup.save(update_fields=['profile_views'])
        startup.refresh_from_db()

    # Count real stats
    posted_count = startup.opportunities.count()
    hired_count = Application.objects.filter(
        opportunity__startup=startup, status="Hired"
    ).count()

    return JsonResponse({
        "id": startup.id,
        "name": startup.name,
        "initials": startup.name[:2].upper(),
        "logoColor": startup.logo_color,
        "tagline": startup.tagline,
        "location": startup.location,
        "website": startup.website,
        "employees": startup.employees,
        "founded": startup.founded,
        "industry": startup.industry,
        "about": startup.about,
        "linkedinUrl": startup.linkedin_url,
        "stats": {
            "projectsPosted": posted_count,
            "studentsHired": hired_count,
            "profileViews": startup.profile_views,
        },
        "opportunities": [
            {
                "id": opp.id,
                "title": opp.title,
                "hiringMode": opp.hiring_mode,
                "tags": [t.strip() for t in opp.tags.split(",")],
            }
            for opp in startup.opportunities.all()
        ],
    })


@csrf_exempt
def student_update_profile(request):
    """Let a logged-in student update their own profile fields."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    s = user.student_profile

    first_name = data.get("firstName")
    last_name = data.get("lastName")
    if first_name is not None or last_name is not None:
        if first_name is not None:
            user.first_name = first_name.strip()
        if last_name is not None:
            user.last_name = last_name.strip()
        user.save(update_fields=["first_name", "last_name"])

    s.bio = data.get("bio", s.bio)
    s.skills = data.get("skills", s.skills)           # send as comma-separated string
    s.location = data.get("location", s.location)
    s.portfolio_url = data.get("portfolioUrl", s.portfolio_url)
    s.linkedin_url = data.get("linkedinUrl", s.linkedin_url)
    s.github_url = data.get("githubUrl", s.github_url)
    s.open_to = data.get("openTo", s.open_to)
    s.save()
    return JsonResponse({"success": True})


# ─── INVITATION VIEWS ────────────────────────────────────────────────────────

@csrf_exempt
def startup_invite(request):
    """
    Startup sends invitations for an opportunity.

    Body JSON:
    {
        "opportunityId": 3,
        "studentIds": [1],          // for solo or group_student_led: one student
                                    // for group_startup_led: up to 4 students
        "hiringMode": "solo" | "group_student_led" | "group_startup_led"
    }
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "startup_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    opp_id = data.get("opportunityId")
    student_ids = data.get("studentIds", [])
    hiring_mode = data.get("hiringMode", "solo")

    opp = Opportunity.objects.filter(id=opp_id, startup=user.startup_profile).first()
    if not opp:
        return JsonResponse({"error": "Opportunity not found"}, status=404)

    # Save the hiring mode on the opportunity
    opp.hiring_mode = hiring_mode
    opp.save()

    startup = user.startup_profile

    # A student should only ever get one active invitation per opportunity.
    # Filter out anyone who already has a pending or accepted invite here,
    # *before* creating a group, so we don't leave an empty orphan group
    # behind if everyone selected turns out to already be invited.
    skipped = []
    invitable_ids = []
    for sid in student_ids:
        student = Student.objects.filter(id=sid).first()
        if not student:
            continue
        already_invited = Invitation.objects.filter(
            opportunity=opp, student=student
        ).exclude(status="declined").exists()
        if already_invited:
            skipped.append(f"{student.user.first_name} {student.user.last_name}".strip())
        else:
            invitable_ids.append(sid)

    # For group modes, create a shared ProjectGroup first
    group = None
    if hiring_mode in ("group_student_led", "group_startup_led") and invitable_ids:
        group = ProjectGroup.objects.create(opportunity=opp)
        if hiring_mode == "group_student_led":
            leader_student = Student.objects.filter(id=invitable_ids[0]).first()
            group.leader = leader_student
            group.save()

    for sid in invitable_ids:
        student = Student.objects.filter(id=sid).first()
        if not student:
            continue

        inv = Invitation.objects.create(
            opportunity=opp,
            student=student,
            invited_by_startup=startup,
            group=group,
            mode=hiring_mode,
            status="pending",
        )

        # Build the notification body so the student sees full context immediately
        if hiring_mode == "solo":
            body = (
                f"{startup.name} wants YOU to build their entire website solo. "
                f"Project: {opp.title}. Accept or decline below."
            )
        elif hiring_mode == "group_student_led":
            body = (
                f"{startup.name} wants you to lead a team for {opp.title}. "
                f"You will recruit your own teammates after accepting."
            )
        else:  # group_startup_led
            total = len(invitable_ids)
            body = (
                f"{startup.name} has chosen a group of {total} students for {opp.title}. "
                f"You are one of them. The project starts once all members accept."
            )

        Notification.objects.create(
            recipient=student.user,
            type="invitation",
            title=f"Project invitation from {startup.name}",
            body=body,
            invitation=inv,
        )

    return JsonResponse({
        "success": True,
        "groupId": group.id if group else None,
        "skipped": skipped,
    })


@csrf_exempt
def student_respond_invitation(request, invitation_id):
    """
    Student accepts or declines an invitation.

    Body JSON:  { "response": "accepted" | "declined" }
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    inv = Invitation.objects.filter(id=invitation_id, student=user.student_profile).first()
    if not inv:
        return JsonResponse({"error": "Invitation not found"}, status=404)

    data = json.loads(request.body)
    response = data.get("response")  # "accepted" or "declined"
    if response not in ("accepted", "declined"):
        return JsonResponse({"error": "Invalid response"}, status=400)

    inv.status = response
    inv.save()

    # Keep the Application row (source of truth for the startup's
    # Candidates view) in sync with how the student responded — this is
    # what actually moves them from Pending into Hired or Rejected.
    app, _ = Application.objects.get_or_create(
        student=inv.student, opportunity=inv.opportunity,
        defaults={'status': 'Pending', 'cover_letter': ''}
    )
    app.status = 'Hired' if response == 'accepted' else 'Rejected'
    app.save()

    # Mark the related notification as read
    Notification.objects.filter(invitation=inv).update(is_read=True)

    if response == "accepted":
        # Add student to the group's members list
        if inv.group:
            inv.group.members.add(user.student_profile)
            inv.group.check_and_activate()   # fires if everyone accepted

        # If group just became active, notify all members + startup
        if inv.group and inv.group.status == "active":
            for member in inv.group.members.all():
                Notification.objects.create(
                    recipient=member.user,
                    type="group_active",
                    title=f"Your group for {inv.opportunity.title} is active!",
                    body="All team members have accepted. You can now start working.",
                    invitation=inv,
                )
            Notification.objects.create(
                recipient=inv.opportunity.startup.user,
                type="group_active",
                title=f"All students accepted for {inv.opportunity.title}",
                body="The full group has been confirmed. The project is now active.",
                invitation=inv,
            )
        else:
            # Notify startup that this student accepted
            Notification.objects.create(
                recipient=inv.opportunity.startup.user,
                type="invite_accepted",
                title=f"{user.first_name} {user.last_name} accepted your invitation",
                body=f"For project: {inv.opportunity.title}.",
                invitation=inv,
            )
    else:
        # Student declined — notify startup
        Notification.objects.create(
            recipient=inv.opportunity.startup.user,
            type="invite_declined",
            title=f"{user.first_name} {user.last_name} declined your invitation",
            body=f"For project: {inv.opportunity.title}. Consider inviting another student.",
            invitation=inv,
        )

    return JsonResponse({"success": True, "newStatus": response})


@csrf_exempt
def student_invite_teammate(request):
    """
    Used in group_student_led mode: the leader invites a teammate.

    Body JSON:
    {
        "invitationId": 5,    // the leader's own invitation (to get group + opportunity)
        "studentId": 8        // the teammate to invite
    }
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    leaders_inv_id = data.get("invitationId")
    teammate_id = data.get("studentId")

    leaders_inv = Invitation.objects.filter(
        id=leaders_inv_id,
        student=user.student_profile,
        mode="group_student_led",
        status="accepted",
    ).first()
    if not leaders_inv:
        return JsonResponse({"error": "Leader invitation not found or not accepted"}, status=404)

    teammate = Student.objects.filter(id=teammate_id).first()
    if not teammate:
        return JsonResponse({"error": "Student not found"}, status=404)

    # Make sure there's a group to attach to; create one lazily if missing
    group = leaders_inv.group
    if not group:
        group = ProjectGroup.objects.create(
            opportunity=leaders_inv.opportunity,
            leader=user.student_profile,
        )
        leaders_inv.group = group
        leaders_inv.save()

    inv = Invitation.objects.create(
        opportunity=leaders_inv.opportunity,
        student=teammate,
        invited_by_student=user.student_profile,
        group=group,
        mode="group_student_led",
        status="pending",
    )

    opp = leaders_inv.opportunity
    Notification.objects.create(
        recipient=teammate.user,
        type="invitation",
        title=f"Team invitation from {user.first_name} {user.last_name}",
        body=(
            f"{user.first_name} is building {opp.title} for {opp.startup.name} "
            f"and wants you to join the team. Accept or decline below."
        ),
        invitation=inv,
    )

    return JsonResponse({"success": True, "invitationId": inv.id})


@csrf_exempt
def student_notifications(request):
    """Return all notifications for the logged-in student, newest first."""
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    notifs = Notification.objects.filter(recipient=user).order_by("-created_at")[:50]
    result = []
    for n in notifs:
        item = {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "isRead": n.is_read,
            "createdAt": n.created_at.strftime("%Y-%m-%d %H:%M"),
            "invitation": None,
        }
        if n.invitation:
            inv = n.invitation
            item["invitation"] = {
                "id": inv.id,
                "status": inv.status,
                "mode": inv.mode,
                "opportunityId": inv.opportunity.id,
                "opportunityTitle": inv.opportunity.title,
                "startupName": inv.opportunity.startup.name,
                "startupId": inv.opportunity.startup.id,
                "groupId": inv.group.id if inv.group else None,
            }
        result.append(item)

    unread_count = Notification.objects.filter(recipient=user, is_read=False).count()
    return JsonResponse({"notifications": result, "unreadCount": unread_count})


@csrf_exempt
def startup_notifications(request):
    """Return all notifications for the logged-in startup, newest first.
    Mirrors student_notifications — startups get notified when a student
    accepts/declines an invitation, or when a group becomes fully active."""
    user = get_auth_user(request)
    if not user or not hasattr(user, "startup_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    notifs = Notification.objects.filter(recipient=user).order_by("-created_at")[:50]
    result = []
    for n in notifs:
        item = {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "isRead": n.is_read,
            "createdAt": n.created_at.strftime("%Y-%m-%d %H:%M"),
            "invitation": None,
        }
        if n.invitation:
            inv = n.invitation
            item["invitation"] = {
                "id": inv.id,
                "status": inv.status,
                "mode": inv.mode,
                "opportunityId": inv.opportunity.id,
                "opportunityTitle": inv.opportunity.title,
                "studentId": inv.student.id,
                "studentName": f"{inv.student.user.first_name} {inv.student.user.last_name}",
            }
        result.append(item)

    unread_count = Notification.objects.filter(recipient=user, is_read=False).count()
    return JsonResponse({"notifications": result, "unreadCount": unread_count})


@csrf_exempt
def mark_notifications_read(request):
    """Mark all (or specific) notifications as read."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = json.loads(request.body)
    ids = data.get("ids")   # optional list of specific notification ids
    qs = Notification.objects.filter(recipient=user)
    if ids:
        qs = qs.filter(id__in=ids)
    qs.update(is_read=True)
    return JsonResponse({"success": True})


@csrf_exempt
def list_students(request):
    """
    Browse students when choosing who to invite.
    Called by a startup (picking any mode's students) AND by a student who is
    leading a group_student_led team and needs to recruit teammates.
    Returns lightweight cards suitable for a picker UI.
    """
    user = get_auth_user(request)
    if not user or not (hasattr(user, "startup_profile") or hasattr(user, "student_profile")):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    students = Student.objects.select_related("user").all()
    # A student browsing to recruit teammates shouldn't see themselves in the list
    if hasattr(user, "student_profile"):
        students = students.exclude(id=user.student_profile.id)

    result = []
    for s in students:
        result.append({
            "id": s.id,
            "firstName": s.user.first_name,
            "lastName": s.user.last_name,
            "initials": (s.user.first_name[0] if s.user.first_name else "") + (s.user.last_name[0] if s.user.last_name else ""),
            "avatarColor": s.avatar_color,
            "university": s.university,
            "major": s.major,
            "year": s.year,
            "skills": [sk.strip() for sk in s.skills.split(",") if sk.strip()],
            "bio": s.bio[:120] + "…" if len(s.bio) > 120 else s.bio,
            "location": s.location,
        })
    return JsonResponse({"students": result})


@csrf_exempt
def list_startups(request):
    """
    Browse ALL registered startups/companies — used by students so every
    company that has signed up is visible to them, even ones that haven't
    posted an opportunity yet (they'd otherwise never appear in the
    dashboard's opportunity feed).
    """
    user = get_auth_user(request)
    if not user or not (hasattr(user, "student_profile") or hasattr(user, "startup_profile")):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    startups = Startup.objects.select_related("user").all().order_by('-id')
    # A startup browsing (e.g. to see who else is on the platform) shouldn't see itself
    if hasattr(user, "startup_profile"):
        startups = startups.exclude(id=user.startup_profile.id)

    student = user.student_profile if hasattr(user, "student_profile") else None
    bookmarked_startup_ids = set()
    if student:
        bookmarked_startup_ids = set(student.bookmarked_startups.values_list('id', flat=True))

    result = []
    for s in startups:
        open_opps = Opportunity.objects.filter(startup=s, is_general=False)
        has_applied = False
        if student:
            has_applied = Application.objects.filter(student=student, opportunity__startup=s).exists()
        result.append({
            "id": s.id,
            "name": s.name,
            "initials": s.name[:2].upper(),
            "logoColor": s.logo_color,
            "tagline": s.tagline,
            "industry": s.industry,
            "location": s.location,
            "website": s.website,
            "employees": s.employees,
            "founded": s.founded,
            "openRolesCount": open_opps.count(),
            "openRoles": [{"id": o.id, "title": o.title} for o in open_opps[:3]],
            "hasApplied": has_applied,
            "bookmarked": s.id in bookmarked_startup_ids,
        })
    return JsonResponse({"startups": result})


def _teamup_status_between(me, other):
    """Returns (status, teamup_id) describing the team-up relationship
    between `me` and `other` from `me`'s point of view."""
    tu = TeamUp.objects.filter(
        models.Q(requester=me, recipient=other) | models.Q(requester=other, recipient=me)
    ).first()
    if not tu:
        return "none", None
    if tu.status == "accepted":
        return "accepted", tu.id
    if tu.status == "declined":
        return "none", None
    # pending
    if tu.requester_id == me.id:
        return "pending_sent", tu.id
    return "pending_received", tu.id


def list_peer_students(request):
    """
    Browse every other student on the platform — powers the "Students Like
    You" section on the student dashboard, with each student's team-up
    status relative to the logged-in student.
    """
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    me = user.student_profile
    peers = Student.objects.exclude(id=me.id).select_related("user").order_by('-id')

    result = []
    for stud in peers:
        status, teamup_id = _teamup_status_between(me, stud)
        result.append({
            "id": stud.id,
            "firstName": stud.user.first_name,
            "lastName": stud.user.last_name,
            "initials": (stud.user.first_name[0] if stud.user.first_name else "") + (stud.user.last_name[0] if stud.user.last_name else ""),
            "avatarColor": stud.avatar_color,
            "university": stud.university,
            "major": stud.major,
            "year": stud.year,
            "bio": stud.bio,
            "skills": [s.strip() for s in stud.skills.split(",") if s.strip()],
            "location": stud.location,
            "teamUpStatus": status,   # none | pending_sent | pending_received | accepted
            "teamUpId": teamup_id,
        })
    return JsonResponse({"students": result})


@csrf_exempt
def student_teamup_request(request):
    """Send (or auto-accept, if they'd already requested you) a team-up
    request to another student."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    me = user.student_profile
    data = json.loads(request.body)
    target_id = data.get("studentId")
    target = Student.objects.filter(id=target_id).first()
    if not target or target.id == me.id:
        return JsonResponse({"error": "Student not found"}, status=404)

    # If they already sent me a request, this is a mutual match — accept it.
    reverse = TeamUp.objects.filter(requester=target, recipient=me).first()
    if reverse:
        reverse.status = "accepted"
        reverse.save()
        Notification.objects.create(
            recipient=target.user, type="teamup_accepted",
            title="Team-up accepted!",
            body=f"{me.user.first_name} {me.user.last_name} accepted your team-up request.",
        )
        return JsonResponse({"success": True, "status": "accepted", "teamUpId": reverse.id})

    tu, created = TeamUp.objects.get_or_create(
        requester=me, recipient=target, defaults={"status": "pending"}
    )
    if not created and tu.status == "declined":
        tu.status = "pending"
        tu.save()
    if created or tu.status == "pending":
        Notification.objects.create(
            recipient=target.user, type="teamup_request",
            title="New team-up request",
            body=f"{me.user.first_name} {me.user.last_name} wants to team up with you.",
        )
    return JsonResponse({"success": True, "status": "pending_sent", "teamUpId": tu.id})


@csrf_exempt
def student_teamup_respond(request):
    """Accept or decline a team-up request that was sent to me."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    user = get_auth_user(request)
    if not user or not hasattr(user, "student_profile"):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    me = user.student_profile
    data = json.loads(request.body)
    teamup_id = data.get("teamUpId")
    response = data.get("response")  # "accepted" | "declined"

    tu = TeamUp.objects.filter(id=teamup_id, recipient=me).first()
    if not tu:
        return JsonResponse({"error": "Team-up request not found"}, status=404)
    if response not in ("accepted", "declined"):
        return JsonResponse({"error": "Invalid response"}, status=400)

    tu.status = response
    tu.save()
    if response == "accepted":
        Notification.objects.create(
            recipient=tu.requester.user, type="teamup_accepted",
            title="Team-up accepted!",
            body=f"{me.user.first_name} {me.user.last_name} accepted your team-up request.",
        )
    return JsonResponse({"success": True, "status": response})