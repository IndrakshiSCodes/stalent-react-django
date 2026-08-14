from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    university = models.CharField(max_length=255)
    major = models.CharField(max_length=255, default='CS')
    year = models.IntegerField(default=3)
    profile_complete = models.IntegerField(default=98)
    avatar_color = models.CharField(max_length=7, default='#5b5bf7')
    bio = models.TextField(blank=True, default='')
    skills = models.CharField(max_length=500, blank=True, default='')   # comma-separated
    location = models.CharField(max_length=255, blank=True, default='')
    portfolio_url = models.CharField(max_length=255, blank=True, default='')
    linkedin_url = models.CharField(max_length=255, blank=True, default='')
    github_url = models.CharField(max_length=255, blank=True, default='')
    open_to = models.CharField(max_length=500, blank=True, default='')  # comma-separated
    bookmarks = models.ManyToManyField('Opportunity', related_name='bookmarked_by', blank=True)
    bookmarked_startups = models.ManyToManyField('Startup', related_name='bookmarked_by_students', blank=True)
    profile_views = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class StudentContribution(models.Model):
    """A past project/contribution a student wants to show off on their
    public profile — e.g. a website they built for another startup, an
    open-source project, a personal build. Always has a link."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='contributions')
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True, default='')  # e.g. the startup/company name, optional
    description = models.TextField(blank=True, default='')
    link = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.student}"


class Experience(models.Model):
    """A past job/internship a student wants to show on their profile —
    replaces the old hardcoded work-experience mock data."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    period = models.CharField(max_length=100, blank=True, default='')
    employment_type = models.CharField(max_length=100, blank=True, default='')  # e.g. "Part-time · Remote"
    description = models.TextField(blank=True, default='')
    tags = models.CharField(max_length=500, blank=True, default='')  # comma-separated
    logo_color = models.CharField(max_length=7, default='#1b2a4a')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.role} at {self.company} — {self.student}"


class Education(models.Model):
    """A school/degree entry a student wants to show on their profile —
    replaces the old hardcoded education mock data."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='education_entries')
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255, blank=True, default='')
    period = models.CharField(max_length=100, blank=True, default='')
    gpa = models.CharField(max_length=50, blank=True, default='')
    courses = models.CharField(max_length=500, blank=True, default='')  # comma-separated
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.degree} at {self.institution} — {self.student}"


class Certification(models.Model):
    """A certificate/award a student wants to show on their profile —
    replaces the old hardcoded certifications mock data."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True, default='')
    date = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.student}"


class Startup(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='startup_profile')
    name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=500, default='Building the future.')
    location = models.CharField(max_length=255, default='San Francisco, CA')
    website = models.CharField(max_length=255, default='company.com')
    employees = models.CharField(max_length=100, default='1-10 employees')
    founded = models.CharField(max_length=100, default='Founded 2023')
    industry = models.CharField(max_length=255, default='SaaS / DevTools')
    logo_color = models.CharField(max_length=7, default='#5b5bf7')
    about = models.TextField(blank=True, default='')
    linkedin_url = models.CharField(max_length=255, blank=True, default='')
    profile_views = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Opportunity(models.Model):
    HIRING_MODE_CHOICES = (
        ('solo', 'Single student'),
        ('group_student_led', 'Group – student forms the team'),
        ('group_startup_led', 'Group – startup picks the team'),
    )

    startup = models.ForeignKey(Startup, on_delete=models.CASCADE, related_name='opportunities')
    title = models.CharField(max_length=255)
    description = models.TextField()
    industry = models.CharField(max_length=255, default='SaaS / DevTools')
    location = models.CharField(max_length=255, default='Remote')
    type = models.CharField(max_length=100, default='Part-time')
    duration = models.CharField(max_length=100, default='3 months')
    salary = models.CharField(max_length=100, default='$800/mo')
    tags = models.CharField(max_length=500, default='React, TypeScript, Tailwind')
    featured = models.BooleanField(default=False)
    hiring_mode = models.CharField(max_length=30, choices=HIRING_MODE_CHOICES, default='solo')
    # A synthetic, auto-created placeholder "role" used when a student applies
    # directly to a company that hasn't posted any real opportunity, or when a
    # startup wants to hire a candidate without a posted role. Never shown in
    # the general opportunity browse feed — only surfaced to the student(s)
    # who actually applied through it, and to the startup's own dashboard.
    is_general = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.startup.name}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Interview', 'Interview'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    cover_letter = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.first_name} applied to {self.opportunity.title}"


class ProjectGroup(models.Model):
    """Represents a team of students working on one opportunity together."""
    STATUS_CHOICES = (
        ('forming', 'Forming – waiting for all members to accept'),
        ('active', 'Active – everyone accepted'),
        ('cancelled', 'Cancelled'),
    )
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='groups')
    members = models.ManyToManyField(Student, related_name='project_groups', blank=True)
    leader = models.ForeignKey(
        Student, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='led_groups'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='forming')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group for {self.opportunity.title}"

    def check_and_activate(self):
        """Auto-activate when every invited member has accepted."""
        total_invited = self.invitations.count()
        total_accepted = self.invitations.filter(status='accepted').count()
        if total_invited > 0 and total_invited == total_accepted:
            self.status = 'active'
            self.save()


class Invitation(models.Model):
    """
    A direct invitation from a startup (or a student leader) to a specific student.
    mode mirrors the parent opportunity's hiring_mode so the student sees it in the
    notification without having to fetch the opportunity separately.
    """
    MODE_CHOICES = (
        ('solo', 'Solo project'),
        ('group_student_led', 'Group – you recruit teammates'),
        ('group_startup_led', 'Group – startup chose the team'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )

    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='invitations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invitations')
    invited_by_startup = models.ForeignKey(
        Startup, null=True, blank=True,
        on_delete=models.CASCADE, related_name='sent_invitations'
    )
    invited_by_student = models.ForeignKey(
        Student, null=True, blank=True,
        on_delete=models.CASCADE, related_name='teammate_invitations'
    )
    group = models.ForeignKey(
        ProjectGroup, null=True, blank=True,
        on_delete=models.CASCADE, related_name='invitations'
    )
    mode = models.CharField(max_length=30, choices=MODE_CHOICES, default='solo')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite → {self.student} for {self.opportunity.title} [{self.status}]"


class TeamUp(models.Model):
    """A peer-to-peer pairing between two students (independent of any
    startup/opportunity) — shown to startups afterwards so they can see
    which students have already teamed up and consider hiring them
    together."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )
    requester = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='teamup_sent')
    recipient = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='teamup_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'recipient')

    def __str__(self):
        return f"{self.requester} \u21c4 {self.recipient} [{self.status}]"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('invitation', 'Project invitation'),
        ('invite_accepted', 'Teammate accepted'),
        ('invite_declined', 'Teammate declined'),
        ('group_active', 'Group is now active'),
        ('status_change', 'Application status changed'),
        ('message', 'New message'),
        ('application', 'New application received'),
        ('teamup_request', 'Team-up request'),
        ('teamup_accepted', 'Team-up accepted'),
    )
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    invitation = models.ForeignKey(
        Invitation, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] → {self.recipient.username}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_unread = models.BooleanField(default=True)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"