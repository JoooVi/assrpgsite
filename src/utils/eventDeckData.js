/* src/utils/eventDeckData.js */

export const eventDeck = [
  // ==========================================
  // COPAS ♥️ (Fenômenos Naturais)
  // ==========================================
  { 
    suit: "copas", value: "A", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Incêndio Inesperado", 
    desc: "Na próxima cena dos Infectados em um Refúgio, um incêndio será iniciado em uma de suas construções. Todos que estiverem próximos sofrem 3(D10) de dano, reduzido em um dado para cada sucesso em um teste de Resolução + Sobrevivência. Caso os Infectados decidam tentar salvar a construção, um Conflito deve ser iniciado." 
  },
  { 
    suit: "copas", value: "2", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Tremores de Terra", 
    desc: "Um terremoto se inicia, dificultando testes ligados ao equilíbrio e impossibilitando viagens. Role 1(D12), o Refúgio mais próximo sofre desabamento em uma construção para cada Símbolo." 
  },
  { 
    suit: "copas", value: "3", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Nuvem Tóxica", 
    desc: "Uma nuvem se move em direção ao local dos Infectados. Role 1(D12), na próxima cena aqueles que não encontrarem abrigo sofrem 1 de dano de Potência para cada Símbolo até a próxima Recuperação." 
  },
  { 
    suit: "copas", value: "4", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Chuva Corrosiva", 
    desc: "Role 1(D12), a acidez da chuva faz com que todos os itens expostos caiam em um Nível de Qualidade para cada Pressão." 
  },
  { 
    suit: "copas", value: "5", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Enxame de Insetos", 
    desc: "Role 1(D12), os insetos causam 1 de dano a Infectados expostos para cada adaptação e todas as reservas de Alimento da Região perdem 1 ponto para cada pressão." 
  },
  { 
    suit: "copas", value: "6", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Plantas Emaranhadoras", 
    desc: "Na próxima vez que iniciar um Conflito, videiras surgem e tentam prender todas as criaturas no alcance. Adicione o seguinte Condicionante ao Conflito: todas as ações serão resolvidas com Reação como Instinto principal." 
  },
  { 
    suit: "copas", value: "7", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Tempestade de Granizo", 
    desc: "Expostos sofrem 1(D10) pontos de dano por rodada, pode danificar estruturas frágeis." 
  },
  { 
    suit: "copas", value: "8", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Fenômeno Sensorial", 
    desc: "Essa carta é mantida com o(a) Assimilador(a) até que seja gasta. Quando usada, todos na cena ficam temporariamente cegos ou surdos, anulando todos os sucessos nos testes com o sentido escolhido por três turnos." 
  },
  { 
    suit: "copas", value: "9", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Chuva Torrencial", 
    desc: "Aos poucos, uma simples chuva se torna uma tempestade brutal. Pode danificar estruturas e obrigar o Refúgio a repará-las. Role 1(D12), Recursos e produções expostos na Região perdem 1 ponto para cada Símbolo no dado." 
  },
  { 
    suit: "copas", value: "10", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Pulso da Assimilação", 
    desc: "Empoderamento súbito temporário faz com que todos percam 1 Nível de Determinação e ganhem 1 Nível de Assimilação." 
  },
  { 
    suit: "copas", value: "J", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Ventania Ensurdecedora", 
    desc: "Na próxima cena, uma ventania torrencial subitamente atinge o local dos Infectados, dificultando movimentações e disparos à distância. Durante a ventania, compreender sons exige testes de Ação e todos os testes de audição ou projéteis são rolados com 1 dado a menos." 
  },
  { 
    suit: "copas", value: "Q", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Tornado Nervoso", 
    desc: "Jogue 4(D10) e conte os símbolos. Nesse número de rodadas, todos que não conseguirem se proteger do tornado entram em seu rastro de destruição e sofrem 1(D10) pontos de dano por rodada e devem ser bem sucedidos em algum teste que inclua Potência para que não sejam arrastados. Construções de madeira no caminho do tornado sofrem a quantidade de símbolos do dado em pontos de obra para manutenção. Tendas e construções improvisadas são levadas pelo vento." 
  },
  { 
    suit: "copas", value: "K", icon: "♥️", type: "Fenômenos Naturais", 
    title: "Temperatura Extrema", 
    desc: "Na próxima cena, a Área será afetada por uma grande onda de calor ou frio, à escolha do(a) Assimilador(a). Role 1(D12), a quantidade de símbolos determina a Pressão e por quantas cenas ela permanecerá. Todos que não estiverem protegidos do clima devem fazer um teste de Resolução + Sobrevivência a cada cena para resistir." 
  },

  // ==========================================
  // OUROS ♦️ (Ameaças e Tensões)
  // ==========================================
  { 
    suit: "ouros", value: "A", icon: "♦️", type: "Ameaças e Tensões", title: "Paramilitares Ameaçadores", 
    desc: "Um som agudo de um disparo é identificado, se virando para o horizonte, um grupo de combatentes está em marcha. Teste que inclua Percepção pode dar informações sobre o grupo (símbolos, equipamentos, etc). Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "São agressivos e querem dominação." },
      { condition: "2 Símbolos", text: "O grupo está em busca de algum material." },
      { condition: "3-4 Símbolos", text: "Estão em busca de aliados." }
    ]
  },
  { 
    suit: "ouros", value: "2", icon: "♦️", type: "Ameaças e Tensões", title: "Caçadores de Recompensas", 
    desc: "Um caçador de recompensas está em busca de seu prêmio e não medirá esforços para obtê-lo. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "O prêmio é aliado do grupo." },
      { condition: "2 Símbolos", text: "O prêmio é alguém do grupo, vivo ou morto." },
      { condition: "3-4 Símbolos", text: "O prêmio é inimigo do grupo." }
    ]
  },
  { 
    suit: "ouros", value: "3", icon: "♦️", type: "Ameaças e Tensões", title: "Tropa Armada", 
    desc: "Grupo armado invade a região, causando uma comoção entre os habitantes. Teste de Erudição pode indicar a qual grupo pertencem. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "A tropa busca expandir seu território." },
      { condition: "2 Símbolos", text: "Rivais de uma comunidade local invadiram a região." },
      { condition: "3-4 Símbolos", text: "O grupo está de passagem e saqueando Refúgios no caminho." }
    ]
  },
  { 
    suit: "ouros", value: "4", icon: "♦️", type: "Ameaças e Tensões", title: "Batedores à Espreita", 
    desc: "Os Infectados são espreitados por batedores. Solicite um teste de Percepção + Segurança, caso mantenham ao menos 1 Sucesso para cada membro do grupo, eles notam que estão sendo observados. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "O objetivo dos batedores é somente adquirir informações sobre os Infectados para seu grupo." },
      { condition: "2 Símbolos", text: "Os batedores estão receosos mas buscam aliados para seu Refúgio." },
      { condition: "3-4 Símbolos", text: "Os batedores estão apenas esperando uma oportunidade para levar vantagem." }
    ]
  },
  { 
    suit: "ouros", value: "5", icon: "♦️", type: "Ameaças e Tensões", title: "Feras Assimiladas", 
    desc: "Ao longe é possível ouvir o som de feras se aproximando, em pouco tempo elas estarão ao seu encalço. Teste de Biologia pode determinar a intenção das criaturas. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Feras famintas estão caçando em bando." },
      { condition: "2 Símbolos", text: "Um grupo de grandes herbívoros está em debandada." },
      { condition: "3-4 Símbolos", text: "Pequenos animais curiosos se aproximam cautelosamente." }
    ]
  },
  { 
    suit: "ouros", value: "6", icon: "♦️", type: "Ameaças e Tensões", title: "Saqueadores Mutantes", 
    desc: "Vale a pena lutar por suas posses? Em um mundo assimilado a resposta nem sempre é tão simples. Saqueadores os emboscaram, role 1(D12) e inicie o Conflito:",
    rolls: [
      { condition: "0-1 Símbolos", text: "Os saqueadores são gananciosos, brutais e violentos." },
      { condition: "2 Símbolos", text: "Se contentam com a entrega dos bens e não machucam inocentes, a menos que necessário." },
      { condition: "3-4 Símbolos", text: "Podem ser dissuadidos do uso de violência pois agem por necessidade." }
    ]
  },
  { 
    suit: "ouros", value: "7", icon: "♦️", type: "Ameaças e Tensões", title: "Profetas da Assimilação", 
    desc: "Um cântico toma conta do ambiente, a letra desse hino traz à tona um grupo de fanáticos. Teste de Erudição pode identificar a qual religião pertencem. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Inquisidores ou Inconformados que querem livrar o mundo dos Assimilados." },
      { condition: "2 Símbolos", text: "Adoradores do Novo Deus ou Homo Assimilatus que louvam e adoram Assimilados." },
      { condition: "3-4 Símbolos", text: "Os missionários pertencem a uma religião pré-Colapso." }
    ]
  },
  { 
    suit: "ouros", value: "8", icon: "♦️", type: "Ameaças e Tensões", title: "Invasores Violentos", 
    desc: "Invasores avançam pelo território com fúria desmedida, deixando para trás um rastro de destruição e cadáveres. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Invadem o território dos Infectados em busca de roubo e pilhagem." },
      { condition: "2 Símbolos", text: "Tentam recrutar novos membros que considerem mais capazes." },
      { condition: "3-4 Símbolos", text: "Os invasores estão em busca de capturar os habitantes." }
    ]
  },
  { 
    suit: "ouros", value: "9", icon: "♦️", type: "Ameaças e Tensões", title: "Exploradores Suspeitos", 
    desc: "Grupo de viajantes com aparência de poucos amigos tem andado na região em busca de algo que não contam. Teste que inclua Furtividade pode ajudar a descobrir o que procuram. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Estão à procura de um tesouro com um mapa que possuem." },
      { condition: "2 Símbolos", text: "Estão no encalço de alguém que escapou deles." },
      { condition: "3-4 Símbolos", text: "Por mais que tentem esconder, estão vigiando os Refúgios da região." }
    ]
  },
  { 
    suit: "ouros", value: "10", icon: "♦️", type: "Ameaças e Tensões", title: "Máquina Robótica", 
    desc: "Armadura-empilhadeira pesada infestada por fungos assimilados destrói tudo que está pelo seu caminho. Teste que inclui Engenharia ajuda a entender que são os fungos que fazem a criatura se mover. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Andando aleatoriamente, atacando quem se aproxima demais." },
      { condition: "2 Símbolos", text: "Procura veículos ou similares para infectá-los e formar uma horda mecânica." },
      { condition: "3-4 Símbolos", text: "O Refúgio mais próximo está em seu trajeto." }
    ]
  },
  { 
    suit: "ouros", value: "J", icon: "♦️", type: "Ameaças e Tensões", title: "Verme Colossal", 
    desc: "Um verme é ameaçador? Depende do tamanho. Um verme gigante emerge do solo, para evitá-lo acumule 8 Sucessos. Role 1(D12) e inicie o Conflito:",
    rolls: [
      { condition: "0-1 Símbolos", text: "Verme do tamanho de um leão. (Neutralizar 6 Sucessos)." },
      { condition: "2 Símbolos", text: "Verme do tamanho de um elefante africano. (Neutralizar 9 Sucessos)." },
      { condition: "3-4 Símbolos", text: "Verme do tamanho de uma baleia azul. (Neutralizar 12 Sucessos)." }
    ]
  },
  { 
    suit: "ouros", value: "Q", icon: "♦️", type: "Ameaças e Tensões", title: "Gangue de Motoqueiros", 
    desc: "Estabelecem um território pelo qual cobram pela sua segurança. Teste que inclui Influência no primeiro contato com eles pode fazer com que se portem de forma amigável. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Estão interessados em conseguir mais Recursos para o seu próprio Refúgio." },
      { condition: "2 Símbolos", text: "Em busca de combustível para as suas motos com os tanques quase vazios." },
      { condition: "3-4 Símbolos", text: "Aceitam mão de obra como pagamento pela sua proteção." }
    ]
  },
  { 
    suit: "ouros", value: "K", icon: "♦️", type: "Ameaças e Tensões", title: "Comitiva Misteriosa", 
    desc: "Um grupo portando vestimentas estranhas aos Infectados, surge querendo algo não convencional. Role 1(D12):",
    rolls: [
      { condition: "0-1 Símbolos", text: "Corporação equipada com tecnologia avançada busca capturar espécimes vivos para estudo." },
      { condition: "2 Símbolos", text: "Comitiva xamânica disposta a trabalhar ou negociar seus talismãs “místicos” em troca de informação específica." },
      { condition: "3-4 Símbolos", text: "Comitiva de Assimilados busca converter os Infectados em nome de seu líder, um ser reverenciado por seu poder inimaginável." }
    ]
  },

  // ==========================================
  // ESPADAS ♠️ (Fenômenos da Assimilação)
  // ==========================================
  { 
    suit: "espadas", value: "A", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Visões Temporais", 
    desc: "Os Infectados gastam todos os Pontos de Ação restantes. Quanto mais pontos forem gastos desta maneira, mais aprofundadas as visões, que podem ser supostas previsões ou revelar acontecimentos do passado." 
  },
  { 
    suit: "espadas", value: "2", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Hostilidade Incessante", 
    desc: "Eventos recentes têm dividido os povos dos Refúgios sobre a confiança que se pode depositar em indivíduos com nível alto de Assimilação." 
  },
  { 
    suit: "espadas", value: "3", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Vínculo Mental", 
    desc: "Infectados ganham temporariamente a capacidade de conversar entre si mentalmente até 100 metros uns dos outros." 
  },
  { 
    suit: "espadas", value: "4", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Sintonização de Infectados", 
    desc: "Até o final dessa sessão de jogo, ao gastar pontos de seu Teste de Assimilação, além das cartas sorteadas, pode gastar seus pontos para replicar uma mutação de Assimilação de um companheiro com quem tenha tido contato." 
  },
  { 
    suit: "espadas", value: "5", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Sintonização Local", 
    desc: "Até o final dessa sessão de jogo, ao sortear as cartas do baralho de Assimilação, uma carta de Assimilação Singular referente ao bioma da região será adicionada." 
  },
  { 
    suit: "espadas", value: "6", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Conexão Cognitiva", 
    desc: "Um dos Infectados, à escolha do(a) Assimilador(a), involuntariamente cria um vínculo com outro e tem vislumbres sobre o seu passado oculto." 
  },
  { 
    suit: "espadas", value: "7", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Sentido Assimilado", 
    desc: "Pelo resto da sessão de jogo, os Infectados ganham a capacidade de sentir a presença de outros assimilados num raio de 5 metros por Ponto de Assimilação." 
  },
  { 
    suit: "espadas", value: "8", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Infecção em Remissão", 
    desc: "Todos os Infectados aumentam em 1 seu Nível de Determinação, consequentemente reduzindo seu Nível de Assimilação proporcionalmente." 
  },
  { 
    suit: "espadas", value: "9", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Infiltrador Metamorfo", 
    desc: "Indivíduo dotado de uma assimilação muito rara que o permite copiar a aparência das pessoas. Ele tentará enganar os Infectados se passando por alguém conhecido." 
  },
  { 
    suit: "espadas", value: "10", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Mutação Espontânea", 
    desc: "Os Infectados rolam um teste de Assimilação com apenas 1 dado (sem adicionar nenhum bônus) e escolhem suas Assimilações imediatamente em um processo que pode ser doloroso e incapacitante. Não altera o cabo de guerra." 
  },
  { 
    suit: "espadas", value: "J", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Encontro Magnífico", 
    desc: "Os Infectados encontram um animal ou planta assimilada de beleza estonteante que os faz refletir sobre a beleza da Assimilação, gerando um momento de Clareza de Propósito." 
  },
  { 
    suit: "espadas", value: "Q", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Mensagem Longínqua", 
    desc: "Um dos Infectados escolhido pelo(a) Assimilador(a) parece ser possuído por algo ou alguém e transmite uma mensagem relevante para a aventura." 
  },
  { 
    suit: "espadas", value: "K", icon: "♠️", type: "Fenômenos da Assimilação", 
    title: "Coincidência Desastrosa", 
    desc: "Algum desordeiro com Assimilação idêntica à de um dos Infectados tem causado problemas a um grupo armado, que o persegue por engano." 
  },

  // ==========================================
  // PAUS ♣️ (Eventos de Recursos)
  // ==========================================
  { 
    suit: "paus", value: "A", icon: "♣️", type: "Eventos de Recursos", 
    title: "Benção da Fartura", 
    desc: "Mês abençoado com o dobro da produção de Alimentos nos Refúgios da região." 
  },
  { 
    suit: "paus", value: "2", icon: "♣️", type: "Eventos de Recursos", 
    title: "Praga na Região", 
    desc: "Doença faz com que todos os Refúgios de uma região e adjacentes percam 1 ponto de Animais ou Plantas de um tipo que o seu Refúgio possui." 
  },
  { 
    suit: "paus", value: "3", icon: "♣️", type: "Eventos de Recursos", 
    title: "Fonte Encontrada", 
    desc: "Poço encontrado em um lugar estratégico numa região cheia de recursos naturais cria oportunidade para construir um novo Refúgio. Isso pode despertar interesse de outros sobreviventes." 
  },
  { 
    suit: "paus", value: "4", icon: "♣️", type: "Eventos de Recursos", 
    title: "Extinção de Recurso", 
    desc: "Esgote todas as reservas de um dos Recursos Naturais da região, escolhido pelo(a) Assimilador(a)." 
  },
  { 
    suit: "paus", value: "5", icon: "♣️", type: "Eventos de Recursos", 
    title: "Desabrochar da Natureza", 
    desc: "Aumente um nível dos Recursos Naturais da região." 
  },
  { 
    suit: "paus", value: "6", icon: "♣️", type: "Eventos de Recursos", 
    title: "Rumores sobre Ruína", 
    desc: "Foram encontradas pistas de que havia um Refúgio não muito longe, que apesar de não existir mais pode ter reservas remanescentes." 
  },
  { 
    suit: "paus", value: "7", icon: "♣️", type: "Eventos de Recursos", 
    title: "Brecha na Defesa", 
    desc: "Foram encontradas brechas que fazem cair em um ponto a Defesa de um Refúgio, são necessários 5 Pontos de Obra para realizar os reparos." 
  },
  { 
    suit: "paus", value: "8", icon: "♣️", type: "Eventos de Recursos", 
    title: "Artefatos Militares", 
    desc: "Grupo que transportava artefatos militares se perdeu na região. Pode despertar interesse de outros Refúgios." 
  },
  { 
    suit: "paus", value: "9", icon: "♣️", type: "Eventos de Recursos", 
    title: "Monstro Assimilado", 
    desc: "Criatura repleta de assimilações aumenta Perigo e Contaminação da Região em um ponto até que seja eliminada ou saia da Região." 
  },
  { 
    suit: "paus", value: "10", icon: "♣️", type: "Eventos de Recursos", 
    title: "Suprimentos Suspeitos", 
    desc: "Gangue de motoqueiros vindos de longe aparece vendendo vestuários e remédios com o símbolo de um outro Refúgio." 
  },
  { 
    suit: "paus", value: "J", icon: "♣️", type: "Eventos de Recursos", 
    title: "Fonte de Feromônios", 
    desc: "Resíduo biológico de criatura à escolha do(a) Assimilador(a) repleto de feromônios pode ser dispersado para atrair Animais." 
  },
  { 
    suit: "paus", value: "Q", icon: "♣️", type: "Eventos de Recursos", 
    title: "Poço de Petróleo", 
    desc: "Reserva de Biomassa: Petróleo é descoberta na região e atrai aqueles que pretendem explorá-la. Aumente um nível de Recursos Naturais da Região se ainda não houver fartura de biomassa." 
  },
  { 
    suit: "paus", value: "K", icon: "♣️", type: "Eventos de Recursos", 
    title: "Emissário Comercial", 
    desc: "Viajante de terras distantes traz a promessa de novas rotas de comércio úteis para as comunidades dentro da Região." 
  }
];

export const drawCards = (num = 3) => {
  const shuffled = [...eventDeck].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};