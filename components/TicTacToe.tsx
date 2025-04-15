import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Text, Portal, Modal, Surface, Switch } from 'react-native-paper';
import { useTheme } from '../constants/theme';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.9;
const CELL_SIZE = BOARD_SIZE / 3;

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [playerXScore, setPlayerXScore] = useState(0);
  const [playerOScore, setPlayerOScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [vsComputer, setVsComputer] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    checkWinner();
  }, [board]);

  useEffect(() => {
    // Make computer move if it's O's turn and vsComputer mode is active
    if (vsComputer && !isXNext && !winner) {
      const timerId = setTimeout(() => {
        makeComputerMove();
      }, 500); // Add a small delay for better UX
      
      return () => clearTimeout(timerId);
    }
  }, [isXNext, vsComputer, winner]);

  const handlePress = (index: number) => {
    if (board[index] || winner) return;
    if (!isXNext && vsComputer) return; // Prevent player from making move during computer's turn

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const makeComputerMove = () => {
    // Create a copy of the current board
    const newBoard = [...board];
    
    // Get the best move for the computer (O)
    const bestMoveIndex = findBestMove(newBoard);
    
    // Make the move
    if (bestMoveIndex !== -1) {
      newBoard[bestMoveIndex] = 'O';
      setBoard(newBoard);
      setIsXNext(true);
    }
  };

  // Simple AI to find the best move for the computer
  const findBestMove = (currentBoard: Array<string | null>): number => {
    // Check if computer can win in the next move
    const winningMove = findWinningMove(currentBoard, 'O');
    if (winningMove !== -1) return winningMove;
    
    // Check if player can win in the next move and block it
    const blockingMove = findWinningMove(currentBoard, 'X');
    if (blockingMove !== -1) return blockingMove;
    
    // Try to take the center if it's free
    if (currentBoard[4] === null) return 4;
    
    // Try to take the corners if they're free
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => currentBoard[i] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => currentBoard[i] === null);
    if (availableSides.length > 0) {
      return availableSides[Math.floor(Math.random() * availableSides.length)];
    }
    
    // If no moves are possible, return -1
    return -1;
  };
  
  // Helper function to find a winning move for a given player
  const findWinningMove = (currentBoard: Array<string | null>, player: string): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      const countPlayer = line.filter(i => currentBoard[i] === player).length;
      const countEmpty = line.filter(i => currentBoard[i] === null).length;
      
      // If there are two of player's symbols and one empty cell in a line
      if (countPlayer === 2 && countEmpty === 1) {
        // Find the empty cell and return its index
        const emptyIndex = line.find(i => currentBoard[i] === null);
        if (emptyIndex !== undefined) return emptyIndex;
      }
    }
    
    return -1;
  };

  const checkWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setModalVisible(true);
        if (board[a] === 'X') {
          setPlayerXScore(playerXScore + 1);
        } else {
          setPlayerOScore(playerOScore + 1);
        }
        return;
      }
    }

    // Check for draw
    if (!board.includes(null) && !winner) {
      setWinner('Draw');
      setModalVisible(true);
      setDraws(draws + 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setModalVisible(false);
  };

  const renderCell = (index: number) => {
    return (
      <TouchableOpacity
        style={[
          styles.cell, 
          { 
            borderColor: colors.border,
            backgroundColor: colors.card
          }
        ]}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.cellText, 
          { color: board[index] === 'X' ? '#FF5252' : '#2196F3' }
        ]}>
          {board[index]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      
      <View style={styles.gameModeContainer}>
        <Text>Two Players</Text>
        <Switch
          value={vsComputer}
          onValueChange={value => {
            setVsComputer(value);
            resetGame();
          }}
          style={styles.switch}
        />
        <Text>vs Computer</Text>
      </View>
      
      <Text style={styles.status}>
        {winner 
          ? (winner === 'Draw' 
              ? 'Game ended in a draw!' 
              : `Player ${winner} wins!`) 
          : vsComputer && !isXNext 
              ? "Computer is thinking..." 
              : `Next player: ${isXNext ? 'X' : 'O'}`
        }
      </Text>

      <Surface style={[styles.scoreBoard, { backgroundColor: colors.background }]}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: '#FF5252' }]}>Player X</Text>
          <Text style={styles.scoreValue}>{playerXScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Draws</Text>
          <Text style={styles.scoreValue}>{draws}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: '#2196F3' }]}>
            {vsComputer ? 'Computer' : 'Player O'}
          </Text>
          <Text style={styles.scoreValue}>{playerOScore}</Text>
        </View>
      </Surface>

      <View style={styles.board}>
        <View style={styles.row}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.row}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.row}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>

      <Button 
        mode="contained" 
        onPress={resetGame} 
        style={styles.resetButton}
      >
        Reset Game
      </Button>

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>
            {winner === 'Draw' 
              ? 'Game ended in a draw!' 
              : winner === 'O' && vsComputer 
                ? 'Computer wins!' 
                : `Player ${winner} wins!`
            }
          </Text>
          <Button mode="contained" onPress={resetGame} style={styles.modalButton}>
            Play Again
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switch: {
    marginHorizontal: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 20,
    width: 200,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    width: 150,
  },
});

export default TicTacToe; 