import os
import sys

# Add the project directory to sys.path
# This ensures that your 'church_system' module can be found
project_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_path)

# You can also add your virtualenv's site-packages here if needed, 
# although cPanel's 'Setup Python App' usually handles this.
# Example if manual:
# sys.path.insert(0, os.path.join(project_path, 'venv/lib/python3.x/site-packages'))

# Import the Django WSGI application
from church_system.wsgi import application
