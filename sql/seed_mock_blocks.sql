-- =============================================================================
-- Mock Data Seed Script for Deep Learning Block Library
-- Target Schema: public.block, public.block_version (from backup_db.sql)
-- Page 1 (IDs 1-12) exactly matches Figma screens. Page 2 (IDs 13-18) for pagination.
-- =============================================================================

-- 1. Insert Core Types
INSERT INTO public.type (id, name, code, create_date)
VALUES 
    (2, 'module', 'MODULE_CODE', now()),
    (3, 'dataset', 'DATASET_CODE', now())
ON CONFLICT (name) DO NOTHING;

-- Clean existing blocks for a fresh exact re-seed
DELETE FROM public.block_version;
DELETE FROM public.block;

-- 2. Insert Blocks (1-12: Figma Screen 1)
INSERT INTO public.block (id, name, registry_name, type, modality, create_date)
VALUES
    -- Row 1 in Figma
    (1, 'CIFAR-10', 'cifar10', 'DATA', 'Image', now()),
    (2, 'Speech Commands', 'speech_commands', 'DATA', 'Audio', now()),
    (3, 'Conv Block', 'conv_block', 'LAYER', 'Image', now()),
    (4, 'Residual Block', 'residual_block', 'LAYER', 'Image', now()),

    -- Row 2 in Figma
    (5, 'Patch Embedding', 'patch_embedding', 'LAYER', 'Image', now()),
    (6, 'Transformer Encoder', 'transformer_encoder', 'LAYER', 'Text and image', now()),
    (7, 'Spectrogram', 'spectrogram', 'LAYER', 'Audio', now()),
    (8, 'Add', 'add_op', 'MERGE', 'All', now()),

    -- Row 3 in Figma
    (9, 'Concat', 'concat_op', 'MERGE', 'All', now()),
    (10, 'Cross Entropy', 'cross_entropy', 'LOSS', 'Classification', now()),
    (11, 'Focal Loss', 'focal_loss', 'LOSS', 'Classification', now()),
    (12, 'Early Stop on Plateau', 'early_stopping', 'CALLBACK', 'All', now()),

    -- Page 2 in Figma
    (13, 'MNIST Digits', 'mnist_digits', 'DATA', 'Image', now()),
    (14, 'Linear Layer', 'linear_layer', 'LAYER', 'All', now()),
    (15, 'BatchNorm2d', 'batch_norm2d', 'LAYER', 'Image', now()),
    (16, 'Max Pooling', 'max_pooling', 'LAYER', 'Image', now()),
    (17, 'MSE Loss', 'mse_loss', 'LOSS', 'All', now()),
    (18, 'Model Checkpoint', 'model_checkpoint', 'CALLBACK', 'All', now());

-- 3. Insert Block Versions (Code, inputs, outputs, params)
INSERT INTO public.block_version (block_id, version, code, inputs, outputs, params, create_date)
VALUES
    -- 1. CIFAR-10
    (1, 1, 
    'from torchvision.datasets import CIFAR10
from torch.utils.data import Dataset

class CIFAR10Dataset(Dataset):
    def __init__(self, root="./data", train=True, download=True):
        self.ds = CIFAR10(root=root, train=train, download=download)
    def __len__(self):
        return len(self.ds)
    def __getitem__(self, idx):
        return self.ds[idx]',
    '[]'::jsonb,
    '["out image [3,32,32]", "out label"]'::jsonb,
    '[{"name": "root", "type": "str", "default": "./data"}, {"name": "train", "type": "bool", "default": "True"}]'::jsonb,
    now()),

    -- 2. Speech Commands
    (2, 1,
    'class SpeechCommandsDataset:
    def __init__(self, sample_rate=16000):
        self.sr = sample_rate',
    '[]'::jsonb,
    '["out waveform [16000]", "out label"]'::jsonb,
    '[{"name": "sample_rate", "type": "int", "default": "16000"}]'::jsonb,
    now()),

    -- 3. Conv Block (v3)
    (3, 3,
    'import torch.nn as nn

class ConvBlock(nn.Module):
    def __init__(self, in_c=3, out_c=64, k=3, s=1, p=1):
        super().__init__()
        self.conv = nn.Conv2d(in_c, out_c, k, s, p)
        self.bn = nn.BatchNorm2d(out_c)
        self.relu = nn.ReLU(inplace=True)
    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))',
    '["in [B,C,H,W]"]'::jsonb,
    '["out [B,C,H,W]"]'::jsonb,
    '[{"name": "in_c", "type": "int", "default": "3"}, {"name": "out_c", "type": "int", "default": "64"}]'::jsonb,
    now()),

    -- 4. Residual Block (v1)
    (4, 1,
    'import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, channels=64):
        super().__init__()
        self.c1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.c2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.act = nn.GELU()
    def forward(self, x):
        return x + self.c2(self.act(self.c1(x)))',
    '["in [B,C,H,W]"]'::jsonb,
    '["out main, skip"]'::jsonb,
    '[{"name": "channels", "type": "int", "default": "64"}]'::jsonb,
    now()),

    -- 5. Patch Embedding (v2)
    (5, 2,
    'import torch.nn as nn

class PatchEmbedding(nn.Module):
    def __init__(self, img_size=32, patch_size=4, in_c=3, embed_dim=64):
        super().__init__()
        self.proj = nn.Conv2d(in_c, embed_dim, kernel_size=patch_size, stride=patch_size)
    def forward(self, x):
        return self.proj(x).flatten(2).transpose(1, 2)',
    '["in [B,3,H,W]"]'::jsonb,
    '["out [B,N,D]"]'::jsonb,
    '[{"name": "img_size", "type": "int", "default": "32"}, {"name": "embed_dim", "type": "int", "default": "64"}]'::jsonb,
    now()),

    -- 6. Transformer Encoder (Built-in)
    (6, 1,
    'import torch.nn as nn
class TransformerEncoder(nn.Module):
    def __init__(self, d_model=64, nhead=4):
        super().__init__()
        self.layer = nn.TransformerEncoderLayer(d_model, nhead, batch_first=True)
    def forward(self, x):
        return self.layer(x)',
    '["in [B,N,D]"]'::jsonb,
    '["out [B,N,D]"]'::jsonb,
    '[{"name": "d_model", "type": "int", "default": "64"}, {"name": "nhead", "type": "int", "default": "4"}]'::jsonb,
    now()),

    -- 7. Spectrogram (v1)
    (7, 1,
    'import torch.nn as nn
class Spectrogram(nn.Module):
    def __init__(self, n_fft=400, hop_length=160):
        super().__init__()
        self.n_fft = n_fft
        self.hop = hop_length
    def forward(self, x):
        return x',
    '["in [B,T]"]'::jsonb,
    '["out [B,F,T]"]'::jsonb,
    '[{"name": "n_fft", "type": "int", "default": "400"}]'::jsonb,
    now()),

    -- 8. Add (Built-in)
    (8, 1,
    'import torch
class AddOp:
    def forward(self, a, b):
        return a + b',
    '["in a, b (same shape)"]'::jsonb,
    '["out a + b"]'::jsonb,
    '[]'::jsonb,
    now()),

    -- 9. Concat (Built-in)
    (9, 1,
    'import torch
class ConcatOp:
    def forward(self, *tensors, dim=1):
        return torch.cat(tensors, dim=dim)',
    '["in 2 or more"]'::jsonb,
    '["out joined on a dim"]'::jsonb,
    '[{"name": "dim", "type": "int", "default": "1"}]'::jsonb,
    now()),

    -- 10. Cross Entropy (Built-in)
    (10, 1,
    'import torch.nn as nn
criterion = nn.CrossEntropyLoss()',
    '["in pred, target"]'::jsonb,
    '["ends the canvas"]'::jsonb,
    '[]'::jsonb,
    now()),

    -- 11. Focal Loss (v2)
    (11, 2,
    'import torch
import torch.nn as nn
class FocalLoss(nn.Module):
    def __init__(self, gamma=2.0):
        super().__init__()
        self.gamma = gamma',
    '["in pred, target"]'::jsonb,
    '["ends the canvas"]'::jsonb,
    '[{"name": "gamma", "type": "float", "default": "2.0"}]'::jsonb,
    now()),

    -- 12. Early Stop on Plateau (v1)
    (12, 1,
    'class EarlyStopping:
    def __init__(self, patience=5):
        self.patience = patience',
    '["runs on epoch end"]'::jsonb,
    '["no connections"]'::jsonb,
    '[{"name": "patience", "type": "int", "default": "5"}]'::jsonb,
    now()),

    -- 13. MNIST Digits
    (13, 1,
    'from torchvision.datasets import MNIST
class MNISTDataset:
    def __init__(self, root="./data", train=True):
        self.ds = MNIST(root=root, train=train)',
    '[]'::jsonb,
    '["out image [1,28,28]", "out label"]'::jsonb,
    '[{"name": "root", "type": "str", "default": "./data"}]'::jsonb,
    now()),

    -- 14. Linear Layer
    (14, 1,
    'import torch.nn as nn
class Linear(nn.Module):
    def __init__(self, in_features=64, out_features=10):
        super().__init__()
        self.fc = nn.Linear(in_features, out_features)
    def forward(self, x):
        return self.fc(x)',
    '["in [B, in_features]"]'::jsonb,
    '["out [B, out_features]"]'::jsonb,
    '[{"name": "in_features", "type": "int", "default": "64"}, {"name": "out_features", "type": "int", "default": "10"}]'::jsonb,
    now()),

    -- 15. BatchNorm2d
    (15, 2,
    'import torch.nn as nn
class BatchNorm2dWrapper(nn.Module):
    def __init__(self, num_features=64):
        super().__init__()
        self.bn = nn.BatchNorm2d(num_features)
    def forward(self, x):
        return self.bn(x)',
    '["in [B,C,H,W]"]'::jsonb,
    '["out [B,C,H,W]"]'::jsonb,
    '[{"name": "num_features", "type": "int", "default": "64"}]'::jsonb,
    now()),

    -- 16. Max Pooling
    (16, 1,
    'import torch.nn as nn
class MaxPooling(nn.Module):
    def __init__(self, kernel_size=2, stride=2):
        super().__init__()
        self.pool = nn.MaxPool2d(kernel_size, stride)
    def forward(self, x):
        return self.pool(x)',
    '["in [B,C,H,W]"]'::jsonb,
    '["out [B,C,H/2,W/2]"]'::jsonb,
    '[{"name": "kernel_size", "type": "int", "default": "2"}]'::jsonb,
    now()),

    -- 17. MSE Loss
    (17, 1,
    'import torch.nn as nn
criterion = nn.MSELoss()',
    '["in pred, target"]'::jsonb,
    '["scalar loss"]'::jsonb,
    '[]'::jsonb,
    now()),

    -- 18. Model Checkpoint
    (18, 1,
    'class ModelCheckpoint:
    def __init__(self, filepath="./weights.pt"):
        self.path = filepath',
    '["runs on val_loss min"]'::jsonb,
    '["saves .pt weights"]'::jsonb,
    '[{"name": "filepath", "type": "str", "default": "./weights.pt"}]'::jsonb,
    now());

-- 4. Set Sequence to maximum ID
SELECT setval('public.block_id_seq', (SELECT MAX(id) FROM public.block));
SELECT setval('public.block_version_id_seq', (SELECT MAX(id) FROM public.block_version));
