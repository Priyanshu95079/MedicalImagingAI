// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const analysisSection = document.getElementById('analysisSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');

// API Configuration
const API_ENDPOINT = process.env.API_ENDPOINT || 'YOUR_API_GATEWAY_ENDPOINT';

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-color)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// File Handling
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.hidden = false;
        analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    imagePreview.src = '';
    previewContainer.hidden = true;
    analysisSection.hidden = true;
    resultsContainer.hidden = true;
}

// API Integration
async function analyzeImage(imageData) {
    try {
        analysisSection.hidden = false;
        loadingIndicator.hidden = false;
        resultsContainer.hidden = true;

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData.split(',')[1] // Remove data URL prefix
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        displayResults(data.analysis);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze image. Please try again.');
    } finally {
        loadingIndicator.hidden = true;
        resultsContainer.hidden = false;
    }
}

// Results Display
function displayResults(analysis) {
    // Split the analysis into sections based on the prompt structure
    const sections = analysis.split('\n\n');
    
    // Update the results
    document.getElementById('observations').textContent = sections[0] || 'No observations available';
    document.getElementById('concerns').textContent = sections[1] || 'No concerns identified';
    document.getElementById('recommendations').textContent = sections[2] || 'No recommendations provided';
} 