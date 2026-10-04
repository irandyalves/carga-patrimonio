import React, { memo } from 'react';
import { getSearchTokens, buildTokenRegex } from '../utils/searchUtils';

// Cache global de tokens por query para evitar parse redundante
const tokensCache = new Map();
function getCachedTokens(query) {
  if (tokensCache.has(query)) return tokensCache.get(query);
  const tokens = getSearchTokens(query);
  if (tokensCache.size > 200) tokensCache.clear();
  tokensCache.set(query, tokens);
  return tokens;
}

// Cache global de regexes compiladas para velocidade máxima
const regexCache = new Map();
function getCachedRegex(token) {
  if (regexCache.has(token)) {
    // Retorna uma regex resetada
    const r = regexCache.get(token);
    if (r) r.lastIndex = 0;
    return r;
  }
  const regex = buildTokenRegex(token);
  if (regexCache.size > 300) regexCache.clear();
  regexCache.set(token, regex);
  return regex;
}

/**
 * Componente que destaca / marca visualmente as palavras e trechos coincidentes
 * com o termo de busca em tempo real, suportando termos flexíveis, múltiplos e sem acento.
 * Altamente otimizado com memoização e caches globais para 60fps.
 */
function HighlightTextComponent({ 
  text, 
  query, 
  className = '', 
  highlightClassName = 'bg-amber-400/35 text-amber-200 font-bold px-0.5 py-0.2 rounded-[3px] border-b-2 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.35)]',
  tag: Tag = 'span' 
}) {
  if (text === null || text === undefined) return null;
  const strText = String(text);
  
  if (!query || typeof query !== 'string' || !query.trim() || strText.length === 0) {
    return <Tag className={className}>{strText}</Tag>;
  }

  const tokens = getCachedTokens(query);
  if (tokens.length === 0) {
    return <Tag className={className}>{strText}</Tag>;
  }

  // Coleta os intervalos [start, end] de correspondência para todos os tokens
  const ranges = [];
  for (let i = 0; i < tokens.length; i++) {
    const regex = getCachedRegex(tokens[i]);
    if (!regex) continue;

    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(strText)) !== null) {
      if (match[0].length === 0) {
        regex.lastIndex++;
        continue;
      }
      ranges.push({
        start: match.index,
        end: match.index + match[0].length
      });
      // Evita loop infinito em expressões com zero-width match
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
  }

  if (ranges.length === 0) {
    return <Tag className={className}>{strText}</Tag>;
  }

  // Ordena os intervalos e mescla sobreposições
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const current = ranges[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  // Constrói os nós com marcação <mark>
  const parts = [];
  let lastIndex = 0;

  merged.forEach((range, idx) => {
    if (range.start > lastIndex) {
      parts.push(
        <React.Fragment key={`text-${idx}-${lastIndex}`}>
          {strText.slice(lastIndex, range.start)}
        </React.Fragment>
      );
    }
    parts.push(
      <mark key={`mark-${idx}-${range.start}`} className={highlightClassName}>
        {strText.slice(range.start, range.end)}
      </mark>
    );
    lastIndex = range.end;
  });

  if (lastIndex < strText.length) {
    parts.push(
      <React.Fragment key={`text-end-${lastIndex}`}>
        {strText.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return <Tag className={className}>{parts}</Tag>;
}

export const HighlightText = memo(HighlightTextComponent);
export default HighlightText;
