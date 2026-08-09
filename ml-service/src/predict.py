import os
import json
import joblib
import numpy as np
import pandas as pd

FEATURE_FRIENDLY_NAMES = {
    'attendancePercentage': 'Low Attendance Rate',
    'internalMarks': 'Poor Internal Marks',
    'assignmentScore': 'Low Assignment Scores',
    'cgpa': 'Low CGPA',
    'backlogCount': 'Multiple Active Backlogs',
    'previousSemesterPerformance': 'Declining Semester Performance',
    'feeStatus': 'Pending Fee Status',
    'familyIncomeCategory': 'Financial Stress Indicator',
    'internetAccess': 'Limited Internet Connectivity',
    'extracurricularParticipation': 'Low Campus Engagement',
    'previousCounsellingCount': 'Prior Academic Support History'
}

class DropoutPredictor:
    def __init__ (self):
        models_dir = os.path.join(os.path.dirname(__file__), '../models')
        model_path = os.path.join(models_dir, 'dropout_model.joblib')
        scaler_path = os.path.join(models_dir, 'scaler.joblib')
        meta_path = os.path.join(models_dir, 'model_metadata.json')

        if not os.path.exists(model_path):
            print("[Predictor] Model artifacts missing. Auto-triggering dataset generation and training...")
            from train import train_and_evaluate
            train_and_evaluate()

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        
        with open(meta_path, 'r') as f:
            self.metadata = json.load(f)
            
        self.feature_names = self.metadata.get('feature_names', [
            'attendancePercentage', 'internalMarks', 'assignmentScore', 'cgpa',
            'backlogCount', 'previousSemesterPerformance', 'feeStatus',
            'familyIncomeCategory', 'internetAccess', 'extracurricularParticipation',
            'previousCounsellingCount'
        ])
        self.feature_importances = self.metadata.get('feature_importances', {})

    def predict_student(self, student_dict: dict, low_thresh=39, medium_thresh=69) -> dict:
        # Map feeStatus string to numeric if passed as string
        fee_map = {'Paid': 0, 'Pending': 1, 'Partial': 2}
        inc_map = {'Low': 0, 'Medium': 1, 'High': 2}
        net_map = {'No': 0, 'Yes': 1}
        ext_map = {'Low': 0, 'Moderate': 1, 'High': 2}

        fee_val = fee_map.get(student_dict.get('feeStatus'), student_dict.get('feeStatus', 0))
        inc_val = inc_map.get(student_dict.get('familyIncomeCategory'), student_dict.get('familyIncomeCategory', 1))
        net_val = net_map.get(student_dict.get('internetAccess'), student_dict.get('internetAccess', 1))
        ext_val = ext_map.get(student_dict.get('extracurricularParticipation'), student_dict.get('extracurricularParticipation', 1))

        input_data = {
            'attendancePercentage': float(student_dict.get('attendancePercentage', 75)),
            'internalMarks': float(student_dict.get('internalMarks', 65)),
            'assignmentScore': float(student_dict.get('assignmentScore', 70)),
            'cgpa': float(student_dict.get('cgpa', 7.0)),
            'backlogCount': int(student_dict.get('backlogCount', 0)),
            'previousSemesterPerformance': float(student_dict.get('previousSemesterPerformance', 70)),
            'feeStatus': int(fee_val),
            'familyIncomeCategory': int(inc_val),
            'internetAccess': int(net_val),
            'extracurricularParticipation': int(ext_val),
            'previousCounsellingCount': int(student_dict.get('previousCounsellingCount', 0))
        }

        df_input = pd.DataFrame([input_data])[self.feature_names]

        # Model probability of dropout risk (0 to 1)
        if self.metadata.get('best_model_name') == 'Logistic Regression':
            scaled_input = self.scaler.transform(df_input)
            prob = float(self.model.predict_proba(scaled_input)[0][1])
        else:
            prob = float(self.model.predict_proba(df_input)[0][1])

        risk_score = round(prob * 100, 1)

        # Categorize risk level based on configurable thresholds
        if risk_score <= low_thresh:
            risk_level = 'Low'
        elif risk_score <= medium_thresh:
            risk_level = 'Medium'
        else:
            risk_level = 'High'

        prediction = 1 if risk_score > 45 else 0

        # Calculate student-specific risk factor impact scores
        # Factors that deviate negatively from ideal values
        factor_scores = []
        
        # 1. Attendance impact
        att = input_data['attendancePercentage']
        if att < 75:
            imp = (75 - att) / 75.0 * 0.35 + self.feature_importances.get('attendancePercentage', 0.2)
            factor_scores.append({
                'feature': 'attendancePercentage',
                'friendlyName': FEATURE_FRIENDLY_NAMES['attendancePercentage'],
                'importance': round(float(imp), 3),
                'description': f"Attendance is currently at {att}%, below the required 75% threshold."
            })
            
        # 2. Backlogs impact
        backs = input_data['backlogCount']
        if backs > 0:
            imp = (backs / 6.0) * 0.30 + self.feature_importances.get('backlogCount', 0.25)
            factor_scores.append({
                'feature': 'backlogCount',
                'friendlyName': FEATURE_FRIENDLY_NAMES['backlogCount'],
                'importance': round(float(imp), 3),
                'description': f"Student has {backs} active backlog subject(s) requiring remediation."
            })

        # 3. CGPA impact
        cgpa_val = input_data['cgpa']
        if cgpa_val < 6.5:
            imp = (6.5 - cgpa_val) / 6.5 * 0.30 + self.feature_importances.get('cgpa', 0.2)
            factor_scores.append({
                'feature': 'cgpa',
                'friendlyName': FEATURE_FRIENDLY_NAMES['cgpa'],
                'importance': round(float(imp), 3),
                'description': f"Current cumulative GPA is {cgpa_val}, indicating academic vulnerability."
            })

        # 4. Internal marks / Assignment score impact
        internals = input_data['internalMarks']
        if internals < 55:
            imp = (55 - internals) / 55.0 * 0.20 + self.feature_importances.get('internalMarks', 0.15)
            factor_scores.append({
                'feature': 'internalMarks',
                'friendlyName': FEATURE_FRIENDLY_NAMES['internalMarks'],
                'importance': round(float(imp), 3),
                'description': f"Internal examination score is {internals}%, below average."
            })

        # Sort top factors by calculated importance
        factor_scores.sort(key=lambda x: x['importance'], reverse=True)

        # Fallback if no negative indicators triggered
        if not factor_scores:
            factor_scores = [
                {
                    'feature': 'attendancePercentage',
                    'friendlyName': 'Normal Academic Progression',
                    'importance': 0.05,
                    'description': 'Student indicators are currently within standard ranges.'
                }
            ]

        return {
            'riskScore': risk_score,
            'riskLevel': risk_level,
            'prediction': prediction,
            'modelVersion': f"v1.0-{self.metadata.get('best_model_name', 'RandomForest')}",
            'topFactors': factor_scores[:4]
        }
