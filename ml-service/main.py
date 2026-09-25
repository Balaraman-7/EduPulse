from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Union, List, Dict
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from predict import DropoutPredictor

app = FastAPI(
    title="EduPulse ML Prediction Service",
    description="Microservice providing machine learning model-estimated dropout risk prediction and explainable risk factors.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None

@app.on_event("startup")
def startup_event():
    global predictor
    print("[FastAPI] Initializing DropoutPredictor and loading trained model...")
    predictor = DropoutPredictor()
    print("[FastAPI] ML Service startup complete and ready for inference.")

class StudentFeatures(BaseModel):
    attendancePercentage: float = Field(..., ge=0, le=100)
    internalMarks: float = Field(..., ge=0, le=100)
    assignmentScore: float = Field(..., ge=0, le=100)
    cgpa: float = Field(..., ge=0, le=10)
    backlogCount: int = Field(..., ge=0)
    previousSemesterPerformance: Optional[float] = Field(70.0, ge=0, le=100)
    feeStatus: Optional[Union[str, int]] = 'Paid'
    familyIncomeCategory: Optional[Union[str, int]] = 'Medium'
    internetAccess: Optional[Union[str, int]] = 'Yes'
    extracurricularParticipation: Optional[Union[str, int]] = 'Moderate'
    previousCounsellingCount: Optional[int] = 0

class ThresholdConfig(BaseModel):
    lowMax: Optional[float] = 39.0
    mediumMax: Optional[float] = 69.0

class PredictRequest(BaseModel):
    features: StudentFeatures
    thresholds: Optional[ThresholdConfig] = ThresholdConfig()

@app.get("/")
def read_root():
    return {
        "service": "EduPulse ML Service",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "edupulse-ml",
        "model_loaded": predictor is not None
    }

@app.post("/predict")
def predict_dropout(req: Union[PredictRequest, StudentFeatures]):
    global predictor
    if predictor is None:
        predictor = DropoutPredictor()
        
    try:
        if isinstance(req, PredictRequest):
            student_dict = req.features.dict()
            low_thresh = req.thresholds.lowMax if req.thresholds else 39.0
            med_thresh = req.thresholds.mediumMax if req.thresholds else 69.0
        else:
            student_dict = req.dict()
            low_thresh = 39.0
            med_thresh = 69.0

        result = predictor.predict_student(student_dict, low_thresh=low_thresh, medium_thresh=med_thresh)
        return result
    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
