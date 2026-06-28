# 🎬 Movie Rating Prediction with Python

## 📌 Project Overview

Movie Rating Prediction is a Machine Learning project developed as part of the **CodSoft Data Science Internship Program**. The objective of this project is to predict movie ratings based on various features such as genre, duration, votes, release year, and other movie-related attributes.

This project demonstrates the complete Data Science workflow, including data preprocessing, exploratory data analysis (EDA), feature engineering, model training, evaluation, visualization, and deployment through a Flask web application.

---

## 🎯 Problem Statement

Movie ratings play an important role in helping viewers choose films and helping producers understand audience preferences. Using historical movie data, the goal is to build a machine learning model capable of predicting movie ratings based on available movie characteristics.

This is a regression-based machine learning problem where the model predicts a numerical rating value.

---

## 📊 Dataset Information

The dataset contains movie-related information such as:

* Movie Name
* Genre
* Director
* Actors
* Duration
* Release Year
* Votes
* Rating

### Dataset Features

| Feature  | Description     |
| -------- | --------------- |
| Name     | Movie Name      |
| Genre    | Movie Genre     |
| Director | Director Name   |
| Actor    | Lead Actors     |
| Duration | Movie Runtime   |
| Year     | Release Year    |
| Votes    | Number of Votes |
| Rating   | Target Variable |

---

## 🔍 Exploratory Data Analysis (EDA)

The following analyses were performed:

### Rating Distribution

* Analyzed the spread of movie ratings.
* Identified highly rated and low-rated movies.

### Genre Analysis

* Compared average ratings across genres.
* Determined genres with consistently higher ratings.

### Votes vs Rating

* Examined the relationship between popularity and ratings.

### Duration Analysis

* Studied how movie length affects ratings.

### Correlation Analysis

* Identified relationships between numerical features.

---

## ⚙️ Data Preprocessing

The dataset underwent several preprocessing steps:

* Missing value handling
* Duplicate record removal
* Label Encoding for categorical features
* Feature scaling
* Train-Test Split

---

## 🛠️ Feature Engineering

Additional transformations were performed to improve model performance:

* Encoding categorical variables
* Extracting useful numerical attributes
* Removing irrelevant columns
* Normalizing numerical features

---

## 🤖 Machine Learning Models Used

The following algorithms were trained and compared:

1. Linear Regression
2. Decision Tree Regressor
3. Random Forest Regressor
4. Gradient Boosting Regressor

---

## 📈 Model Evaluation

Evaluation metrics used:

* R² Score
* Mean Absolute Error (MAE)
* Mean Squared Error (MSE)
* Root Mean Squared Error (RMSE)

### Sample Performance Comparison

| Model             | R² Score |
| ----------------- | -------- |
| Linear Regression | 0.78     |
| Decision Tree     | 0.81     |
| Random Forest     | 0.89     |
| Gradient Boosting | 0.87     |

### Best Performing Model

🏆 **Random Forest Regressor**

---

## 📊 Visualizations Included

* Rating Distribution
* Genre-wise Rating Analysis
* Votes vs Rating Scatter Plot
* Correlation Heatmap
* Feature Importance Chart

All visualizations are available in the **output_images** folder.

---

## 🌐 Web Application

A Flask-based web application has been developed for real-time movie rating prediction.

### User Inputs

* Genre
* Duration
* Release Year
* Votes
* Director Information

### Prediction Output

* Predicted Movie Rating ⭐
* Confidence Analysis
* Model Insights

---

## 🧰 Technologies Used

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn
* Scikit-Learn
* Flask
* Jupyter Notebook

---

## 📁 Project Structure

```text
Task2_Movie_Rating_Prediction/
│
├── movie_dataset.csv
├── Movie_Rating_Prediction.ipynb
├── app.py
├── model.pkl
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── output_images/
    ├── rating_distribution.png
    ├── genre_analysis.png
    ├── correlation_heatmap.png
    └── feature_importance.png
```

---

## ▶️ How to Run

### Clone Repository

```bash
git clone <repository-url>
cd Task2_Movie_Rating_Prediction
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Flask Application

```bash
python app.py
```

### Open Browser

```text
http://localhost:5000
```

---

## 🚀 Future Improvements

* Deep Learning Models
* Recommendation System Integration
* Hyperparameter Tuning
* Cloud Deployment
* Real-Time Movie Data Integration
* Interactive Dashboard

---

## 🏆 Conclusion

This project successfully demonstrates the application of Machine Learning techniques to predict movie ratings. Through data analysis, preprocessing, model comparison, and deployment, the project showcases practical Data Science skills and provides a complete end-to-end predictive analytics solution.

---

### 👨‍💻 Developed for CodSoft Data Science Internship Program

**Author:** Chalapati Sarika
**Internship:** CodSoft Data Science Internship
**Task:** Movie Rating Prediction with Python 🎬⭐
