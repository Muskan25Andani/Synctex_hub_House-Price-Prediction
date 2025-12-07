from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

# Load the trained model and feature names
model_path = os.path.join(os.path.dirname(__file__), 'model', 'notebook', 'house_price_model.pkl')
model = None
feature_names = []

try:
    model_data = joblib.load(model_path)
    if isinstance(model_data, dict):
        model = model_data['model']
        feature_names = model_data['feature_names']
    else:
        model = model_data
        feature_names = []
    print("✓ Model loaded successfully!")
    print(f"✓ Model expects {len(feature_names)} features")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    print(f"✗ Model path: {model_path}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded. Please train the model first.', 'success': False}), 500
        
        data = request.get_json()
        
        # Extract features from request (matching CSV column names exactly)
        area = float(data.get('area', 0))
        bedrooms = int(data.get('bedrooms', 0))
        bathrooms = int(data.get('bathrooms', 0))
        stories = int(data.get('stories', 0))
        parking = int(data.get('parking', 0))
        mainroad = data.get('mainroad', 'no')
        guestroom = data.get('guestroom', 'no')
        basement = data.get('basement', 'no')
        hotwaterheating = data.get('hotwaterheating', 'no')
        airconditioning = data.get('airconditioning', 'no')
        prefarea = data.get('prefarea', 'no')
        furnishingstatus = data.get('furnishingstatus', 'furnished')
        
        # Create a dictionary matching exact column names from CSV
        raw_features = {
            'area': [area],
            'bedrooms': [bedrooms],
            'bathrooms': [bathrooms],
            'stories': [stories],
            'mainroad': [mainroad],
            'guestroom': [guestroom],
            'basement': [basement],
            'hotwaterheating': [hotwaterheating],
            'airconditioning': [airconditioning],
            'parking': [parking],
            'prefarea': [prefarea],
            'furnishingstatus': [furnishingstatus]
        }
        
        # Create DataFrame
        df_input = pd.DataFrame(raw_features)
        
        # Apply get_dummies with drop_first=True (same as training)
        df_encoded = pd.get_dummies(df_input, drop_first=True)
        
        # Ensure all required features exist
        for feature in feature_names:
            if feature not in df_encoded.columns:
                df_encoded[feature] = 0
        
        # Select features in correct order and make prediction
        features = df_encoded[feature_names].values
        prediction = model.predict(features)[0]
        
        # Ensure non-negative price
        prediction = max(0, prediction)
        
        # Format response
        response = {
            'success': True,
            'predicted_price': round(prediction, 2),
            'formatted_price': f"PKR {prediction:,.0f}",
            'features_used': {
                'area': area,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'stories': stories,
                'parking': parking,
                'mainroad': mainroad,
                'guestroom': guestroom,
                'basement': basement,
                'hotwaterheating': hotwaterheating,
                'airconditioning': airconditioning,
                'prefarea': prefarea,
                'furnishingstatus': furnishingstatus
            }
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 400

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)