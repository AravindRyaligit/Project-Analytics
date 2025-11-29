from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import psycopg2
from typing import Optional

app = FastAPI(title="Project Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": "localhost",
    "port": "5432",
    "database": "project_analytics",
    "user": "postgres",
    "password": "}Brindavanam6"
}

try:
    rf_delay = joblib.load("backend/rf_delay_model.pkl")
    rf_bottleneck = joblib.load("backend/rf_bottleneck_model.pkl")
except FileNotFoundError:
    rf_delay = joblib.load("rf_delay_model.pkl")
    rf_bottleneck = joblib.load("rf_bottleneck_model.pkl")

class ProjectPredictionInput(BaseModel):
    project_cost: float
    project_benefit: float
    complexity: str
    completionpercent: float
    actual_duration_days: float
    project_type: Optional[str] = "INCOME GENERATION"
    project_manager: Optional[str] = "Unknown"
    region: Optional[str] = "North"
    department: Optional[str] = "Admin & BI"
    phase: Optional[str] = "Phase 1 - Explore"
    status: Optional[str] = "In - Progress"

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.get("/")
def read_root():
    return {
        "message": "Project Analytics API",
        "version": "1.0.0",
        "endpoints": ["/projects", "/stats", "/model-info", "/predict"]
    }

@app.get("/projects")
def get_projects(limit: int = 100):
    try:
        conn = get_db_connection()
        query = f"SELECT * FROM projects LIMIT {limit};"
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        for col in df.select_dtypes(include=['datetime64']).columns:
            df[col] = df[col].astype(str)
        
        return {
            "count": len(df),
            "projects": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_statistics():
    try:
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM projects;", conn)
        conn.close()
        
        stats = {
            "total_projects": len(df),
            "completed_projects": len(df[df['status'] == 'Completed']),
            "in_progress_projects": len(df[df['status'] == 'In - Progress']),
            "cancelled_projects": len(df[df['status'] == 'Cancelled']),
            "on_hold_projects": len(df[df['status'] == 'On - Hold']),
            "avg_completion_percent": float(df['completionpercent'].mean()),
            "total_cost": float(df['project_cost'].sum()),
            "total_benefit": float(df['project_benefit'].sum()),
            "avg_cost": float(df['project_cost'].mean()),
            "avg_benefit": float(df['project_benefit'].mean()),
            "projects_by_type": df['project_type'].value_counts().to_dict(),
            "projects_by_region": df['region'].value_counts().to_dict(),
            "projects_by_complexity": df['complexity'].value_counts().to_dict(),
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-info")
def get_model_info():
    return {
        "delay_model": {
            "type": "Random Forest Regressor",
            "n_estimators": 100,
            "mae": 0.183,
            "r2_score": 0.999,
            "features": list(rf_delay.feature_names_in_)
        },
        "bottleneck_model": {
            "type": "Random Forest Classifier",
            "n_estimators": 100,
            "accuracy": 1.0,
            "features": list(rf_bottleneck.feature_names_in_)
        }
    }

@app.post("/predict")
def predict_project(data: ProjectPredictionInput):
    try:
        completion_speed = data.completionpercent / data.actual_duration_days if data.actual_duration_days > 0 else 0
        cost_efficiency = data.project_benefit / data.project_cost if data.project_cost > 0 else 0
        
        input_data = {
            'project_cost': data.project_cost,
            'project_benefit': data.project_benefit,
            'complexity': data.complexity,
            'completionpercent': data.completionpercent,
            'actual_duration_days': data.actual_duration_days,
            'completion_speed': completion_speed,
            'cost_efficiency': cost_efficiency,
            'project_type': data.project_type,
            'project_manager': data.project_manager,
            'region': data.region,
            'department': data.department,
            'phase': data.phase,
            'status': data.status
        }
        
        df_input = pd.DataFrame([input_data])
        df_encoded = pd.get_dummies(df_input, drop_first=True)
        
        training_columns = rf_delay.feature_names_in_
        for col in training_columns:
            if col not in df_encoded:
                df_encoded[col] = 0
        df_encoded = df_encoded[training_columns]
        
        delay_pred = rf_delay.predict(df_encoded)[0]
        bottleneck_pred = rf_bottleneck.predict(df_encoded)[0]
        
        return {
            "predicted_delay_days": float(delay_pred),
            "resource_bottleneck": bool(bottleneck_pred),
            "input_data": input_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
