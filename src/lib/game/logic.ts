// 游戏棋盘类型定义
export interface Position {
  row: number
  col: number
}

export interface Tile {
  type: number
  id: number
  position: Position
}

export type Board = (Tile | null)[][]

export interface GameConfig {
  size: number
  tileTypes: number
  difficulty: 'easy' | 'medium' | 'hard'
}

// 生成随机棋盘
export function generateBoard(size: number, tileTypes: number): Board {
  const totalTiles = size * size
  const pairsNeeded = totalTiles / 2
  const tiles: Tile[] = []

  // 创建配对的方块
  for (let i = 0; i < pairsNeeded; i++) {
    const type = i % tileTypes
    const tile1: Tile = {
      type,
      id: i * 2,
      position: { row: 0, col: 0 },
    }
    const tile2: Tile = {
      type,
      id: i * 2 + 1,
      position: { row: 0, col: 0 },
    }
    tiles.push(tile1, tile2)
  }

  // 随机打乱
  shuffleArray(tiles)

  // 填充到棋盘
  const board: Board = Array(size).fill(null).map(() => Array(size).fill(null))

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j
      if (index < tiles.length) {
        tiles[index].position = { row: i, col: j }
        board[i][j] = tiles[index]
      }
    }
  }

  return board
}

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// 检查两个方块是否可以连接（支持直线、一个拐点、两个拐点）
export function canConnect(board: Board, start: Position, end: Position): Position[] | null {
  const startTile = board[start.row]?.[start.col]
  const endTile = board[end.row]?.[end.col]

  if (!startTile || !endTile) return null
  if (startTile.type !== endTile.type) return null
  if (start.row === end.row && start.col === end.col) return null

  // 1. 直线连接
  const directPath = getDirectPath(board, start, end)
  if (directPath) return directPath

  // 2. 一个拐点连接
  const oneTurnPath = getOneTurnPath(board, start, end)
  if (oneTurnPath) return oneTurnPath

  // 3. 两个拐点连接
  const twoTurnPath = getTwoTurnPath(board, start, end)
  if (twoTurnPath) return twoTurnPath

  return null
}

// 直线连接检测
function getDirectPath(board: Board, start: Position, end: Position): Position[] | null {
  if (start.row === end.row) {
    // 同一行
    const minCol = Math.min(start.col, end.col)
    const maxCol = Math.max(start.col, end.col)
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[start.row][col] !== null) return null
    }
    return [start, end]
  }

  if (start.col === end.col) {
    // 同一列
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][start.col] !== null) return null
    }
    return [start, end]
  }

  return null
}

// 一个拐点连接检测
function getOneTurnPath(board: Board, start: Position, end: Position): Position[] | null {
  // 尝试两个可能的拐点
  const turn1: Position = { row: start.row, col: end.col }
  const turn2: Position = { row: end.row, col: start.col }

  // 检查拐点1
  if (isPositionEmpty(board, turn1)) {
    const path1 = getDirectPath(board, start, turn1)
    const path2 = getDirectPath(board, turn1, end)
    if (path1 && path2) {
      return [start, turn1, end]
    }
  }

  // 检查拐点2
  if (isPositionEmpty(board, turn2)) {
    const path1 = getDirectPath(board, start, turn2)
    const path2 = getDirectPath(board, turn2, end)
    if (path1 && path2) {
      return [start, turn2, end]
    }
  }

  return null
}

// 两个拐点连接检测
function getTwoTurnPath(board: Board, start: Position, end: Position): Position[] | null {
  // 扫描同一行的空位置作为可能的中间点
  for (let col = 0; col < board[0].length; col++) {
    if (col === start.col || col === end.col) continue

    const mid1: Position = { row: start.row, col }
    const mid2: Position = { row: end.row, col }

    if (isPositionEmpty(board, mid1) && isPositionEmpty(board, mid2)) {
      const path1 = getDirectPath(board, start, mid1)
      const path2 = getDirectPath(board, mid1, mid2)
      const path3 = getDirectPath(board, mid2, end)

      if (path1 && path2 && path3) {
        return [start, mid1, mid2, end]
      }
    }
  }

  // 扫描同一列的空位置作为可能的中间点
  for (let row = 0; row < board.length; row++) {
    if (row === start.row || row === end.row) continue

    const mid1: Position = { row, col: start.col }
    const mid2: Position = { row, col: end.col }

    if (isPositionEmpty(board, mid1) && isPositionEmpty(board, mid2)) {
      const path1 = getDirectPath(board, start, mid1)
      const path2 = getDirectPath(board, mid1, mid2)
      const path3 = getDirectPath(board, mid2, end)

      if (path1 && path2 && path3) {
        return [start, mid1, mid2, end]
      }
    }
  }

  return null
}

// 检查位置是否为空（包括边界外）
function isPositionEmpty(board: Board, pos: Position): boolean {
  if (pos.row < 0 || pos.row >= board.length || pos.col < 0 || pos.col >= board[0].length) {
    return true // 边界外视为空
  }
  return board[pos.row][pos.col] === null
}

// 移除方块
export function removeTiles(board: Board, positions: Position[]): Board {
  const newBoard = board.map(row => [...row])
  positions.forEach(pos => {
    if (newBoard[pos.row] && newBoard[pos.row][pos.col]) {
      newBoard[pos.row][pos.col] = null
    }
  })
  return newBoard
}

// 检查游戏是否完成
export function isGameCompleted(board: Board): boolean {
  for (let row of board) {
    for (let tile of row) {
      if (tile !== null) return false
    }
  }
  return true
}

// 检查是否还有可消除的方块
export function hasPossibleMoves(board: Board): boolean {
  const size = board.length
  const tiles: Position[] = []

  // 收集所有非空方块
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] !== null) {
        tiles.push({ row: i, col: j })
      }
    }
  }

  // 检查是否有可配对的方块
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const tile1 = board[tiles[i].row][tiles[i].col]
      const tile2 = board[tiles[j].row][tiles[j].col]

      if (tile1 && tile2 && tile1.type === tile2.type) {
        if (canConnect(board, tiles[i], tiles[j])) {
          return true
        }
      }
    }
  }

  return false
}

// 重新洗牌（当没有可消除方块时）
export function shuffleBoard(board: Board): Board {
  const size = board.length
  const tiles: Tile[] = []

  // 收集所有非空方块
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] !== null) {
        tiles.push({ ...board[i][j]! })
      }
    }
  }

  // 重新打乱
  shuffleArray(tiles)

  // 重新填充棋盘
  const newBoard: Board = Array(size).fill(null).map(() => Array(size).fill(null))
  let index = 0

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (index < tiles.length) {
        tiles[index].position = { row: i, col: j }
        newBoard[i][j] = tiles[index]
        index++
      }
    }
  }

  return newBoard
}