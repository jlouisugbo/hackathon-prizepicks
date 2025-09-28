import React from 'react';
import { View, Text } from 'react-native';
import { GameEvent, LiveGame } from '../../../shared/src/types';

interface RecentEventsProps {
  gameEvents: GameEvent[];
  liveGame: LiveGame | null;
}

const RecentEvents: React.FC<RecentEventsProps> = ({ gameEvents, liveGame }) => {
  if (gameEvents.length === 0 || !liveGame) return null;
  return (
    <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 20 }}>
      <Text style={{ color: '#212121', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
        Recent Events
      </Text>
      {gameEvents.slice(0, 3).map((event: GameEvent) => (
        <View key={event.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#BDBDBD' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#212121', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{event.description}</Text>
            <Text style={{ color: '#757575', fontSize: 12, fontWeight: '500' }}>Q{event.quarter} • {event.gameTime}</Text>
          </View>
          {event.multiplier && (
            <View style={{ backgroundColor: '#1976D2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{event.multiplier}x</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default RecentEvents;
