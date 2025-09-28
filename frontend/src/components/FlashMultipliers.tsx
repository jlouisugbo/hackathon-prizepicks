import React from 'react';
import { View, Text } from 'react-native';
import { Player, FlashMultiplier } from '../../../shared/src/types';
import { theme } from '../theme/theme';

interface FlashMultipliersProps {
  flashMultipliers: Map<string, FlashMultiplier>;
  players: Player[];
  setSelectedPlayer: (player: Player) => void;
  setTradeType: (type: 'buy' | 'sell') => void;
  setTradeModalVisible: (visible: boolean) => void;
}

const FlashMultipliers: React.FC<FlashMultipliersProps> = ({ flashMultipliers, players, setSelectedPlayer, setTradeType, setTradeModalVisible }) => {
  if (flashMultipliers.size === 0) return null;
  return (
    <View style={{ marginHorizontal: 8, marginBottom: 8, backgroundColor: theme.colors.multiplierBg, borderRadius: 8, padding: 6, borderWidth: 1, borderColor: theme.colors.primary, minHeight: 32 }}>
      <View style={{ alignItems: 'center', marginBottom: 8, paddingVertical: 2 }}>
        <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: 2 }}>
          ⚡ FLASH MULTIPLIERS ACTIVE
        </Text>
      </View>
      {Array.from(flashMultipliers.values()).map((flash: FlashMultiplier) => {
        const player = players.find((p: Player) => p.id === flash.playerId);
        return (
          <View
            key={flash.playerId}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder, minHeight: 24 }}
            onTouchEnd={() => {
              if (player) {
                setSelectedPlayer(player);
                setTradeType('buy');
                setTradeModalVisible(true);
              }
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.onSurface, fontSize: 12, fontWeight: '600', marginBottom: 1 }}>{flash.playerName}</Text>
              <Text style={{ color: theme.colors.neutral, fontSize: 11, fontWeight: '400' }}>{flash.eventDescription}</Text>
            </View>
            <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, minWidth: 28, alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{flash.multiplier}x</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default FlashMultipliers;
