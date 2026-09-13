"""
PyTorch GRU + Multi-Head Self-Attention Digital Twin Model
Replicates the deep temporal architecture from MATLAB Phase 2b (Train_digital_twin_gru.m).
"""

import torch
import torch.nn as nn
from typing import Optional

class GRUAttentionNet(nn.Module):
    """
    Sequence-to-sequence Deep Recurrent Network with Self-Attention.
    Architecture:
      Input(num_features) -> GRU(64) -> Dropout(0.3) -> MultiHeadSelfAttention(4 heads, 64) -> GRU(64) -> Dropout(0.3) -> FC(5)
    """
    def __init__(
        self,
        input_dim: int = 32,
        hidden_dim: int = 64,
        num_heads: int = 4,
        num_classes: int = 5,
        dropout: float = 0.3
    ):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes

        self.gru1 = nn.GRU(input_dim, hidden_dim, batch_first=True)
        self.drop1 = nn.Dropout(dropout)
        self.attn = nn.MultiheadAttention(embed_dim=hidden_dim, num_heads=num_heads, batch_first=True)
        self.gru2 = nn.GRU(hidden_dim, hidden_dim, batch_first=True)
        self.drop2 = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        Args:
            x: Tensor of shape (batch_size, seq_len, input_dim)
        Returns:
            logits: Tensor of shape (batch_size, seq_len, num_classes)
        """
        # GRU Layer 1
        out, _ = self.gru1(x)
        out = self.drop1(out)

        # Multi-Head Self-Attention Layer
        attn_out, _ = self.attn(out, out, out)

        # GRU Layer 2
        out, _ = self.gru2(attn_out)
        out = self.drop2(out)

        # Classification Projection per Time-Step
        logits = self.fc(out)
        return logits
