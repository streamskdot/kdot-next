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
}

export function getLeagueTheme(leagueSlug: string): LeagueTheme {
  return leagueThemes[leagueSlug] || leagueThemes['champions-league']
}
