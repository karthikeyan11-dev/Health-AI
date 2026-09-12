"""
MATLAB AI Pipeline Training & Artifact Export Script
Translates the entire 5-Phase MATLAB Research Pipeline to Native Python:
1. Feature Engineering (PP, MAP, RPP, Sleep Impact, Autonomic Stress, Activity Efficiency)
2. 5-Class Bagged Random Forest Classifier with Zero-Leakage Group-Aware User Splits
3. PyTorch GRU + Multi-Head Self-Attention Temporal Digital Twin
4. Rule-Guided Action-Masked CardioEnv Gymnasium MDP & PPO Reinforcement Learning Policy
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_pipeline")

SEED = 42
np.random.seed(SEED)
torch.manual_seed(SEED)

DATA_PATH = "data/processed_digital_twin_data.csv"
CARDIO_ARTIFACTS_DIR = "ai_service/artifacts/cardio"
TWIN_ARTIFACTS_DIR = "ai_service/artifacts/digital_twin"

os.makedirs(CARDIO_ARTIFACTS_DIR, exist_ok=True)
os.makedirs(TWIN_ARTIFACTS_DIR, exist_ok=True)

# =========================================================================
# PHASE 1: BIOMETRIC FEATURE ENGINEERING
# =========================================================================
def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Replicates MATLAB prepare_features.m identically."""
    T = df.copy()
    
    # 1. Hemodynamic & Metabolic derived features
    T['pulse_pressure'] = T['bp_systolic'] - T['bp_diastolic']
    T['map_score'] = T['bp_diastolic'] + (T['pulse_pressure'] / 3.0)
    T['rpp'] = T['resting_hr'] * T['bp_systolic']
    T['sleep_impact'] = T['sleep_hours'] * T['sleep_efficiency']
    
    # 2. Autonomic stress balance proxy
    if 'hrv' in T.columns:
        T['autonomic_stress_proxy'] = (100.0 - T['hrv']) * (T['resting_hr'] / 60.0)
        
    # 3. Activity metabolic efficiency
    if 'steps' in T.columns and 'calories_burned' in T.columns:
        T['activity_efficiency'] = T['calories_burned'] / np.maximum(T['steps'], 1.0)
        
    # 4. Outlier clipping
    T['bp_systolic'] = np.clip(T['bp_systolic'], 70.0, 250.0)
    T['bp_diastolic'] = np.clip(T['bp_diastolic'], 40.0, 150.0)
    T['resting_hr'] = np.clip(T['resting_hr'], 30.0, 200.0)
    
    return T

logger.info("Loading raw dataset from %s...", DATA_PATH)
raw_df = pd.read_csv(DATA_PATH)
df_features = prepare_features(raw_df)

id_col = "user_id"
date_col = "date"
label_col = "cardiometabolic_risk_state"

feature_cols = [col for col in df_features.columns if col not in [id_col, date_col, label_col]]
logger.info("Total rows: %d | Feature columns: %d | Unique users: %d", len(df_features), len(feature_cols), df_features[id_col].nunique())

# Save feature column names
with open(os.path.join(CARDIO_ARTIFACTS_DIR, "feature_names.json"), "w") as f:
    json.dump(feature_cols, f, indent=2)

# =========================================================================
# PHASE 2: 5-CLASS RANDOM FOREST CLASSIFIER (GROUP-AWARE SPLIT)
# =========================================================================
logger.info("=== PHASE 2: TRAINING RANDOM FOREST RISK CLASSIFIER ===")
unique_users = df_features[id_col].unique()
np.random.shuffle(unique_users)

n_train = int(0.8 * len(unique_users))
train_users = set(unique_users[:n_train])
test_users = set(unique_users[n_train:])

train_mask = df_features[id_col].isin(train_users)
test_mask = df_features[id_col].isin(test_users)

X_train_df = df_features.loc[train_mask, feature_cols]
y_train = df_features.loc[train_mask, label_col].values
X_test_df = df_features.loc[test_mask, feature_cols]
y_test = df_features.loc[test_mask, label_col].values

logger.info("Train rows: %d (%d users) | Test rows: %d (%d users)", len(X_train_df), len(train_users), len(X_test_df), len(test_users))

# Fit StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_df)
X_test_scaled = scaler.transform(X_test_df)

# Train Bagged Random Forest Ensemble (150 trees)
rf_model = RandomForestClassifier(
    n_estimators=150,
    max_leaf_nodes=50,
    random_state=SEED,
    n_jobs=-1
)
rf_model.fit(X_train_scaled, y_train)

y_pred = rf_model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
logger.info("✅ Held-Out Test Accuracy: %.2f%%", acc * 100)
logger.info("\n%s", classification_report(y_test, y_pred, target_names=["Optimal (0)", "Low (1)", "Moderate (2)", "High (3)", "Critical (4)"]))

# Save Classifier & Scaler & Template
joblib.dump(rf_model, os.path.join(CARDIO_ARTIFACTS_DIR, "rf_risk_classifier.joblib"))
joblib.dump(scaler, os.path.join(CARDIO_ARTIFACTS_DIR, "feature_scaler.joblib"))

# Save background samples for SHAP explainer
background_samples = X_test_scaled[np.random.choice(len(X_test_scaled), min(100, len(X_test_scaled)), replace=False)]
joblib.dump(background_samples, os.path.join(CARDIO_ARTIFACTS_DIR, "shap_background.joblib"))

# Save template features CSV
df_features[feature_cols].head(50).to_csv(os.path.join(CARDIO_ARTIFACTS_DIR, "template_features.csv"), index=False)
logger.info("Saved Phase 2 classifier artifacts to %s", CARDIO_ARTIFACTS_DIR)

# =========================================================================
# PHASE 2b: PYTORCH GRU + MULTI-HEAD SELF-ATTENTION DIGITAL TWIN
# =========================================================================
logger.info("=== PHASE 2b: TRAINING GRU-ATTENTION DIGITAL TWIN ===")

# Build per-user sequences sorted by date
df_features[date_col] = pd.to_datetime(df_features[date_col], format="%d-%m-%Y")
df_sorted = df_features.sort_values(by=[id_col, date_col])

user_sequences = []
user_labels = []
user_id_list = []

for uid, group in df_sorted.groupby(id_col):
    seq_feats = group[feature_cols].values.astype(np.float32)  # (30, num_features)
    seq_lbls = group[label_col].values.astype(np.int64)        # (30,)
    user_sequences.append(seq_feats)
    user_labels.append(seq_lbls)
    user_id_list.append(uid)

# Three-way split: 64% Train / 16% Val / 20% Test
n_total_users = len(user_id_list)
shuffled_indices = np.random.permutation(n_total_users)

n_train_users = int(0.64 * n_total_users)
n_val_users = int(0.16 * n_total_users)

train_idx = shuffled_indices[:n_train_users]
val_idx = shuffled_indices[n_train_users:n_train_users + n_val_users]
test_idx = shuffled_indices[n_train_users + n_val_users:]

logger.info("GRU Users -> Train: %d | Val: %d | Test: %d", len(train_idx), len(val_idx), len(test_idx))

# Compute normalization mu & sigma strictly on training users
all_train_feats = np.concatenate([user_sequences[i] for i in train_idx], axis=0)
norm_mu = np.mean(all_train_feats, axis=0)
norm_sigma = np.std(all_train_feats, axis=0)
norm_sigma[norm_sigma == 0] = 1.0

# Save Normalization Stats
norm_stats = {
    "mu": norm_mu.tolist(),
    "sigma": norm_sigma.tolist(),
    "feature_cols": feature_cols
}
with open(os.path.join(TWIN_ARTIFACTS_DIR, "normalization_stats.json"), "w") as f:
    json.dump(norm_stats, f, indent=2)

def normalize_seq(seq):
    return (seq - norm_mu) / norm_sigma

X_train_seq = [normalize_seq(user_sequences[i]) for i in train_idx]
y_train_seq = [user_labels[i] for i in train_idx]

X_val_seq = [normalize_seq(user_sequences[i]) for i in val_idx]
y_val_seq = [user_labels[i] for i in val_idx]

X_test_seq = [normalize_seq(user_sequences[i]) for i in test_idx]
y_test_seq = [user_labels[i] for i in test_idx]

# Sequence-level minority oversampling for underrepresented classes (0, 3, 4)
train_labels_flat = np.concatenate(y_train_seq)
class_counts = pd.Series(train_labels_flat).value_counts()
max_count = class_counts.max()
TARGET_FRACTION = 0.30

extra_X, extra_y = [], []
for c in range(5):
    cnt = class_counts.get(c, 0)
    if cnt < TARGET_FRACTION * max_count:
        target_days = int(TARGET_FRACTION * max_count)
        has_class_c = [i for i, lbls in enumerate(y_train_seq) if c in lbls]
        if has_class_c:
            days_per_copy = sum(np.sum(y_train_seq[i] == c) for i in has_class_c)
            if days_per_copy > 0:
                copies_needed = max(1, int(np.ceil((target_days - cnt) / days_per_copy)))
                for _ in range(copies_needed):
                    for idx_c in has_class_c:
                        extra_X.append(X_train_seq[idx_c])
                        extra_y.append(y_train_seq[idx_c])

X_train_seq.extend(extra_X)
y_train_seq.extend(extra_y)
logger.info("Training sequences after oversampling: %d", len(X_train_seq))

# PyTorch Dataset
class SequenceDataset(Dataset):
    def __init__(self, sequences, labels):
        self.sequences = [torch.tensor(s, dtype=torch.float32) for s in sequences]
        self.labels = [torch.tensor(l, dtype=torch.long) for l in labels]

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.labels[idx]

train_loader = DataLoader(SequenceDataset(X_train_seq, y_train_seq), batch_size=64, shuffle=True)
val_loader = DataLoader(SequenceDataset(X_val_seq, y_val_seq), batch_size=64, shuffle=False)
test_loader = DataLoader(SequenceDataset(X_test_seq, y_test_seq), batch_size=64, shuffle=False)

# PyTorch GRU + Multi-Head Self-Attention Architecture
class GRUAttentionNet(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_heads: int = 4, num_classes: int = 5, dropout: float = 0.3):
        super().__init__()
        self.gru1 = nn.GRU(input_dim, hidden_dim, batch_first=True)
        self.drop1 = nn.Dropout(dropout)
        self.attn = nn.MultiheadAttention(embed_dim=hidden_dim, num_heads=num_heads, batch_first=True)
        self.gru2 = nn.GRU(hidden_dim, hidden_dim, batch_first=True)
        self.drop2 = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        # x: (batch_size, seq_len, input_dim)
        out, _ = self.gru1(x)
        out = self.drop1(out)
        attn_out, _ = self.attn(out, out, out)
        out, _ = self.gru2(attn_out)
        out = self.drop2(out)
        logits = self.fc(out)  # (batch_size, seq_len, num_classes)
        return logits

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
input_dim = len(feature_cols)
model = GRUAttentionNet(input_dim=input_dim).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)

best_val_loss = float("inf")
best_model_state = None

logger.info("Training GRU-Attention model on %s for 30 epochs...", device)
for epoch in range(1, 31):
    model.train()
    train_loss = 0.0
    for X_b, y_b in train_loader:
        X_b, y_b = X_b.to(device), y_b.to(device)
        optimizer.zero_grad()
        logits = model(X_b)  # (B, T, C)
        loss = criterion(logits.view(-1, 5), y_b.view(-1))
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * X_b.size(0)

    train_loss /= len(train_loader.dataset)

    # Validation
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0
    with torch.no_grad():
        for X_b, y_b in val_loader:
            X_b, y_b = X_b.to(device), y_b.to(device)
            logits = model(X_b)
            loss = criterion(logits.view(-1, 5), y_b.view(-1))
            val_loss += loss.item() * X_b.size(0)
            preds = torch.argmax(logits, dim=-1)
            val_correct += (preds == y_b).sum().item()
            val_total += y_b.numel()

    val_loss /= len(val_loader.dataset)
    val_acc = val_correct / val_total

    if val_loss < best_val_loss:
        best_val_loss = val_loss
        best_model_state = model.state_dict().copy()

    if epoch % 5 == 0 or epoch == 30:
        logger.info("Epoch %2d/30 | Train Loss: %.4f | Val Loss: %.4f | Val Acc: %.2f%%", epoch, train_loss, val_loss, val_acc * 100)

# Load best checkpoint and evaluate on held-out test users
model.load_state_dict(best_model_state)
torch.save(best_model_state, os.path.join(TWIN_ARTIFACTS_DIR, "gru_attention_net.pt"))
logger.info("Saved GRU-Attention weights to %s", TWIN_ARTIFACTS_DIR)

model.eval()
test_preds, test_trues = [], []
with torch.no_grad():
    for X_b, y_b in test_loader:
        X_b, y_b = X_b.to(device), y_b.to(device)
        logits = model(X_b)
        preds = torch.argmax(logits, dim=-1)
        test_preds.extend(preds.cpu().numpy().flatten())
        test_trues.extend(y_b.cpu().numpy().flatten())

test_acc = accuracy_score(test_trues, test_preds)
logger.info("✅ Digital Twin Held-Out Per-Day Test Accuracy: %.2f%%", test_acc * 100)

# =========================================================================
# PHASE 3: CARDIOENV MDP & RULE-GUIDED ACTION-MASKED PPO AGENT
# =========================================================================
logger.info("=== PHASE 3: TRAINING PPO CLINICAL INTERVENTION ENGINE ===")

class GymCardioEnv(gym.Env):
    """
    Gymnasium environment reproducing MATLAB CardioEnv.m identically:
    - State: Normalized vitals + current predicted risk class (length N + 1)
    - Actions: 4 discrete medical interventions
    - Rule-Guided Action Masking: Blocks unsafe actions (e.g. exercise during hypertension)
    """
    def __init__(self, raw_pool, feature_names, mu, sigma, rf_clf, scaler_obj):
        super().__init__()
        self.raw_pool = raw_pool
        self.feature_names = feature_names
        self.mu = mu
        self.sigma = sigma
        self.rf_clf = rf_clf
        self.scaler = scaler_obj
        
        self.num_features = len(feature_names)
        self.observation_space = spaces.Box(
            low=-10.0, high=10.0, shape=(self.num_features + 1,), dtype=np.float32
        )
        self.action_space = spaces.Discrete(4)
        
        self.max_steps = 14
        self.steps_elapsed = 0
        self.current_raw = None
        self.current_risk = 0

    def _predict_risk(self, raw_vitals):
        scaled = self.scaler.transform(raw_vitals.reshape(1, -1))
        return int(self.rf_clf.predict(scaled)[0])

    def _normalize(self, raw_vitals):
        return ((raw_vitals - self.mu) / self.sigma).astype(np.float32)

    def _check_safety(self, action, raw_vitals):
        """Rule-Guided Action-Masking Guardrails."""
        bp_idx = self.feature_names.index("bp_systolic")
        hr_idx = self.feature_names.index("resting_hr")
        
        bp_sys = raw_vitals[bp_idx]
        rhr = raw_vitals[hr_idx]
        
        is_safe = True
        effective_action = action
        
        # Action 3: Increase Physical Activity
        if action == 3 and (bp_sys >= 160.0 or rhr >= 100.0):
            is_safe = False
            effective_action = 0  # Fallback to Maintain Routine / Rest
            
        return is_safe, effective_action

    def _apply_effect(self, raw_vitals, action):
        """Heuristic physiological transition model with stochastic biological noise."""
        next_v = raw_vitals.copy()
        noise = 0.01 * np.abs(raw_vitals) * np.random.randn(*raw_vitals.shape)
        next_v = next_v + noise
        
        bp_sys_idx = self.feature_names.index("bp_systolic")
        bp_dia_idx = self.feature_names.index("bp_diastolic")
        hr_idx = self.feature_names.index("resting_hr")
        sleep_eff_idx = self.feature_names.index("sleep_efficiency")
        hrv_idx = self.feature_names.index("hrv")
        steps_idx = self.feature_names.index("steps")
        cal_idx = self.feature_names.index("calories_burned")
        
        if action == 1:  # Diet & Nutrition (Reduce Sodium)
            next_v[bp_sys_idx] -= 1.5
            next_v[bp_dia_idx] -= 1.0
        elif action == 2:  # Sleep & Recovery Protocol
            next_v[sleep_eff_idx] = min(1.0, next_v[sleep_eff_idx] + 0.03)
            next_v[hrv_idx] += 1.0
            next_v[hr_idx] -= 0.5
        elif action == 3:  # Increase Physical Activity
            next_v[steps_idx] += 800.0
            next_v[cal_idx] += 150.0
            next_v[hr_idx] -= 0.3
            
        return np.maximum(next_v, 0.0)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.steps_elapsed = 0
        idx = np.random.randint(len(self.raw_pool))
        self.current_raw = self.raw_pool[idx].copy()
        self.current_risk = self._predict_risk(self.current_raw)
        
        obs = np.append(self._normalize(self.current_raw), float(self.current_risk)).astype(np.float32)
        return obs, {}

    def step(self, action):
        self.steps_elapsed += 1
        
        is_safe, effective_action = self._check_safety(action, self.current_raw)
        next_raw = self._apply_effect(self.current_raw, effective_action)
        
        prev_risk = self.current_risk
        new_risk = self._predict_risk(next_raw)
        
        reward = float(prev_risk - new_risk)
        if not is_safe:
            reward -= 2.0  # Safety violation penalty
            
        self.current_raw = next_raw
        self.current_risk = new_risk
        
        obs = np.append(self._normalize(next_raw), float(new_risk)).astype(np.float32)
        terminated = (self.steps_elapsed >= self.max_steps) or (new_risk >= 4)
        truncated = False
        
        info = {"is_action_safe": is_safe, "effective_action": effective_action}
        return obs, reward, terminated, truncated, info

raw_pool = [user_sequences[i][0] for i in train_idx]
env = DummyVecEnv([lambda: GymCardioEnv(raw_pool, feature_cols, norm_mu, norm_sigma, rf_model, scaler)])

ppo_agent = PPO(
    "MlpPolicy",
    env,
    learning_rate=1e-3,
    n_steps=1024,
    batch_size=128,
    n_epochs=5,
    gamma=0.95,
    ent_coef=0.05,
    clip_range=0.2,
    verbose=1,
    seed=SEED
)

logger.info("Training PPO Agent for 25,000 steps...")
ppo_agent.learn(total_timesteps=25000)

ppo_save_path = os.path.join(CARDIO_ARTIFACTS_DIR, "ppo_intervention_agent.zip")
ppo_agent.save(ppo_save_path)
logger.info("✅ PPO Agent saved to %s", ppo_save_path)

logger.info("=========================================================================")
logger.info("ALL MATLAB PIPELINE ARTIFACTS SUCCESSFULLY REPLICATED & EXPORTED!")
logger.info("=========================================================================")
