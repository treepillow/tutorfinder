import os
import math
import functools
import requests
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

JWT_SECRET            = os.environ.get('JWT_SECRET', 'esd-jwt-secret-2024')
MATCH_SERVICE_URL     = os.environ.get('MATCH_SERVICE_URL', 'http://match-service:5002')
AVAILABILITY_SERVICE_URL = os.environ.get('AVAILABILITY_SERVICE_URL', 'http://availability-service:5003')
DB_SCHEMA             = os.environ.get('DB_SCHEMA', 'public')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://localhost/tutorfinder')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'options': f'-csearch_path={DB_SCHEMA}'}
}

db = SQLAlchemy(app)


class Profile(db.Model):
    __tablename__ = 'profiles'

    user_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone         = db.Column(db.String(20), nullable=False)
    role          = db.Column(db.Enum('Tutor', 'Student', native_enum=False), nullable=False)
    subject       = db.Column(db.String(100))
    price_rate    = db.Column(db.Numeric(10, 2))
    latitude      = db.Column(db.Float)
    longitude     = db.Column(db.Float)
    bio           = db.Column(db.Text)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_public_dict(self):
        return {
            'user_id':    self.user_id,
            'name':       self.name,
            'role':       self.role,
            'subject':    self.subject,
            'price_rate': float(self.price_rate) if self.price_rate is not None else None,
            'latitude':   self.latitude,
            'longitude':  self.longitude,
            'bio':        self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def to_full_dict(self):
        d = self.to_public_dict()
        d['email'] = self.email
        d['phone'] = self.phone
        return d

    def to_internal_dict(self):
        return {
            'user_id': self.user_id,
            'name':    self.name,
            'phone':   self.phone,
            'role':    self.role,
        }


with app.app_context():
    from sqlalchemy import text
    with db.engine.connect() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
        conn.commit()
    db.create_all()


def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or malformed'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.current_user_id = payload['user_id']
            request.current_role    = payload['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'profile-service'}), 200


@app.route('/profile/register', methods=['POST'])
def register():
    data = request.get_json(force=True) or {}
    for field in ['name', 'email', 'password', 'phone', 'role']:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    if data['role'] not in ('Tutor', 'Student'):
        return jsonify({'error': "role must be 'Tutor' or 'Student'"}), 400
    if Profile.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = bcrypt.hashpw(
        data['password'].encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')

    profile = Profile(
        name=data['name'], email=data['email'],
        password_hash=password_hash, phone=data['phone'],
        role=data['role'], subject=data.get('subject'),
        price_rate=data.get('price_rate'),
        latitude=data.get('latitude'), longitude=data.get('longitude'),
        bio=data.get('bio', '')
    )
    db.session.add(profile)
    db.session.commit()
    return jsonify({'message': 'Profile created', 'user_id': profile.user_id}), 201


@app.route('/profile/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email and password are required'}), 400

    profile = Profile.query.filter_by(email=data['email']).first()
    if not profile or not bcrypt.checkpw(
            data['password'].encode('utf-8'), profile.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = jwt.encode(
        {'user_id': profile.user_id, 'role': profile.role,
         'exp': datetime.now(tz=timezone.utc) + timedelta(hours=24)},
        JWT_SECRET, algorithm='HS256'
    )
    return jsonify({
        'token': token, 'user_id': profile.user_id,
        'role': profile.role, 'name': profile.name
    }), 200


@app.route('/profile/<int:user_id>', methods=['GET'])
@token_required
def get_profile(user_id):
    profile = Profile.query.get(user_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    if request.current_user_id == user_id:
        return jsonify(profile.to_full_dict()), 200

    is_matched = False
    try:
        resp = requests.get(
            f'{MATCH_SERVICE_URL}/match/status',
            params={'userA': request.current_user_id, 'userB': user_id},
            timeout=5)
        if resp.status_code == 200:
            is_matched = resp.json().get('matched', False)
    except Exception:
        pass

    return jsonify(profile.to_full_dict() if is_matched else profile.to_public_dict()), 200


@app.route('/profile/internal/<int:user_id>', methods=['GET'])
def get_profile_internal(user_id):
    """Internal endpoint for service-to-service calls. No auth required."""
    profile = Profile.query.get(user_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify(profile.to_internal_dict()), 200


@app.route('/profile/<int:user_id>', methods=['PUT'])
@token_required
def update_profile(user_id):
    if request.current_user_id != user_id:
        return jsonify({'error': 'Forbidden: cannot update another user profile'}), 403
    profile = Profile.query.get(user_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    data = request.get_json(force=True) or {}
    for field in ['name', 'phone', 'subject', 'price_rate', 'latitude', 'longitude', 'bio']:
        if field in data:
            setattr(profile, field, data[field])
    db.session.commit()
    return jsonify(profile.to_full_dict()), 200


@app.route('/profile/search', methods=['POST'])
@token_required
def search_profiles():
    data = request.get_json(force=True) or {}
    target_role = 'Tutor' if request.current_role == 'Student' else 'Student'

    query = Profile.query.filter_by(role=target_role)
    if data.get('subject'):
        query = query.filter(Profile.subject.ilike(f"%{data['subject']}%"))
    if data.get('min_price') is not None:
        query = query.filter(Profile.price_rate >= data['min_price'])
    if data.get('max_price') is not None:
        query = query.filter(Profile.price_rate <= data['max_price'])

    requester = Profile.query.get(request.current_user_id)
    radius = data.get('radius', 3)
    results = []

    for p in query.all():
        if (requester and requester.latitude and requester.longitude
                and p.latitude and p.longitude):
            if haversine(requester.latitude, requester.longitude,
                         p.latitude, p.longitude) > radius:
                continue

        profile_data = p.to_public_dict()
        try:
            avail = requests.get(
                f'{AVAILABILITY_SERVICE_URL}/availability/{p.user_id}', timeout=5)
            profile_data['availability'] = avail.json().get('availability', []) \
                if avail.status_code == 200 else []
        except Exception:
            profile_data['availability'] = []
        results.append(profile_data)

    return jsonify({'profiles': results, 'count': len(results)}), 200


@app.route('/profile/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    if not token:
        return jsonify({'valid': False, 'error': 'Token required'}), 400
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return jsonify({'valid': True, 'user_id': payload['user_id'],
                        'role': payload.get('role')}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'valid': False, 'error': 'Token expired'}), 200
    except jwt.InvalidTokenError:
        return jsonify({'valid': False, 'error': 'Invalid token'}), 200


if __name__ == '__main__':
    with app.app_context():
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
            conn.commit()
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)), debug=False)
