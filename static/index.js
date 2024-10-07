document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const colorInput = document.getElementById('colorInput');
    const outputNameInput = document.getElementById('outputNameInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const boxSizeInput = document.getElementById('boxSizeInput');
    const borderSizeInput = document.getElementById('borderSizeInput');
    const outputSizeInput = document.getElementById('outputSizeInput');
    const alertContainer = document.getElementById('alertContainer');
    const cleanBtn = document.getElementById('cleanBtn');

    // Initialize button states
    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    cleanBtn.disabled = true;

    // Add event listeners for form validation
    for (const input of [urlInput, colorInput, outputNameInput, boxSizeInput, borderSizeInput, outputSizeInput]) {
        input.addEventListener('input', validateForm);
    }

    function validateForm() {
        const url = urlInput.value.trim();
        const outputName = outputNameInput.value.trim();
        const boxSize = Number.parseInt(boxSizeInput.value, 10);
        const borderSize = Number.parseInt(borderSizeInput.value, 10);
        const outputSize = Number.parseInt(outputSizeInput.value, 10);

        let isValid = true;
        let errorMessage = '';

        // Validate input fields
        if (!url) {
            isValid = false;
            errorMessage = 'Please enter a valid URL.';
        } else if (!outputName) {
            isValid = false;
            errorMessage = 'Please enter an output file name.';
        } else if (Number.isNaN(boxSize) || boxSize < 1 || boxSize > 50) {
            isValid = false;
            errorMessage = 'Box size must be between 1 and 50.';
        } else if (Number.isNaN(borderSize) || borderSize < 0 || borderSize > 20) {
            isValid = false;
            errorMessage = 'Border size must be between 0 and 20.';
        } else if (Number.isNaN(outputSize) || outputSize < 100 || outputSize > 1000) {
            isValid = false;
            errorMessage = 'Output size must be between 100 and 1000.';
        }

        generateBtn.disabled = !isValid;

        // Show or clear alert based on validation
        if (!isValid && !alertContainer.querySelector('.alert')) {
            showAlert('danger', errorMessage);
        } else if (isValid) {
            clearAlert();
        }

        // Enable/disable the Clean button based on any input
        const hasInput = url || outputName || 
                         colorInput.value !== '#000000' || 
                         boxSize !== 10 || 
                         borderSize !== 4 || 
                         outputSize !== 300;
        cleanBtn.disabled = !hasInput;
    }

    function showAlert(type, message, duration = 5000) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade`;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alertElement);

        // Force a reflow to ensure the transition works
        alertElement.getBoundingClientRect();

        // Add the 'show' class to trigger the fade-in effect
        alertElement.classList.add('show');

        // Set a timeout to remove the alert
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 300); // Wait for the fade-out transition to complete
        }, duration);
    }

    function clearAlert() {
        while (alertContainer.firstChild) {
            alertContainer.removeChild(alertContainer.firstChild);
        }
    }

    // Generate QR code
    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled) return;

        const url = urlInput.value.trim();
        const color = colorInput.value;
        const outputName = outputNameInput.value.trim();
        const boxSize = boxSizeInput.value;
        const borderSize = borderSizeInput.value;
        const outputSize = outputSizeInput.value;

        if (!url) {
            showAlert('danger', 'Please enter a URL');
            return;
        }

        // Disable the generate button and show spinner
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, color, outputName, boxSize, borderSize, outputSize }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const imgUrl = URL.createObjectURL(blob);
                qrCodeImage.src = imgUrl;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('btn-outline-success');
                downloadBtn.classList.add('btn-success');
                showAlert('success', 'QR code generated successfully!');
            } else {
                showAlert('danger', 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('danger', 'An error occurred while generating the QR code');
        } finally {
            // Re-enable the generate button and reset text
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate';
        }
    });

    // Download QR code
    downloadBtn.addEventListener('click', downloadQRCode);

    function downloadQRCode() {
        const outputName = outputNameInput.value.trim() || 'qr_code';
        const link = document.createElement('a');
        link.download = `${outputName}.png`;
        link.href = qrCodeImage.src;
        link.click();
    }

    // Reset form
    cleanBtn.addEventListener('click', () => {
        // Reset all input fields to their default values
        urlInput.value = '';
        colorInput.value = '#000000';
        outputNameInput.value = '';
        boxSizeInput.value = 10;
        borderSizeInput.value = 4;
        outputSizeInput.value = 300;

        // Reset buttons
        generateBtn.disabled = true;
        downloadBtn.disabled = true;

        // Reset QR code image to default
        qrCodeImage.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23f8f9fa'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23757575' font-size='20' font-family='Roboto, sans-serif'>Your QR Code</text></svg>";

        clearAlert();
        showAlert('info', 'Form has been reset.');

        // Disable the Clean button after resetting
        cleanBtn.disabled = true;
    });

    // Center QR code image
    const qrCodeContainer = document.getElementById('qrCodeImage').parentElement;
    qrCodeContainer.style.display = 'flex';
    qrCodeContainer.style.justifyContent = 'center';
    qrCodeContainer.style.alignItems = 'center';
});