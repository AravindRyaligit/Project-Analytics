# Project Analytics Dashboard

AI-powered project management analytics system with machine learning predictions for project delays and resource bottlenecks.

## Features

- � **Interactive Dashboard** - Real-time project analytics with beautiful visualizations
- 🔮 **ML Predictions** - Predict project delays and identify resource bottlenecks
- � **Data Visualization** - Charts powered by Chart.js
- 📋 **Project Management** - Search, filter, and analyze all projects
- 🤖 **Model Insights** - View ML model performance metrics

![Screenshot 2025-11-29 141921](https://github.com/user-attachments/assets/53ddcd6a-895a-48fc-9407-b743c7e90965)

![Screenshot 2025-11-29 142046](https://github.com/user-attachments/assets/64e7435c-1257-4d67-bb15-47fa49232859)

![Screenshot 2025-11-29 142027](https://github.com/user-attachments/assets/252c5ea5-9d83-4792-91c6-32cb8f34ff2a)






## Tech Stack

**Backend:**
- FastAPI
- PostgreSQL
- scikit-learn
- Pandas

**Frontend:**
- HTML5, CSS3, JavaScript
- Chart.js
- Modern responsive design

### Delay Prediction
- **Algorithm:** Random Forest Regressor
- **MAE:** 0.183 days
- **R² Score:** 0.999

### Bottleneck Detection
- **Algorithm:** Random Forest Classifier

## Project Structure

```
project_analytics/
├── backend/
│   ├── api.py                 # FastAPI application
│   ├── rf_delay_model.pkl     # Trained delay model
│   └── rf_bottleneck_model.pkl # Trained bottleneck model
├── index.html                 # Dashboard UI
├── styles.css                 # Styling
├── app.js                     # Frontend logic
└── requirements.txt           # Dependencies
```

## License

This project is licensed under the MIT License.





