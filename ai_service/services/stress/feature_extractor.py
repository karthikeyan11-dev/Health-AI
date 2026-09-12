"""
Feature Extraction Engine for Stress Assessment AI V2
Extracts 51 physiological, statistical, temporal, cross-vital ratio,
and baseline-relative features from 90-second telemetry windows.
"""

from typing import Dict
import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis

def extract_features_from_window(window_df: pd.DataFrame, subj_baseline: Dict[str, float]) -> Dict[str, float]:
    """
    Extracts 51 statistical, temporal, ratio, and baseline-relative physiological features
    ONLY from HR, SpO2, and Temperature.
    """
    hr = np.asarray(window_df['hr'], dtype=float)
    spo2 = np.asarray(window_df['SpO2'], dtype=float)
    temp = np.asarray(window_df['temp'], dtype=float)
    
    feats: Dict[str, float] = {}
    n = len(hr)
    x = np.arange(n)
    
    # 1. Heart Rate Statistical Features
    feats['hr_mean'] = float(np.mean(hr))
    feats['hr_std'] = float(np.std(hr, ddof=1)) if n > 1 else 0.0
    feats['hr_min'] = float(np.min(hr))
    feats['hr_max'] = float(np.max(hr))
    feats['hr_range'] = (feats['hr_max'] - feats['hr_min'])
    feats['hr_median'] = float(np.median(hr))
    feats['hr_p10'] = float(np.percentile(hr, 10))
    feats['hr_p90'] = float(np.percentile(hr, 90))
    feats['hr_iqr'] = (feats['hr_p90'] - feats['hr_p10'])
    feats['hr_cv'] = (feats['hr_std'] / (feats['hr_mean'] + 1e-6))
    
    if feats['hr_std'] > 1e-6:
        feats['hr_skew'] = float(skew(hr))
        feats['hr_kurt'] = float(kurtosis(hr))
    else:
        feats['hr_skew'] = 0.0
        feats['hr_kurt'] = 0.0
        
    # HR Temporal First-Differences & Acceleration
    hr_diff = np.diff(hr)
    feats['hr_diff_mean'] = float(np.mean(np.abs(hr_diff))) if len(hr_diff) > 0 else 0.0
    feats['hr_diff_rms'] = float(np.sqrt(np.mean(hr_diff**2))) if len(hr_diff) > 0 else 0.0
    
    hr_accel = np.diff(hr_diff) if len(hr_diff) > 1 else np.array([0.0])
    feats['hr_accel_mean'] = float(np.mean(np.abs(hr_accel)))
    feats['hr_accel_rms'] = float(np.sqrt(np.mean(hr_accel**2)))
    feats['hr_slope'] = float(np.polyfit(x, hr, 1)[0]) if n > 1 else 0.0

    # 2. SpO2 Statistical & Temporal Features
    feats['spo2_mean'] = float(np.mean(spo2))
    feats['spo2_std'] = float(np.std(spo2, ddof=1)) if n > 1 else 0.0
    feats['spo2_min'] = float(np.min(spo2))
    feats['spo2_max'] = float(np.max(spo2))
    feats['spo2_range'] = (feats['spo2_max'] - feats['spo2_min'])
    feats['spo2_median'] = float(np.median(spo2))
    feats['spo2_p10'] = float(np.percentile(spo2, 10))
    feats['spo2_p90'] = float(np.percentile(spo2, 90))
    feats['spo2_iqr'] = (feats['spo2_p90'] - feats['spo2_p10'])
    feats['spo2_cv'] = (feats['spo2_std'] / (feats['spo2_mean'] + 1e-6))
    feats['spo2_slope'] = float(np.polyfit(x, spo2, 1)[0]) if n > 1 else 0.0
    
    spo2_diff = np.diff(spo2)
    feats['spo2_diff_mean'] = float(np.mean(np.abs(spo2_diff))) if len(spo2_diff) > 0 else 0.0
    
    # 3. Temperature Statistical & Temporal Features
    feats['temp_mean'] = float(np.mean(temp))
    feats['temp_std'] = float(np.std(temp, ddof=1)) if n > 1 else 0.0
    feats['temp_min'] = float(np.min(temp))
    feats['temp_max'] = float(np.max(temp))
    feats['temp_range'] = (feats['temp_max'] - feats['temp_min'])
    feats['temp_median'] = float(np.median(temp))
    feats['temp_p10'] = float(np.percentile(temp, 10))
    feats['temp_p90'] = float(np.percentile(temp, 90))
    feats['temp_iqr'] = (feats['temp_p90'] - feats['temp_p10'])
    feats['temp_cv'] = (feats['temp_std'] / (feats['temp_mean'] + 1e-6))
    feats['temp_slope'] = float(np.polyfit(x, temp, 1)[0]) if n > 1 else 0.0
    
    temp_diff = np.diff(temp)
    feats['temp_diff_mean'] = float(np.mean(np.abs(temp_diff))) if len(temp_diff) > 0 else 0.0
    
    # 4. Cross-Vital Ratios
    feats['hr_temp_ratio'] = (feats['hr_mean'] / (feats['temp_mean'] + 1e-6))
    feats['hr_spo2_ratio'] = (feats['hr_mean'] / (feats['spo2_mean'] + 1e-6))
    feats['temp_spo2_ratio'] = (feats['temp_mean'] / (feats['spo2_mean'] + 1e-6))
    feats['hr_temp_spo2_mult_ratio'] = ((feats['hr_mean'] * feats['temp_mean']) / (feats['spo2_mean'] + 1e-6))

    # 5. Personalized Subject Baseline Features
    hr_base_std = subj_baseline['hr_std'] if subj_baseline.get('hr_std', 1.0) >= 1e-6 else 1.0
    temp_base_std = subj_baseline['temp_std'] if subj_baseline.get('temp_std', 1.0) >= 1e-6 else 1.0
    spo2_base_std = subj_baseline['spo2_std'] if subj_baseline.get('spo2_std', 1.0) >= 1e-6 else 1.0

    feats['hr_base_delta'] = (feats['hr_mean'] - subj_baseline['hr_mean'])
    feats['hr_base_zscore'] = (feats['hr_base_delta'] / hr_base_std)
    
    feats['temp_base_delta'] = (feats['temp_mean'] - subj_baseline['temp_mean'])
    feats['temp_base_zscore'] = (feats['temp_base_delta'] / temp_base_std)
    
    feats['spo2_base_delta'] = (feats['spo2_mean'] - subj_baseline['spo2_mean'])
    feats['spo2_base_zscore'] = (feats['spo2_base_delta'] / spo2_base_std)
    
    return feats
