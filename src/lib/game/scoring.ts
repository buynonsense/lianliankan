import { GameConfig } from './logic'

// 常量配置
const GAME_CONSTANTS = {
  MAX_TIME: 180, // 3分钟（秒）
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
  } as const,
  MIN_TIME_PER_TILE: 0.3, // 秒/方块
  DIFFICULTY_MIN_TIMES: {
    easy: 5,
    medium: 10,
    hard: 15,
  } as const,
  DEBUG: process.env.NODE_ENV === 'development',
} as const

// 游戏配置
const GAME_CONFIGS = {
  easy: { size: 6, tileTypes: 8, difficulty: 'easy' as const },
  medium: { size: 8, tileTypes: 12, difficulty: 'medium' as const },
  hard: { size: 10, tileTypes: 16, difficulty: 'hard' as const },
} as const

export interface GameResult {
  timeSeconds: number
  moves: number
  boardSize: number
  difficulty: string
  completed: boolean
}

// 类型守卫
function isValidDifficulty(difficulty: string): difficulty is keyof typeof GAME_CONFIGS {
  return difficulty in GAME_CONFIGS
}

// 调试日志（仅在开发环境）
function debugLog(...args: any[]): void {
  if (GAME_CONSTANTS.DEBUG) {
    console.log('[GameScoring]', ...args)
  }
}

// 计算基础分数（公共逻辑）
function calculateBaseScore(boardSize: number, timeSeconds: number, moves: number): number {
  const baseScore = boardSize * boardSize * 10
  const timeBonus = Math.max(0, GAME_CONSTANTS.MAX_TIME - timeSeconds) * 2
  const optimalMoves = (boardSize * boardSize) / 2

  // 步数奖励：考虑洗牌机制，允许比理论最优少1-2步
  const adjustedOptimalMoves = optimalMoves - 1
  const moveBonus = Math.max(0, adjustedOptimalMoves - moves) * 5

  return baseScore + timeBonus + moveBonus
}

export function calculateScore(result: GameResult): number {
  // 输入验证
  if (!result || typeof result.timeSeconds !== 'number' || typeof result.moves !== 'number') {
    debugLog('无效的输入参数')
    return 0
  }

  const { timeSeconds, moves, boardSize, difficulty, completed } = result

  if (!completed) return 0

  const baseScore = calculateBaseScore(boardSize, timeSeconds, moves)

  // 难度系数
  const multiplier = isValidDifficulty(difficulty)
    ? GAME_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty]
    : 1.0

  const totalScore = Math.round(baseScore * multiplier)
  return Math.max(totalScore, 0)
}

// 获取游戏配置
export function getGameConfig(difficulty: string): GameConfig {
  if (!isValidDifficulty(difficulty)) {
    debugLog('无效的难度:', difficulty)
    return GAME_CONFIGS.easy // 安全降级
  }

  return GAME_CONFIGS[difficulty]
}

// 验证游戏结果（防作弊）
export function validateGameResult(
  result: GameResult,
  expectedConfig: GameConfig
): boolean {
  // 输入验证
  if (!result || typeof result.timeSeconds !== 'number' || typeof result.moves !== 'number') {
    debugLog('无效的输入参数')
    return false
  }

  const { timeSeconds, moves, boardSize, difficulty } = result

  debugLog('开始验证', {
    timeSeconds,
    moves,
    boardSize,
    difficulty,
    expectedSize: expectedConfig.size,
  })

  // 1. 检查棋盘大小是否匹配
  if (boardSize !== expectedConfig.size) {
    debugLog('❌ 棋盘大小不匹配', { actual: boardSize, expected: expectedConfig.size })
    return false
  }

  // 2. 检查难度是否有效
  if (!isValidDifficulty(difficulty)) {
    debugLog('❌ 无效的难度', { difficulty })
    return false
  }

  // 3. 检查时间是否合理
  const baseMinTime = boardSize * boardSize * GAME_CONSTANTS.MIN_TIME_PER_TILE
  const difficultyMinTime = GAME_CONSTANTS.DIFFICULTY_MIN_TIMES[difficulty]
  const minTime = Math.max(baseMinTime, difficultyMinTime)

  if (timeSeconds < minTime) {
    debugLog('❌ 时间太短', { actual: timeSeconds, minRequired: minTime })
    return false
  }

  // 4. 检查步数是否合理
  // 理论最少步数 = 方块对数，但由于洗牌机制，实际可能更少
  // 允许比理论最少步数少1-2步（考虑洗牌带来的优化）
  const theoreticalMinMoves = boardSize * boardSize / 2
  const minMoves = Math.max(1, theoreticalMinMoves - 2) // 允许2步的容错
  const maxMoves = boardSize * boardSize * 2

  if (moves < minMoves || moves > maxMoves) {
    debugLog('❌ 步数不合理', {
      actual: moves,
      theoreticalMin: theoreticalMinMoves,
      allowedMin: minMoves,
      max: maxMoves
    })
    return false
  }

  // 5. 额外检查：时间不应过长（防止挂机）
  const maxReasonableTime = GAME_CONSTANTS.MAX_TIME * 1.5 // 4.5分钟
  if (timeSeconds > maxReasonableTime) {
    debugLog('❌ 时间过长，可能挂机', { actual: timeSeconds, max: maxReasonableTime })
    return false
  }

  debugLog('✅ 验证通过')
  return true
}