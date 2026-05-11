from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

DATABASE_URL = "sqlite:///./votafest.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SECRET_KEY = "votafest-upb-2026-secret-key-xK9mP2qR"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")


class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=False)
    color = Column(String, default="teal")  # verde, rojo, amarillo, teal, rosa, naranja
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="options")
    votes = relationship("Vote", back_populates="option")


class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True)
    option_id = Column(Integer, ForeignKey("options.id"))
    voter_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    option = relationship("Option", back_populates="votes")


Base.metadata.create_all(bind=engine)

app = FastAPI(title="VotaFest API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptionCreate(BaseModel):
    text: str
    color: str = "teal"


class OptionResponse(BaseModel):
    id: int
    text: str
    color: str
    vote_count: int = 0

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    text: str
    options: List[OptionCreate]


class QuestionResponse(BaseModel):
    id: int
    text: str
    is_active: bool
    options: List[OptionResponse]
    total_votes: int = 0

    class Config:
        from_attributes = True


class VoteCreate(BaseModel):
    option_id: int
    voter_id: str


class Token(BaseModel):
    access_token: str
    token_type: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise exc
    except JWTError:
        raise exc
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin:
        raise exc
    return admin


def build_question_response(q) -> QuestionResponse:
    options = []
    total = 0
    for opt in q.options:
        count = len(opt.votes)
        total += count
        options.append(OptionResponse(id=opt.id, text=opt.text, color=opt.color, vote_count=count))
    return QuestionResponse(id=q.id, text=q.text, is_active=q.is_active, options=options, total_votes=total)


def init_db():
    db = SessionLocal()
    if not db.query(Admin).filter(Admin.username == "admin").first():
        db.add(Admin(username="admin", hashed_password=get_password_hash("votafest2026")))
        db.commit()
    db.close()


init_db()


@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    return {"access_token": create_access_token({"sub": admin.username}), "token_type": "bearer"}


@app.get("/questions", response_model=List[QuestionResponse])
def get_questions(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return [build_question_response(q) for q in db.query(Question).order_by(Question.created_at.desc()).all()]


@app.post("/questions", response_model=QuestionResponse)
def create_question(
    question: QuestionCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    db_q = Question(text=question.text)
    db.add(db_q)
    db.flush()
    for opt in question.options:
        db.add(Option(text=opt.text, color=opt.color, question_id=db_q.id))
    db.commit()
    db.refresh(db_q)
    return build_question_response(db_q)


@app.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(q)
    db.commit()
    return {"ok": True}


@app.post("/questions/{question_id}/activate")
def activate_question(question_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    db.query(Question).update({"is_active": False})
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    q.is_active = True
    db.commit()
    return {"ok": True}


@app.post("/questions/deactivate-all")
def deactivate_all(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    db.query(Question).update({"is_active": False})
    db.commit()
    return {"ok": True}


@app.get("/active-question")
def get_active_question(db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.is_active == True).first()
    if not q:
        return None
    options = []
    total = 0
    for opt in q.options:
        count = len(opt.votes)
        total += count
        options.append({"id": opt.id, "text": opt.text, "color": opt.color, "vote_count": count})
    return {"id": q.id, "text": q.text, "is_active": True, "options": options, "total_votes": total}


@app.post("/vote")
def cast_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    option = db.query(Option).filter(Option.id == vote.option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opción no encontrada")

    question = db.query(Question).filter(Question.id == option.question_id).first()
    if not question or not question.is_active:
        raise HTTPException(status_code=400, detail="La pregunta no está activa actualmente")

    existing = (
        db.query(Vote)
        .join(Option)
        .filter(Option.question_id == option.question_id, Vote.voter_id == vote.voter_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Ya registraste tu voto en esta pregunta")

    db.add(Vote(option_id=vote.option_id, voter_id=vote.voter_id))
    db.commit()

    options = []
    total = 0
    for opt in question.options:
        count = len(opt.votes)
        total += count
        options.append({"id": opt.id, "text": opt.text, "color": opt.color, "vote_count": count})
    return {"id": question.id, "text": question.text, "options": options, "total_votes": total}


@app.get("/results/{question_id}")
def get_results(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return build_question_response(q)
