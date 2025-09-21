import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from .config import Config
import traceback
import os

class VectorSearch:
    def __init__(self, model_name=None, doctors_path=None):
        self.model_name = model_name or Config.EMBED_MODEL
        self.doctors_path = doctors_path or Config.DOCTORS_PATH
        self.model = None
        self.index = None
        self.doctors = []
        self._load_data()
        self._build_index()

    def _load_data(self):
        try:
            if os.path.exists(self.doctors_path):
                with open(self.doctors_path, encoding="utf-8") as f:
                    self.doctors = json.load(f) or []
            else:
                self.doctors = []
        except Exception:
            self.doctors = []
            print("Failed to load doctors.json:", traceback.format_exc())

    def _doc_to_text(self, d):
        name = d.get("name", {})
        name_en = name.get("en") if isinstance(name, dict) else name
        name_ar = name.get("ar") if isinstance(name, dict) else ""
        bio = d.get("bio", "") or ""
        # Duplicate bilingual fields so Arabic queries match
        parts = [
            str(name_en or d.get("full_name","" )).strip(),
            str(name_ar).strip(),
            str(d.get("specialty","" )).strip(),
            str(bio).strip(),
            str(d.get("availability","" )).strip()
        ]
        return ". ".join([p for p in parts if p])

    def _build_index(self):
        texts = [self._doc_to_text(d) for d in self.doctors]
        if not texts:
            print("VectorSearch: no documents to index.")
            return
        try:
            self.model = SentenceTransformer(self.model_name)
            embs = self.model.encode(texts, convert_to_numpy=True)
            embs = np.asarray(embs, dtype=np.float32)
            if embs.ndim == 1:
                embs = np.expand_dims(embs, 0)
            faiss.normalize_L2(embs)
            dim = embs.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(embs)
            print(f"VectorSearch: built index ({len(self.doctors)} docs, dim={dim})")
        except Exception:
            self.model = None
            self.index = None
            print("VectorSearch: failed to build index:", traceback.format_exc())

    def search(self, query, k=None):
        if self.index is None:
            return []
        q_emb = self.model.encode([query], convert_to_numpy=True)
        q_emb = np.asarray(q_emb, dtype=np.float32)
        if q_emb.ndim == 1:
            q_emb = np.expand_dims(q_emb, 0)
        faiss.normalize_L2(q_emb)
        D, I = self.index.search(q_emb, k or Config.TOP_K)
        results = []
        for score, idx in zip(D[0], I[0]):
            if idx < 0: continue
            doc = self.doctors[int(idx)]
            results.append({"doc": doc, "score": float(score), "idx": int(idx)})
        return results