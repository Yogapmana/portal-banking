# 🏦 Predictive Lead Scoring System (Bank Marketing)

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Library](https://img.shields.io/badge/Library-Scikit--Learn-orange)
![FastAPI](https://img.shields.io/badge/Service-FastAPI-009688)
![Status](https://img.shields.io/badge/Status-Production-green)

## 📋 Project Overview
Repositori ini berisi dokumentasi dan kode sumber *Machine Learning* untuk **Capstone Project Tim A25-CS083**. Proyek ini menyediakan layanan **Credit Scoring** cerdas berbasis API yang dapat memprediksi probabilitas keberhasilan telemarketing perbankan (Deposito Berjangka).

Model ini telah dioptimasi untuk integrasi aplikasi web secara *real-time*, memungkinkan tim sales untuk mendapatkan skor prioritas nasabah secara instan.

### Informasi Program
*   **Program:** Studi Independen Bersertifikat.
*   **Mitra:** PT Dicoding Akademi Indonesia (Program ASAH)
*   **Role:** Machine Learning Engineer

---

## 👥 Team Members (A25-CS083)
Proyek ini dikerjakan secara kolaboratif oleh tim lintas fungsi:
*   **Ardli Kafi Murobby** - Machine Learning Engineer (Data Modeling)
*   **Jeremy Timothy Souk** - Machine Learning Engineer (Data Analysis)
*   **Yoga Permana Putra** - React & Back-End Developer
*   **M. Mardlian Nurofiq** - React & Back-End Developer
*   **Jose Gabriel Thendito** - React & Back-End Developer

---

## 📂 Dataset & Feature Selection
Dataset bersumber dari **UCI Machine Learning Repository**: [Bank Marketing Data Set](https://archive.ics.uci.edu/dataset/222/bank+marketing).

### ⚡ Key Engineering Decision: 7 Key Features
Meskipun dataset asli memiliki 20 atribut, kami melakukan **Feature Selection** yang ketat untuk kebutuhan *Deployment Production*. Kami memilih **7 Fitur Utama** yang paling relevan dan mudah diinput oleh user di aplikasi web:

1.  **Demografis**: `age`, `job`, `marital`, `education`
2.  **Finansial**: `default` (kredit macet), `housing` (KPR), `loan` (pinjaman pribadi)

> **Catatan:** Fitur `duration` (durasi panggilan) tetap DIHAPUS untuk mencegah *Data Leakage*, karena durasi tidak diketahui sebelum panggilan dilakukan.

---

## 🛠️ Tech Stack & Architecture

### Libraries & Tools
*   **Training**: `Pandas`, `Scikit-learn`, `Jupyter Notebook`
*   **Serving**: `FastAPI`, `Uvicorn`, `Joblib`, `Docker`
*   **Data Gen**: `Faker` (untuk simulasi data dummy)

### Architecture Pipeline
1.  **Training (Offline)**: Dilakukan di `notebooks/Customer_Data_Modelling.ipynb`. Model dilatih menggunakan 19 fitur untuk analisis mendalam, namun divalidasi kinerjanya pada subset fitur.
2.  **Serving (Online)**: Menggunakan `ml-service` (FastAPI). Service ini menerima input 7 fitur dari Frontend/Backend, melakukan *preprocessing* ringan, dan mengembalikan skor secara *real-time*.

---

## 📊 Model Performance
Kami membandingkan beberapa algoritma (Random Forest, Logistic Regression, Gradient Boosting). 
**Model Terpilih: Gradient Boosting Classifier**.

| Metric | Score | Interpretasi |
| :--- | :--- | :--- |
| **ROC-AUC Score** | **0.8091** | Kemampuan membedakan kelas positif/negatif sangat baik. |
| **Accuracy** | **90.11%** | Tingkat keakuratan prediksi global. |

---

## 🔌 API Integration (Real-time Scoring)
Service Machine Learning berjalan pada endpoint `/predict`.

### Endpoint: `POST /predict`

#### Request Body (JSON)
```json
{
  "age": 35,
  "job": "entrepreneur",
  "marital": "married",
  "education": "university.degree",
  "default": "no",
  "housing": "yes",
  "loan": "no"
}
```

#### Response Body (JSON)
```json
{
  "score": 85.5,
  "probability": 0.4275,
  "priority": "HIGH"
}
```
*   **Score (0-100)**: Nilai probabilitas yang discaling untuk keterbacaan (0-100).
*   **Priority**: `HIGH` (>70), `MEDIUM` (40-70), `LOW` (<40).

---

## 🚀 How to Run

### 1. Training Model (Optional)
Jalankan notebook untuk melatih ulang model dan menghasilkan file `.pkl` baru.
```bash
cd notebooks
jupyter notebook Customer_Data_Modelling.ipynb
```

### 2. Running ML Service (Local)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
*Service akan berjalan di `http://localhost:5000`*

### 3. Running with Docker
```bash
cd ml-service
docker build -t credit-scoring-service .
docker run -p 5000:5000 credit-scoring-service
```