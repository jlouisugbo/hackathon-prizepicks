// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Compact currency formatting for large numbers
export const formatCurrencyCompact = (amount: number, currency: string = 'USD'): string => {
  if (amount >= 1e9) {
    return `${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `${(amount / 1e3).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
};

// Percentage formatting
export const formatPercent = (percent: number, decimals: number = 2): string => {
  return `${percent.toFixed(decimals)}%`;
};

// Number formatting with commas
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Shares formatting
export const formatShares = (shares: number): string => {
  if (shares === 1) return '1 share';
  return `${formatNumber(shares)} shares`;
};

// Date formatting
export const formatDate = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Time formatting
export const formatTime = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// DateTime formatting
export const formatDateTime = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Relative time formatting (e.g., "2 minutes ago")
export const formatRelativeTime = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return formatDate(date);
  }
};

// Price change formatting with color indication
export const formatPriceChange = (change: number, changePercent: number) => {
  const isPositive = change >= 0;
  const sign = isPositive ? '+' : '';

  return {
    absolute: `${sign}${formatCurrency(change)}`,
    percent: `${sign}${formatPercent(changePercent)}`,
    isPositive,
  };
};

// Volume formatting
export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  }
  return formatNumber(volume);
};

// Market cap formatting
export const formatMarketCap = (marketCap: number): string => {
  return formatCurrencyCompact(marketCap);
};

// Game time formatting (e.g., "Q3 7:32")
export const formatGameTime = (quarter: number, timeRemaining: string): string => {
  const quarterMap: { [key: number]: string } = {
    1: 'Q1',
    2: 'Q2',
    3: 'Q3',
    4: 'Q4',
  };

  const quarterStr = quarter > 4 ? `OT${quarter - 4}` : quarterMap[quarter] || `Q${quarter}`;
  return `${quarterStr} ${timeRemaining}`;
};

// Score formatting
export const formatScore = (homeScore: number, awayScore: number, homeTeam: string, awayTeam: string): string => {
  return `${awayTeam} ${awayScore} - ${homeScore} ${homeTeam}`;
};

// Player position formatting
export const formatPosition = (position: string): string => {
  const positionMap: { [key: string]: string } = {
    'PG': 'Point Guard',
    'SG': 'Shooting Guard',
    'SF': 'Small Forward',
    'PF': 'Power Forward',
    'C': 'Center',
  };

  return positionMap[position] || position;
};

// Player stats formatting
export const formatPlayerStat = (stat: number, type: 'ppg' | 'rpg' | 'apg' | 'fg' | 'threePt'): string => {
  switch (type) {
    case 'fg':
    case 'threePt':
      return formatPercent(stat * 100, 1);
    default:
      return stat.toFixed(1);
  }
};

// Trade type formatting
export const formatTradeType = (type: 'buy' | 'sell'): { text: string; color: string } => {
  return {
    text: type.toUpperCase(),
    color: type === 'buy' ? '#4CAF50' : '#F44336',
  };
};

// Account type formatting
export const formatAccountType = (accountType: 'season' | 'live'): string => {
  return accountType === 'season' ? 'Season' : 'Live';
};

// Order type formatting
export const formatOrderType = (orderType: 'market' | 'limit'): string => {
  return orderType === 'market' ? 'Market' : 'Limit';
};

// Flash multiplier formatting
export const formatMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(1)}x`;
};

// Rank formatting
export const formatRank = (rank: number): string => {
  if (rank % 10 === 1 && rank % 100 !== 11) {
    return `${rank}st`;
  } else if (rank % 10 === 2 && rank % 100 !== 12) {
    return `${rank}nd`;
  } else if (rank % 10 === 3 && rank % 100 !== 13) {
    return `${rank}rd`;
  } else {
    return `${rank}th`;
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Username formatting (capitalize first letter)
export const formatUsername = (username: string): string => {
  return username.charAt(0).toUpperCase() + username.slice(1);
};