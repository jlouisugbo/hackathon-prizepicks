import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

interface PlayerPriceChartProps {
  data: {
    labels: string[];
    prices: number[];
  };
  playerName: string;
  isPositive?: boolean;
}

export default function PlayerPriceChart({
  data,
  playerName,
  isPositive = true
}: PlayerPriceChartProps) {
  const chartColor = isPositive ? theme.colors.bullish : theme.colors.bearish;

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => chartColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.neutral,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: chartColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.neutral + '20',
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.prices.length > 0 ? data.prices : [0],
        color: (opacity = 1) => chartColor,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{playerName} - 24h Price</Text>
      <LineChart
        data={chartData}
        width={width - 64}
        height={180}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={true}
        fromZero={false}
        yAxisLabel="$"
        yAxisInterval={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
});