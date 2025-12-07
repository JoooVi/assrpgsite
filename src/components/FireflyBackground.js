// src/FireflyBackground.js

import React, { useEffect, useRef } from 'react';

const FireflyBackground = () => {
  // 1. useRef para acessar o elemento <canvas>
  const canvasRef = useRef(null);
  
  // Usamos useRef para guardar o ID da animação e poder cancelá-la
  const animationFrameId = useRef(null);

  // 2. useEffect para rodar o código QUANDO o componente for montado
  useEffect(() => {
    // Pega o elemento canvas e o contexto 2D
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');
    
    // Define o tamanho do canvas (como no código original)
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // --- Início do Código Original Adaptado ---

    // A classe do Vagalume
    class firefly {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.s = Math.random() * 2;
        this.ang = Math.random() * 2 * Math.PI;
        this.v = (this.s * this.s) / 4;
      }
      move() {
        this.x += this.v * Math.cos(this.ang);
        this.y += this.v * Math.sin(this.ang);
        this.ang += (Math.random() * 20 * Math.PI) / 180 - (10 * Math.PI) / 180;
      }
      show() {
        c.beginPath();
        c.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
        c.fillStyle = '#f0bd6cff'; // Cor do vagalume
        c.fill();
      }
    }

    let f = []; // Array de vagalumes

    // Função que desenha os vagalumes
    function draw() {
      if (f.length < 100) {
        for (let j = 0; j < 10; j++) {
          f.push(new firefly());
        }
      }
      // Animação
      for (let i = 0; i < f.length; i++) {
        f[i].move();
        f[i].show();
        if (f[i].x < 0 || f[i].x > w || f[i].y < 0 || f[i].y > h) {
          f.splice(i, 1);
        }
      }
    }

    // Listeners de Mouse (mantidos do original)
    let mouse = {};
    let last_mouse = {};
    const mouseMoveHandler = (e) => {
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;
      mouse.x = e.pageX - canvas.offsetLeft;
      mouse.y = e.pageY - canvas.offsetTop;
    };
    // Adicionamos o listener ao canvas
    canvas.addEventListener('mousemove', mouseMoveHandler, false);

    // Função de Loop de Animação
    function loop() {
      // Limpa o canvas a cada frame. 
      // O fundo preto do 'body' (no index.css) vai aparecer por baixo.
      c.clearRect(0, 0, w, h);
      
      draw(); // Desenha os vagalumes
      
      // Continua o loop
      animationFrameId.current = requestAnimationFrame(loop);
    }

    // Listener para redimensionar a tela
    const resizeHandler = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    // Inicia o loop
    loop();

    // --- Fim do Código Original Adaptado ---

    // 3. Função de Limpeza (Cleanup)
    // Isso roda quando o componente "morre" (unmount)
    return () => {
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      // Para a animação para não consumir recursos
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // O array vazio [] garante que este useEffect rode apenas uma vez

  // 4. Renderiza o elemento <canvas>
  // Damos um ID a ele para o CSS funcionar
  return <canvas ref={canvasRef} id="firefly-canvas" />;
};

export default FireflyBackground;