from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import aiofiles
import os
from pathlib import Path

from app import models, schemas
from app.core import security
from app.services.rag_service import RAGService
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()
rag_service = RAGService()


@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for processing"""
    # Validate file type
    allowed_types = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Validate file size (max 10MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Save file
    upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / f"{file.filename}"
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    # Create document record
    db_document = models.Document(
        filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        content_type=file.content_type,
        user_id=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Process document asynchronously (in production, use background tasks)
    result = rag_service.process_document(current_user.id, str(file_path), file.filename)

    # Update document status
    if result['status'] == 'success':
        db_document.status = 'completed'
    else:
        db_document.status = 'failed'
    db.commit()

    return schemas.DocumentResponse(
        id=db_document.id,
        filename=db_document.filename,
        status=db_document.status,
        message=result['message'],
        chunks_count=result.get('chunks_count', 0)
    )


@router.get("/", response_model=List[schemas.Document])
def get_user_documents(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for the current user"""
    documents = db.query(models.Document).filter(models.Document.user_id == current_user.id).all()
    return documents


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document"""
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete from database
    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


@router.post("/query", response_model=schemas.QueryResponse)
def query_documents(
    query: schemas.QueryRequest,
    current_user: models.User = Depends(security.get_current_user)
):
    """Query user's documents"""
    result = rag_service.query_documents(current_user.id, query.question)

    return schemas.QueryResponse(
        answer=result['answer'],
        sources=result['sources'],
        confidence=result['confidence']
    )
