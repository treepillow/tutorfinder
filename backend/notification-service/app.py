import os
import json
import pika
import threading
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

RABBITMQ_URL     = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
RESEND_API_KEY   = os.environ.get('RESEND_API_KEY', '')
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'noreply@tutorfinder.com')

DB_SCHEMA = os.environ.get('DB_SCHEMA', 'notification_schema')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://localhost/tutorfinder')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'options': f'-csearch_path={DB_SCHEMA}'}
}

db = SQLAlchemy(app)


class Notification(db.Model):
    __tablename__ = 'notifications'
    __table_args__ = {'schema': DB_SCHEMA}

    notify_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, nullable=True)
    type        = db.Column(db.Enum('Match', 'Booking', 'Payment', native_enum=False), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    email       = db.Column(db.String(100), nullable=False)
    status      = db.Column(db.String(20), default='Pending')
    routing_key = db.Column(db.String(100), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'notify_id':   self.notify_id,
            'user_id':     self.user_id,
            'type':        self.type,
            'message':     self.message,
            'email':       self.email,
            'status':      self.status,
            'routing_key': self.routing_key,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }


with app.app_context():
    from sqlalchemy import text
    with db.engine.connect() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
        conn.commit()
    db.create_all()


def send_email(to_email, subject, message_text):
    if not RESEND_API_KEY:
        print(f'[EMAIL MOCK] To: {to_email} | Subject: {subject} | {message_text}')
        return True
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            'from': RESEND_FROM_EMAIL,
            'to': [to_email],
            'subject': subject,
            'text': message_text,
        })
        return True
    except Exception as e:
        print(f'Email error: {e}')
        return False


def save_and_notify(user_id, notify_type, email, subject, message, routing_key):
    if not email:
        return
    status = 'Sent' if send_email(email, subject, message) else 'Failed'
    try:
        with app.app_context():
            notif = Notification(
                user_id=user_id, type=notify_type, message=message,
                email=email, status=status, routing_key=routing_key)
            db.session.add(notif)
            db.session.commit()
    except Exception as e:
        print(f'Save notification error: {e}')


def handle_message(ch, method, properties, body):
    try:
        data = json.loads(body)
        rk   = method.routing_key
        print(f'[NOTIFICATION] {rk}: {data}')

        if rk == 'match.created':
            save_and_notify(data.get('user_a_id'), 'Match', data.get('user_a_email'),
                            'New Match on TutorFinder!',
                            f"Hi {data.get('user_a_name', 'there')}! You have a new match on TutorFinder!", rk)
            save_and_notify(data.get('user_b_id'), 'Match', data.get('user_b_email'),
                            'New Match on TutorFinder!',
                            f"Hi {data.get('user_b_name', 'there')}! You have a new match on TutorFinder!", rk)

        elif rk == 'booking.created':
            save_and_notify(data.get('tutor_id'), 'Booking', data.get('tutor_email'),
                            'New Booking Request',
                            f"New booking request on {data.get('lesson_date')} at "
                            f"{data.get('start_time')}. Please confirm or reject in the app.", rk)

        elif rk == 'booking.confirmed':
            save_and_notify(data.get('tutee_id'), 'Booking', data.get('tutee_email'),
                            'Booking Confirmed',
                            f"Your booking on {data.get('lesson_date')} is confirmed! "
                            f"Please pay your deposit within 24 hours.", rk)

        elif rk == 'booking.rejected':
            save_and_notify(data.get('tutee_id'), 'Booking', data.get('tutee_email'),
                            'Booking Rejected',
                            "Your booking was rejected by the tutor. Please select another slot.", rk)

        elif rk == 'booking.expired':
            save_and_notify(data.get('tutee_id'), 'Booking', data.get('tutee_email'),
                            'Booking Cancelled',
                            f"Booking cancelled. Reason: {data.get('reason', 'Expired')}", rk)

        elif rk == 'booking.cancelled':
            save_and_notify(data.get('tutee_id'), 'Booking', data.get('tutee_email'),
                            'Booking Cancelled',
                            "A booking has been cancelled.", rk)
            save_and_notify(data.get('tutor_id'), 'Booking', data.get('tutor_email'),
                            'Booking Cancelled',
                            "A booking has been cancelled.", rk)

        elif rk == 'payment.success':
            save_and_notify(data.get('tutee_id'), 'Payment', data.get('tutee_email'),
                            'Payment Received',
                            f"Payment of SGD {data.get('amount')} received! Your lesson is confirmed.", rk)

        elif rk == 'payment.failed':
            save_and_notify(data.get('tutee_id'), 'Payment', data.get('tutee_email'),
                            'Payment Failed',
                            "Payment failed. Please try again in the app.", rk)

        elif rk == 'deposit.released':
            save_and_notify(data.get('tutor_id'), 'Payment', data.get('tutor_email'),
                            'Deposit Released',
                            "Your lesson deposit has been released to your account!", rk)

        elif rk == 'deposit.refunded':
            save_and_notify(data.get('tutee_id'), 'Payment', data.get('tutee_email'),
                            'Deposit Refunded',
                            "Your deposit has been refunded. Allow 3-5 business days.", rk)

        else:
            print(f'[NOTIFICATION] Unhandled routing key: {rk}')

    except Exception as e:
        print(f'[NOTIFICATION] Message handling error: {e}')


def start_consumer():
    def consume():
        while True:
            try:
                params = pika.URLParameters(RABBITMQ_URL)
                conn = pika.BlockingConnection(params)
                ch = conn.channel()
                ch.exchange_declare(exchange='esd_exchange', exchange_type='topic', durable=True)
                ch.queue_declare(queue='notification_queue', durable=True)
                ch.queue_bind(exchange='esd_exchange',
                              queue='notification_queue', routing_key='#')
                ch.basic_qos(prefetch_count=1)
                ch.basic_consume(queue='notification_queue',
                                 on_message_callback=handle_message, auto_ack=True)
                print('[NOTIFICATION] Consumer ready, waiting for messages...')
                ch.start_consuming()
            except Exception as e:
                print(f'[NOTIFICATION] Consumer error: {e}. Retrying in 5s...')
                time.sleep(5)

    threading.Thread(target=consume, daemon=True).start()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'notification-service'}), 200


@app.route('/notify/send', methods=['POST'])
def send_notification():
    data = request.get_json(force=True) or {}
    for field in ['user_id', 'type', 'message', 'email']:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    if data['type'] not in ['Match', 'Booking', 'Payment']:
        return jsonify({'error': "type must be Match, Booking, or Payment"}), 400

    email  = data['email']
    msg    = data['message']
    subject = data.get('subject', 'TutorFinder Notification')
    status = 'Sent' if send_email(email, subject, msg) else 'Failed'

    notif = Notification(
        user_id=data['user_id'], type=data['type'],
        message=msg, email=email,
        status=status, routing_key='direct')
    db.session.add(notif)
    db.session.commit()
    return jsonify({'success': True, 'notify_id': notif.notify_id, 'status': status}), 201


@app.route('/notify/user/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    notifs = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()).all()
    return jsonify({'notifications': [n.to_dict() for n in notifs],
                    'count': len(notifs)}), 200


if __name__ == '__main__':
    with app.app_context():
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
            conn.commit()
        db.create_all()
    start_consumer()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5007)), debug=False)
