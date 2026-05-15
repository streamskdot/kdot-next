export interface LeagueTheme {
  name: string
  colors: {
    primary: string
    primaryDark: string
    accent: string
    background: string
    border: string
    text: string
    textMuted: string
  }
  darkColors: {
    primary: string
    primaryDark: string
    accent: string
    background: string
    border: string
    text: string
    textMuted: string
  }
  gradients: {
    card: string
    header: string
  }
  darkGradients: {
    card: string
    header: string
  }
  logo?: string
}

export const leagueThemes: Record<string, LeagueTheme> = {
  'champions-league': {
    name: 'Champions League',
    colors: {
      primary: '#1a237e', // Deep blue
      primaryDark: '#0d1442',
      accent: '#00d4ff', // Cyan accent
      background: '#e8eaf6',
      border: '#1a237e',
      text: '#1a237e',
      textMuted: '#5c6bc0',
    },
    darkColors: {
      primary: '#0d1b4e', // Darker blue
      primaryDark: '#070a2a',
      accent: '#0088cc', // Darker cyan
      background: '#0a1030',
      border: '#0d1b4e',
      text: '#e8eaf6',
      textMuted: '#9fa8da',
    },
    gradients: {
      card: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
      header: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #0d1b4e 0%, #1a2a6e 50%, #283988 100%)',
      header: 'linear-gradient(135deg, #0d1b4e 0%, #0a1558 100%)',
    },
  },
  'europa-league': {
    name: 'Europa League',
    colors: {
      primary: '#ff6b35', // Orange
      primaryDark: '#c44d1a',
      accent: '#ffd700', // Gold accent
      background: '#fff3e0',
      border: '#ff6b35',
      text: '#ff6b35',
      textMuted: '#ff8c42',
    },
    darkColors: {
      primary: '#cc4a20', // Darker orange
      primaryDark: '#8a3312',
      accent: '#cc9900', // Darker gold
      background: '#1a1208',
      border: '#cc4a20',
      text: '#ffe0b2',
      textMuted: '#ffab40',
    },
    gradients: {
      card: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
      header: 'linear-gradient(135deg, #ff6b35 0%, #f57c00 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #cc4a20 0%, #e65a20 50%, #ff6a20 100%)',
      header: 'linear-gradient(135deg, #cc4a20 0%, #b04010 100%)',
    },
  },
  'uefa-conference-league-knockout-stage': {
    name: 'UEFA Conference League',
    colors: {
      primary: '#00a651', // Green
      primaryDark: '#007a3b',
      accent: '#00ff88', // Bright green accent
      background: '#e8f5e9',
      border: '#00a651',
      text: '#00a651',
      textMuted: '#4caf50',
    },
    darkColors: {
      primary: '#007a3b', // Darker green
      primaryDark: '#004d25',
      accent: '#00cc66', // Darker bright green
      background: '#0a1f12',
      border: '#007a3b',
      text: '#c8e6c9',
      textMuted: '#66bb6a',
    },
    gradients: {
      card: 'linear-gradient(135deg, #00a651 0%, #00c853 50%, #00e676 100%)',
      header: 'linear-gradient(135deg, #00a651 0%, #008f4c 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #007a3b 0%, #009944 50%, #00b84d 100%)',
      header: 'linear-gradient(135deg, #007a3b 0%, #005c2d 100%)',
    },
  },
  'premier-league': {
    name: 'Premier League',
    colors: {
      primary: '#38003c', // Purple
      primaryDark: '#1a0020',
      accent: '#00ff85',
      background: '#f3e5f5',
      border: '#38003c',
      text: '#38003c',
      textMuted: '#7b1fa2',
    },
    darkColors: {
      primary: '#2a002c', // Darker purple
      primaryDark: '#150015',
      accent: '#00cc66',
      background: '#150d18',
      border: '#2a002c',
      text: '#e1bee7',
      textMuted: '#9c4dcc',
    },
    gradients: {
      card: 'linear-gradient(135deg, #38003c 0%, #4a148c 100%)',
      header: 'linear-gradient(135deg, #38003c 0%, #6a1b9a 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #2a002c 0%, #3c0c3e 50%, #4e1850 100%)',
      header: 'linear-gradient(135deg, #2a002c 0%, #1a001c 100%)',
    },
  },
  'laliga': {
    name: 'La Liga',
    colors: {
      primary: '#ee2222', // Red
      primaryDark: '#aa1111',
      accent: '#ffcc00', // Gold/Yellow accent
      background: '#ffebee',
      border: '#ee2222',
      text: '#ee2222',
      textMuted: '#ef5350',
    },
    darkColors: {
      primary: '#cc1a1a', // Darker red
      primaryDark: '#880e0e',
      accent: '#cc9900', // Darker gold
      background: '#1a0808',
      border: '#cc1a1a',
      text: '#ffcdd2',
      textMuted: '#e57373',
    },
    gradients: {
      card: 'linear-gradient(135deg, #ee2222 0%, #f44336 50%, #ef5350 100%)',
      header: 'linear-gradient(135deg, #ee2222 0%, #d32f2f 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #cc1a1a 0%, #d32f2f 50%, #e53935 100%)',
      header: 'linear-gradient(135deg, #cc1a1a 0%, #b71c1c 100%)',
    },
  },
  'la-liga': {
    name: 'La Liga',
    colors: {
      primary: '#ee2222', // Red
      primaryDark: '#aa1111',
      accent: '#ffcc00', // Gold/Yellow accent
      background: '#ffebee',
      border: '#ee2222',
      text: '#ee2222',
      textMuted: '#ef5350',
    },
    darkColors: {
      primary: '#cc1a1a', // Darker red
      primaryDark: '#880e0e',
      accent: '#cc9900', // Darker gold
      background: '#1a0808',
      border: '#cc1a1a',
      text: '#ffcdd2',
      textMuted: '#e57373',
    },
    gradients: {
      card: 'linear-gradient(135deg, #ee2222 0%, #f44336 50%, #ef5350 100%)',
      header: 'linear-gradient(135deg, #ee2222 0%, #d32f2f 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #cc1a1a 0%, #d32f2f 50%, #e53935 100%)',
      header: 'linear-gradient(135deg, #cc1a1a 0%, #b71c1c 100%)',
    },
  },
  'bundesliga': {
    name: 'Bundesliga',
    colors: {
      primary: '#d20505', // Red
      primaryDark: '#a00404',
      accent: '#ffffff', // White accent
      background: '#ffebee',
      border: '#d20505',
      text: '#d20505',
      textMuted: '#ef5350',
    },
    darkColors: {
      primary: '#b00404', // Darker red
      primaryDark: '#7a0303',
      accent: '#e0e0e0', // Darker white
      background: '#1a0808',
      border: '#b00404',
      text: '#ffcdd2',
      textMuted: '#e57373',
    },
    gradients: {
      card: 'linear-gradient(135deg, #d20505 0%, #e53935 50%, #f44336 100%)',
      header: 'linear-gradient(135deg, #d20505 0%, #c62828 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #b00404 0%, #c62828 50%, #d32f2f 100%)',
      header: 'linear-gradient(135deg, #b00404 0%, #8a0202 100%)',
    },
  },
  'serie-a': {
    name: 'Serie A',
    colors: {
      primary: '#008fd7', // Blue
      primaryDark: '#006ba3',
      accent: '#00ff88', // Green accent
      background: '#e1f5fe',
      border: '#008fd7',
      text: '#008fd7',
      textMuted: '#039be5',
    },
    darkColors: {
      primary: '#006ba3', // Darker blue
      primaryDark: '#004d73',
      accent: '#00cc66', // Darker green
      background: '#0a1520',
      border: '#006ba3',
      text: '#b3e5fc',
      textMuted: '#4fc3f7',
    },
    gradients: {
      card: 'linear-gradient(135deg, #008fd7 0%, #039be5 50%, #29b6f6 100%)',
      header: 'linear-gradient(135deg, #008fd7 0%, #0277bd 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #006ba3 0%, #0277bd 50%, #039be5 100%)',
      header: 'linear-gradient(135deg, #006ba3 0%, #005082 100%)',
    },
  },
  'fa-cup': {
    name: 'FA Cup',
    colors: {
      primary: '#e60026', // Emirates red
      primaryDark: '#b3001e',
      accent: '#c0c0c0', // Silver (trophy)
      background: '#ffffff',
      border: '#e60026',
      text: '#e60026',
      textMuted: '#ff4d6d',
    },
    darkColors: {
      primary: '#cc0022',
      primaryDark: '#990019',
      accent: '#a0a0a0', // Darker silver
      background: '#1a0a0c',
      border: '#cc0022',
      text: '#ffffff',
      textMuted: '#ff8099',
    },
    gradients: {
      card: 'linear-gradient(135deg, #e60026 0%, #ff1a3c 50%, #ff3366 100%)',
      header: 'linear-gradient(135deg, #e60026 0%, #cc0022 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #990019 0%, #b3001e 50%, #cc0022 100%)',
      header: 'linear-gradient(135deg, #990019 0%, #660011 100%)',
    },
  },
  'ligue-1': {
    name: 'Ligue 1',
    colors: {
      primary: '#ffffff', // White
      primaryDark: '#e0e0e0',
      accent: '#d4a000', // Darker yellow accent
      background: '#ffffff',
      border: '#d4a000', // Yellow border
      text: '#333333',
      textMuted: '#666666',
    },
    darkColors: {
      primary: '#ffffff', // White
      primaryDark: '#e0e0e0',
      accent: '#d4a000', // Darker yellow accent
      background: '#1a1500',
      border: '#d4a000', // Yellow border
      text: '#ffffff',
      textMuted: '#cccccc',
    },
    gradients: {
      card: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
      header: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
    },
    darkGradients: {
      card: 'linear-gradient(135deg, #2a2515 0%, #1a1500 50%, #0f0d00 100%)',
      header: 'linear-gradient(135deg, #2a2515 0%, #1a1500 100%)',
    },
  },
}

export function getLeagueTheme(leagueSlug: string): LeagueTheme {
  return leagueThemes[leagueSlug] || leagueThemes['champions-league']
}
