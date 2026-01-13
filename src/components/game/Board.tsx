'use client'

import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react'
import { Board as BoardType, Position, Tile as TileType } from '@/lib/game/logic'
import Tile from './Tile'

interface BoardProps {
  board: BoardType
  onTileClick: (position: Position, tile: TileType | null) => void
  selectedPosition: Position | null
  highlightPath: Position[]
  isProcessing: boolean
}

interface TilePosition {
  x: number
  y: number
}

export default function Board({ board, onTileClick, selectedPosition, highlightPath, isProcessing }: BoardProps) {
  const [shake, setShake] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilePositions, setTilePositions] = useState<Map<string, TilePosition>>(new Map())
  const animationFrameRef = useRef<number>()
  const isMountedRef = useRef<boolean>(true)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // 优化：使用 memoized 计算路径点集合，避免重复计算
  const pathSet = useMemo(() => {
    return new Set(highlightPath.map(pos => `${pos.row}-${pos.col}`))
  }, [highlightPath])

  // 优化：比较两个 Map 是否相等，避免不必要的状态更新
  const areMapsEqual = useCallback((map1: Map<string, TilePosition>, map2: Map<string, TilePosition>): boolean => {
    if (map1.size !== map2.size) return false
    for (const [key, value] of map1) {
      const other = map2.get(key)
      if (!other || other.x !== value.x || other.y !== value.y) return false
    }
    return true
  }, [])

  // 优化：只在路径变化时计算位置，使用 requestAnimationFrame
  const updateTilePositions = useCallback(() => {
    const container = containerRef.current
    if (!container || highlightPath.length === 0) return

    const grid = container.querySelector('.grid-container')
    if (!grid) return

    // 清除之前的动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // 使用 requestAnimationFrame 确保在浏览器绘制前更新
    animationFrameRef.current = requestAnimationFrame(() => {
      // 检查组件是否仍挂载（防止竞态条件）
      if (!isMountedRef.current || !containerRef.current) return

      const tiles = grid.querySelectorAll('[data-tile]')
      const newPositions = new Map<string, TilePosition>()

      tiles.forEach((tile) => {
        const row = tile.getAttribute('data-row')
        const col = tile.getAttribute('data-col')

        if (row && col) {
          const key = `${row}-${col}`
          // 只计算路径上的方块位置，优化性能
          if (pathSet.has(key)) {
            const rect = tile.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            const x = rect.left - containerRect.left + rect.width / 2
            const y = rect.top - containerRect.top + rect.height / 2
            newPositions.set(key, { x, y })
          }
        }
      })

      // 只有位置真正改变时才更新状态，避免不必要的渲染
      if (newPositions.size > 0 && !areMapsEqual(newPositions, tilePositions)) {
        setTilePositions(newPositions)
      }
    })
  }, [highlightPath, pathSet, tilePositions, areMapsEqual])

  // 优化：使用 useLayoutEffect 替代 useEffect + setTimeout，获得更可靠的 DOM 时序
  useLayoutEffect(() => {
    if (highlightPath.length === 0) {
      setTilePositions(new Map())
      return
    }

    // 立即更新位置，无需延迟
    updateTilePositions()
  }, [highlightPath, updateTilePositions])

  // 优化：抖动动画逻辑
  useEffect(() => {
    if (highlightPath.length === 0) {
      setShake(false)
      return
    }

    const shakeTimer = setTimeout(() => {
      // 检查组件是否仍挂载
      if (!isMountedRef.current) return

      setShake(true)
      const resetTimer = setTimeout(() => {
        if (isMountedRef.current) {
          setShake(false)
        }
      }, 300)

      return () => clearTimeout(resetTimer)
    }, 100)

    return () => clearTimeout(shakeTimer)
  }, [highlightPath])

  // 优化：生成 SVG 路径，添加缓存
  const generatePath = useCallback((): string | null => {
    if (highlightPath.length < 2 || tilePositions.size === 0) return null

    const pathPoints = highlightPath
      .map(pos => tilePositions.get(`${pos.row}-${pos.col}`))
      .filter((pos): pos is TilePosition => pos !== undefined)

    if (pathPoints.length < 2) return null

    // 使用数组拼接优化字符串构建
    const pathCommands = [
      `M ${pathPoints[0].x} ${pathPoints[0].y}`,
      ...pathPoints.slice(1).map(p => `L ${p.x} ${p.y}`)
    ]

    return pathCommands.join(' ')
  }, [highlightPath, tilePositions])

  // 优化：选中状态判断
  const isSelected = useCallback((row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }, [selectedPosition])

  // 优化：路径高亮判断
  const isPathHighlighted = useCallback((row: number, col: number) => {
    return pathSet.has(`${row}-${col}`)
  }, [pathSet])

  // 优化：添加 ResizeObserver 支持，处理棋盘大小变化
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      if (highlightPath.length > 0) {
        updateTilePositions()
      }
    }

    // 创建 ResizeObserver
    resizeObserverRef.current = new ResizeObserver(handleResize)
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [highlightPath, updateTilePositions])

  // 优化：组件生命周期管理
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      // 组件卸载时清理所有资源
      isMountedRef.current = false

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [])

  // 生成 SVG 路径数据
  const pathData = generatePath()

  return (
    <div ref={containerRef} className="relative inline-block p-4 bg-gray-800 rounded-lg">
      {/*
        SVG 连接线层 - 只在有路径时渲染
        使用双层路径实现发光效果：
        - 外层：较宽，半透明，营造发光感
        - 内层：较细，高亮，显示实际路径
      */}
      {pathData && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          role="img"
          aria-label={`连接路径：${highlightPath.length} 个方块`}
        >
          {/* 发光层 - 较宽，半透明 */}
          <path
            d={pathData}
            stroke="#86efac"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          {/* 主路径层 - 较细，高亮 */}
          <path
            d={pathData}
            stroke="#4ade80"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </svg>
      )}

      {/* 方块网格层 */}
      <div
        className="grid gap-1 grid-container"
        style={{
          gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
          gap: '4px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const isPath = isPathHighlighted(rowIndex, colIndex)
            const isCurrentSelected = isSelected(rowIndex, colIndex)
            const shouldShake = shake && isPath

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-tile
                data-row={rowIndex}
                data-col={colIndex}
                onClick={() => !isProcessing && onTileClick({ row: rowIndex, col: colIndex }, tile)}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                  rounded-lg cursor-pointer transition-all duration-200
                  flex items-center justify-center relative
                  ${isCurrentSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}
                  ${isPath ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}
                  ${shouldShake ? 'animate-bounce' : ''}
                  ${isProcessing ? 'cursor-wait opacity-75' : ''}
                `}
              >
                {tile && <Tile type={tile.type} />}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}