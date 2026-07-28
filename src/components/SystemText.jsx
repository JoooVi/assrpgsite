import React, { useMemo } from "react";
import { getSystemSymbol } from "../utils/systemSymbols";
import "./SystemText.css";

const TOKEN_REGEX = /(\[([a-zA-Z0-9_\-\s\u00c0-\u017f]+)\]|\(([a-zA-Z0-9_\-\s\u00c0-\u017f]+)\)|:([a-zA-Z0-9_\-\s\u00c0-\u017f]+):)/g;
const INLINE_SYMBOL_REGEX = /(🐞|🦉|🫎|🛡️?|⬜️?|♦️?|🔷|❤️?|determina(?:ç|c)(?:ão|ao|ões|oes)|assimila(?:ç|c)(?:ão|ao|ões|oes))/giu;

const GLYPH_TOKENS = {
  "🐞": "sucesso",
  "🦉": "pressao",
  "🫎": "adaptacao",
  "🛡": "pressao",
  "🛡️": "pressao",
  "⬜": "d6",
  "⬜️": "d6",
  "♦": "d10",
  "♦️": "d10",
  "🔷": "d12",
  "❤": "saude",
  "❤️": "saude",
};

const getInlineResourceToken = (value) => {
  if (GLYPH_TOKENS[value]) return GLYPH_TOKENS[value];

  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.startsWith("determinac")) return "determinacao";
  if (normalized.startsWith("assimilac")) return "assimilacao";
  return null;
};

const renderInlineResources = (chunk, keyPrefix) => {
  const textChunk = String(chunk || "");
  const nodes = [];
  let lastIndex = 0;
  let match;

  INLINE_SYMBOL_REGEX.lastIndex = 0;
  while ((match = INLINE_SYMBOL_REGEX.exec(textChunk)) !== null) {
    const word = match[0];
    const token = getInlineResourceToken(word);
    const symbol = token ? getSystemSymbol(token) : null;

    if (!symbol) continue;

    if (match.index > lastIndex) {
      nodes.push(textChunk.slice(lastIndex, match.index));
    }

    const isWord = /^[\p{L}]+$/u.test(word) && !/^(?:D|A|Ass)$/i.test(word);
    nodes.push(
      <span
        key={`${keyPrefix}-resource-${match.index}`}
        className="system-symbol-inline-resource"
        title={symbol.label}
      >
        <img
          src={symbol.icon}
          alt={symbol.label}
          className="system-symbol-icon system-symbol-inline-resource-icon"
          loading="lazy"
        />
        {isWord && <span>{word}</span>}
      </span>
    );

    lastIndex = match.index + word.length;
  }

  if (lastIndex < textChunk.length) {
    nodes.push(textChunk.slice(lastIndex));
  }

  return nodes.length ? nodes : [textChunk];
};

const SystemText = ({ text, className = "" }) => {
  const nodes = useMemo(() => {
    const rawText = String(text || "")
      .replace(/\b(Req:\s*)(?:Ass|A)(?=\s*\d+\+)/giu, "$1[assimilacao]")
      .replace(/\b(\d+\s+)D\b(?!\d)/g, "$1[determinacao]")
      .replace(/⬜️?\s*\(D6\)/giu, "[d6]")
      .replace(/♦️?\s*\(D10\)/giu, "[d10]")
      .replace(/🔷\s*\(D12\)/giu, "[d12]");
    const parts = [];
    let lastIndex = 0;
    let match;

    TOKEN_REGEX.lastIndex = 0;
    while ((match = TOKEN_REGEX.exec(rawText)) !== null) {
      const [rawToken,, bracketToken, parenthesisToken, colonToken] = match;
      const token = bracketToken || parenthesisToken || colonToken;
      const symbol = getSystemSymbol(token);
      if (!symbol && (parenthesisToken || colonToken)) continue;

      if (match.index > lastIndex) {
        parts.push(...renderInlineResources(rawText.slice(lastIndex, match.index), `text-${lastIndex}`));
      }

      if (symbol) {
        parts.push(
          <img
            key={`${token}-${match.index}`}
            src={symbol.icon}
            alt={symbol.label}
            title={symbol.label}
            className="system-symbol-icon"
            loading="lazy"
          />
        );
      } else {
        parts.push(rawToken);
      }

      lastIndex = match.index + rawToken.length;
    }

    if (lastIndex < rawText.length) {
      parts.push(...renderInlineResources(rawText.slice(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  }, [text]);

  return <span className={className}>{nodes}</span>;
};

export default SystemText;
