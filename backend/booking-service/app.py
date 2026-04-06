import os
import json
import ssl
import pika
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

DB_SCHEMA           = os.environ.get('DB_SCHEMA', 'booking_schema')
RABBITMQ_URL        = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
PROFILE_SERVICE_URL = os.environ.get('PROFILE_SERVICE_URL', 'http://profile-service:5001')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://localhost/tutorfinder')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'options': f'-csearch_path={DB_SCHEMA}'}
}

db = SQLAlchemy(app)

VALID_STATUSES = [
    'AwaitingConfirmation', 'AwaitingPayment', 'Confirmed',
    'Completed', 'Cancelled', 'Disputed'
]


class Booking(db.Model):
    __tablename__ = 'bookings'
    __table_args__ = {'schema': DB_SCHEMA}

    booking_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tutor_id        = db.Column(db.Integer, nullable=False)
    tutee_id        = db.Column(db.Integer, nullable=False)
    availability_id = db.Column(db.Integer, nullable=False)
    lesson_date     = db.Column(db.Date, nullable=False)
    start_time      = db.Column(db.Time, nullable=False)
    end_time        = db.Column(db.Time, nullable=False)
    subject         = db.Column(db.String(100), nullable=True)
    level           = db.Column(db.String(100), nullable=True)
    status          = db.Column(
        db.Enum(*VALID_STATUSES, native_enum=False),
        default='AwaitingConfirmation', nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at    = db.Column(db.DateTime, nullable=True)
    completed_at    = db.Column(db.DateTime, nullable=True)
    cancelled_at    = db.Column(db.DateTime, nullable=True)
    disputed_at     = db.Column(db.DateTime, nullable=True)
    disputed_by     = db.Column(db.String(50), nullable=True)
    dispute_reason  = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'booking_id':      self.booking_id,
            'tutor_id':        self.tutor_id,
            'tutee_id':        self.tutee_id,
            'availability_id': self.availability_id,
            'lesson_date':     self.lesson_date.isoformat() if self.lesson_date else None,
            'start_time':      str(self.start_time),
            'end_time':        str(self.end_time),
            'subject':         self.subject,
            'level':           self.level,
            'status':          self.status,
            'created_at':      self.created_at.isoformat() if self.created_at else None,
            'confirmed_at':    self.confirmed_at.isoformat() if self.confirmed_at else None,
            'completed_at':    self.completed_at.isoformat() if self.completed_at else None,
            'cancelled_at':    self.cancelled_at.isoformat() if self.cancelled_at else None,
            'disputed_at':     self.disputed_at.isoformat() if self.disputed_at else None,
            'disputed_by':     self.disputed_by,
            'dispute_reason':  self.dispute_reason,
        }


with app.app_context():
    from sqlalchemy import text
    with db.engine.connect() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
        conn.commit()
    db.create_all()
    
    # Add missing columns if they don't exist
    with db.engine.connect() as conn:
        try:
            conn.execute(text(f'ALTER TABLE {DB_SCHEMA}.bookings ADD COLUMN completed_at TIMESTAMP NULL'))
            conn.commit()
        except:
            pass
        try:
            conn.execute(text(f'ALTER TABLE {DB_SCHEMA}.bookings ADD COLUMN cancelled_at TIMESTAMP NULL'))
            conn.commit()
        except:
            pass
        try:
            conn.execute(text(f'ALTER TABLE {DB_SCHEMA}.bookings ADD COLUMN disputed_at TIMESTAMP NULL'))
            conn.commit()
        except:
            pass
    
    # Backfill timestamps for existing bookings
    with db.engine.connect() as conn:
        try:
            # Backfill cancelled_at for existing cancelled bookings
            conn.execute(text(f'''
                UPDATE {DB_SCHEMA}.bookings 
                SET cancelled_at = created_at 
                WHERE status = 'Cancelled' AND cancelled_at IS NULL
            '''))
            conn.commit()
        except Exception as e:
            print(f"Backfill cancelled_at error: {e}")
        
        try:
            # Backfill completed_at for existing completed bookings
            conn.execute(text(f'''
                UPDATE {DB_SCHEMA}.bookings 
                SET completed_at = created_at 
                WHERE status = 'Completed' AND completed_at IS NULL
            '''))
            conn.commit()
        except Exception as e:
            print(f"Backfill completed_at error: {e}")
        
        try:
            # Backfill disputed_at for existing disputed bookings
            conn.execute(text(f'''
                UPDATE {DB_SCHEMA}.bookings 
                SET disputed_at = created_at 
                WHERE status = 'Disputed' AND disputed_at IS NULL
            '''))
            conn.commit()
        except Exception as e:
            print(f"Backfill disputed_at error: {e}")


def get_email(user_id):
    """Look up a user's email address from the profile service."""
    try:
        resp = requests.get(f'{PROFILE_SERVICE_URL}/profile/internal/{user_id}', timeout=3)
        if resp.status_code == 200:
            return resp.json().get('email', '')
    except Exception as e:
        print(f'[BOOKING] Email lookup error for user {user_id}: {e}')
    return ''


def publish_event(routing_key, payload):
    """Publish an event to the RabbitMQ esd_exchange."""
    try:
        print(f'[BOOKING] Publishing {routing_key}...', flush=True)
        params = pika.URLParameters(RABBITMQ_URL)
        params.socket_timeout = 10
        params.blocked_connection_timeout = 10
        params.heartbeat = 60
        params.connection_attempts = 3
        params.retry_delay = 2
        if RABBITMQ_URL.startswith('amqps'):
            ssl_context = ssl.create_default_context()
            params.ssl_options = pika.SSLOptions(ssl_context)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.exchange_declare(exchange='esd_exchange', exchange_type='topic', durable=True)
        ch.basic_publish(
            exchange='esd_exchange',
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        conn.close()
        print(f'[BOOKING] Published {routing_key}: {payload}', flush=True)
    except Exception as e:
        print(f'[BOOKING] RabbitMQ publish error: {e}', flush=True)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'booking-service'}), 200


@app.route('/booking', methods=['POST'])
def create_booking():
    data = request.get_json(force=True) or {}
    for field in ['tutor_id', 'tutee_id', 'availability_id', 'lesson_date', 'start_time', 'end_time']:
        if data.get(field) is None:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    try:
        booking = Booking(
            tutor_id=int(data['tutor_id']),
            tutee_id=int(data['tutee_id']),
            availability_id=int(data['availability_id']),
            lesson_date=datetime.strptime(data['lesson_date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M:%S').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M:%S').time(),
            subject=data.get('subject'),
            level=data.get('level'),
        )
        db.session.add(booking)
        db.session.commit()
        publish_event('booking.created', {
            'booking_id':  booking.booking_id,
            'tutor_id':    booking.tutor_id,
            'tutor_email': get_email(booking.tutor_id),
            'lesson_date': data['lesson_date'],
            'start_time':  data['start_time'],
        })
        socketio.emit('new_booking', booking.to_dict())
        return jsonify(booking.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid date/time format: {e}'}), 400


@app.route('/booking/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify(booking.to_dict()), 200


@app.route('/booking/user/<int:user_id>', methods=['GET'])
def get_bookings_by_user(user_id):
    status_filter = request.args.get('status')
    query = Booking.query.filter(
        (Booking.tutor_id == user_id) | (Booking.tutee_id == user_id))
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    bookings = query.order_by(Booking.created_at.desc()).all()
    return jsonify({'bookings': [b.to_dict() for b in bookings], 'count': len(bookings)}), 200


@app.route('/booking/status/<string:status>', methods=['GET'])
def get_bookings_by_status(status):
    if status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status: {status}'}), 400
    bookings = Booking.query.filter(Booking.status == status).order_by(Booking.created_at.desc()).all()
    return jsonify({'bookings': [b.to_dict() for b in bookings], 'count': len(bookings)}), 200


@app.route('/booking/<int:booking_id>/confirm', methods=['PUT'])
def confirm_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status != 'AwaitingConfirmation':
        return jsonify({'error': f'Cannot confirm booking with status: {booking.status}'}), 400
    booking.status = 'AwaitingPayment'
    booking.confirmed_at = datetime.utcnow()
    db.session.commit()
    publish_event('booking.confirmed', {
        'booking_id':  booking.booking_id,
        'tutee_id':    booking.tutee_id,
        'tutee_email': get_email(booking.tutee_id),
        'lesson_date': booking.lesson_date.isoformat(),
    })
    socketio.emit('booking_confirmed', booking.to_dict())
    return jsonify(booking.to_dict()), 200


@app.route('/booking/<int:booking_id>/reject', methods=['PUT'])
def reject_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status != 'AwaitingConfirmation':
        return jsonify({'error': f'Cannot reject booking with status: {booking.status}'}), 400
    booking.status = 'Cancelled'
    booking.cancelled_at = datetime.utcnow()
    db.session.commit()
    publish_event('booking.rejected', {
        'booking_id':  booking.booking_id,
        'tutee_id':    booking.tutee_id,
        'tutee_email': get_email(booking.tutee_id),
    })
    socketio.emit('booking_status_changed', booking.to_dict())
    return jsonify(booking.to_dict()), 200


@app.route('/booking/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status in ['Cancelled', 'Completed']:
        return jsonify({'error': f'Cannot cancel booking with status: {booking.status}'}), 400
    booking.status = 'Cancelled'
    booking.cancelled_at = datetime.utcnow()
    db.session.commit()
    publish_event('booking.cancelled', {
        'booking_id':   booking.booking_id,
        'tutee_id':     booking.tutee_id,
        'tutee_email':  get_email(booking.tutee_id),
        'tutor_id':     booking.tutor_id,
        'tutor_email':  get_email(booking.tutor_id),
    })
    socketio.emit('booking_status_changed', booking.to_dict())
    return jsonify(booking.to_dict()), 200


@app.route('/booking/<int:booking_id>/complete', methods=['PUT'])
def complete_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status != 'Confirmed':
        return jsonify({'error': f'Cannot complete booking with status: {booking.status}'}), 400
    booking.status = 'Completed'
    booking.completed_at = datetime.utcnow()
    db.session.commit()
    socketio.emit('booking_status_changed', booking.to_dict())
    return jsonify(booking.to_dict()), 200


@app.route('/booking/<int:booking_id>/dispute', methods=['PUT'])
def dispute_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status not in ['Confirmed', 'Completed']:
        return jsonify({'error': f'Cannot dispute booking with status: {booking.status}'}), 400
    data = request.get_json(force=True) or {}
    booking.status = 'Disputed'
    booking.disputed_at = datetime.utcnow()
    booking.disputed_by = data.get('reported_by') or data.get('ReportedBy')
    booking.dispute_reason = data.get('reason') or data.get('Reason')
    db.session.commit()
    return jsonify(booking.to_dict()), 200


@app.route('/booking/<int:booking_id>/status', methods=['PUT'])
def update_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    data = request.get_json(force=True) or {}
    new_status = data.get('status')
    if new_status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {VALID_STATUSES}'}), 400
    
    # Update status and set appropriate timestamp
    booking.status = new_status
    if new_status == 'Completed':
        booking.completed_at = datetime.utcnow()
    elif new_status == 'Cancelled':
        booking.cancelled_at = datetime.utcnow()
    elif new_status == 'Disputed':
        booking.disputed_at = datetime.utcnow()
    elif new_status == 'Confirmed' and not booking.confirmed_at:
        booking.confirmed_at = datetime.utcnow()
    
    db.session.commit()
    socketio.emit('booking_status_changed', booking.to_dict())
    return jsonify(booking.to_dict()), 200


@app.route('/booking/expired', methods=['GET'])
def get_expired_bookings():
    expire_type = request.args.get('type', 'confirmation')
    cutoff = datetime.utcnow() - timedelta(hours=24)

    if expire_type == 'confirmation':
        bookings = Booking.query.filter(
            Booking.status == 'AwaitingConfirmation',
            Booking.created_at < cutoff).all()
    elif expire_type == 'payment':
        bookings = Booking.query.filter(
            Booking.status == 'AwaitingPayment',
            Booking.confirmed_at.isnot(None),
            Booking.confirmed_at < cutoff).all()
    else:
        return jsonify({'error': 'type must be confirmation or payment'}), 400

    return jsonify({'bookings': [b.to_dict() for b in bookings]}), 200


if __name__ == '__main__':
    with app.app_context():
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
            conn.commit()
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 5004)), debug=False)
