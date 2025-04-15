import { View, StyleSheet } from 'react-native';
import TicTacToe from '../../components/TicTacToe';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <TicTacToe />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
