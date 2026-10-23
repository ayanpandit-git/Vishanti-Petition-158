from typing import Literal

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import mysql.connector
from app.database import get_connection

app = FastAPI(title="Vishanti Petition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

class ComplaintCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    priority: Literal["Low", "Medium", "High"] = "Medium"
    is_anonymous : bool = False

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/complaints", status_code=201)
def create_complaint(complaint: ComplaintCreate):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO complaints (title, description, category, priority, is_anonymous)
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
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
        if(cursor is not None):
            cursor.close()

        if(connection is not None and connection.is_connected()):
            connection.close()