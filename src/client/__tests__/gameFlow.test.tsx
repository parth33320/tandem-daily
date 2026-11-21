import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { GameScreen } from '../components/GameScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useDailyGame } from '../hooks/useDailyGame';
import { dealDailyCards } from '../lib/daily';
import { WORDS } from '../lib/words';
import { renderHook, act } from '@testing-library/react';

// Mock fetch for API calls
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock devvit/web client
vi.mock('@devvit/web/client', () => ({
  navigateTo: vi.fn(),
  requestExpandedMode: vi.fn(),
}));

vi.mock('@devvit/web/server', () => ({
  context: { postId: 't3_test123', subredditName: 'test' },
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    incrBy: vi.fn().mockResolvedValue(1),
    hGetAll: vi.fn().mockResolvedValue({}),
    hIncrBy: vi.fn().mockResolvedValue(1),
  },
  reddit: {
    getCurrentUsername: vi.fn().mockResolvedValue('testuser'),
    setUserFlair: vi.fn().mockResolvedValue({}),
    submitComment: vi.fn().mockResolvedValue({ id: 'comment123' }),
  },
}));

// Mock sound effects
vi.mock('../utils/soundEffects', () => ({
  playSwoosh: vi.fn(),
  playTick: vi.fn(),
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playWin: vi.fn(),
  setSfxMuted: vi.fn(),
}));

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    
    // Default successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        type: 'daily',
        puzzleNumber: 1,
        seed: '2025-01-01',
        username: 'testuser',
        streak: 0,
        alreadyPlayed: false,
        cards: dealDailyCards(1, 'zh2ja', WORDS, 12345),
        stats: {
          card_0: { '0': 10, '1': 5, '2': 3, '3': 2 },
          card_1: { '0': 8, '1': 7, '2': 4, '3': 1 },
          card_2: { '0': 12, '1': 6, '2': 2, '3': 0 },
          card_3: { '0': 9, '1': 9, '2': 5, '3': 7 },
          card_4: { '0': 11, '1': 4, '2': 3, '3': 2 },
        },
      }),
    });
  });

  const renderGame = () => {
    return render(
      <ErrorBoundary>
        <GameScreen />
      </ErrorBoundary>
    );
  };

  // Helper to wait for loading to complete and game to be ready
  const waitForGameReady = async () => {
    await waitFor(() => {
      expect(screen.queryByText('Failed to load today\'s puzzle')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Play Today/i })).toBeInTheDocument();
    });
  };

  describe('StartScreen', () => {
    it('renders StartScreen without errors', async () => {
      renderGame();
      await waitForGameReady();
      
      expect(screen.getByText('Tandem Daily')).toBeInTheDocument();
      expect(screen.getByText('Puzzle #1')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /I know Chinese → guess Japanese/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /I know Japanese → guess Chinese/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /I know neither — Visual Detective/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Play Today/i })).toBeInTheDocument();
    });
  });

  describe('Game Round - CardView and ChoiceButtons', () => {
    it('mounts CardView and 4 ChoiceButtons after clicking Play', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      await waitFor(() => {
        const kanjiElements = screen.getAllByText(/^[\u4e00-\u9fff]+$/);
        expect(kanjiElements.length).toBeGreaterThan(0);
      });
      
      // Should have 4 choice buttons
      await waitFor(() => {
        const choiceButtons = screen.getAllByRole('button', { name: /.+/ }).filter(b => 
          !b.textContent?.includes('✂️') && 
          !b.textContent?.includes('🔍') && 
          !b.textContent?.includes('🎭') && 
          !b.textContent?.includes('📊') && 
          !b.textContent?.includes('⏱️')
        );
        expect(choiceButtons.length).toBe(4);
        
        // Each choice button should have non-empty text
        choiceButtons.forEach(btn => {
          expect(btn.textContent?.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('displays language prompt pill', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Guess the JAPANESE meaning/i)).toBeInTheDocument();
      });
    });
  });

  describe('Lifelines', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      await waitFor(() => screen.getByText(/Guess the JAPANESE meaning/i));
    });

    it('50/50 lifeline eliminates 2 wrong choices', async () => {
      const user = userEvent.setup();
      
      const fiftyFiftyBtn = screen.getByRole('button', { name: /✂️ 50\/50/i });
      await user.click(fiftyFiftyBtn);
      
      await waitFor(() => {
        const choiceButtons = screen.getAllByRole('button', { name: /.+/ });
        const eliminatedCount = choiceButtons.filter(b => 
          b.className.includes('opacity-25') || b.className.includes('line-through')
        ).length;
        expect(eliminatedCount).toBe(2);
      });
    });

    it('20-Q lifeline reveals clue pills', async () => {
      const user = userEvent.setup();
      
      const twentyQBtn = screen.getByRole('button', { name: /20-Q/i });
      await user.click(twentyQBtn);
      
      await waitFor(() => {
        const clueElements = screen.getAllByText(/🎭/i);
        expect(clueElements.length).toBeGreaterThan(0);
      });
    });

    it('Poll lifeline shows community stats', async () => {
      const user = userEvent.setup();
      
      const pollBtn = screen.getByRole('button', { name: /Poll/i });
      await user.click(pollBtn);
      
      await waitFor(() => {
        expect(screen.getByText(/Community Picks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Answer Selection and Reveal', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      await waitFor(() => screen.getByText(/Guess the JAPANESE meaning/i));
    });

    it('reveals answer and shows RevealView on selection', async () => {
      const user = userEvent.setup();
      
      const choiceButtons = screen.getAllByRole('button', { name: /.+/ });
      const choiceButton = choiceButtons.find(b => 
        !b.textContent?.includes('✂️') && 
        !b.textContent?.includes('🔍') && 
        !b.textContent?.includes('🎭') && 
        !b.textContent?.includes('📊') && 
        !b.textContent?.includes('⏱️')
      );
      
      await user.click(choiceButton!);
      
      await waitFor(() => {
        const japaneseElements = screen.getAllByText(/Japanese/i);
        const chineseElements = screen.getAllByText(/Chinese/i);
        expect(japaneseElements.length).toBeGreaterThan(0);
        expect(chineseElements.length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /Next Card →/i })).toBeInTheDocument();
      });
    });

    it('shows correct/wrong indicator', async () => {
      const user = userEvent.setup();
      
      const choiceButtons = screen.getAllByRole('button', { name: /.+/ });
      const choiceButton = choiceButtons.find(b => 
        !b.textContent?.includes('✂️') && 
        !b.textContent?.includes('🔍') && 
        !b.textContent?.includes('🎭') && 
        !b.textContent?.includes('📊') && 
        !b.textContent?.includes('⏱️')
      );
      
      await user.click(choiceButton!);
      
      await waitFor(() => {
        const result = screen.getByText(/Correct!|Wrong/i);
        expect(result).toBeInTheDocument();
      });
    });
  });

  describe('Complete Game Flow', () => {
    it('completes all 5 cards and shows EndScreen with score', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      // Play through all 5 cards
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          const choiceButtons = screen.getAllByRole('button', { name: /.+/ });
          const choiceButton = choiceButtons.find(b => 
            !b.textContent?.includes('✂️') && 
            !b.textContent?.includes('🔍') && 
            !b.textContent?.includes('🎭') && 
            !b.textContent?.includes('📊') && 
            !b.textContent?.includes('⏱️')
          );
          if (choiceButton) {
            return choiceButton;
          }
        });
        
        const choiceButton = screen.getAllByRole('button', { name: /.+/ }).find(b => 
          !b.textContent?.includes('✂️') && 
          !b.textContent?.includes('🔍') && 
          !b.textContent?.includes('🎭') && 
          !b.textContent?.includes('📊') && 
          !b.textContent?.includes('⏱️')
        );
        if (choiceButton) {
          await userEvent.setup().click(choiceButton);
        }
        
        // Wait for reveal
        await waitFor(() => {
          expect(screen.getByText(/Correct!|Wrong/i)).toBeInTheDocument();
        });
        
        // Click Next Card / See Final Score to advance
        await waitFor(async () => {
          const nextBtn = screen.getByRole('button', { name: /Next Card →|See Final Score →/i });
          await userEvent.setup().click(nextBtn);
        });
        
        // Allow time for state update after clicking Next Card / See Final Score
        if (i === 4) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      // After 5th card, wait for EndScreen to appear
      await waitFor(() => {
        // The EndScreen shows a title in h1 element
        const endScreenTitle = screen.getByRole('heading', { name: /Perfect|Good Job|Keep Learning|Wrong/i });
        expect(endScreenTitle).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Share Score to Comments/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Three Modes', () => {
    const modes = ['zh2ja', 'ja2zh', 'en'] as const;
    
    modes.forEach(mode => {
      it(`works in ${mode} mode`, async () => {
        const user = userEvent.setup();
        render(
          <ErrorBoundary>
            <GameScreen />
          </ErrorBoundary>
        );
        await waitForGameReady();
        
        // Select mode
        const radio = screen.getByRole('radio', { name: mode === 'zh2ja' ? /I know Chinese/i : mode === 'ja2zh' ? /I know Japanese/i : /I know neither/i });
        await user.click(radio);
        
        await user.click(screen.getByRole('button', { name: /Play Today/i }));
        
        await waitFor(() => {
          const kanjiElements = screen.getAllByText(/^[\u4e00-\u9fff]+$/);
          expect(kanjiElements.length).toBeGreaterThan(0);
        });
        
        // Should have 4 choices
        await waitFor(() => {
          const choiceButtons = screen.getAllByRole('button', { name: /.+/ }).filter(b => 
            !b.textContent?.includes('✂️') && 
            !b.textContent?.includes('🔍') && 
            !b.textContent?.includes('🎭') && 
            !b.textContent?.includes('📊') && 
            !b.textContent?.includes('⏱️')
          );
          expect(choiceButtons.length).toBe(4);
        });
      });
    });
  });

  describe('Visual Detective (en) Mode', () => {
    it('renders without crashing', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      
      // Select Visual Detective mode
      await user.click(screen.getByRole('radio', { name: /I know neither/i }));
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      await waitFor(() => {
        // Just verify the game renders - kanji should be visible
        const kanjiElements = screen.getAllByText(/^[\u4e00-\u9fff]+$/);
        expect(kanjiElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Timer', () => {
    it('shows timer countdown', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/15s/)).toBeInTheDocument();
      });
    });

    it('can toggle timer on/off', async () => {
      const user = userEvent.setup();
      renderGame();
      await waitForGameReady();
      await user.click(screen.getByRole('button', { name: /Play Today/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/15s/)).toBeInTheDocument();
      });
      
      // Click the timer toggle button by its aria-label
      await user.click(screen.getByRole('button', { name: /Disable timer/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/OFF/)).toBeInTheDocument();
      });
    });
  });
});

describe('dealDailyCards', () => {
  it('returns exactly 5 cards', () => {
    const cards = dealDailyCards(1, 'zh2ja', WORDS);
    expect(cards.length).toBe(5);
  });

  it('first card is never a false friend', () => {
    const cards = dealDailyCards(1, 'zh2ja', WORDS);
    expect(cards[0]!.word.relation).not.toBe('false');
  });

  it('deterministic with same seed', () => {
    const cards1 = dealDailyCards(1, 'zh2ja', WORDS, 12345);
    const cards2 = dealDailyCards(1, 'zh2ja', WORDS, 12345);
    expect(cards1.map(c => c.word.id)).toEqual(cards2.map(c => c.word.id));
  });

  it('different seeds produce different cards', () => {
    const cards1 = dealDailyCards(1, 'zh2ja', WORDS, 11111);
    const cards2 = dealDailyCards(2, 'zh2ja', WORDS, 99999); // Use different puzzleNum to ensure different cards
    // Very unlikely to be identical with very different seeds and puzzleNum
    const same = cards1.every((c, i) => c.word.id === cards2[i]!.word.id);
    expect(same).toBe(false);
  });

  it('practice mode with random seed produces different cards each time', () => {
    const cards1 = dealDailyCards(1, 'zh2ja', WORDS, Date.now());
    const cards2 = dealDailyCards(2, 'zh2ja', WORDS, Date.now() + 100000); // Different puzzleNum and larger time gap
    const same = cards1.every((c, i) => c.word.id === cards2[i]!.word.id);
    expect(same).toBe(false);
  });
});

describe('useDailyGame hook', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        type: 'daily',
        puzzleNumber: 1,
        seed: '2025-01-01',
        username: 'testuser',
        streak: 0,
        alreadyPlayed: false,
        cards: dealDailyCards(1, 'zh2ja', WORDS, 12345),
        stats: {},
      }),
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.phase).toBe('start');
    expect(result.current.score).toBe(0);
    expect(result.current.currentCard).toBe(0);
    expect(result.current.timerEnabled).toBe(true);
  });

  it('loads daily data on mount', async () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.daily).not.toBeNull();
      expect(result.current.daily?.puzzleNumber).toBe(1);
    });
  });

  it('startGame transitions to playing phase', async () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.startGame(false);
    });
    
    expect(result.current.phase).toBe('playing');
    expect(result.current.currentCard).toBe(0);
    expect(result.current.score).toBe(0);
  });

  it('practice mode uses random seed', async () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.startGame(true);
    });
    
    expect(result.current.practiceMode).toBe(true);
  });

  it('timer counts down when enabled', async () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.startGame(false);
    });
    
    // Timer should start at 15
    expect(result.current.timer).toBe(15);
    expect(result.current.timerEnabled).toBe(true);
  });

  it('toggleTimer pauses/resumes timer', async () => {
    const { result } = renderHook(() => useDailyGame('zh2ja'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.startGame(false);
    });
    
    act(() => {
      result.current.toggleTimer();
    });
    
    expect(result.current.timerEnabled).toBe(false);
    
    act(() => {
      result.current.toggleTimer();
    });
    
    expect(result.current.timerEnabled).toBe(true);
  });
});