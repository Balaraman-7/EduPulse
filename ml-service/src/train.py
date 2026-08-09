import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(__file__), '../data/student_dropout_dataset.csv')
    if not os.path.exists(data_path):
        from generate_dataset import generate_synthetic_data
        generate_synthetic_data()
        
    df = pd.read_csv(data_path)
    X = df.drop(columns=['dropoutRisk'])
    y = df['dropoutRisk']

    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        'Logistic Regression': LogisticRegression(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1
    best_model_obj = None

    print("\n========================================================")
    print("      EDUPULSE ML MODEL EVALUATION & COMPARISON REPORT    ")
    print("========================================================")

    for name, model in models.items():
        if name == 'Logistic Regression':
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
            probs = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)

        results[name] = {
            'Accuracy': round(acc, 4),
            'Precision': round(prec, 4),
            'Recall': round(rec, 4),
            'F1-Score': round(f1, 4),
            'ROC-AUC': round(auc, 4)
        }

        print(f"\nModel: {name}")
        print(f"  Accuracy:  {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f}  (Crucial to catch at-risk students)")
        print(f"  F1-Score:  {f1:.4f}")
        print(f"  ROC-AUC:   {auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model

    print("\n--------------------------------------------------------")
    print(f"SELECTED MODEL: {best_model_name} (Highest F1-Score: {best_f1:.4f})")
    print("--------------------------------------------------------")

    # Feature Importance
    if hasattr(best_model_obj, 'feature_importances_'):
        importances = best_model_obj.feature_importances_
    else:
        importances = np.abs(best_model_obj.coef_[0])
    
    feature_importance_dict = {
        feat: round(float(imp), 4) for feat, imp in zip(feature_names, importances)
    }
    sorted_importances = sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True)

    print("\nTop Feature Importances:")
    for feat, imp in sorted_importances:
        print(f"  - {feat}: {imp}")

    # Save artifact files
    models_dir = os.path.join(os.path.dirname(__file__), '../models')
    os.makedirs(models_dir, exist_ok=True)

    joblib.dump(best_model_obj, os.path.join(models_dir, 'dropout_model.joblib'))
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.joblib'))

    metadata = {
        'best_model_name': best_model_name,
        'metrics': results,
        'feature_names': feature_names,
        'feature_importances': feature_importance_dict
    }

    with open(os.path.join(models_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[Model Save] Successfully saved trained model and scaler to {models_dir}")
    return metadata

if __name__ == '__main__':
    train_and_evaluate()
