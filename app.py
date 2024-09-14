from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_cors import CORS

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
        return jsonify({'error': str(e)}), 400  # Return detailed error information

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

# Get Monthly Report
@app.route('/expenses/monthly', methods=['GET'])
@jwt_required()
def monthly_report():
    user_id = get_jwt_identity()
    current_month = datetime.now().month
    expenses = Expense.query.filter(db.extract('month', Expense.date) == current_month, Expense.user_id == user_id).all()
    total_spending = sum([expense.amount for expense in expenses])
    return jsonify({'total_spending': total_spending})

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
