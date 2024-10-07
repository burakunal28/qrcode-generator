from flask import Flask, request, send_file, render_template
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import GappedSquareModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image
import io
import re
import os

# Set up template and static directories
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    # Extract data from request
    data = request.json
    url_data = data.get('url', '')
    qr_color = data.get('color', '#000000')
    output_name = data.get('outputName', 'qr_code')
    box_size = int(data.get('boxSize', 10))
    border_size = int(data.get('borderSize', 4))
    output_size = int(data.get('outputSize', 300))

    # Validate and sanitize the output name
    output_name = re.sub(r'[^\w_. -]', '', output_name)
    output_name = output_name[:50]

    # Create QR code instance
    qr = qrcode.QRCode(
        version=None, 
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=box_size, 
        border=border_size,
    )

    qr.add_data(url_data)
    qr.make(fit=True)

    # Convert color value to RGB
    rgb_color = tuple(int(qr_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    # Generate QR code image
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=GappedSquareModuleDrawer(),
        color_mask=SolidFillColorMask(back_color=(255, 255, 255, 0), front_color=rgb_color + (255,))
    )

    img = img.convert("RGBA")
    
    # Resize the image to the specified output size
    img = img.resize((output_size, output_size), Image.LANCZOS)
    
    # Save image to BytesIO object
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    # Send the image file as a response
    return send_file(img_io, mimetype='image/png', as_attachment=True, download_name=f"{output_name}.png")

if __name__ == '__main__':
    app.run(debug=True)