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
    const textInput = document.getElementById('textInput');

    // Default values
    const defaultValues = {
        url: '',
        color: '#000000',
        outputName: '',
        boxSize: 10,
        borderSize: 4,
        outputSize: 300,
        text: ''
    };

    // Initialize button states
    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    cleanBtn.disabled = true;

    // URL validation regex
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    // Add event listeners for form validation
    const inputElements = [urlInput, colorInput, outputNameInput, boxSizeInput, borderSizeInput, outputSizeInput, textInput];
    inputElements.forEach(input => {
        input.addEventListener('input', debouncedValidation);
    });

    function validateForm() {
        const url = urlInput.value.trim();
        const outputName = outputNameInput.value.trim();
        const boxSize = Number.parseInt(boxSizeInput.value, 10);
        const borderSize = Number.parseInt(borderSizeInput.value, 10);
        const outputSize = Number.parseInt(outputSizeInput.value, 10);
        const text = textInput.value.trim();

        let isValid = true;
        let urlErrors = [];
        let fileNameErrors = [];

        if (!url || !urlRegex.test(url)) {
            isValid = false;
            urlErrors.push('Please enter a valid URL (e.g., https://example.com)');
        }

        if (!outputName) {
            isValid = false;
            fileNameErrors.push('Please enter a file name');
        }
        if (Number.isNaN(boxSize) || boxSize < 1 || boxSize > 50) {
            isValid = false;
            fileNameErrors.push('Box size must be between 1 and 50');
        }
        if (Number.isNaN(borderSize) || borderSize < 0 || borderSize > 20) {
            isValid = false;
            fileNameErrors.push('Border size must be between 0 and 20');
        }
        if (Number.isNaN(outputSize) || outputSize < 100 || outputSize > 1000) {
            isValid = false;
            fileNameErrors.push('Output size must be between 100 and 1000');
        }
        if (text.length > 50) {
            isValid = false;
            fileNameErrors.push('Text must be 50 characters or fewer');
        }

        if (urlErrors.length > 0) {
            showAlert('danger', urlErrors.join('<br>'), 0, 'urlAlertContainer');
        } else {
            clearAlert('urlAlertContainer');
        }

        if (fileNameErrors.length > 0) {
            showAlert('danger', fileNameErrors.join('<br>'), 0, 'fileNameAlertContainer');
        } else {
            clearAlert('fileNameAlertContainer');
        }

        generateBtn.disabled = !isValid;
        if (isValid) {
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        const hasModifications = (
            url !== '' ||
            outputName !== '' ||
            colorInput.value !== '#000000' ||
            boxSize !== 10 ||
            borderSize !== 4 ||
            outputSize !== 300 ||
            text !== ''
        );
        cleanBtn.disabled = !hasModifications;
    }

    function showAlert(type, message, duration = 5000, containerId) {
        clearAlert(containerId);
        const container = document.getElementById(containerId);
        if (container) {
            const alertElement = document.createElement('div');
            const bgColor = type === 'danger' ? 'bg-red-100 text-red-800 border-red-400' : 
                            type === 'success' ? 'bg-green-100 text-green-800 border-green-400' :
                            'bg-blue-100 text-blue-800 border-blue-400';
            
            alertElement.className = `${bgColor} border-l-4 p-4 mb-4 rounded-md transition-all duration-500 ease-in-out transform opacity-0 scale-95`;
            alertElement.innerHTML = `
                <div class="flex items-center">
                    <div class="flex-grow">${message}</div>
                    <button class="ml-4 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            container.insertBefore(alertElement, container.firstChild);

            requestAnimationFrame(() => {
                alertElement.classList.remove('opacity-0', 'scale-95');
                alertElement.classList.add('opacity-100', 'scale-100');
            });

            if (duration > 0) {
                setTimeout(() => {
                    if (alertElement.parentElement) {
                        alertElement.classList.add('opacity-0', 'scale-95');
                        setTimeout(() => alertElement.remove(), 500);
                    }
                }, duration);
            }
        }
    }

    function clearAlert(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    }

    // Generate QR code
    generateBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        const color = colorInput.value;
        const outputName = outputNameInput.value.trim();
        const boxSize = boxSizeInput.value;
        const borderSize = borderSizeInput.value;
        const outputSize = outputSizeInput.value;
        const text = textInput.value.trim();

        // Disable the generate button and show spinner
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, color, outputName, boxSize, borderSize, outputSize, text }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const imgUrl = URL.createObjectURL(blob);
                qrCodeImage.src = imgUrl;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('bg-blue-100', 'hover:bg-blue-200', 'text-blue-800');
                downloadBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
                showAlert('success', 'QR code generated successfully!', 5000, 'alertContainer');
            } else {
                showAlert('danger', 'Failed to generate QR code', 5000, 'alertContainer');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('danger', 'An error occurred while generating the QR code', 5000, 'alertContainer');
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
        urlInput.value = defaultValues.url;
        colorInput.value = defaultValues.color;
        outputNameInput.value = defaultValues.outputName;
        boxSizeInput.value = defaultValues.boxSize;
        borderSizeInput.value = defaultValues.borderSize;
        outputSizeInput.value = defaultValues.outputSize;
        textInput.value = defaultValues.text;
        document.getElementById('boxSizeValue').textContent = defaultValues.boxSize;
        document.getElementById('borderSizeValue').textContent = defaultValues.borderSize;
        document.getElementById('outputSizeValue').textContent = `${defaultValues.outputSize}px`;

        // Reset buttons
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        downloadBtn.disabled = true;
        downloadBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'text-white');
        downloadBtn.classList.add('bg-blue-100', 'hover:bg-blue-200', 'text-blue-800');

        // Reset QR code image to default
        qrCodeImage.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23f8f9fa'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23757575' font-size='20' font-family='Roboto, sans-serif'>Your QR Code</text></svg>";

        clearAlert('urlAlertContainer');
        clearAlert('fileNameAlertContainer');
        showAlert('info', 'Form has been reset.', 5000, 'alertContainer');

        // Disable the Clean button after resetting
        cleanBtn.disabled = true;
    });

    // Center QR code image
    const qrCodeContainer = document.getElementById('qrCodeImage').parentElement;
    qrCodeContainer.style.display = 'flex';
    qrCodeContainer.style.justifyContent = 'center';
    qrCodeContainer.style.alignItems = 'center';

    // Add debounced validation to prevent excessive alerts
    let validationTimeout;
    function debouncedValidation() {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validateForm, 300);
    }

    // Update display values for range inputs
    boxSizeInput.addEventListener('input', () => {
        document.getElementById('boxSizeValue').textContent = boxSizeInput.value;
    });
    borderSizeInput.addEventListener('input', () => {
        document.getElementById('borderSizeValue').textContent = borderSizeInput.value;
    });
    outputSizeInput.addEventListener('input', () => {
        document.getElementById('outputSizeValue').textContent = `${outputSizeInput.value}px`;
    });

    // Validate form on page load
    validateForm();
});