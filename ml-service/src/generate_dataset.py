import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=1200, random_seed=42):
    np.random.seed(random_seed)
    
    attendance = np.random.normal(75, 18, num_samples).clip(25, 100)
    cgpa = np.random.normal(7.2, 1.4, num_samples).clip(3.0, 10.0)
    backlogs = np.random.poisson(1.2, num_samples).clip(0, 8)
    internal_marks = (cgpa * 8.5 + np.random.normal(0, 8, num_samples)).clip(20, 100)
    assignment_score = (attendance * 0.7 + np.random.normal(15, 10, num_samples)).clip(20, 100)
    prev_sem_perf = (cgpa * 8.0 + np.random.normal(5, 7, num_samples)).clip(25, 100)
    
    fee_status = np.random.choice([0, 1, 2], num_samples, p=[0.75, 0.15, 0.10]) # 0: Paid, 1: Pending, 2: Partial
    income_cat = np.random.choice([0, 1, 2], num_samples, p=[0.30, 0.50, 0.20]) # 0: Low, 1: Medium, 2: High
    internet = np.random.choice([0, 1], num_samples, p=[0.12, 0.88]) # 0: No, 1: Yes
    extracurricular = np.random.choice([0, 1, 2], num_samples, p=[0.40, 0.45, 0.15]) # 0: Low, 1: Moderate, 2: High
    counselling_count = np.random.poisson(0.5, num_samples).clip(0, 5)

    # Compute a realistic logit score for dropout risk
    risk_score_raw = (
        (75 - attendance) * 0.06 +
        (7.0 - cgpa) * 0.8 +
        backlogs * 0.75 +
        (65 - internal_marks) * 0.04 +
        (65 - assignment_score) * 0.03 +
        (fee_status == 1) * 0.5 +
        (income_cat == 0) * 0.3 +
        (internet == 0) * 0.4 -
        extracurricular * 0.2
    )

    # Sigmoid function for risk probability
    risk_prob = 1 / (1 + np.exp(-risk_score_raw))
    # Binary target (dropout risk)
    dropout_target = (risk_prob > 0.45).astype(int)

    df = pd.DataFrame({
        'attendancePercentage': np.round(attendance, 1),
        'internalMarks': np.round(internal_marks, 1),
        'assignmentScore': np.round(assignment_score, 1),
        'cgpa': np.round(cgpa, 2),
        'backlogCount': backlogs,
        'previousSemesterPerformance': np.round(prev_sem_perf, 1),
        'feeStatus': fee_status,
        'familyIncomeCategory': income_cat,
        'internetAccess': internet,
        'extracurricularParticipation': extracurricular,
        'previousCounsellingCount': counselling_count,
        'dropoutRisk': dropout_target
    })

    out_dir = os.path.join(os.path.dirname(__file__), '../data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'student_dropout_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"[Dataset] Generated {num_samples} realistic student rows saved to {out_path}")
    print(f"[Dataset] Dropout class balance:\n{df['dropoutRisk'].value_counts(normalize=True)}")
    return df

if __name__ == '__main__':
    generate_synthetic_data()
