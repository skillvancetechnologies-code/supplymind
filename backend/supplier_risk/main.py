

import pandas as pd
df_s = pd.read_csv('suppliers.csv')
df_d = pd.read_csv('demand_history.csv')

print("Suppliers shape:", df_s.shape)
print("Supplier columns:", df_s.columns.tolist())
print("\nDemand shape:", df_d.shape)
print("Unique SKUs:", df_d['sku_id'].nunique())
print("Date range:", df_d['date'].min(), "to", df_d['date'].max())
print("\nSuppliers by city tier:")
print(df_s['city_tier'].value_counts())

import pandas as pd

df_sup = pd.read_csv('suppliers.csv')
df_skus = pd.read_csv('skus.csv')
df_po = pd.read_csv('purchase_orders.csv')
df_dem = pd.read_csv('demand_history.csv')
df_inv = pd.read_csv('inventory_positions.csv')
df_perf = pd.read_csv('supplier_performance.csv')
# Average OTIF by city tier
print("Avg OTIF by supplier city tier:")
merged = df_sup.merge(df_perf, on='supplier_id')
print(merged.groupby('city_tier')['otif_percentage']
.mean().round(2))

# Stockout analysis
print("\nTotal stockout days by category:")
sku_inv = df_skus.merge(df_inv, on='sku_id')
print(sku_inv.groupby('category')['is_stockout']
.sum().sort_values(ascending=False))

# Demand by month
df_dem['date'] = pd.to_datetime(df_dem['date'])
df_dem['month'] = df_dem['date'].dt.month
print("\nAvg daily demand by month:")
print(df_dem.groupby('month')['quantity_demanded']
.mean().round(1))

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

df_sup = pd.read_csv('suppliers.csv')
df_perf = pd.read_csv('supplier_performance.csv')

df = df_perf.merge(df_sup[['supplier_id','city_tier']], on='supplier_id')
df['is_high_risk'] = (df['otif_percentage'] < 75).astype(int)
print("High risk rate:", round(df['is_high_risk'].mean()*100,1), "%")

features = ['otif_percentage','avg_lead_time_days',
            'quality_reject_rate_pct','fill_rate_pct',
            'capacity_utilization_pct']

X = df[features].fillna(df[features].mean())
y = df['is_high_risk']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train,X_test,y_train,y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42)

model = LogisticRegression(class_weight='balanced', random_state=42)
model.fit(X_train, y_train)

auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
print(f"Baseline AUC-ROC: {auc:.4f}")

importance = pd.DataFrame({
    'feature': features,
    'coefficient': abs(model.coef_[0])
}).sort_values('coefficient', ascending=False)
print(importance.to_string(index=False))

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

df_sup = pd.read_csv('suppliers.csv')
df_perf = pd.read_csv('supplier_performance.csv')
df_po = pd.read_csv('purchase_orders.csv')

df_perf['month'] = pd.to_datetime(df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

# Build trend features —
# what happened in last 3 months
supplier_features = []

for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)  # last 6 months

    if len(sup) < 3:
        continue

    last3 = sup.tail(3)
    prev3 = sup.head(3)

    # OTIF trend — is it getting worse?
    otif_slope = (
        last3['otif_percentage'].mean() -
        prev3['otif_percentage'].mean()
    )

    # Lead time trend
    lt_trend = (
        last3['avg_lead_time_days'].mean() -
        prev3['avg_lead_time_days'].mean()
    )

    # Current performance
    current = sup.iloc[-1]

    supplier_features.append({
        'supplier_id': sup_id,
        'otif_slope_3m': round(otif_slope, 2),
        'lead_time_trend': round(lt_trend, 2),
        'avg_quality_reject': round(
            last3['quality_reject_rate_pct'].mean(),2),
        'avg_fill_rate': round(
            last3['fill_rate_pct'].mean(), 2),
        'avg_capacity_util': round(
            last3['capacity_utilization_pct'].mean(),2),
        'current_otif': current['otif_percentage'],
        # Target — will OTIF drop below 75 next month?
        'is_high_risk': int(
            current['otif_percentage'] < 80 and
            otif_slope < -3
        )
    })

df_feat = pd.DataFrame(supplier_features)
print("Dataset shape:", df_feat.shape)
print("High risk rate:",
      round(df_feat['is_high_risk'].mean()*100,1),"%")

features = ['otif_slope_3m','lead_time_trend',
            'avg_quality_reject','avg_fill_rate',
            'avg_capacity_util']

X = df_feat[features].fillna(0)
y = df_feat['is_high_risk']

X_train,X_test,y_train,y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)
auc = roc_auc_score(
    y_test, model.predict_proba(X_test)[:,1])
print(f"\nNew AUC-ROC: {auc:.4f}")
print("(Yesterday was 0.9997 — this is more honest)")

importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature importance:")
print(importance.to_string(index=False))

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

df_sup = pd.read_csv('suppliers.csv')
df_perf = pd.read_csv('supplier_performance.csv')

df_perf['month'] = pd.to_datetime(df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

supplier_features = []
for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)

    if len(sup) < 3:
        continue

    last3 = sup.tail(3)
    prev3 = sup.head(3)

    otif_slope = (
        last3['otif_percentage'].mean() -
        prev3['otif_percentage'].mean()
    )
    lt_trend = (
        last3['avg_lead_time_days'].mean() -
        prev3['avg_lead_time_days'].mean()
    )

    supplier_features.append({
        'supplier_id': sup_id,
        'otif_slope_3m': round(otif_slope,2),
        'lead_time_trend': round(lt_trend,2),
        'avg_quality_reject': round(
            last3['quality_reject_rate_pct'].mean(),2),
        'avg_fill_rate': round(
            last3['fill_rate_pct'].mean(),2),
        'avg_capacity_util': round(
            last3['capacity_utilization_pct'].mean(),2),
        # NO current_otif here — removed
        'is_high_risk': int(
            last3['otif_percentage'].mean() < 78
            and otif_slope < -2
        )
    })

df_feat = pd.DataFrame(supplier_features)
print("Shape:", df_feat.shape)
print("High risk rate:",
      round(df_feat['is_high_risk'].mean()*100,1),"%")

features = ['otif_slope_3m','lead_time_trend',
            'avg_quality_reject',
            'avg_fill_rate','avg_capacity_util']

X = df_feat[features].fillna(0)
y = df_feat['is_high_risk']

X_train,X_test,y_train,y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)
auc = roc_auc_score(
    y_test,
    model.predict_proba(X_test)[:,1])

print(f"\nReal AUC-ROC: {auc:.4f}")
print("This is your honest baseline.")
print("Target with LightGBM in Week 2: > 0.82")

importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature importance:")
print(importance.to_string(index=False))

import pandas as pd
import lightgbm as lgb
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

df_sup = pd.read_csv('suppliers.csv')
df_perf = pd.read_csv('supplier_performance.csv')

df_perf['month'] = pd.to_datetime(df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

supplier_features = []
for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)
    if len(sup) < 3:
        continue
    last3 = sup.tail(3)
    prev3 = sup.head(3)
    otif_slope = (
        last3['otif_percentage'].mean() -
        prev3['otif_percentage'].mean()
    )
    lt_trend = (
        last3['avg_lead_time_days'].mean() -
        prev3['avg_lead_time_days'].mean()
    )
    supplier_features.append({
        'supplier_id': sup_id,
        'otif_slope_3m': round(otif_slope,2),
        'lead_time_trend': round(lt_trend,2),
        'avg_quality_reject': round(
            last3['quality_reject_rate_pct'].mean(),2),
        'avg_fill_rate': round(
            last3['fill_rate_pct'].mean(),2),
        'avg_capacity_util': round(
            last3['capacity_utilization_pct'].mean(),2),
        'is_high_risk': int(
            last3['otif_percentage'].mean() < 78
            and otif_slope < -2
        )
    })

df_feat = pd.DataFrame(supplier_features)
print("Shape:", df_feat.shape)
print("High risk rate:",
      round(df_feat['is_high_risk'].mean()*100,1),"%")

features = ['otif_slope_3m','lead_time_trend',
            'avg_quality_reject',
            'avg_fill_rate','avg_capacity_util']

X = df_feat[features].fillna(0).values
y = df_feat['is_high_risk'].values

# 5-fold cross validation
cv = StratifiedKFold(n_splits=5,
                      shuffle=True,
                      random_state=42)
auc_scores = []

for fold, (train_idx, val_idx) in enumerate(
        cv.split(X, y)):
    X_train = X[train_idx]
    X_val = X[val_idx]
    y_train = y[train_idx]
    y_val = y[val_idx]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)

    model = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=15,
        class_weight='balanced',
        random_state=42,
        verbose=-1
    )
    model.fit(X_train, y_train)
    preds = model.predict_proba(X_val)[:,1]

    if len(set(y_val)) > 1:
        auc = roc_auc_score(y_val, preds)
        auc_scores.append(auc)
        print(f"Fold {fold+1} AUC: {auc:.4f}")

print(f"\nMean CV AUC: {np.mean(auc_scores):.4f}")
print(f"Std: {np.std(auc_scores):.4f}")
print("This is your honest baseline.")
print("Target: CV AUC above 0.75")

import optuna
import lightgbm as lgb
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

# Reuse X and y from the previous cell, which are already prepared as NumPy arrays
# X, y

def objective(trial):
    # Hyperparameters to tune
    n_estimators = trial.suggest_int('n_estimators', 50, 300)
    learning_rate = trial.suggest_float('learning_rate', 0.01, 0.1)
    num_leaves = trial.suggest_int('num_leaves', 10, 40)
    min_child_samples = trial.suggest_int('min_child_samples', 5, 30)

    # Initialize StratifiedKFold
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    auc_scores = []

    for fold, (train_idx, val_idx) in enumerate(cv.split(X, y)):
        X_train = X[train_idx]
        X_val = X[val_idx]
        y_train = y[train_idx]
        y_val = y[val_idx]

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)

        # Initialize and train LightGBM model
        model = lgb.LGBMClassifier(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            num_leaves=num_leaves,
            min_child_samples=min_child_samples,
            class_weight='balanced',
            random_state=42,
            verbose=-1
        )
        model.fit(X_train_scaled, y_train)

        # Make predictions and calculate AUC
        preds = model.predict_proba(X_val_scaled)[:, 1]
        if len(np.unique(y_val)) > 1:
            auc = roc_auc_score(y_val, preds)
            auc_scores.append(auc)

    # Return the mean AUC score across all folds
    return np.mean(auc_scores) if auc_scores else 0.0

# Create an Optuna study and optimize
study = optuna.create_study(direction='maximize', study_name='lgbm_optimization')
study.optimize(objective, n_trials=30, show_progress_bar=True)

print("\nNumber of finished trials: ", len(study.trials))
print("Best trial:")
trial = study.best_trial

print(f"  Value (Mean CV AUC): {trial.value:.4f}")
print("  Params: ")
for key, value in trial.params.items():
    print(f"    {key}: {value}")

best_params = trial.params
best_cv_auc_optuna = trial.value

# Retrain the final model with the best parameters and perform CV
final_model_auc_scores = []
final_model_feature_importances = []

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for fold, (train_idx, val_idx) in enumerate(cv.split(X, y)):
    X_train = X[train_idx]
    X_val = X[val_idx]
    y_train = y[train_idx]
    y_val = y[val_idx]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    final_model = lgb.LGBMClassifier(
        **best_params,
        class_weight='balanced',
        random_state=42,
        verbose=-1
    )
    final_model.fit(X_train_scaled, y_train)
    preds = final_model.predict_proba(X_val_scaled)[:, 1]

    if len(np.unique(y_val)) > 1:
        auc = roc_auc_score(y_val, preds)
        final_model_auc_scores.append(auc)

    # Store feature importances from one fold (they should be consistent across folds for well-trained models)
    if fold == 0:
        final_model_feature_importances = final_model.feature_importances_

print(f"\nBest CV AUC from Optuna: {best_cv_auc_optuna:.4f}")
print(f"Final model Mean CV AUC: {np.mean(final_model_auc_scores):.4f}")
print(f"Final model Std Dev CV AUC: {np.std(final_model_auc_scores):.4f}")

feature_importance_df = pd.DataFrame({
    'feature': features,
    'importance': final_model_feature_importances
}).sort_values('importance', ascending=False)

print("\nTop 3 features by importance:")
print(feature_importance_df.head(3).to_string(index=False))

print("\nFeature importance:")
print(importance.to_string(index=False))

import pandas as pd

df_perf = pd.read_csv('supplier_performance.csv')
df_perf['month'] = pd.to_datetime(df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

supplier_features = []
for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)

    if len(sup) < 3:
        continue

    last3 = sup.tail(3)
    prev3 = sup.head(3)

    # OTIF trend — is it getting worse?
    otif_slope = (
        last3['otif_percentage'].mean() -
        prev3['otif_percentage'].mean()
    )

    supplier_features.append({
        'supplier_id': sup_id,
        'otif_slope_3m': round(otif_slope, 2)
    })

df_otif_slope = pd.DataFrame(supplier_features)
print(df_otif_slope.head())

import pandas as pd
df_perf = pd.read_csv('supplier_performance.csv')
df_sup = pd.read_csv('suppliers.csv')

df_perf['month'] = pd.to_datetime(
    df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

# Show worst deteriorating suppliers
results = []
for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)
    if len(sup) < 6:
        continue
    last3 = sup.tail(3)['otif_percentage'].mean()
    prev3 = sup.head(3)['otif_percentage'].mean()
    slope = last3 - prev3
    results.append({
        'supplier_id': sup_id,
        'otif_slope': round(slope,2),
        'current_otif': round(last3,1)
    })

df_r = pd.DataFrame(results)
df_r = df_r.merge(
    df_sup[['supplier_id','city_tier']],
    on='supplier_id')
worst = df_r.nsmallest(5,'otif_slope')
print("Top 5 fastest deteriorating suppliers:")
print(worst.to_string(index=False))

import joblib
import lightgbm as lgb
from sklearn.preprocessing import StandardScaler

# Initialize and fit the scaler on the entire dataset
scaler_final = StandardScaler()
X_scaled_final = scaler_final.fit_transform(X)

# Initialize the best model with the parameters found by Optuna
best_model = lgb.LGBMClassifier(
    **best_params,
    class_weight='balanced',
    random_state=42,
    verbose=-1
)

# Fit the best model on the entire scaled dataset
best_model.fit(X_scaled_final, y)

# Save the model and the scaler
joblib.dump(best_model, 'supplier_risk_model.pkl')
joblib.dump(scaler_final, 'supplier_risk_scaler.pkl')
print("Model and scaler saved successfully!")


from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from sklearn.linear_model import LinearRegression

# ---------------------------------------------------
# LOAD MODEL + SCALER
# ---------------------------------------------------

# Load the cleaned model and scaler
model = joblib.load("supplier_risk_model_cleaned.pkl")
scaler = joblib.load("supplier_risk_scaler_cleaned.pkl")

# ---------------------------------------------------
# LOAD DATA
# ---------------------------------------------------

df = pd.read_csv("supplier_performance.csv")

# ---------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------

app = FastAPI(title="Supplier Risk API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Supplier Risk API Running"}

# ---------------------------------------------------
# INPUT SCHEMA
# ---------------------------------------------------

class SupplierRequest(BaseModel):
    supplier_id: str

# ---------------------------------------------------
# FEATURE ENGINEERING FUNCTION
# ---------------------------------------------------

def compute_supplier_features(supplier_id):

    supplier_df = df[df["supplier_id"] == supplier_id].copy()

    # Need at least 6 months
    if len(supplier_df) < 6:
        return None

    supplier_df = supplier_df.sort_values("month")

    # Last 6 months
    last6 = supplier_df.tail(6)

    # Split into previous 3 and latest 3
    prev3 = last6.head(3)
    last3 = last6.tail(3)

    # Current OTIF
    current_otif = last3["otif_percentage"].iloc[-1]

    # OTIF slope (trend)
    X = np.arange(len(last3)).reshape(-1, 1)
    y = last3["otif_percentage"].values

    lr = LinearRegression()
    lr.fit(X, y)

    otif_slope_3m = lr.coef_[0]

    # Lead time trend
    lt_trend = (
        last3["avg_lead_time_days"].mean()
        - prev3["avg_lead_time_days"].mean()
    )

    # Other features
    avg_quality_reject = last3["quality_reject_rate_pct"].mean()

    avg_fill_rate = last3["fill_rate_pct"].mean()

    avg_capacity_util = last3["capacity_utilization_pct"].mean()

    # Feature dataframe
    features = pd.DataFrame([
        {
            "lead_time_trend": round(lt_trend, 2),
            "avg_quality_reject": round(avg_quality_reject, 2),
            "avg_fill_rate": round(avg_fill_rate, 2),
            "avg_capacity_util": round(avg_capacity_util, 2)
        }
    ])

    return features, otif_slope_3m, current_otif

# ---------------------------------------------------
# RISK TIER FUNCTION
# ---------------------------------------------------

def get_risk_tier(score):

    if score >= 70:
        return "High"

    elif score >= 40:
        return "Medium"

    else:
        return "Low"

# ---------------------------------------------------
# API ENDPOINT
# ---------------------------------------------------

@app.get("/supplier-risk")
def get_supplier_risk(supplier_id: str):

    try:

        if not supplier_id:
            raise HTTPException(
                status_code=400,
                detail="supplier_id is required"
            )

        result = compute_supplier_features(supplier_id)

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found or insufficient data"
            )

        features, otif_slope_3m, current_otif = result

        # Scale features
        scaled = scaler.transform(features)

        # Predict probability
        risk_score = round(
            model.predict_proba(scaled)[0][1] * 100,
            1
        )

        # Risk tier
        if risk_score >= 70:
            risk_tier = "High"

        elif risk_score >= 40:
            risk_tier = "Medium"

        else:
            risk_tier = "Low"

        # Top features
        top_features = []

        if otif_slope_3m < 0:
            top_features.append("Declining OTIF")

        if current_otif < 85:
            top_features.append("Low Current OTIF")

        return {
            "supplier_id": supplier_id,
            "risk_score": risk_score,
            "risk_tier": risk_tier,
            "top_features": top_features,
            "otif_slope_3m": round(float(otif_slope_3m), 2),
            "current_otif": round(float(current_otif), 2)
        }

    except HTTPException as e:
        raise e

    except Exception as e:

        print(f"ERROR: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------
# RUN API
# ---------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


import optuna
from sklearn.model_selection import cross_val_score
import lightgbm as lgb # Import LightGBM

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int(
            'n_estimators', 50, 300
        ),
        'max_depth': trial.suggest_int(
            'max_depth', 3, 10
        ),
        'learning_rate': trial.suggest_float(
            'learning_rate', 0.01, 0.3
        ),
        'num_leaves': trial.suggest_int(
            'num_leaves', 20, 100
        ),
        'min_child_samples': trial.suggest_int(
            'min_child_samples', 5, 50
        )
    }

    # The LGBMClassifier needs to be imported, previously it was not defined
    model = lgb.LGBMClassifier(**params, random_state=42, verbose=-1)
    score = cross_val_score(
        model, X, y, # Use X and y (full dataset) as defined in previous cells
        scoring='roc_auc',
        cv=5
    ).mean()
    return score

study = optuna.create_study(
    direction='maximize'
)
study.optimize(objective, n_trials=30)

print("Best AUC:", study.best_value)
print("Best params:", study.best_params)

# Retrain with best params (corrected to use best_params from study and full data X, y)
best_model = lgb.LGBMClassifier(
    **study.best_params,
    class_weight='balanced',
    random_state=42,
    verbose=-1
)
best_model.fit(X, y)

import joblib
import lightgbm as lgb
from sklearn.preprocessing import StandardScaler

# Initialize and fit the scaler on the entire dataset
scaler_final = StandardScaler()
X_scaled_final = scaler_final.fit_transform(X)

# Initialize the best model with the parameters found by Optuna
best_model = lgb.LGBMClassifier(
    **best_params,
    class_weight='balanced',
    random_state=42,
    verbose=-1
)

# Fit the best model on the entire scaled dataset
best_model.fit(X_scaled_final, y)

# Save the model and the scaler
joblib.dump(best_model, 'supplier_risk_model.pkl')
joblib.dump(scaler_final, 'supplier_risk_scaler.pkl')
print("Model and scaler saved successfully!")


# Remove the leaking feature 'otif_slope_3m'
features_cleaned = [
    'lead_time_trend',
    'avg_quality_reject',
    'avg_fill_rate',
    'avg_capacity_util'
]

print('Features used for the cleaned model:')
print(features_cleaned)

import pandas as pd
import lightgbm as lgb
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

df_sup = pd.read_csv('suppliers.csv')
df_perf = pd.read_csv('supplier_performance.csv')

df_perf['month'] = pd.to_datetime(df_perf['month'])
df_perf = df_perf.sort_values(
    ['supplier_id','month'])

supplier_features = []
for sup_id in df_perf['supplier_id'].unique():
    sup = df_perf[
        df_perf['supplier_id']==sup_id
    ].tail(6)
    if len(sup) < 3:
        continue
    last3 = sup.tail(3)
    prev3 = sup.head(3)
    otif_slope = (
        last3['otif_percentage'].mean() -
        prev3['otif_percentage'].mean()
    )
    lt_trend = (
        last3['avg_lead_time_days'].mean() -
        prev3['avg_lead_time_days'].mean()
    )
    supplier_features.append({
        'supplier_id': sup_id,
        'otif_slope_3m': round(otif_slope,2),
        'lead_time_trend': round(lt_trend,2),
        'avg_quality_reject': round(
            last3['quality_reject_rate_pct'].mean(),2),
        'avg_fill_rate': round(
            last3['fill_rate_pct'].mean(),2),
        'avg_capacity_util': round(
            last3['capacity_utilization_pct'].mean(),2),
        'is_high_risk': int(
            last3['otif_percentage'].mean() < 78
            and otif_slope < -2
        )
    })

df_feat_cleaned = pd.DataFrame(supplier_features)
print("Shape (after removing leaking feature):", df_feat_cleaned.shape)
print("High risk rate (after removing leaking feature):",
      round(df_feat_cleaned['is_high_risk'].mean()*100,1),"%")

# The definition of features_cleaned has been moved to a previous cell (15df6bd2).

X_cleaned = df_feat_cleaned[features_cleaned].fillna(0).values
y_cleaned = df_feat_cleaned['is_high_risk'].values

# 5-fold cross validation
cv_cleaned = StratifiedKFold(n_splits=5,
                      shuffle=True,
                      random_state=42)
auc_scores_cleaned = []

for fold, (train_idx, val_idx) in enumerate(
        cv_cleaned.split(X_cleaned, y_cleaned)):
    X_train_cleaned = X_cleaned[train_idx]
    X_val_cleaned = X_cleaned[val_idx]
    y_train_cleaned = y_cleaned[train_idx]
    y_val_cleaned = y_cleaned[val_idx]

    scaler_cleaned = StandardScaler()
    X_train_scaled_cleaned = scaler_cleaned.fit_transform(X_train_cleaned)
    X_val_scaled_cleaned = scaler_cleaned.transform(X_val_cleaned)

    model_cleaned = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=15,
        class_weight='balanced',
        random_state=42,
        verbose=-1
    )
    model_cleaned.fit(X_train_scaled_cleaned, y_train_cleaned)
    preds_cleaned = model_cleaned.predict_proba(X_val_scaled_cleaned)[:,1]

    if len(set(y_val_cleaned)) > 1:
        auc_cleaned = roc_auc_score(y_val_cleaned, preds_cleaned)
        auc_scores_cleaned.append(auc_cleaned)
        print(f"Fold {fold+1} AUC: {auc_cleaned:.4f}")

print(f"\nNew Mean CV AUC (without otif_slope_3m): {np.mean(auc_scores_cleaned):.4f}")
print(f"New Std Dev CV AUC (without otif_slope_3m): {np.std(auc_scores_cleaned):.4f}")

feature_importance_cleaned = pd.DataFrame({
    'feature': features_cleaned,
    'importance': model_cleaned.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature importance (without otif_slope_3m):")
print(feature_importance_cleaned.to_string(index=False))

import optuna
import lightgbm as lgb
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

# Define the Optuna objective function for the cleaned feature set
def objective_cleaned(trial):
    n_estimators = trial.suggest_int('n_estimators', 50, 300)
    learning_rate = trial.suggest_float('learning_rate', 0.01, 0.1)
    num_leaves = trial.suggest_int('num_leaves', 10, 40)
    min_child_samples = trial.suggest_int('min_child_samples', 5, 30)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    auc_scores = []

    for fold, (train_idx, val_idx) in enumerate(cv.split(X_cleaned, y_cleaned)):
        X_train_fold = X_cleaned[train_idx]
        X_val_fold = X_cleaned[val_idx]
        y_train_fold = y_cleaned[train_idx]
        y_val_fold = y_cleaned[val_idx]

        scaler_fold = StandardScaler()
        X_train_scaled_fold = scaler_fold.fit_transform(X_train_fold)
        X_val_scaled_fold = scaler_fold.transform(X_val_fold)

        model_fold = lgb.LGBMClassifier(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            num_leaves=num_leaves,
            min_child_samples=min_child_samples,
            class_weight='balanced',
            random_state=42,
            verbose=-1
        )
        model_fold.fit(X_train_scaled_fold, y_train_fold)

        preds_fold = model_fold.predict_proba(X_val_scaled_fold)[:, 1]
        if len(np.unique(y_val_fold)) > 1:
            auc_fold = roc_auc_score(y_val_fold, preds_fold)
            auc_scores.append(auc_fold)

    return np.mean(auc_scores) if auc_scores else 0.0

# Create an Optuna study and optimize for the cleaned model
study_cleaned = optuna.create_study(direction='maximize', study_name='lgbm_cleaned_optimization')
study_cleaned.optimize(objective_cleaned, n_trials=30, show_progress_bar=True)

print("\nNumber of finished trials for cleaned model: ", len(study_cleaned.trials))
print("Best trial for cleaned model:")
trial_cleaned = study_cleaned.best_trial

print(f"  Value (Mean CV AUC): {trial_cleaned.value:.4f}")
print("  Params: ")
for key, value in trial_cleaned.params.items():
    print(f"    {key}: {value}")

best_params_cleaned = trial_cleaned.params
best_cv_auc_cleaned = trial_cleaned.value

import optuna

# Create an Optuna study and optimize for the cleaned model
study_cleaned = optuna.create_study(direction='maximize', study_name='lgbm_cleaned_optimization')
study_cleaned.optimize(objective_cleaned, n_trials=30, show_progress_bar=True)

print("\nNumber of finished trials for cleaned model: ", len(study_cleaned.trials))
print("Best trial for cleaned model:")
trial_cleaned = study_cleaned.best_trial

print(f"  Value (Mean CV AUC): {trial_cleaned.value:.4f}")
print("  Params: ")
for key, value in trial_cleaned.params.items():
    print(f"    {key}: {value}")

best_params_cleaned = trial_cleaned.params
best_cv_auc_cleaned = trial_cleaned.value

import joblib
import lightgbm as lgb
from sklearn.preprocessing import StandardScaler

# Initialize and fit the scaler on the entire X_cleaned dataset
scaler_final_cleaned = StandardScaler()
X_scaled_final_cleaned = scaler_final_cleaned.fit_transform(X_cleaned)

# Initialize the best model with the parameters found by Optuna for the cleaned features
best_model_cleaned = lgb.LGBMClassifier(
    **best_params_cleaned,
    class_weight='balanced',
    random_state=42,
    verbose=-1
)

# Fit the best model on the entire scaled dataset with cleaned features
best_model_cleaned.fit(X_scaled_final_cleaned, y_cleaned)

# Save the cleaned model and the cleaned scaler
joblib.dump(best_model_cleaned, 'supplier_risk_model_cleaned.pkl')
joblib.dump(scaler_final_cleaned, 'supplier_risk_scaler_cleaned.pkl')
print("Cleaned model and scaler saved successfully!")
