import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

DB_SCHEMA = os.environ.get('DB_SCHEMA', 'public')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://localhost/tutorfinder')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'options': f'-csearch_path={DB_SCHEMA}'}
}

db = SQLAlchemy(app)


class Availability(db.Model):
    __tablename__ = 'availability'

    availability_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, nullable=False)
    date            = db.Column(db.Date, nullable=False)
    start_time      = db.Column(db.Time, nullable=False)
    end_time        = db.Column(db.Time, nullable=False)
    status          = db.Column(
        db.Enum('Available', 'Reserved', 'Unavailable', native_enum=False),
        default='Available', nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'availability_id': self.availability_id,
            'user_id':         self.user_id,
            'date':            self.date.isoformat() if self.date else None,
            'start_time':      str(self.start_time),
            'end_time':        str(self.end_time),
            'status':          self.status,
        }


with app.app_context():
    from sqlalchemy import text
    with db.engine.connect() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
        conn.commit()
    db.create_all()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'availability-service'}), 200


@app.route('/availability', methods=['POST'])
def add_slot():
    data = request.get_json(force=True) or {}
    for field in ['user_id', 'date', 'start_time', 'end_time']:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    try:
        slot = Availability(
            user_id=int(data['user_id']),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M:%S').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M:%S').time(),
            status='Available'
        )
        db.session.add(slot)
        db.session.commit()
        return jsonify(slot.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid date/time format. Use YYYY-MM-DD and HH:MM:SS. {e}'}), 400


@app.route('/availability/<int:user_id>', methods=['GET'])
def get_availability(user_id):
    slots = Availability.query.filter_by(user_id=user_id).order_by(
        Availability.date, Availability.start_time).all()
    return jsonify({'user_id': user_id, 'availability': [s.to_dict() for s in slots]}), 200


@app.route('/availability/slot/<int:availability_id>', methods=['GET'])
def get_slot(availability_id):
    slot = Availability.query.get(availability_id)
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    return jsonify(slot.to_dict()), 200


@app.route('/availability/check', methods=['POST'])
def check_availability():
    data = request.get_json(force=True) or {}
    if not data.get('availability_id'):
        return jsonify({'error': 'availability_id is required'}), 400
    slot = Availability.query.get(int(data['availability_id']))
    if not slot:
        return jsonify({'available': False, 'error': 'Slot not found'}), 404
    return jsonify({'available': slot.status == 'Available', 'slot': slot.to_dict()}), 200


@app.route('/availability/<int:availability_id>', methods=['PUT'])
def update_slot(availability_id):
    slot = Availability.query.get(availability_id)
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    data = request.get_json(force=True) or {}
    new_status = data.get('status')
    if new_status not in ['Available', 'Reserved', 'Unavailable']:
        return jsonify({'error': 'status must be Available, Reserved, or Unavailable'}), 400
    # Only block if trying to RESERVE an already reserved/unavailable slot
    if new_status == 'Reserved' and slot.status != 'Available':
        if slot.status == 'Reserved':
            return jsonify({'error': 'Slot is already reserved'}), 409
        if slot.status == 'Unavailable':
            return jsonify({'error': 'Slot is unavailable'}), 409
    slot.status = new_status
    db.session.commit()
    return jsonify(slot.to_dict()), 200


@app.route('/availability/<int:availability_id>', methods=['DELETE'])
def delete_slot(availability_id):
    slot = Availability.query.get(availability_id)
    if not slot:
        return jsonify({'error': 'Slot not found'}), 404
    if slot.status != 'Available':
        return jsonify({'error': 'Cannot delete a Reserved or Unavailable slot'}), 400
    db.session.delete(slot)
    db.session.commit()
    return jsonify({'message': 'Slot deleted'}), 200


if __name__ == '__main__':
    with app.app_context():
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}'))
            conn.commit()
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5003)), debug=False)
