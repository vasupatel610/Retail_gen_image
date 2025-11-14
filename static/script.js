// Global variables
let selectedFile = null;
let currentImageUrl = null;
let currentFilename = null;
let generationHistory = [];

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeImage = document.getElementById('removeImage');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const gallerySection = document.getElementById('gallerySection');
const galleryGrid = document.getElementById('galleryGrid');
const progressFill = document.getElementById('progressFill');

// API base URL
// const API_BASE_URL = window.location.origin;
const API_BASE_URL = "http://localhost:8010";


// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadGenerationHistory();
    updateGenerateButton();
});

// Initialize all event listeners
function initializeEventListeners() {
    // File input change
    imageInput.addEventListener('change', handleFileSelect);
    
    // Upload area drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // Remove image
    removeImage.addEventListener('click', clearImageSelection);
    
    // Prompt input
    promptInput.addEventListener('input', updateGenerateButton);
    
    // Generate button
    generateBtn.addEventListener('click', generateImage);
    
    // Download button
    downloadBtn.addEventListener('click', downloadImage);
    
    // Delete button
    deleteBtn.addEventListener('click', deleteImage);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        validateAndPreviewFile(files[0]);
    }
}

// Validate and preview file
function validateAndPreviewFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (JPG, PNG, or WEBP).');
        return;
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showError('File size must be less than 10MB.');
        return;
    }
    
    selectedFile = file;
    previewImage(file);
    updateGenerateButton();
}

// Preview selected image
function previewImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Clear image selection
function clearImageSelection() {
    selectedFile = null;
    imageInput.value = '';
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    updateGenerateButton();
}

// Update generate button state
function updateGenerateButton() {
    const hasFile = selectedFile !== null;
    const hasPrompt = promptInput.value.trim().length > 0;
    
    generateBtn.disabled = !(hasFile && hasPrompt);
}

// Add suggestion to prompt
function addSuggestion(suggestion) {
    const currentPrompt = promptInput.value.trim();
    if (currentPrompt) {
        promptInput.value = currentPrompt + ' ' + suggestion;
    } else {
        promptInput.value = suggestion;
    }
    updateGenerateButton();
}

// Generate image
async function generateImage() {
    if (!selectedFile || !promptInput.value.trim()) {
        showError('Please upload an image and enter a prompt');
        return;
    }

    try {
        showLoadingState();
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', promptInput.value.trim());
        

        const response = await fetch(`${API_BASE_URL}/api/v1/generate-image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate image');
        }
        
        const result = await response.json();
        
        if (result.success) {
            currentImageUrl = result.image_url;
            currentFilename = result.filename;
            
            // Add to history
            const historyItem = {
                filename: result.filename,
                imageUrl: result.image_url,
                prompt: promptInput.value.trim(),
                originalImage: selectedFile.name,
                timestamp: new Date().toISOString()
            };
            
            generationHistory.unshift(historyItem);
            saveGenerationHistory();
            
            showResults(result.image_url);
            updateGallery();
        } else {
            throw new Error(result.message || 'Failed to generate image');
        }
        
    } catch (error) {
        console.error('Generation error:', error);
        showError(error.message || 'Failed to generate image. Please try again.');
        hideLoadingState();
    }
}

// Show loading state
function showLoadingState() {
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    generateBtn.disabled = true;
    
    // Animate progress bar
    progressFill.style.width = '0%';
    setTimeout(() => {
        progressFill.style.width = '30%';
    }, 500);
    setTimeout(() => {
        progressFill.style.width = '60%';
    }, 1500);
    setTimeout(() => {
        progressFill.style.width = '90%';
    }, 2500);
}

// Hide loading state
function hideLoadingState() {
    loadingSection.style.display = 'none';
    generateBtn.disabled = false;
    progressFill.style.width = '0%';
}

// Show results
function showResults(imageUrl) {
    hideLoadingState();
    
    resultImage.src = imageUrl;
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Complete progress bar
    progressFill.style.width = '100%';
    setTimeout(() => {
        progressFill.style.width = '0%';
    }, 1000);
}

// Download image
async function downloadImage() {
    if (!currentImageUrl || !currentFilename) {
        showError('No image to download.');
        return;
    }
    
    try {
        const response = await fetch(currentImageUrl);
        if (!response.ok) {
            throw new Error('Failed to download image');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
        
        showSuccess('Image downloaded successfully!');
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download image. Please try again.');
    }
}

// Delete image
async function deleteImage() {
    if (!currentFilename) {
        showError('No image to delete.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/delete/${currentFilename}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to delete image');
        }
        
        // Remove from history
        generationHistory = generationHistory.filter(item => item.filename !== currentFilename);
        saveGenerationHistory();
        
        showSuccess('Image deleted successfully!');
        resetForm();
        updateGallery();
        
    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete image. Please try again.');
    }
}

// Share image
function shareImage() {
    if (!currentImageUrl) {
        showError('No image to share.');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Generated Image',
            text: 'Check out this AI-generated image!',
            url: currentImageUrl
        }).catch(error => {
            console.error('Share error:', error);
            copyToClipboard(currentImageUrl);
        });
    } else {
        copyToClipboard(currentImageUrl);
    }
}

// Copy URL to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('Image URL copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Image URL copied to clipboard!');
    });
}

// Reset form
function resetForm() {
    clearImageSelection();
    promptInput.value = '';
    resultsSection.style.display = 'none';
    currentImageUrl = null;
    currentFilename = null;
    updateGenerateButton();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update gallery
function updateGallery() {
    if (generationHistory.length === 0) {
        gallerySection.style.display = 'none';
        return;
    }
    
    gallerySection.style.display = 'block';
    galleryGrid.innerHTML = '';
    
    // Show last 6 generations
    const recentGenerations = generationHistory.slice(0, 6);
    
    recentGenerations.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryGrid.appendChild(galleryItem);
    });
}

// Create gallery item
function createGalleryItem(item, index) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.style.animationDelay = `${index * 0.1}s`;
    
    galleryItem.innerHTML = `
        <img src="${item.imageUrl}" alt="Generated Image" loading="lazy">
        <div class="gallery-item-info">
            <h4>${truncateText(item.prompt, 60)}</h4>
            <p>${formatDate(item.timestamp)}</p>
        </div>
    `;
    
    galleryItem.addEventListener('click', () => {
        currentImageUrl = item.imageUrl;
        currentFilename = item.filename;
        showResults(item.imageUrl);
    });
    
    return galleryItem;
}

// Load generation history from localStorage
function loadGenerationHistory() {
    try {
        const saved = localStorage.getItem('generationHistory');
        if (saved) {
            generationHistory = JSON.parse(saved);
            updateGallery();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        generationHistory = [];
    }
}

// Save generation history to localStorage
function saveGenerationHistory() {
    try {
        // Keep only last 20 items
        const historyToSave = generationHistory.slice(0, 20);
        localStorage.setItem('generationHistory', JSON.stringify(historyToSave));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// Error handling
function showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeModal('errorModal');
    }, 5000);
}

function showSuccess(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Add slide animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Handle keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Ctrl/Cmd + Enter to generate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (!generateBtn.disabled) {
            generateImage();
        }
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Adjust gallery grid on resize
    updateGallery();
});

// Handle page visibility change to pause/resume animations
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause animations
        document.body.style.animationPlayState = 'paused';
    } else {
        // Page is visible, resume animations
        document.body.style.animationPlayState = 'running';
    }
});

// Performance optimization: Lazy load images in gallery
function observeGalleryImages() {
    const images = document.querySelectorAll('.gallery-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when gallery is updated
const originalUpdateGallery = updateGallery;
updateGallery = function() {
    originalUpdateGallery();
    setTimeout(observeGalleryImages, 100);
};

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Export functions for global access
window.addSuggestion = addSuggestion;
window.shareImage = shareImage;
window.resetForm = resetForm;
window.closeModal = closeModal;
