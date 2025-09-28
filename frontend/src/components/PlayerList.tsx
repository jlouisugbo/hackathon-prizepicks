import React from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import PlayerCard from './PlayerCard';
import { Player, LiveGame, FlashMultiplier } from '../../../shared/src/types';

interface PlayerListProps {
  players: Player[];
  liveGame: LiveGame | null;
  flashMultipliers: Map<string, FlashMultiplier>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterMultiplier: boolean;
  setFilterMultiplier: (f: boolean) => void;
  handleQuickBuy: (player: Player) => void;
  handleQuickSell: (player: Player) => void;
  theme: any;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, liveGame, flashMultipliers, searchQuery, setSearchQuery, filterMultiplier, setFilterMultiplier, handleQuickBuy, handleQuickSell, theme }) => {
  let displayPlayers = liveGame
    ? players.filter(p => liveGame.activePlayers.includes(p.id))
    : players;

  if (searchQuery) {
    displayPlayers = displayPlayers.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterMultiplier) {
    displayPlayers = displayPlayers.filter(p => flashMultipliers.has(p.id));
  }

  displayPlayers = [...displayPlayers].sort((a, b) => {
    const aHas = flashMultipliers.has(a.id);
    const bHas = flashMultipliers.has(b.id);
    if (aHas === bHas) return 0;
    return aHas ? -1 : 1;
  });

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.onBackground, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
          {liveGame ? 'Live Players' : 'All Players'}
        </Text>
        <Text style={{ color: theme.colors.neutral, fontSize: 14, fontWeight: '500' }}>
          {displayPlayers.length} players available
        </Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Search players or teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 8, paddingHorizontal: 12 }}
            dense
          />
        </View>
        <Button
          mode={filterMultiplier ? 'contained' : 'outlined'}
          onPress={() => setFilterMultiplier(!filterMultiplier)}
          style={{ borderRadius: 8 }}
          compact
        >
          Multiplier
        </Button>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 }}>
        {displayPlayers.map((player, index) => {
          const multiplier = flashMultipliers.get(player.id)?.multiplier;
          return (
            <View key={`player-${player.id}-${index}`} style={{ width: '48%', marginBottom: 12 }}>
              <PlayerCard
                player={player}
                onBuy={() => handleQuickBuy(player)}
                onSell={() => handleQuickSell(player)}
                flashMultiplier={multiplier}
                isLive={liveGame?.activePlayers.includes(player.id)}
                compact={false}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default PlayerList;
