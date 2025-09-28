import React from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LiveGame, Portfolio } from '../../../shared/src/types';

interface GameHeaderProps {
  liveGames: LiveGame[];
  selectedGameId: string | null;
  setSelectedGameId: (id: string) => void;
  setLiveGame: (game: LiveGame) => void;
  liveGame: LiveGame | null;
  portfolio: Portfolio | null;
  theme: any;
}

const GameHeader: React.FC<GameHeaderProps> = ({ liveGames, selectedGameId, setSelectedGameId, setLiveGame, liveGame, portfolio, theme }) => {
  if (liveGames && liveGames.length > 1) {
    const activeGame = liveGames.find(g => g.id === selectedGameId) || liveGames[0];
    return (
      <View>
        <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 4 }}>Select Live Game:</Text>
          <View style={{ borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: 8, backgroundColor: theme.colors.surface }}>
            {liveGames.map(game => (
              <Button
                key={game.id}
                mode={game.id === selectedGameId ? 'contained' : 'text'}
                onPress={() => {
                  setSelectedGameId(game.id);
                  setLiveGame(game);
                }}
                style={{ marginVertical: 2 }}
              >
                {game.awayTeam} vs {game.homeTeam} (Q{game.quarter})
              </Button>
            ))}
          </View>
        </View>
        {/* Show header for selected game only */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20, backgroundColor: theme.colors.surface, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.liveActive, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>LIVE</Text>
            </View>
            <Text style={{ color: theme.colors.neutral, fontSize: 14, fontWeight: '600' }}>
              Q{activeGame.quarter} • {activeGame.timeRemaining}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{activeGame.awayTeam}</Text>
              <Text style={{ color: theme.colors.onSurface, fontSize: 32, fontWeight: '900' }}>{activeGame.awayScore}</Text>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ color: theme.colors.neutral, fontSize: 24, fontWeight: '300' }}>-</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{activeGame.homeTeam}</Text>
              <Text style={{ color: theme.colors.onSurface, fontSize: 32, fontWeight: '900' }}>{activeGame.homeScore}</Text>
            </View>
          </View>
          {portfolio && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{portfolio.tradesRemaining}</Text>
                <Text style={{ color: theme.colors.neutral, fontSize: 12, fontWeight: '500' }}>Trades Left</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{portfolio.availableBalance}</Text>
                <Text style={{ color: theme.colors.neutral, fontSize: 12, fontWeight: '500' }}>Available</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
  if (!liveGame) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
        <Ionicons name="basketball-outline" size={64} color={theme.colors.neutral} />
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.onBackground, marginTop: 16, marginBottom: 8 }}>No Live Game</Text>
        <Text style={{ fontSize: 16, color: theme.colors.neutral, textAlign: 'center', lineHeight: 22 }}>
          Live trading will be available during games
        </Text>
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 20, backgroundColor: theme.colors.surface, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.liveActive, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>LIVE</Text>
        </View>
        <Text style={{ color: theme.colors.neutral, fontSize: 14, fontWeight: '600' }}>
          Q{liveGame.quarter} • {liveGame.timeRemaining}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{liveGame.awayTeam}</Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 32, fontWeight: '900' }}>{liveGame.awayScore}</Text>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: theme.colors.neutral, fontSize: 24, fontWeight: '300' }}>-</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{liveGame.homeTeam}</Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 32, fontWeight: '900' }}>{liveGame.homeScore}</Text>
        </View>
      </View>
      {portfolio && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{portfolio.tradesRemaining}</Text>
            <Text style={{ color: theme.colors.neutral, fontSize: 12, fontWeight: '500' }}>Trades Left</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{portfolio.availableBalance}</Text>
            <Text style={{ color: theme.colors.neutral, fontSize: 12, fontWeight: '500' }}>Available</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default GameHeader;
