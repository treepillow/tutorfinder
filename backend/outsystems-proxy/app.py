import os
import requests
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

OUTSYSTEMS_BASE = os.environ.get(
    'OUTSYSTEMS_URL',
    'https://personal-m9frao4j.outsystemscloud.com/TutorFinder_BookingProcess/rest/BookingProcess'
)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'outsystems-proxy'}), 200

@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def proxy(path):
    if request.method == 'OPTIONS':
        return Response(status=200)
    try:
        res = requests.request(
            method=request.method,
            url=f'{OUTSYSTEMS_BASE}/{path}',
            json=request.get_json(force=True, silent=True),
            timeout=15
        )
        return Response(res.content, status=res.status_code, content_type='application/json')
    except Exception as e:
        return jsonify({'error': str(e)}), 502

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5010)), debug=False)
