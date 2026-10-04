import React from 'react';
import { formatPatrimonio } from './formatters';

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 
  'em', 'no', 'na', 'nos', 'nas', 
  'para', 'pra', 'pro', 'com', 'por', 
  'um', 'uma', 'uns', 'umas', 
  'e', 'a', 'o', 'as', 'os'
]);

/**
 * Remove acentos e normaliza para minúsculas
 */
export function normalizeText(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Escapa caracteres especiais para uso seguro em RegExp
 */
export function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extrai tokens / palavras individuais da busca
 */
export function getSearchTokens(query) {
  if (!query || typeof query !== 'string') return [];
  return query
    .trim()
    .split(/[\s,+/\\-]+/)
    .filter(t => t.length > 0);
}

/**
 * Extrai tokens significativos (ignorando stop words quando há termos mais específicos)
 */
export function getSignificantTokens(query) {
  const rawTokens = getSearchTokens(query);
  if (rawTokens.length <= 1) return rawTokens;

  const filtered = rawTokens.filter(t => {
    const norm = normalizeText(t);
    return !STOP_WORDS.has(norm);
  });

  return filtered.length > 0 ? filtered : rawTokens;
}

/**
 * Converte um token em expressão regular que casa independentemente de acentos,
 * maiúsculas/minúsculas e separadores opcionais entre dígitos (. ou -).
 */
export function buildTokenRegex(token) {
  if (!token || !token.trim()) return null;
  const clean = token.trim();

  // Se o token for composto por números (ou números com pontos/hífen), suporta pontuação flexível
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length > 0 && clean.length <= digitsOnly.length + 3) {
    const digitPattern = digitsOnly.split('').map(d => `${d}`).join('[\\s.\\-]?');
    try {
      return new RegExp(`(${digitPattern})`, 'gi');
    } catch (e) {}
  }

  // Mapeamento de acentuações em Língua Portuguesa
  const accentMap = {
    a: '[aáàãâäAÁÀÃÂÄ]',
    e: '[eéèêëEÉÈÊË]',
    i: '[iíìîïIÍÌÎÏ]',
    o: '[oóòõôöOÓÒÕÔÖ]',
    u: '[uúùûüUÚÙÛÜ]',
    c: '[cçCÇ]'
  };

  const baseToken = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let pattern = '';
  for (let i = 0; i < baseToken.length; i++) {
    const ch = baseToken[i].toLowerCase();
    if (accentMap[ch]) {
      pattern += accentMap[ch];
    } else {
      pattern += escapeRegExp(baseToken[i]);
    }
  }

  try {
    return new RegExp(`(${pattern})`, 'gi');
  } catch (e) {
    return new RegExp(`(${escapeRegExp(clean)})`, 'gi');
  }
}

/**
 * Verifica se um patrimônio/bem atende aos critérios de busca (não exata, flexível, multi-termos e sem acentos)
 */
export function matchesAsset(item, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return true;

  const tokens = getSignificantTokens(searchTerm);
  if (tokens.length === 0) return true;

  const rawNum = String(item.numeroPatrimonio || '');
  const digitsNum = rawNum.replace(/\D/g, '');
  const last5 = digitsNum.length >= 5 ? digitsNum.slice(-5) : digitsNum;
  const formattedXX = last5.length === 5 ? `${last5.slice(0, 2)}.${last5.slice(2)}` : last5;
  const formattedFull = formatPatrimonio(item.numeroPatrimonio);

  const cautelaText = item.cautelaAtual 
    ? `${item.cautelaAtual.setorDestino || ''} ${item.cautelaAtual.responsavelRetirada || ''} ${item.cautelaAtual.responsavel || ''} ${item.cautelaAtual.documento || ''}` 
    : '';

  const searchableFields = [
    rawNum,
    digitsNum,
    last5,
    formattedXX,
    formattedFull,
    item.descricao || '',
    item.localizacao || '',
    item.observacao || '',
    item.responsavel || '',
    item.servidorNome || '',
    item.servidorTelefone || '',
    item.servidor || '',
    item.servidorMesa || '',
    item.setorNome || '',
    item.numeroSerie || '',
    item.modelo || '',
    item.marca || '',
    item.categoria || '',
    item.fornecedor || '',
    cautelaText
  ];

  const searchableNormalized = searchableFields
    .map(f => normalizeText(String(f)))
    .join(' ');

  return tokens.every(token => {
    const tokenNormalized = normalizeText(token);
    if (!tokenNormalized) return true;

    // 1. Busca por substring normalizada (sem acentos e minúscula)
    if (searchableNormalized.includes(tokenNormalized)) {
      return true;
    }

    // 2. Busca por dígitos / sufixo de patrimônio
    const tokenDigits = token.replace(/\D/g, '');
    if (tokenDigits.length > 0) {
      if (digitsNum.includes(tokenDigits) || digitsNum.endsWith(tokenDigits)) {
        return true;
      }
    }

    // 3. Busca por Regex com mapeamento fonético/acentual
    const regex = buildTokenRegex(token);
    if (regex) {
      return searchableFields.some(field => {
        regex.lastIndex = 0;
        return regex.test(String(field));
      });
    }

    return false;
  });
}
