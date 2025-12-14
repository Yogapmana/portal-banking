"""
ML Scoring Service for Bank Marketing Lead Scoring
Uses trained Random Forest model to predict customer conversion probability
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import pickle
import pandas as pd
import numpy as np
import os

app = FastAPI(
    title="Credit Scoring ML Service",
    description="ML service untuk prediksi skor prioritas nasabah",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model saat startup
MODEL_PATH = os.getenv("MODEL_PATH", "/app/model/credit_scoring_model.pkl")
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        # Try joblib first (recommended for sklearn models)
        try:
            model = joblib.load(MODEL_PATH)
            print(f"✅ Model loaded with joblib from {MODEL_PATH}")
        except Exception:
            # Fallback to pickle
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print(f"✅ Model loaded with pickle from {MODEL_PATH}")
        
        print(f"   Model type: {type(model)}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model = None


class CustomerData(BaseModel):
    """Input data untuk prediksi skor nasabah - 7 key features only"""
    age: int = Field(..., ge=17, le=100, description="Usia nasabah")
    job: str = Field(..., description="Pekerjaan")
    marital: str = Field(..., description="Status pernikahan")
    education: str = Field(..., description="Pendidikan")
    default: str = Field(default="no", description="Memiliki kredit macet?")
    housing: str = Field(..., description="Memiliki rumah?")
    loan: str = Field(..., description="Memiliki pinjaman?")


class ScoreResponse(BaseModel):
    """Response dari prediksi skor"""
    score: float = Field(..., description="Skor probabilitas 0-100")
    probability: float = Field(..., description="Raw probability 0-1")
    priority: str = Field(..., description="Kategori prioritas: HIGH/MEDIUM/LOW")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


# Mapping values untuk encoding - 7 key features only
JOB_VALUES = [
    "admin.", "blue-collar", "entrepreneur", "housemaid", "management",
    "retired", "self-employed", "services", "student", "technician",
    "unemployed", "unknown"
]

MARITAL_VALUES = ["divorced", "married", "single", "unknown"]

EDUCATION_VALUES = [
    "basic.4y", "basic.6y", "basic.9y", "high.school", "illiterate",
    "professional.course", "university.degree", "unknown"
]

YES_NO_VALUES = ["no", "yes", "unknown"]


def prepare_features(data: CustomerData) -> pd.DataFrame:
    """Prepare features for model prediction - 7 key features only"""
    
    # Create dataframe with 7 key features only
    # Model trained with: age, job, marital, education, default, housing, loan
    features = {
        "age": [data.age],
        "job": [data.job.lower()],
        "marital": [data.marital.lower()],
        "education": [data.education.lower()],
        "default": [data.default.lower()],
        "housing": [data.housing.lower()],
        "loan": [data.loan.lower()],
    }
    
    df = pd.DataFrame(features)
    return df


def get_priority(score: float) -> str:
    """Determine priority category based on score"""
    if score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model is not None else "degraded",
        model_loaded=model is not None
    )


@app.post("/predict", response_model=ScoreResponse)
async def predict_score(data: CustomerData):
    """
    Predict customer conversion probability score
    
    Returns a score from 0-100 indicating likelihood of conversion
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Service unavailable."
        )
    
    try:
        # Prepare features
        features_df = prepare_features(data)
        
        # Get prediction probability
        # Model returns [prob_class_0, prob_class_1]
        # We want prob_class_1 (probability of conversion)
        proba = model.predict_proba(features_df)[0]
        
        # Get probability of positive class (conversion)
        probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
        
        # ===========================================
        # BETTER SCALING FOR 7-FEATURE MODEL
        # ===========================================
        # Model trained on imbalanced data (11% positive rate)
        # Raw probability distribution:
        #   - Low: 0.05 - 0.20 -> Score 10-40 (LOW)
        #   - Medium: 0.20 - 0.35 -> Score 40-70 (MEDIUM)
        #   - High: 0.35+ -> Score 70-100 (HIGH)
        #
        # Scaling factor 2.0x provides proportional mapping:
        #   - 0.20 -> 40 (LOW/MEDIUM boundary)
        #   - 0.35 -> 70 (MEDIUM/HIGH boundary)
        #   - 0.50 -> 100 (Maximum)
        
        scaling_factor = 2.0  # Proportional: 0.50 probability = 100 score
        adjusted_probability = min(1.0, probability * scaling_factor)
        
        score = round(adjusted_probability * 100, 2)
        
        # Determine priority (Standard thresholds)
        priority = get_priority(score)
        
        return ScoreResponse(
            score=score,
            probability=round(probability, 4),  # Keep raw prob for debugging
            priority=priority
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@app.post("/predict/batch")
async def predict_batch(customers: list[CustomerData]):
    """
    Batch prediction for multiple customers
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Service unavailable."
        )
    
    results = []
    for customer in customers:
        try:
            features_df = prepare_features(customer)
            proba = model.predict_proba(features_df)[0]
            probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
            
            # Apply same scaling as single predict (2.0x for proportional scores)
            adjusted_probability = min(1.0, probability * 2.0)
            score = round(adjusted_probability * 100, 2)
            
            results.append({
                "score": score,
                "probability": round(probability, 4),
                "priority": get_priority(score)
            })
        except Exception as e:
            results.append({
                "score": 0,
                "probability": 0,
                "priority": "LOW",
                "error": str(e)
            })
    
    return {"predictions": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
