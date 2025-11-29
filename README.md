# Project Analytics Dashboard

AI-powered project management analytics system with machine learning predictions for project delays and resource bottlenecks.



![Screenshot 2025-11-2![Screenshot 2025-11-29 142046](https://github.com/user-attachments/assets/46ded629-07d3-4242-aed9-0d6f4237245b)

9 142027](https://github.com/user-attachments/assets/0d37b247-8caa-43e4-b8ca-59d8769b479a)


![Screenshot 2025-11-29 141921](https://github.com/user-attachments/assets/f61782c3-1c77-4a92-8ed5-c9eb0bbed912)

## Features

- � **Interactive Dashboard** - Real-time project analytics with beautiful visualizations
- 🔮 **ML Predictions** - Predict project delays and identify resource bottlenecks
- � **Data Visualization** - Charts powered by Chart.js
- 📋 **Project Management** - Search, filter, and analyze all projects
- 🤖 **Model Insights** - View ML model performance metrics

## Tech Stack

**Backend:**
- FastAPI
- PostgreSQL
- scikit-learn (Random Forest)
- Pandas

**Frontend:**
- HTML5, CSS3, JavaScript
- Chart.js
- Modern responsive design

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-analytics.git
cd project-analytics
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database in `backend/api.py`:
```python
DB_CONFIG = {
    "host": "localhost",
    "port": "5432",
    "database": "project_analytics",
    "user": "your_username",
    "password": "your_password"
}
```

4. Start the backend:
```bash
python -m uvicorn backend.api:app --reload
```

5. Open `index.html` in your browser

## API Endpoints

- `GET /` - API information
- `GET /projects` - Retrieve all projects
- `GET /stats` - Summary statistics
- `GET /model-info` - Model performance metrics
- `POST /predict` - Generate predictions

## ML Models

### Delay Prediction
- **Algorithm:** Random Forest Regressor
- **MAE:** 0.183 days
- **R² Score:** 0.999

### Bottleneck Detection
- **Algorithm:** Random Forest Classifier
- **Accuracy:** 100%

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

## Usage

### Making Predictions

```javascript
const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        project_cost: 5000000,
        project_benefit: 8000000,
        complexity: "High",
        completionpercent: 75,
        actual_duration_days: 120
    })
});

const result = await response.json();
console.log(result);
```

## Screenshots

*Add screenshots of your dashboard here*

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/project-analytics](https://github.com/yourusername/project-analytics)

