// src/FireflyBackground.js

import React, { useEffect, useRef } from 'react';

const FireflyBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');
    
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Cores baseadas na arte ass.jpg (Verde mutante, Ciano e Verde claro da luz do sol)
    const colors = [
      'rgba(74, 222, 128, ', 
      'rgba(60, 220, 231, ', 
      'rgba(200, 255, 200, ' 
    ];

    class Spore {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Tamanho irregular para simular matéria orgânica/esporos
        this.s = Math.random() * 1.5 + 0.3; 
        
        // Movimento flutuante como poeira ao vento
        this.vx = (Math.random() - 0.5) * 0.4; 
        this.vy = -(Math.random() * 0.4 + 0.1); 
        
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        
        // Opacidade controlada para não tapar a imagem
        this.maxOpacity = Math.random() * 0.6 + 0.1; 
        this.opacity = Math.random() * this.maxOpacity;
        
        // Controle do efeito de piscar
        this.fadeSpeed = Math.random() * 0.008 + 0.002;
        this.fadeIn = Math.random() > 0.5;
      }

      move() {
        this.x += this.vx;
        this.y += this.vy;

        // Efeito de respiração (Fade in / Fade out)
        if (this.fadeIn) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= this.maxOpacity) this.fadeIn = false;
        } else {
          this.opacity -= this.fadeSpeed;
          if (this.opacity <= 0) this.reset(); 
        }

        // Reposiciona se sair do ecrã
        if (this.y < -10 || this.x < -10 || this.x > w + 10) {
          this.reset();
          this.y = h + 10; 
        }
      }

      show() {
        c.beginPath();
        c.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
        c.fillStyle = `${this.colorBase}${this.opacity})`;
        c.fill();
      }
    }

    let spores = [];
    // Quantidade moderada para não poluir
    for (let i = 0; i < 90; i++) {
      spores.push(new Spore());
    }

    function loop() {
      // Limpa o canvas totalmente sem aplicar nenhum fundo escuro
      c.clearRect(0, 0, w, h); 
      
      spores.forEach(spore => {
        spore.move();
        spore.show();
      });
      
      animationFrameId.current = requestAnimationFrame(loop);
    }

    const resizeHandler = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    loop();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0 
      }} 
    />
  );
};

export default FireflyBackground;