# QR Code Generator

This is a web application that allows users to generate customized QR codes quickly and easily. It's built with Flask on the backend and uses JavaScript for dynamic frontend interactions.

## Features

- Generate QR codes from any URL
- Customize QR code color
- Adjust box size, border size, and output size
- Download generated QR codes as PNG files
- Responsive design for desktop and mobile use

## Live Demo

You can try out the live application [here](https://qrcode-generator-burakunal28.vercel.app).

## Developer

This project was developed by Burak Ünal. You can find more of his work on his GitHub profile: [https://github.com/burakunal28](https://github.com/burakunal28)

## Technology Stack

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- Styling: Bootstrap 5
- Deployment: Vercel

## Local Development

To run this project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/burakunal28/qrcode-generator.git
   cd qrcode-generator
   ```

2. Install the required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:

   ```bash
   python api/index.py
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Deployment

This project is configured for easy deployment on Vercel. The `vercel.json` file in the root directory specifies the build configuration.

To deploy:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root directory
3. Follow the prompts to deploy your application

## Project Structure

- `api/index.py`: Main Flask application
- `static/index.js`: Frontend JavaScript for dynamic interactions
- `static/index.css`: Custom CSS styles
- `templates/index.html`: HTML template for the web interface
- `requirements.txt`: Python dependencies
- `vercel.json`: Vercel deployment configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
