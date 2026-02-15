from django.db import models
from core.models import TimeStampedModel
from ministries.models import Ministry

class Member(TimeStampedModel):
    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('WIDOWED', 'Widowed'),
        ('DIVORCED', 'Divorced'),
    ]

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
    ]

    MEMBER_TYPE_CHOICES = [
        ('NEW', 'New Member'),
        ('OLD', 'Old Member'),
    ]

    # Header / Meta
    member_type = models.CharField(max_length=10, choices=MEMBER_TYPE_CHOICES, default='NEW')
    member_id = models.CharField(max_length=20, unique=True, blank=True)
    joined_date = models.DateField(blank=True, null=True) # Manual entry now

    # Personal Details
    full_name = models.CharField(max_length=255)
    also_known_as = models.CharField(max_length=255, blank=True, null=True)
    passport_photo = models.ImageField(upload_to='members/photos/', blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='MALE')
    year_of_birth = models.IntegerField(null=True, blank=True)
    other_details = models.TextField(blank=True, null=True)
    
    # Contact Info
    phone = models.CharField(max_length=20, unique=True) # Important for identification
    national_id = models.CharField(max_length=20, blank=True, null=True, unique=True) # Added for identification
    email = models.EmailField(blank=True, null=True)
    
    # Residence
    estate = models.CharField(max_length=100, blank=True, null=True)
    phase = models.CharField(max_length=100, blank=True, null=True)
    plot = models.CharField(max_length=100, blank=True, null=True)
    door = models.CharField(max_length=100, blank=True, null=True)
    
    # Living Arrangement
    staying_with = models.CharField(max_length=255, blank=True, null=True)
    staying_with_relation = models.CharField(max_length=100, blank=True, null=True)

    # Family Details
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, default='SINGLE')
    spouse_name = models.CharField(max_length=255, blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    spouse_workplace = models.CharField(max_length=255, blank=True, null=True)
    spouse_occupation = models.CharField(max_length=255, blank=True, null=True)
    
    father_name = models.CharField(max_length=255, blank=True, null=True)
    mother_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Next of Kin
    next_of_kin_name = models.CharField(max_length=255, blank=True, null=True)
    next_of_kin_relation = models.CharField(max_length=100, blank=True, null=True)
    next_of_kin_phone = models.CharField(max_length=20, blank=True, null=True)

    # Location / Origin
    county = models.CharField(max_length=100, blank=True, null=True)
    sub_county = models.CharField(max_length=100, blank=True, null=True)
    ward = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=100, blank=True, null=True)

    # Education & Work
    education_level = models.CharField(max_length=100, blank=True, null=True)
    education_course = models.CharField(max_length=255, blank=True, null=True)
    work_place = models.CharField(max_length=255, blank=True, null=True)
    occupation = models.CharField(max_length=255, blank=True, null=True)
    work_area = models.CharField(max_length=100, blank=True, null=True)

    # Spiritual Details
    saved = models.BooleanField(default=False)
    saved_date = models.DateField(blank=True, null=True)
    saved_where = models.CharField(max_length=255, blank=True, null=True)
    
    baptized = models.BooleanField(default=False)
    baptized_date = models.DateField(blank=True, null=True)
    
    previous_church = models.CharField(max_length=255, blank=True, null=True)
    previous_ministry = models.CharField(max_length=255, blank=True, null=True)
    
    main_ministry = models.ForeignKey(Ministry, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    desired_ministry = models.CharField(max_length=255, blank=True, null=True) # Text for now as they might not be created yet
    
    influence_reason = models.TextField(blank=True, null=True, help_text="What influenced you to come to this church?")
    prayer_need = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.member_id:
            # Simple ID generation logic: COC + Year + Increment
            import datetime
            year = datetime.date.today().year
            last_member = Member.objects.last()
            if last_member and last_member.member_id.startswith(f"COC{year}"):
                try:
                    last_id_num = int(last_member.member_id[-4:])
                    new_id_num = last_id_num + 1
                except ValueError:
                    new_id_num = 1
            else:
                new_id_num = 1
            self.member_id = f"COC{year}{new_id_num:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.member_id})"


class Child(TimeStampedModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='children')
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField(blank=True, null=True)
    school_or_work = models.CharField(max_length=255, blank=True, null=True, help_text="School / College / University / Place of Work")
    class_or_course = models.CharField(max_length=255, blank=True, null=True, help_text="Class / Course / Type of Work")

    def __str__(self):
        return f"{self.full_name} (Child of {self.member.full_name})"
