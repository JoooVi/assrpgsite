import React from "react";
import d6Shape from "../assets/icons/d6_forma.svg";
import d10Shape from "../assets/icons/d10_forma.svg";
import d12Shape from "../assets/icons/d12_forma.svg";
import "./DiceFace.css";

const DICE_SHAPES = {
  6: d6Shape,
  10: d10Shape,
  12: d12Shape,
};

const normalizeSymbolSrc = (src) => src?.default || src;

const DiceFace = ({ die, size = 44, className = "", label = true }) => {
  const sides = Number(die?.sides);
  const shapeSrc = DICE_SHAPES[sides] || d10Shape;
  const symbols = Array.isArray(die?.result) ? die.result.filter(Boolean) : [];
  const hasSymbols = symbols.length > 0;

  return (
    <div
      className={`dice-face dice-face-d${sides || "x"} ${className}`.trim()}
      style={{ "--dice-face-size": `${size}px` }}
      title={`d${sides || "?"}: ${hasSymbols ? `${symbols.length} símbolo${symbols.length === 1 ? "" : "s"}` : "face vazia"}`}
    >
      {label && <span className="dice-face-label">d{sides || "?"}</span>}
      <div className="dice-face-body">
        <img className="dice-face-shape" src={shapeSrc} alt="" aria-hidden="true" />
        <div className={`dice-face-content dice-face-symbol-count-${Math.min(symbols.length, 4)}`}>
          {hasSymbols ? (
            symbols.map((imgSrc, index) => (
              <img
                key={`${normalizeSymbolSrc(imgSrc)}-${index}`}
                className="dice-face-symbol"
                src={normalizeSymbolSrc(imgSrc)}
                alt=""
                aria-hidden="true"
              />
            ))
          ) : (
            <span className="dice-face-empty" aria-label="Face sem símbolos" />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceFace;
