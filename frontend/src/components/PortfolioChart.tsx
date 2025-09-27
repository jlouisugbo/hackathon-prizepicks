import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

interface PortfolioChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

export default function PortfolioChart({ data, title = 'Portfolio Performance' }: PortfolioChartProps) {
  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.neutral + '30',
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values.length > 0 ? data.values : [0],
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={chartData}
        width={width - 48}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={false}
        yAxisLabel="$"
        yAxisSuffix="k"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
});