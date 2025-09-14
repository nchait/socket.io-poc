from flask import Flask, request
from flask_socketio import SocketIO, emit
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize SocketIO with CORS enabled for React Native
socketio = SocketIO(app, cors_allowed_origins="*")

# Store connected players
connected_players = {}

@app.route('/')
def index():
    return "Gaming Socket.IO Server is running!"

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    client_id = request.sid
    logger.info(f"Player connected: {client_id}")
    connected_players[client_id] = {'id': client_id}
    
    # Send confirmation back to client
    emit('connected', {'message': 'Successfully connected to server', 'playerId': client_id})
    
    # Notify all other clients about new player
    emit('player_joined', {'playerId': client_id}, broadcast=True, include_self=False)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    client_id = request.sid
    logger.info(f"Player disconnected: {client_id}")
    
    if client_id in connected_players:
        del connected_players[client_id]
    
    # Notify all other clients about player leaving
    emit('player_left', {'playerId': client_id}, broadcast=True)

@socketio.on('player_move')
def handle_player_move(data):
    """Handle player movement data"""
    client_id = request.sid
    
    try:
        # Validate required fields
        if not all(key in data for key in ['playerId', 'x', 'y']):
            emit('error', {'message': 'Invalid player_move data. Required: playerId, x, y'})
            return
        
        # Update player position
        if client_id in connected_players:
            connected_players[client_id].update({
                'x': data['x'],
                'y': data['y']
            })
        
        logger.info(f"Player {data['playerId']} moved to ({data['x']}, {data['y']})")
        
        # Broadcast movement to all connected clients
        emit('player_move', {
            'playerId': data['playerId'],
            'x': data['x'],
            'y': data['y']
        }, broadcast=True)
        
    except Exception as e:
        logger.error(f"Error handling player_move: {str(e)}")
        emit('error', {'message': f'Error processing player move: {str(e)}'})

@socketio.on('get_players')
def handle_get_players():
    """Send current player list to requesting client"""
    client_id = request.sid
    emit('players_list', {'players': list(connected_players.values())})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001, debug=True)
