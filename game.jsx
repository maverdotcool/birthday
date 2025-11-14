import React, { useState, useEffect } from 'react';
import { Gift, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export default function BobbiPokemonGame() {
  const [gameState, setGameState] = useState('start');
  const [bobbiPos, setBobbiPos] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('down');
  const [presents, setPresents] = useState([]);
  const [openedPresents, setOpenedPresents] = useState(new Set());
  const [message, setMessage] = useState('');
  const [moves, setMoves] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const GRID_SIZE = 30;
  const VIEWPORT_SIZE = 11;
  const PRESENT_COUNT = 12;
  const TILE_SIZE = 48;

  // INSTRUCTIONS: Upload your sprite sheets to a hosting service (Imgur, GitHub, etc.)
  // Then replace the URLs below with your hosted image URLs
  const SPRITE_SHEETS = {
    walk: 'https://i.imgur.com/YOUR_WALK_SHEET.png',  // Replace with your walk sprite sheet URL
    idle: 'https://i.imgur.com/YOUR_IDLE_SHEET.png',  // Replace with your idle sprite sheet URL
  };
  
  const SPRITE_CONFIG = {
    walk: { frames: 5, frameWidth: 32, frameHeight: 28 },
    idle: { frames: 5, frameWidth: 32, frameHeight: 28 },
  };

  useEffect(() => {
    if (gameState === 'playing' && presents.length === 0) {
      initializeGame();
    }
  }, [gameState]);

  // Animation loop for sprite frames
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      const animation = isMoving ? 'walk' : 'idle';
      const frames = SPRITE_CONFIG[animation].frames;
      setCurrentFrame(f => (f + 1) % frames);
    }, isMoving ? 100 : 200); // Faster when walking
    
    return () => clearInterval(interval);
  }, [gameState, isMoving]);

  const initializeGame = () => {
    const newPresents = [];
    const winningIdx = Math.floor(Math.random() * PRESENT_COUNT);
    
    while (newPresents.length < PRESENT_COUNT) {
      const x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      const y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      
      const distance = Math.abs(x - 15) + Math.abs(y - 15);
      if (distance > 3 && !newPresents.some(p => p.x === x && p.y === y)) {
        newPresents.push({ 
          x, 
          y, 
          id: newPresents.length,
          isWinner: newPresents.length === winningIdx 
        });
      }
    }
    
    setPresents(newPresents);
    setMessage('Search the tall grass for presents!');
  };

  const getTileType = (x, y) => {
    if (x < 1 || y < 1 || x >= GRID_SIZE - 1 || y >= GRID_SIZE - 1) {
      return 'tree';
    }
    
    if (presents.some(p => p.x === x && p.y === y)) {
      return 'present';
    }
    
    const grassPattern = (x * 3 + y * 7) % 5;
    return grassPattern === 0 ? 'grass-dark' : 'grass-light';
  };

  const moveBobbi = (dx, dy, newDir) => {
    if (isMoving || gameState !== 'playing') return;
    
    const newX = bobbiPos.x + dx;
    const newY = bobbiPos.y + dy;
    
    if (newX > 0 && newX < GRID_SIZE - 1 && newY > 0 && newY < GRID_SIZE - 1) {
      setIsMoving(true);
      setDirection(newDir);
      setBobbiPos({ x: newX, y: newY });
      setMoves(m => m + 1);
      
      setTimeout(() => setIsMoving(false), 150);
      
      const presentAtPos = presents.find(p => p.x === newX && p.y === newY);
      if (presentAtPos && !openedPresents.has(presentAtPos.id)) {
        setTimeout(() => openPresent(presentAtPos), 200);
      }
    }
  };

  const openPresent = (present) => {
    setOpenedPresents(prev => new Set([...prev, present.id]));
    
    if (present.isWinner) {
      setMessage('🎉 Bobbi found the Apple Gift Card!');
      setTimeout(() => setGameState('won'), 1500);
    } else {
      const remaining = PRESENT_COUNT - openedPresents.size - 1;
      setMessage(`Empty! Keep searching... ${remaining} presents left!`);
    }
  };

  const renderSprite = () => {
    const animation = isMoving ? 'walk' : 'idle';
    const config = SPRITE_CONFIG[animation];
    const spriteSheet = SPRITE_SHEETS[animation];
    
    // Check if sprite sheets are configured
    if (!spriteSheet || spriteSheet.includes('YOUR_')) {
      // Fallback to animated emoji pug
      return (
        <div className="relative">
          <span className="text-4xl" style={{
            display: 'inline-block',
            animation: isMoving ? 'bounce 0.3s ease-in-out infinite' : 'none'
          }}>
            🐕
          </span>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      );
    }
    
    // Render sprite sheet animation
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
        }}
      >
        <div
          style={{
            width: `${config.frameWidth}px`,
            height: `${config.frameHeight}px`,
            backgroundImage: `url(${spriteSheet})`,
            backgroundPosition: `-${currentFrame * config.frameWidth}px 0px`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            transform: 'scale(1.7)',
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveBobbi(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          moveBobbi(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveBobbi(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveBobbi(1, 0, 'right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bobbiPos, gameState, isMoving]);

  const startGame = () => {
    setGameState('playing');
    setBobbiPos({ x: 15, y: 15 });
    setPresents([]);
    setOpenedPresents(new Set());
    setMoves(0);
    setDirection('down');
    setMessage('');
    setCurrentFrame(0);
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #1a1a2e 0px, #1a1a2e 2px, #16213e 2px, #16213e 4px)'
      }}>
        <div className="bg-gray-800 border-8 border-gray-700 rounded-lg p-8 max-w-3xl text-center shadow-2xl" style={{
          boxShadow: '0 0 0 4px #4a5568, 0 0 20px rgba(0,0,0,0.8)'
        }}>
          <div className="text-6xl mb-6">🐕</div>
          <h1 className="text-5xl font-bold mb-2 text-yellow-400" style={{
            fontFamily: 'monospace',
            textShadow: '4px 4px 0px #000, -2px -2px 0px #fbbf24'
          }}>
            BOBBI'S QUEST
          </h1>
          <p className="text-2xl text-green-400 mb-8 font-mono">Find the Gift Card!</p>
          
          <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-400 font-mono text-xl mb-4">🐕 BOBBI THE PUG</h3>
            <p className="text-gray-300 font-mono text-sm">
              Your adorable pug companion is ready for adventure!
            </p>
          </div>
          
          <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-6 mb-8 text-left">
            <p className="text-white font-mono text-lg mb-4">📜 YOUR MISSION:</p>
            <div className="text-green-300 font-mono space-y-2">
              <p>→ Guide Bobbi through tall grass</p>
              <p>→ Find {PRESENT_COUNT} hidden presents</p>
              <p>→ Only ONE has the Apple Gift Card!</p>
              <p>→ Use ARROW KEYS or WASD to move</p>
              <p>→ Camera follows Bobbi automatically</p>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 text-2xl font-bold border-4 border-green-800 hover:border-green-900 transition-all font-mono shadow-lg"
            style={{
              boxShadow: '4px 4px 0px #065f46, -2px -2px 0px #10b981'
            }}
          >
            ▶ START QUEST
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const viewportStartX = Math.max(0, Math.min(bobbiPos.x - Math.floor(VIEWPORT_SIZE / 2), GRID_SIZE - VIEWPORT_SIZE));
    const viewportStartY = Math.max(0, Math.min(bobbiPos.y - Math.floor(VIEWPORT_SIZE / 2), GRID_SIZE - VIEWPORT_SIZE));

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #0f172a 0px, #0f172a 2px, #1e293b 2px, #1e293b 4px)'
      }}>
        <div className="mb-4 bg-gray-800 border-4 border-gray-600 rounded-lg px-8 py-3 flex gap-8 items-center shadow-lg">
          <div className="text-white font-mono text-xl">
            MOVES: <span className="text-yellow-400 font-bold">{moves}</span>
          </div>
          <div className="text-white font-mono text-xl">
            FOUND: <span className="text-green-400 font-bold">{openedPresents.size}/{PRESENT_COUNT}</span>
          </div>
        </div>

        <div className="bg-gray-800 border-8 border-gray-700 rounded-lg shadow-2xl mb-4" style={{
          boxShadow: '0 0 0 4px #4a5568, 0 0 30px rgba(0,0,0,0.8)'
        }}>
          <div 
            className="relative overflow-hidden"
            style={{
              width: `${VIEWPORT_SIZE * TILE_SIZE}px`,
              height: `${VIEWPORT_SIZE * TILE_SIZE}px`
            }}
          >
            <div 
              className="absolute grid gap-0 transition-transform duration-150"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                imageRendering: 'pixelated',
                transform: `translate(${-viewportStartX * TILE_SIZE}px, ${-viewportStartY * TILE_SIZE}px)`
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                const x = idx % GRID_SIZE;
                const y = Math.floor(idx / GRID_SIZE);
                const tile = getTileType(x, y);
                const isBobbi = bobbiPos.x === x && bobbiPos.y === y;
                const present = presents.find(p => p.x === x && p.y === y);
                const isOpened = present && openedPresents.has(present.id);

                let bgColor = '#86efac';
                if (tile === 'tree') bgColor = '#166534';
                else if (tile === 'grass-dark') bgColor = '#4ade80';
                
                return (
                  <div
                    key={idx}
                    className="relative"
                    style={{
                      backgroundColor: bgColor,
                      width: `${TILE_SIZE}px`,
                      height: `${TILE_SIZE}px`,
                      borderRight: '1px solid rgba(0,0,0,0.1)',
                      borderBottom: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {tile === 'tree' && (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🌲
                      </div>
                    )}
                    
                    {tile === 'present' && !isOpened && (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
                        🎁
                      </div>
                    )}
                    
                    {isBobbi && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 p-1">
                        {renderSprite()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-gray-800 border-4 border-gray-600 rounded-lg px-8 py-4 max-w-xl mb-4">
            <p className="text-white font-mono text-lg text-center">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div></div>
          <button
            onClick={() => moveBobbi(0, -1, 'up')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 border-2 border-gray-500 rounded active:bg-gray-800 transition-colors"
          >
            <ArrowUp size={24} />
          </button>
          <div></div>
          <button
            onClick={() => moveBobbi(-1, 0, 'left')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 border-2 border-gray-500 rounded active:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => moveBobbi(0, 1, 'down')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 border-2 border-gray-500 rounded active:bg-gray-800 transition-colors"
          >
            <ArrowDown size={24} />
          </button>
          <button
            onClick={() => moveBobbi(1, 0, 'right')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 border-2 border-gray-500 rounded active:bg-gray-800 transition-colors"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        <p className="text-gray-500 font-mono text-sm mt-4">
          Use Arrow Keys or WASD to move
        </p>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #1a1a2e 0px, #1a1a2e 2px, #16213e 2px, #16213e 4px)'
      }}>
        <div className="bg-gray-800 border-8 border-yellow-600 rounded-lg p-10 max-w-2xl text-center shadow-2xl" style={{
          boxShadow: '0 0 0 4px #ca8a04, 0 0 40px rgba(234, 179, 8, 0.5)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <div className="text-8xl mb-6">🎉</div>
          
          <h2 className="text-5xl font-bold mb-6 text-yellow-400" style={{
            fontFamily: 'monospace',
            textShadow: '4px 4px 0px #000, -2px -2px 0px #fbbf24'
          }}>
            QUEST COMPLETE!
          </h2>

          <div className="text-6xl mb-6">🐕</div>
          
          <div className="bg-gray-900 border-4 border-green-600 rounded-lg p-6 mb-6">
            <p className="text-green-400 font-mono text-2xl mb-4">
              ⭐ Bobbi found it in {moves} moves! ⭐
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 border-8 border-yellow-500 rounded-lg p-8 mb-8" style={{
            boxShadow: '0 0 30px rgba(234, 179, 8, 0.5)'
          }}>
            <Gift className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-yellow-300 mb-4 font-mono">
              YOUR REWARD!
            </h3>
            <div className="bg-white border-4 border-gray-600 rounded-lg p-8 mt-4">
              <div className="text-7xl mb-4">🍎</div>
              <p className="text-4xl font-black text-gray-800 mb-2 font-mono">
                APPLE GIFT CARD
              </p>
              <p className="text-xl text-gray-600 font-mono">
                Treat yourself, Mum! 💝
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border-4 border-pink-600 rounded-lg p-6 mb-6">
            <p className="text-pink-400 font-mono text-2xl mb-2">
              💝 WITH ALL OUR LOVE
            </p>
            <p className="text-gray-400 font-mono">Thank you for everything! ❤️</p>
          </div>

          <button 
            onClick={startGame}
            className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 text-xl font-bold border-4 border-green-800 transition-all font-mono shadow-lg"
            style={{
              boxShadow: '4px 4px 0px #065f46'
            }}
          >
            ▶ PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }
}
