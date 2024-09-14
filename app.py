from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_cors import CORS
import matplotlib.pyplot as plt
import io
import google.generativeai as genai  # Import the Gemini API
import os

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'  # You can switch to MySQL/Postgres
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Use a secure random key

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Initialize Gemini API (ensure the API key is set in the environment)
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("Gemini API key not set in environment variables")
genai.configure(api_key=api_key)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

# Create database tables
@app.before_request
def create_tables():
    db.create_all()

# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token})

# Add Expense
@app.route('/expense', methods=['POST'])
@jwt_required()
def log_expense():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        new_expense = Expense(
            user_id=user_id,
            category=data['category'],
            amount=data['amount'],
            date=datetime.strptime(data['date'], '%Y-%m-%d')
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({'message': 'Expense logged successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Get All Expenses
@app.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    expenses_data = [{
        'id': expense.id,
        'category': expense.category,
        'amount': expense.amount,
        'date': expense.date.strftime('%Y-%m-%d')
    } for expense in expenses]
    return jsonify(expenses_data)

# Generate Pie Chart
@app.route('/pie_chart', methods=['POST'])
@jwt_required()
def pie_chart():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()

    # Get categories and amounts for the pie chart
    categories = list(set([expense.category for expense in expenses]))
    amounts = [sum([expense.amount for expense in expenses if expense.category == category]) for category in categories]

    # Create a pie chart with Matplotlib
    plt.figure(figsize=(6,6))
    plt.pie(amounts, labels=categories, autopct='%1.1f%%')
    plt.title("Spending by Category")

    # Save the pie chart to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    return send_file(img, mimetype='image/png')

# Get Gemini Suggestions
@app.route('/gemini_advice', methods=['POST'])
@jwt_required()
def gemini_advice():
    try:
        # Get expenses from the request body
        data = request.get_json()
        expenses = data.get('expenses', [])

        # Format the expenses into a prompt for the Gemini API
        expenses_text = "\n".join([f"{expense['category']}: ${expense['amount']}" for expense in expenses])
        prompt = f"Here are my monthly expenses:\n{expenses_text}\nPlease suggest how I can improve my savings."

        # Call the Gemini API to generate advice
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        # Return the generated advice
        return jsonify({'advice': response.text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
