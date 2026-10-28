import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Literal
import mysql.connector
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel, Field
from app.database import get_connection

load_dotenv()
app = FastAPI(title="Vishanti Petition API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME_HOURS = 8

password_hasher = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=128)

class CreateComplaint(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    priority: Literal["Low", "Medium", "High"] = "Medium"
    is_anonymous: bool = False

def close_database(connection, cursor):
    if(cursor is not None):
        cursor.close()
    if(connection is not None and connection.is_connected()):
        connection.close()

def create_access_token(user_id: int) -> str:
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET_KEY is not configured on the server.",
        )

    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_LIFETIME_HOURS)
    
    payload = {
        "sub": str(user_id),
        "exp": expires_at
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)
):
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET_KEY is not configured on the server.",
        )
    if(credentials is None):
        raise HTTPException(
            status_code=401,
            detail="Please log in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    connection = None
    cursor = None

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = int(payload["sub"])
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, username, role
            FROM users
            WHERE user_id = %s
            """,
            (user_id,),
        )

        user = cursor.fetchone()

        if(user is None):
            raise HTTPException(
                status_code=401,
                detail="This account no longer exists.",
                header={"WWW-Authenticate": "Bearer"},
            )

        return user
    
    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired login token.",
            header={"WWW-Authenticate": "Bearer"},
        ) from error
    
    except mysql.connection.Error as error:
        raise HTTPException(
            status_code=500,
            detail="A database error occured while checking your account.",
        ) from error
    
    finally:
        close_database(connection, cursor)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/auth/register", status_code=201)
def register_student(request: RegisterRequest):
    password_hash = password_hasher.hash(request.password)

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO users (username, password_hash, role)
            VALUES (%s, %s, %s)
            """,
            (request.username, password_hash, "student")
        )

        connection.commit()

        return {
            "message": "Student account created successfully.",
            "user_id": cursor.lastrowid,
            "username": request.username,
            "role": "student",
        }
    
    except mysql.connector.IntegrityError as error:
        if(connection is not None and connection.is_connected()):
            connection.rollback()

        if(error.errno == 1062):
            raise HTTPException(
                status_code=409,
                detail="That username is already taken."
            ) from error

        raise HTTPException(
            status_code=500,
            detail="A database error occured during registration.",
        ) from error
    
    except mysql.connector.Error as error:
        if(connection is not None and connection.is_connected()):
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="A database error occured during registration."
        ) from error

    finally:
        close_database(connection, cursor)

@app.post("/api/auth/login")
def login(request: LoginRequest):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, username, password_hash, role
            FROM users
            WHERE username = %s
            """,
            (request.username,),
        )

        user = cursor.fetchone()

        if(user is None or not password_hasher.verify(
            request.password,
            user["password_hash"],
        )):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password.",
            )

        access_token = create_access_token(user["user_id"])

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": TOKEN_LIFETIME_HOURS * 3600,
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "role": user["role"],
            },
        }

    except mysql.connector.Error as error:
        raise HTTPException(
            status_code=500,
            detail="A database error occured during login.",
        )

    finally:
        close_database(connection, cursor)

@app.get("/api/auth/me")
def get_my_account(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/complaints", status_code=201)
def create_complaint(
    complaint: CreateComplaint,
    current_user: dict = Depends(get_current_user),
):
    if(current_user["role"] != "student"):
        raise HTTPException(
            status_code=403,
            detail="Only students can file complaints.",
        )
    
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO complaints (created_by, title, description, category, priority, is_anonymous)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            current_user["user_id"],
            complaint.title,
            complaint.description,
            complaint.category,
            complaint.priority,
            complaint.is_anonymous,
        )

        cursor.execute(query, values)
        connection.commit()

        return {
            "message": "Complaint filed successfully",
            "complaint_id": cursor.lastrowid,
            "status": "Filed",
        }
    
    except mysql.connector.Error as error:
        if(connection is not None and connection.is_connected()):
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="A database error occured while filing the complaint.",
        ) from error
    
    finally:
        close_database(connection, cursor)