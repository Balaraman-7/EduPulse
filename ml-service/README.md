# ⚠️ EduPulse ML Microservice Notice

> **Note**: The production EduPulse application is configured to use the deployed Render ML prediction service at:
> **`https://ml-model-lkco.onrender.com/predict`**

This directory contains the original local microservice implementation. The Node/Express backend communicates directly with the deployed Render API, sending the 4 core features (`attendance_percentage`, `cgpa`, `backlog_count`, `internal_marks`).
