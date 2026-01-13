'use client'

import { useState, useEffect, useCallback } from 'react'
import { Board as BoardType, Position, Tile as TileType } from '@/lib/game/logic'
import Tile from './Tile'

interface BoardProps {
  board: BoardType
  onTileClick: (position: Position, tile: TileType | null) => void
  selectedPosition: Position | null
  highlightPath: Position[]
  isProcessing: boolean
}

export default function Board({ board, onTileClick, selectedPosition, highlightPath, isProcessing }: BoardProps) {
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (highlightPath.length > 0) {
      const timer = setTimeout(() => {
        setShake(true)
        setTimeout(() => setShake(false), 300)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightPath])

  const isHighlighted = (row: number, col: number) => {
    return highlightPath.some(pos => pos.row === row && pos.col === col)
  }

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  return (
    <div className="inline-block p-4 bg-gray-800 rounded-lg">
      <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
        gap: '4px'
      }}>
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => !isProcessing && onTileClick({ row: rowIndex, col: colIndex }, tile)}
              className={`
                w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                rounded-lg cursor-pointer transition-all duration-200
                flex items-center justify-center
                ${isSelected(rowIndex, colIndex) ? 'ring-4 ring-yellow-400 scale-110' : ''}
                ${isHighlighted(rowIndex, colIndex) ? 'bg-green-400 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}
                ${shake && isHighlighted(rowIndex, colIndex) ? 'animate-bounce' : ''}
                ${isProcessing ? 'cursor-wait opacity-75' : ''}
              `}
            >
              {tile && <Tile type={tile.type} />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}