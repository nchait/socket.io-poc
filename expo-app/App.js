import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001'; // Change to your server IP for physical device

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const socketRef = useRef(null);
  const moveIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setCurrentPlayer(socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setCurrentPlayer(null);
    });

    socketRef.current.on('connected', (data) => {
      console.log('Connection confirmed:', data);
      Alert.alert('Connected', `Player ID: ${data.playerId}`);
    });

    // Player movement event handlers
    socketRef.current.on('player_move', (data) => {
      console.log('Player moved:', data);
      setPlayerMoves(prev => {
        const newMove = {
          id: `${data.playerId}-${Date.now()}`,
          playerId: data.playerId,
          x: data.x,
          y: data.y,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        // Keep only last 20 moves
        const updated = [newMove, ...prev].slice(0, 20);
        return updated;
      });
    });

    socketRef.current.on('player_joined', (data) => {
      console.log('Player joined:', data.playerId);
      Alert.alert('Player Joined', `Player ${data.playerId} joined the game`);
    });

    socketRef.current.on('player_left', (data) => {
      console.log('Player left:', data.playerId);
      Alert.alert('Player Left', `Player ${data.playerId} left the game`);
    });

    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data.message);
      Alert.alert('Error', data.message);
    });

    // Note: Mock movement is now controlled manually via buttons

    // Cleanup on unmount
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startMockMovement = () => {
    // Send a player move every 2 seconds with random coordinates
    moveIntervalRef.current = setInterval(() => {
      if (socketRef.current && isConnected) {
        const mockMove = {
          playerId: socketRef.current.id,
          x: Math.floor(Math.random() * 1000),
          y: Math.floor(Math.random() * 1000),
        };
        
        console.log('Sending player move:', mockMove);
        socketRef.current.emit('player_move', mockMove);
      }
    }, 2000);
  };

  const stopMockMovement = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  const clearMoves = () => {
    setPlayerMoves([]);
  };

  const manualConnect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    } else if (!socketRef.current) {
      // Reinitialize socket if it doesn't exist
      socketRef.current = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });
      
      // Re-attach event handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        setCurrentPlayer(socketRef.current.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setCurrentPlayer(null);
      });

      socketRef.current.on('connected', (data) => {
        console.log('Connection confirmed:', data);
        Alert.alert('Connected', `Player ID: ${data.playerId}`);
      });

      socketRef.current.on('player_move', (data) => {
        console.log('Player moved:', data);
        setPlayerMoves(prev => {
          const newMove = {
            id: `${data.playerId}-${Date.now()}`,
            playerId: data.playerId,
            x: data.x,
            y: data.y,
            timestamp: new Date().toLocaleTimeString(),
          };
          
          const updated = [newMove, ...prev].slice(0, 20);
          return updated;
        });
      });

      socketRef.current.on('player_joined', (data) => {
        console.log('Player joined:', data.playerId);
        Alert.alert('Player Joined', `Player ${data.playerId} joined the game`);
      });

      socketRef.current.on('player_left', (data) => {
        console.log('Player left:', data.playerId);
        Alert.alert('Player Left', `Player ${data.playerId} left the game`);
      });

      socketRef.current.on('error', (data) => {
        console.error('Socket error:', data.message);
        Alert.alert('Error', data.message);
      });
    }
  };

  const manualDisconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  const sendManualMove = () => {
    if (socketRef.current && isConnected) {
      const manualMove = {
        playerId: socketRef.current.id,
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
      };
      
      console.log('Sending manual player move:', manualMove);
      socketRef.current.emit('player_move', manualMove);
    } else {
      Alert.alert('Not Connected', 'Please connect to the server first');
    }
  };

  const toggleAutoMovement = () => {
    if (moveIntervalRef.current) {
      stopMockMovement();
    } else {
      startMockMovement();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Gaming Socket.IO POC</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#28a745' : '#dc3545' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerInfoText}>
          Your Player ID: {currentPlayer || 'Not connected'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, styles.connectButton]} 
          onPress={manualConnect}
          disabled={isConnected}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]} 
          onPress={manualDisconnect}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.moveButton]} 
          onPress={sendManualMove}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Send Move</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.autoButton]} 
          onPress={toggleAutoMovement}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>
            {moveIntervalRef.current ? 'Stop Auto' : 'Start Auto'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearMoves}
        >
          <Text style={styles.buttonText}>Clear Moves</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.movesContainer}>
        <Text style={styles.sectionTitle}>Recent Player Moves</Text>
        {playerMoves.length === 0 ? (
          <Text style={styles.emptyText}>No moves yet. Players will appear here as they move.</Text>
        ) : (
          playerMoves.map((move) => (
            <View key={move.id} style={styles.moveItem}>
              <Text style={styles.moveText}>
                Player: {move.playerId}
              </Text>
              <Text style={styles.coordinatesText}>
                Position: ({move.x}, {move.y})
              </Text>
              <Text style={styles.timestampText}>
                Time: {move.timestamp}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  playerInfo: {
    padding: 15,
    backgroundColor: '#e3f2fd',
    margin: 10,
    borderRadius: 8,
  },
  playerInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  controls: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginHorizontal: 3,
    marginVertical: 3,
    minWidth: 80,
  },
  connectButton: {
    backgroundColor: '#28a745',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
  },
  moveButton: {
    backgroundColor: '#007bff',
  },
  autoButton: {
    backgroundColor: '#ffc107',
  },
  clearButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  movesContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  moveItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  moveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontStyle: 'italic',
  },
});

export default App;
