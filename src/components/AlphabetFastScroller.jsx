import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

const ALPHABET = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 
  'V', 'W', 'X', 'Y', 'Z'
];

export const AlphabetFastScroller = ({
  items = [],
  sortField = 'descricao',
  scrollContainerRef
}) => {
  const [activeLetter, setActiveLetter] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bubblePos, setBubblePos] = useState({ y: 0 });
  const barRef = useRef(null);

  // Normaliza texto e extrai a letra inicial correspondente
  const getItemLetter = useCallback((item) => {
    if (!item) return '#';
    let text = '';
    if (sortField === 'numeroPatrimonio') {
      text = String(item.numeroPatrimonio || '').trim();
      if (/^\d/.test(text)) return '#';
    } else {
      text = String(item.descricao || item.numeroPatrimonio || '').trim();
    }
    
    if (!text) return '#';
    const firstChar = text.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/^[A-Z]$/.test(firstChar)) {
      return firstChar;
    }
    return '#';
  }, [sortField]);

  // Mapeia cada letra ao índice do primeiro item correspondente
  const letterMap = useMemo(() => {
    const map = new Map();
    items.forEach((item, index) => {
      const letter = getItemLetter(item);
      if (!map.has(letter)) {
        map.set(letter, { index, item });
      }
    });
    return map;
  }, [items, getItemLetter]);

  // Rola até o item da letra
  const scrollToLetter = useCallback((letter) => {
    const target = letterMap.get(letter);
    if (!target || !scrollContainerRef?.current) return;

    const el = document.getElementById(`asset-row-${target.item.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [letterMap, scrollContainerRef]);

  // Calcula qual letra está na posição Y
  const handlePointerAction = useCallback((clientY) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(rect.height - 1, relativeY));
    const ratio = clampedY / rect.height;
    const letterIndex = Math.min(ALPHABET.length - 1, Math.max(0, Math.floor(ratio * ALPHABET.length)));
    const letter = ALPHABET[letterIndex];

    setActiveLetter(letter);
    setBubblePos({ y: clampedY + rect.top });
    scrollToLetter(letter);
  }, [scrollToLetter]);

  const onPointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerAction(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      e.preventDefault();
      handlePointerAction(e.clientY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setActiveLetter(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerAction]);

  // Não renderizar se tiver pouquíssimos itens (ex: menos de 6)
  if (items.length < 6) return null;

  return (
    <>
      {/* Floating Letter Bubble Indicator */}
      {isDragging && activeLetter && (
        <div
          style={{ top: `${bubblePos.y}px` }}
          className="fixed right-10 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2 animate-in fade-in zoom-in-75 duration-75"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.7)] border-2 border-white/80 select-none">
            {activeLetter}
          </div>
          <div className="w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-emerald-500"></div>
        </div>
      )}

      {/* Alphabet Strip Bar Fixed on Right Side */}
      <div 
        ref={barRef}
        onPointerDown={onPointerDown}
        className="fixed right-1.5 top-1/2 -translate-y-1/2 z-40 bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 rounded-full py-2 px-1 flex flex-col items-center justify-between select-none shadow-xl transition-all cursor-ns-resize touch-none w-5 sm:w-6 h-[70vh] max-h-[560px]"
        title="Barra de rolagem rápida por letra (A-Z)"
      >
        {ALPHABET.map((char) => {
          const hasItems = letterMap.has(char);
          const isSelected = activeLetter === char;
          return (
            <button
              key={char}
              type="button"
              tabIndex={-1}
              onClick={() => {
                setActiveLetter(char);
                scrollToLetter(char);
                setTimeout(() => setActiveLetter(null), 600);
              }}
              className={`w-full flex-1 flex items-center justify-center text-[9px] sm:text-[10px] leading-none transition-transform ${
                isSelected
                  ? 'text-emerald-300 font-black scale-150 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  : hasItems
                    ? 'text-slate-300 font-bold hover:text-emerald-400 hover:scale-125'
                    : 'text-slate-600 font-normal opacity-40'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </>
  );
};
