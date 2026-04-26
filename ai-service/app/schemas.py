from pydantic import BaseModel
from typing import Optional


class Experience(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: bool = False
    description: Optional[str] = None
    highlights: list[str] = []


class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None


class Skill(BaseModel):
    name: str
    level: str = "intermediate"
    category: Optional[str] = None


class Certification(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    technologies: list[str] = []


class Language(BaseModel):
    name: str
    proficiency: str = "professional_working"


class TotalExperience(BaseModel):
    years: int = 0
    months: int = 0


class ParsedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    totalExperience: Optional[TotalExperience] = None
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    behanceUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    summary: Optional[str] = None
    experiences: list[Experience] = []
    education: list[Education] = []
    skills: list[Skill] = []
    certifications: list[Certification] = []
    projects: list[Project] = []
    languages: list[Language] = []
    achievements: list[str] = []


class GenerateRequest(BaseModel):
    user_profile: dict
    job_description: str
    template_id: str


class GenerateResponse(BaseModel):
    content: dict
    score: int
