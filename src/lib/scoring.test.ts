import { describe, it, expect } from 'vitest';
import { calculateScore } from './scoring';

const defaultRules = {
  exactScorePoints: 5,
  outcomePoints: 3,
  oneTeamScorePoints: 1,
  bonusPoints: 0,
};

describe('calculateScore', () => {
  it('da puntos máximos por resultado exacto', () => {
    const result = calculateScore(2, 1, 2, 1, defaultRules);
    expect(result.points).toBe(5);
    expect(result.hitExactScore).toBe(true);
    expect(result.hitOutcome).toBe(true);
    expect(result.reason).toContain('Resultado exacto');
  });

  it('da puntos por acertar ganador', () => {
    const result = calculateScore(2, 1, 3, 0, defaultRules);
    expect(result.points).toBe(3);
    expect(result.hitExactScore).toBe(false);
    expect(result.hitOutcome).toBe(true);
    expect(result.reason).toContain('Ganador');
  });

  it('da puntos por acertar empate', () => {
    const result = calculateScore(1, 1, 2, 2, defaultRules);
    expect(result.points).toBe(3);
    expect(result.hitOutcome).toBe(true);
    expect(result.reason).toContain('Empate');
  });

  it('da puntos por acertar score de un equipo', () => {
    const result = calculateScore(2, 1, 2, 0, defaultRules);
    expect(result.points).toBe(1);
    expect(result.hitOneTeamScore).toBe(true);
    expect(result.reason).toContain('local');
  });

  it('da 0 puntos cuando no acierta nada', () => {
    const result = calculateScore(2, 1, 0, 0, defaultRules);
    expect(result.points).toBe(0);
    expect(result.hitExactScore).toBe(false);
    expect(result.hitOutcome).toBe(false);
    expect(result.hitOneTeamScore).toBe(false);
  });

  it('retorna sin pronostico cuando prediction es null (undefined)', () => {
    const result = calculateScore(undefined, undefined, 0, 0, defaultRules);
    expect(result.points).toBe(0);
    expect(result.reason).toContain('Sin pronóstico');
  });

  it('aplica bonus cuando hay resultado exacto', () => {
    const rules = { ...defaultRules, bonusPoints: 2 };
    const result = calculateScore(2, 1, 2, 1, rules);
    expect(result.points).toBe(7); // 5 + 2 bonus
  });

  it('should score exact draw correctly', () => {
    const result = calculateScore(0, 0, 0, 0, defaultRules);
    expect(result.points).toBe(5);
    expect(result.hitExactScore).toBe(true);
  });

  it('should score exact away win correctly', () => {
    const result = calculateScore(1, 2, 1, 2, defaultRules);
    expect(result.points).toBe(5);
    expect(result.hitOutcome).toBe(true);
  });

  it('should score one-team-hit without outcome', () => {
    const result = calculateScore(0, 2, 0, 1, defaultRules);
    expect(result.points).toBe(1);
    expect(result.hitOneTeamScore).toBe(true);
    expect(result.hitOutcome).toBe(false);
  });

  it('should score outcome hit without exact score', () => {
    const result = calculateScore(3, 1, 2, 0, defaultRules);
    expect(result.points).toBe(3);
    expect(result.hitExactScore).toBe(false);
    expect(result.hitOutcome).toBe(true);
  });

  it('should return zero for missing prediction', () => {
    const result = calculateScore(undefined, undefined, 3, 2, defaultRules);
    expect(result.points).toBe(0);
    expect(result.reason).toContain('Sin pronóstico');
  });

  it('should apply bonus only on exact score', () => {
    const rules = { ...defaultRules, bonusPoints: 4 };
    const exact = calculateScore(1, 0, 1, 0, rules);
    const oneTeamOnly = calculateScore(2, 0, 1, 0, rules);
    expect(exact.points).toBe(9);
    expect(oneTeamOnly.points).toBe(1);
  });

  it('should handle zero-zero actual result correctly', () => {
    const outcome = calculateScore(1, 1, 0, 0, defaultRules);
    expect(outcome.points).toBe(3);
    expect(outcome.reason).toContain('Empate');
  });

  describe('late penalty', () => {
    it('aplica penalización del 50% truncando', () => {
      const result = calculateScore(2, 1, 2, 1, defaultRules, 50);
      // 5 pts exacto - floor(5*50/100=2.5)=2 → 3 pts final
      expect(result.points).toBe(3);
    });

    it('aplica penalización 0% sin alterar puntos', () => {
      const result = calculateScore(2, 1, 2, 1, defaultRules, 0);
      expect(result.points).toBe(5);
    });

    it('sin penalización si no se pasa latePenaltyPercent', () => {
      const result = calculateScore(2, 1, 2, 1, defaultRules);
      expect(result.points).toBe(5);
    });

    it('penalización 25% sobre resultado exacto con bonus', () => {
      const rules = { ...defaultRules, bonusPoints: 2 };
      const result = calculateScore(1, 0, 1, 0, rules, 25);
      // base = 5+2 = 7, penalty = floor(7*25/100) = floor(1.75) = 1, final = 6
      expect(result.points).toBe(6);
    });

    it('penalización no afecta cuando hay 0%', () => {
      const result = calculateScore(5, 0, 0, 0, defaultRules, 0);
      expect(result.points).toBe(1); // oneTeamScore = 1, penalty 0% no altera
    });

    it('incluye indicación de tardío en reason', () => {
      const result = calculateScore(1, 0, 1, 0, defaultRules, 50);
      expect(result.reason).toContain('tardío');
    });
  });
});
