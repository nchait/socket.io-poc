# Gaming Socket.IO Proof of Concept

A real-time gaming communication proof of concept using Flask-SocketIO backend and React Native mobile client.

## Project Structure

```
socket.io-poc/
├── backend/
│   ├── server.py          # Flask-SocketIO server
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile        # Docker configuration for backend
├── mobile/
│   ├── App.js            # Main React Native application
│   ├── index.js          # React Native entry point
│   ├── package.json      # Node.js dependencies
│   ├── babel.config.js   # Babel configuration
│   └── metro.config.js   # Metro bundler configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

## Features

### Backend (Flask-SocketIO)
- WebSocket server using Socket.IO protocol
- Real-time player connection/disconnection handling
- Player movement broadcasting to all connected clients
- Player position tracking
- Error handling and logging

### Frontend (React Native)
- Real-time connection to Socket.IO server
- Automatic mock player movement (every 2 seconds)
- Live display of all player movements
- Connection status indicator
- Player join/leave notifications

## Prerequisites

- Docker and Docker Compose
- Node.js (16 or higher)
- React Native development environment
- For iOS: Xcode
- For Android: Android Studio

## Setup Instructions

### 1. Backend Setup

1. **Start the backend server using Docker Compose:**
   ```bash
   cd /Users/noahchait/Documents/fun/socket.io-poc
   docker-compose up --build
   ```

   This will:
   - Build the Flask-SocketIO server Docker image
   - Start the server on `http://localhost:3001`
   - Enable hot reloading for development

2. **Verify the backend is running:**
   ```bash
   curl http://localhost:3001
   ```
   Should return: "Gaming Socket.IO Server is running!"

### 2. Mobile App Setup

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **For iOS (requires Xcode):**
   ```bash
   # First, install Xcode from the App Store
   # Then run:
   cd ios && pod install && cd ..
   npm run ios
   ```

4. **For Android (requires Android Studio):**
   ```bash
   # First, install Android Studio and set up an emulator
   # Then run:
   npm run android
   ```

5. **Alternative: Run Metro bundler only (for web testing):**
   ```bash
   npm start
   ```

6. **Web Version (Immediate Testing):**
   ```bash
   # Open the web version in your browser
   open web/index.html
   # Or manually open: /Users/noahchait/Documents/fun/socket.io-poc/web/index.html
   ```

### 3. Network Configuration

**Important:** If testing on a physical device, update the server URL in `mobile/App.js`:

```javascript
// Change this line in App.js
const SERVER_URL = 'http://YOUR_COMPUTER_IP:3001';
```

Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`).

## Usage

1. **Start the backend:**
   ```bash
   docker-compose up
   ```

2. **Start the React Native app:**
   ```bash
   cd mobile
   npm start
   # In another terminal:
   npm run ios  # or npm run android
   ```

3. **Expected behavior:**
   - App connects to the server automatically
   - Connection status shows "Connected" with green indicator
   - Your Player ID is displayed
   - App automatically sends mock player movements every 2 seconds
   - All player movements appear in real-time in the moves list
   - When other players join/leave, you'll see notifications

## API Events

### Client → Server Events

- `connect` - Automatically sent when client connects
- `player_move` - Send player movement data
  ```json
  {
    "playerId": "socket_id",
    "x": 123,
    "y": 456
  }
  ```
- `get_players` - Request current player list

### Server → Client Events

- `connected` - Connection confirmation
- `player_move` - Broadcast player movement
- `player_joined` - New player joined
- `player_left` - Player disconnected
- `players_list` - Current player list
- `error` - Error messages

## Development

### Backend Development

- The backend uses Flask-SocketIO with eventlet for async handling
- Server runs on port 3001 with CORS enabled for all origins
- Logs are printed to console for debugging
- Hot reloading is enabled in development mode

### Frontend Development

- Uses React Native 0.72.6 with socket.io-client 4.7.2
- Mock movement is automatically generated every 2 seconds
- UI updates in real-time as new events are received
- Connection status is visually indicated

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Ensure Docker is running
   - Check that backend is started with `docker-compose up`
   - Verify port 3001 is not blocked

2. **iOS build issues (xcodebuild errors):**
   - Install Xcode from the App Store (this is required for iOS development)
   - Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
   - Install CocoaPods: `sudo gem install cocoapods`
   - Run: `cd ios && pod install && cd ..`

3. **React Native build issues:**
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean and rebuild: `cd ios && xcodebuild clean && cd ..`

4. **Physical device connection:**
   - Update SERVER_URL to use your computer's IP address
   - Ensure both devices are on the same network
   - Check firewall settings

5. **Socket.IO connection issues:**
   - Check browser console for WebSocket errors
   - Verify CORS settings in backend
   - Try different transports: `['websocket', 'polling']`

## Testing Multiple Clients

To test real-time communication between multiple clients:

1. Start the backend server
2. Run the React Native app on multiple devices/simulators
3. Each client will see movements from all other clients
4. Player join/leave events will be broadcast to all clients

## Production Considerations

- Replace `SECRET_KEY` with a secure random key
- Implement proper authentication/authorization
- Add rate limiting for player movements
- Use a production WSGI server (gunicorn + eventlet)
- Implement proper error handling and logging
- Add data persistence for player positions
- Consider Redis for scaling across multiple servers

## License

This is a proof of concept project for educational purposes.
