// ====================================
// HOUSE PRICE PREDICTOR - JAVASCRIPT
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const resultsContainer = document.getElementById('resultsContainer');
    const infoSection = document.getElementById('infoSection');

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        error.classList.add('hidden');
        error.textContent = '';
        
        // Validate form
        if (!validateForm()) {
            showError('Please fill all required fields correctly');
            return;
        }
        
        // Show loading
        loading.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        
        // Get form data
        const formData = getFormData();
        
        // Send request to backend
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            loading.classList.add('hidden');
            
            if (data.success) {
                displayResults(data);
            } else {
                showError(data.error || 'An error occurred during prediction');
            }
        })
        .catch(err => {
            loading.classList.add('hidden');
            console.error('Error:', err);
            showError('Failed to connect to server. Make sure Flask is running on http://localhost:5000');
        });
    });

    // Form reset
    form.addEventListener('reset', function() {
        resultsContainer.classList.add('hidden');
        infoSection.classList.remove('hidden');
        error.classList.add('hidden');
    });

    /**
     * Validate form inputs
     */
    function validateForm() {
        const area = document.getElementById('area').value;
        const bedrooms = document.getElementById('bedrooms').value;
        const bathrooms = document.getElementById('bathrooms').value;
        const stories = document.getElementById('stories').value;
        const parking = document.getElementById('parking').value;
        const furnishing = document.getElementById('furnishingstatus').value;
        
        // Check required fields
        if (!area || !bedrooms || !bathrooms || !stories || parking === '' || !furnishing) {
            return false;
        }
        
        // Validate area range
        const areaNum = parseFloat(area);
        if (areaNum < 1650 || areaNum > 16200) {
            showError('Area must be between 1650 and 16200 sq ft');
            return false;
        }
        
        return true;
    }

    /**
     * Get form data
     */
    function getFormData() {
        return {
            area: document.getElementById('area').value,
            bedrooms: document.getElementById('bedrooms').value,
            bathrooms: document.getElementById('bathrooms').value,
            stories: document.getElementById('stories').value,
            parking: document.getElementById('parking').value,
            mainroad: document.getElementById('mainroad').checked ? 'yes' : 'no',
            guestroom: document.getElementById('guestroom').checked ? 'yes' : 'no',
            basement: document.getElementById('basement').checked ? 'yes' : 'no',
            hotwaterheating: document.getElementById('hotwaterheating').checked ? 'yes' : 'no',
            airconditioning: document.getElementById('airconditioning').checked ? 'yes' : 'no',
            prefarea: document.getElementById('prefarea').checked ? 'yes' : 'no',
            furnishingstatus: document.getElementById('furnishingstatus').value
        };
    }

    /**
     * Display prediction results
     */
    function displayResults(data) {
        // Hide info section
        infoSection.classList.add('hidden');
        
        // Display price
        document.getElementById('predictedPrice').textContent = data.formatted_price;
        
        // Display property details
        const features = data.features_used;
        document.getElementById('detailArea').textContent = `${features.area} sq ft`;
        document.getElementById('detailBedrooms').textContent = `${features.bedrooms} ${features.bedrooms > 1 ? 'bedrooms' : 'bedroom'}`;
        document.getElementById('detailBathrooms').textContent = `${features.bathrooms} ${features.bathrooms > 1 ? 'bathrooms' : 'bathroom'}`;
        document.getElementById('detailStories').textContent = `${features.stories} ${features.stories > 1 ? 'stories' : 'story'}`;
        document.getElementById('detailParking').textContent = `${features.parking} ${features.parking > 1 ? 'spaces' : 'space'}`;
        document.getElementById('detailFurnishing').textContent = capitalizeWords(features.furnishingstatus);
        
        // Display special features
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';
        
        const specialFeatures = [];
        if (features.mainroad) specialFeatures.push('Main Road Access');
        if (features.guestroom) specialFeatures.push('Guest Room');
        if (features.basement) specialFeatures.push('Basement');
        if (features.hotwaterheating) specialFeatures.push('Hot Water Heating');
        if (features.airconditioning) specialFeatures.push('Air Conditioning');
        if (features.prefarea) specialFeatures.push('Preferred Area');
        
        if (specialFeatures.length > 0) {
            specialFeatures.forEach(feature => {
                const tag = document.createElement('span');
                tag.className = 'feature-tag';
                tag.textContent = '✓ ' + feature;
                featuresList.appendChild(tag);
            });
        } else {
            featuresList.innerHTML = '<p style="color: #757575;">No special features selected</p>';
        }
        
        // Show results
        resultsContainer.classList.remove('hidden');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Show error message
     */
    function showError(message) {
        error.textContent = '❌ ' + message;
        error.classList.remove('hidden');
        loading.classList.add('hidden');
    }

    /**
     * Capitalize words
     */
    function capitalizeWords(str) {
        return str.split('-').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Input validation on change
    document.getElementById('area').addEventListener('change', function() {
        const val = parseFloat(this.value);
        if (val < 1650 || val > 16200) {
            showError('Area must be between 1650 and 16200 sq ft');
            this.value = '';
        }
    });

    // Show info section on page load
    infoSection.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
});