import os
import json
import threading
import pika
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import UniqueConstraint

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

RABBITMQ_URL        = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
PROFILE_SERVICE_URL = os.environ.get('PROFILE_SERVICE_URL', 'http://profile-service:5001')
DB_SCHEMA           = os.environ.get('DB_SCHEMA', 'public')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://localhost/tutorfinder')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'options': f'-csearch_path={DB_SCHEMA}'}
}

db = SQLAlchemy(app)


class Swipe(db.Model):
    __tablename__ = 'swipes'
    __table_args__ = (UniqueConstraint('swiper_id', 'swiped_id', name='uq_swipe'),)

    swipe_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    swiper_id  = db.Column(db.Integer, nullable=False)
    swiped_id  = db.Column(db.Integer, nullable=False)
    is_like    = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Match(db.Model):
    __tablename__ = 'matches'

    match_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_a_id  = db.Column(db.Integer, nullable=False)
    user_b_id  = db.Column(db.Integer, nullable=False)
    status     = db.Column(db.Enum('Active', 'Archived', native_enum=False), default='Active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


with app.app_context():
    from sqlalchemy import text
    with db.engine.connect() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
        conn.commit()
    db.create_all()


def publish_message(routing_key, body):
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.exchange_declare(exchange='esd_exchange', exchange_type='topic', durable=True)
        ch.basic_publish(
            exchange='esd_exchange', routing_key=routing_key,
            body=json.dumps(body),
            properties=pika.BasicProperties(delivery_mode=2))
        conn.close()
    except Exception as e:
        print(f'RabbitMQ publish error: {e}')


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'match-service'}), 200


@app.route('/match/swipe', methods=['POST'])
def swipe():
    data = request.get_json(force=True) or {}
    for field in ['swiper_id', 'swiped_id', 'is_like']:
        if data.get(field) is None:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    swiper_id = int(data['swiper_id'])
    swiped_id = int(data['swiped_id'])
    is_like   = bool(data['is_like'])

    if Swipe.query.filter_by(swiper_id=swiper_id, swiped_id=swiped_id).first():
        return jsonify({'error': 'Already swiped on this user'}), 409

    db.session.add(Swipe(swiper_id=swiper_id, swiped_id=swiped_id, is_like=is_like))
    db.session.commit()

    if not is_like:
        return jsonify({'matched': False, 'message': 'Pass recorded'}), 200

    reverse = Swipe.query.filter_by(
        swiper_id=swiped_id, swiped_id=swiper_id, is_like=True).first()
    if not reverse:
        return jsonify({'matched': False, 'message': 'Like saved'}), 200

    new_match = Match(user_a_id=swiper_id, user_b_id=swiped_id)
    db.session.add(new_match)
    db.session.commit()

    match_id = new_match.match_id

    # Fetch profiles and publish notification in background so the response is instant
    def notify(match_id, swiper_id, swiped_id):
        user_a_name = user_a_phone = user_b_name = user_b_phone = None
        try:
            ra = requests.get(f'{PROFILE_SERVICE_URL}/profile/internal/{swiper_id}', timeout=5)
            if ra.status_code == 200:
                user_a_name  = ra.json().get('name')
                user_a_phone = ra.json().get('phone')
        except Exception:
            pass
        try:
            rb = requests.get(f'{PROFILE_SERVICE_URL}/profile/internal/{swiped_id}', timeout=5)
            if rb.status_code == 200:
                user_b_name  = rb.json().get('name')
                user_b_phone = rb.json().get('phone')
        except Exception:
            pass
        publish_message('match.created', {
            'match_id':     match_id,
            'user_a_id':    swiper_id,   'user_b_id':    swiped_id,
            'user_a_name':  user_a_name, 'user_b_name':  user_b_name,
            'user_a_phone': user_a_phone,'user_b_phone': user_b_phone,
        })

    threading.Thread(target=notify, args=(match_id, swiper_id, swiped_id), daemon=True).start()

    return jsonify({'matched': True, 'match_id': match_id}), 200


@app.route('/match/status', methods=['GET'])
def match_status():
    user_a = request.args.get('userA', type=int)
    user_b = request.args.get('userB', type=int)
    if user_a is None or user_b is None:
        return jsonify({'error': 'userA and userB are required'}), 400

    match = Match.query.filter(
        ((Match.user_a_id == user_a) & (Match.user_b_id == user_b)) |
        ((Match.user_a_id == user_b) & (Match.user_b_id == user_a)),
        Match.status == 'Active'
    ).first()

    return jsonify({'matched': match is not None}), 200


@app.route('/match/matches/<int:user_id>', methods=['GET'])
def get_matches(user_id):
    matches = Match.query.filter(
        ((Match.user_a_id == user_id) | (Match.user_b_id == user_id)),
        Match.status == 'Active'
    ).all()

    return jsonify([{
        'match_id':      m.match_id,
        'other_user_id': m.user_b_id if m.user_a_id == user_id else m.user_a_id,
        'status':        m.status,
        'created_at':    m.created_at.isoformat() if m.created_at else None,
    } for m in matches]), 200


@app.route('/match/swiped/<int:user_id>', methods=['GET'])
def get_swiped(user_id):
    rows = Swipe.query.filter_by(swiper_id=user_id).all()
    return jsonify({'swiped_ids': [r.swiped_id for r in rows]}), 200


@app.route('/match/<int:match_id>/archive', methods=['PUT'])
def archive_match(match_id):
    match = db.session.get(Match, match_id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    match.status = 'Archived'
    db.session.commit()
    return jsonify({'message': 'Match archived', 'match_id': match_id}), 200


if __name__ == '__main__':
    with app.app_context():
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
            conn.commit()
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5002)), debug=False)
