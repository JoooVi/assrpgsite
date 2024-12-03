require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const CharacterTrait = require('../models/CharacterTrait');
const Assimilation = require('../models/Assimilation');

const initialItems = [
    { name: 'Pedaço de Pau', type: 'Arma', category: 0, weight: 2, description: 'Uma arma improvisada feita de madeira.', characteristics: { points: 0, details: [] }, isCustom: false },
    { name: 'Tijolo', type: 'Arma', category: 0, weight: 3, description: 'Uma arma improvisada feita de tijolo.', characteristics: { points: 0, details: [] }, isCustom: false },
    { name: 'Faca de Cozinha', type: 'Arma', category: 1, weight: 1, description: 'Uma faca comum usada na cozinha.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Cano Metálico', type: 'Arma', category: 1, weight: 2, description: 'Um pedaço de cano metálico usado como arma.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Lanterna', type: 'Ferramenta', category: 1, weight: 1, description: 'Uma lanterna útil para iluminar áreas escuras.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Barrinha de Proteínas', type: 'Alimento', category: 1, weight: 0.5, description: 'Uma barrinha nutritiva para recarregar energia.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Pé de Cabra', type: 'Ferramenta', category: 2, weight: 3, description: 'Uma ferramenta usada para abrir portas ou caixas.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Livro de Anatomia', type: 'Livro', category: 2, weight: 2, description: 'Um livro detalhando a anatomia humana.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Mochila Grande', type: 'Equipamento', category: 2, weight: 1, description: 'Uma mochila grande para carregar mais itens.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Bússola', type: 'Ferramenta', category: 2, weight: 0.5, description: 'Uma bússola para orientação.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Pistola', type: 'Arma', category: 3, weight: 1, description: 'Uma pistola com 6 balas.', characteristics: { points: 3, details: [] }, isCustom: false },
    { name: 'Kit Médico', type: 'Equipamento', category: 3, weight: 2, description: 'Um kit médico com suprimentos de primeiros socorros.', characteristics: { points: 3, details: [] }, isCustom: false },
    { name: 'Chicote', type: 'Arma', category: 3, weight: 1, description: 'Um chicote usado como arma.', characteristics: { points: 3, details: [] }, isCustom: false },
    { name: 'Coquetel Molotov', type: 'Arma', category: 4, weight: 1, description: 'Uma garrafa de vidro contendo líquido inflamável.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Explosivo', type: 'Arma', category: 4, weight: 2, description: 'Um dispositivo explosivo improvisado.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Mochila de Acampamento', type: 'Equipamento', category: 4, weight: 2, description: 'Uma mochila equipada para acampar.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Taco de Baseball com Pregos', type: 'Arma', category: 4, weight: 2, description: 'Um taco de baseball modificado com pregos.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Colete à Prova de Balas', type: 'Equipamento', category: 5, weight: 3, description: 'Um colete que protege contra balas.', characteristics: { points: 5, details: [] }, isCustom: false },
    { name: 'Equipamento Militar', type: 'Equipamento', category: 5, weight: 4, description: 'Equipamento usado por militares.', characteristics: { points: 5, details: [] }, isCustom: false },
    { name: 'Estilingue', type: 'Arma', category: 0, weight: 1, description: 'Uma arma improvisada feita de galho e elástico, usada para lançar pequenas pedras.', characteristics: { points: 0, details: [] }, isCustom: false },
    { name: 'Garrafa Quebrada', type: 'Arma', category: 0, weight: 1, description: 'Uma garrafa de vidro quebrada usada como arma de curto alcance.', characteristics: { points: 0, details: [] }, isCustom: false },
    { name: 'Arco e Flecha de Treinamento', type: 'Arma', category: 1, weight: 2, description: 'Um arco leve usado para treinos, com flechas de ponta romba.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Kit de Ferramentas Básico', type: 'Ferramenta', category: 1, weight: 3, description: 'Um conjunto de ferramentas básicas, incluindo chave de fenda, alicate e martelo.', characteristics: { points: 1, details: [] }, isCustom: false },
    { name: 'Machado de Lenhador', type: 'Arma/Ferramenta', category: 2, weight: 4, description: 'Um machado robusto, ótimo para cortar madeira e útil como arma.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Mapa Topográfico', type: 'Ferramenta', category: 2, weight: 1, description: 'Um mapa detalhado da região, essencial para navegação em áreas desconhecidas.', characteristics: { points: 2, details: [] }, isCustom: false },
    { name: 'Espingarda de Caça', type: 'Arma', category: 3, weight: 5, description: 'Uma espingarda usada para caça, com munição limitada.', characteristics: { points: 3, details: [] }, isCustom: false },
    { name: 'Rádio Comunicador', type: 'Ferramenta', category: 3, weight: 2, description: 'Um dispositivo de comunicação de longo alcance, útil para coordenação em grupo.', characteristics: { points: 3, details: [] }, isCustom: false },
    { name: 'Lança Chamas Improvisado', type: 'Arma', category: 4, weight: 6, description: 'Um dispositivo improvisado que lança chamas, perigoso e altamente inflamável.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Kit de Sobrevivência Avançado', type: 'Equipamento', category: 4, weight: 3, description: 'Um kit completo com suprimentos para sobrevivência, incluindo facas, abrigo e suprimentos médicos.', characteristics: { points: 4, details: [] }, isCustom: false },
    { name: 'Katana', type: 'Arma', category: 5, weight: 3, description: 'Uma katana afiada e balanceada, ideal para combate corpo a corpo.', characteristics: { points: 5, details: [] }, isCustom: false },
    { name: 'Drone de Reconhecimento', type: 'Ferramenta', category: 5, weight: 2, description: 'Um drone equipado com câmera e sensores, usado para explorar áreas de risco sem exposição direta.', characteristics: { points: 5, details: [] }, isCustom: false },
  ];

const initialCharacterTraits = [
  { name: 'AGROBOY', description: 'Sempre que você faz um teste de conhecimentos Agrários para identificar grãos, frutos, vegetais, mudas ou pragas agrícolas, você pode considerar todas as adaptações (cervo) em sucesso (joaninha).', category: 'Agrários', pointsCost: 2, isCustom: false },
  { name: 'Artes Marciais', description: 'Ao ter sucesso em um teste de Prática Esportiva para golpear um adversário você pode considerar uma quantidade de Adaptação(cervo) como Sucesso(joaninha) até um máximo igual ao seu valor em Pratica Esportiva.', category: 'Prática Esportiva', pointsCost: 2, isCustom: false },
  { name: 'Canivete Suíço', description: 'Sempre que você faz um teste de Prática com Ferramentas você pode usar 1 adaptação(cervo) para adicionar uma característica a ferramenta que está usando no teste. Essa característica deve ser da mesma categoria que a ferramenta (ou de categoria menor). Você pode usar 1 Sucesso(joaninha) para aumentar a categoria da característica adquirida com essa habilidade em 1.', category: 'Prática com Ferramentas', pointsCost: 2, isCustom: false },
  { name: 'Ciência Forense Mutacional', description: 'Sempre que fizer um teste de Conhecimentos para tentar entender a natureza de uma criatura, você pode usar 1 adaptação(cervo) para fazer perguntas adicionais sobre um tópico que você já tenha informações. Cada adaptação(cervo) concede uma pergunta adicional.', category: 'Conhecimentos', pointsCost: 2, isCustom: false },
  { name: 'Contrabandista', description: 'Sempre que você faz um teste de Infiltração para roubar ou esconder objetos você pode usar 1 adaptação(cervo) para esconder um objeto adicional de mesmo tamanho ou menor.', category: 'Infiltração', pointsCost: 2, isCustom: false },
  { name: 'Detetive de Campo', description: 'Sempre que você faz um teste de Instinto de Sagacidade para tentar organizar a ordem de uma série de pistas encontradas, você pode usar 1 adaptação(cervo) para questionar ao Assimilador se duas pistas têm relação. O Assimilador deve responder de maneira verdadeira.', category: 'Instinto de Sagacidade', pointsCost: 2, isCustom: false },
  { name: 'Encantador de Animais', description: 'Sempre que você faz um teste de Influência para interagir com animais você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Influência', pointsCost: 2, isCustom: false },
  { name: 'Esquiva Precisa', description: 'Quando for sofrer dano de uma ameaça que esteja ativamente te atacando, você pode fazer um teste de Reação Esportiva para tentar reduzir o dano. Cada Sucesso(joaninha) reduz o dano em 1. A quantidade máxima de dano que você pode reduzir dessa maneira é igual ao seu Valor em Reação.', category: 'Reação Esportiva', pointsCost: 3, isCustom: false },
  { name: 'Face Amigável', description: 'Sempre que você faz um teste de Influência para tentar convencer alguém com honestidade, você pode receber um sucesso(joaninha) adicional em uma face de dado a sua escolha.', category: 'Influência', pointsCost: 2, isCustom: false },
  { name: 'Memória Afiada', description: 'Sempre que você faz um teste de Sagacidade para lembrar, identificar ou conectar informações que podem ter sido vistas por você, você pode considerar todos Adaptação(cervo) como Sucesso(joaninha).', category: 'Sagacidade', pointsCost: 2, isCustom: false },
  { name: 'Mente de Ferro', description: 'Sempre que você faz um teste de Resolução contra algo que afeta seu estado emocional, você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Resolução', pointsCost: 2, isCustom: false },
  { name: 'Modificações Escamoteáveis', description: 'No final da etapa de Recuperação você pode fazer um teste de Sagacidade Armas. Para cada Sucesso(joaninha) que tiver, você pode adicionar uma característica de equipamento em uma arma disponível. A característica deve ser da mesma categoria que a arma, mas reduz em 1 a quantidade de usos dela. Cada Adaptação(cervo) que tiver ignora uma dessas reduções de uso.', category: 'Sagacidade Armas', pointsCost: 2, isCustom: false },
  { name: 'Natureza Questionadora', description: 'Sempre que você faz um teste de Sagacidade para desvendar mistérios ou adquirir novas informações você pode fazer com que cada Adaptação(cervo) mantido elimine uma Pressão(Coruja).', category: 'Sagacidade', pointsCost: 2, isCustom: false },
  { name: 'Parkour!', description: 'Sempre que você faz um teste para passar rapidamente por uma zona arriscada ou apertada, você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Movimentação', pointsCost: 2, isCustom: false },
  { name: 'Pegada Forte', description: 'Sempre que você faz um teste de Potência para levantar, sustentar ou amparar uma quantidade grande de peso, você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Potência', pointsCost: 2, isCustom: false },
  { name: 'Piloto de Fuga', description: 'Sempre que você faz um teste para conduzir um veículo você pode considerar todos os adaptação(cervo) como Sucesso(joaninha).', category: 'Condução', pointsCost: 2, isCustom: false },
  { name: 'Primeiros Socorros', description: 'No final da etapa de Recuperação você pode fazer um teste de Sagacidade Medicina. Para cada Sucesso(joaninha), você e seus aliados recuperam uma caixa de saúde.', category: 'Sagacidade Medicina', pointsCost: 2, isCustom: false },
  { name: 'Punhos de Ferro', description: 'Sempre que estiver atacando desarmado você pode adicionar 2 Adaptação(cervo) em uma face de dado mantido.', category: 'Combate', pointsCost: 2, isCustom: false },
  { name: 'Química do Bem', description: 'Sempre que você faz um teste com Conhecimentos Exatos para identificar ou modificar uma substância química, você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Conhecimentos Exatos', pointsCost: 2, isCustom: false },
  { name: 'Resiliente', description: 'Ao sofrer dano, você pode gastar 1 Ponto de Determinação para marcar uma caixa de saúde a menos.', category: 'Determinação', pointsCost: 2, isCustom: false },
  { name: 'Saque Rápido', description: 'Você pode usar Adaptação(cerv) para sacar e/ou guardar uma arma ou equipamento durante uma ação (permitindo se beneficiar de mais de um equipamento em uma única ação).', category: 'Agilidade', pointsCost: 2, isCustom: false },
  { name: 'Sentidos de Sobrevivência Aguçados', description: 'Sempre que você faz um teste com Reação para tentar minimizar os danos de um perigo que esteja lhe ameaçando (exceto ataques diretos de criaturas), você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Reação', pointsCost: 2, isCustom: false },
  { name: 'Sucateiro', description: 'Sempre que você faz um teste de Prática com Ofícios para desmanchar ou desmontar um objeto você pode receber um Sucesso(joaninha) adicional em uma face de dado a sua escolha.', category: 'Prática com Ofícios', pointsCost: 2, isCustom: false },
  { name: 'Vasculhar a Fundo', description: 'Sempre que você faz um teste de Percepção para procurar por recursos ou pistas, você pode considerar todos os Adaptação(cervo) como Sucesso(joaninha).', category: 'Percepção', pointsCost: 2, isCustom: false }
];

const initialAssimilations = [
  { name: 'Assimilação Astuta', description: '+1 ponto em Sagacidade (pode ultrapassar o limite máximo) (Ás de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Astuta', description: 'Sempre que realizar um teste de Sagacidade, você pode usar 1 ponto de assimilação para adicionar 1 Adaptação(cervo) a face de um dado. (Ás de copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Astuta', description: 'Sempre que realizar um teste de Infiltração, você pode ignorar 1 pressão(coruja) em um dado - requer Assimilação 3 para adquirir. (Ás de copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Astuta', description: 'Sempre que realizar um teste de Sagacidade, você pode adicionar 1 Sucesso(joaninha) à face de um dado - requer Assimilação 5 para adquirir. (Ás de copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Astuta', description: 'Sempre que realizar um teste de Sagacidade, você pode substituir todas adaptações(cervo)as por Sucesso(joaninha) - requer Assimilação 7 para adquirir. (ÁS de copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Alto-Reflexo', description: 'Adicione +1 ponto em Reação (pode ultrapassar o limite máximo).(2 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Alto-Reflexo', description: 'Use 1 ponto de assimilação: adicione um adaptação(cervo) à face de um dado de Reação em uma rolagem.(2 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Alto-Reflexo', description: 'Ignore uma Pressão(coruja) na sua primeira ação em um conflito - requer Assimilação 3 para adquirir.(2 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Alto-Reflexo', description: 'Adicione Sucesso(joaninha) à face de um dado de Reação - requer Assimilação 5 para adquirir.(2 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Alto-Reflexo', description: 'Pode substituir uma Pressão(Coruja) por Adaptação(cervo) em um dado de Reação - requer Assimilação 7 para adquirir.(2 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Atenta', description: 'Adicione +1 ponto em Percepção (pode ultrapassar o limite máximo).(3 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Atenta', description: 'Use 1 ponto de assimilação: adicione um Sucesso(joaninha) à face de um dado de Percepção em uma rolagem(3 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Atenta', description: 'Uma vez por rodada você pode transferir um Sucesso(joaninha) em Percepção para um aliado sem pagar o custo de Adaptação(cervo) - requer Assimilação 3 para adquirir(3 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Atenta', description: 'Adicione Adaptação(cervo) à face de um dado de Percepção - requer Assimilação 5 para adquirir(3 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Atenta', description: 'Pode substituir uma Adaptação(cervo) por Sucesso(joaninha) em um dado de Percepção - requer Assimilação 7 para adquirir(3 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Vigorosa', description: 'Está imune aos efeitos da condição Ferido. (4 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Vigorosa', description: 'Dobra a quantidade de pontos de saúde no nível 5 (antes de morrer). (4 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Vigorosa', description: 'Recupera 1 ponto de saúde extra por fase de recuperação - requer Assimilação 3 para adquirir. (4 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Vigorosa', description: 'Recebe um ponto de saúde máxima extra por nível - requer Assimilação 5 para adquirir. (4 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Vigorosa', description: 'Ignora até 2 Pressões(Coruja)em dados de Resolução - requer Assimilação 7 para adquirir. (4 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Silvestre', description: 'Adicione um Sucesso(joaninha) em um dado de Infiltração para se camuflar na vegetação. (5 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Silvestre', description: 'não sofre perda de determinação por dormir no relento. (5 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Silvestre', description: 'Pode adicionar 1 Sucesso(joaninha) na face de um dado em testes baseados em olfato - requer Assimilação 3 para adquirir. (5 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Silvestre', description: 'Pode se mover em velocidade normal nas copas das árvores - requer Assimilação 5 para adquirir. (5 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Silvestre', description: 'O Rei da Selva nunca é atacado por animais - requer Assimilação 7 para adquirir. (5 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Pujante', description: 'Pode usar Adaptação(cervo) como Sucesso(joaninha) para ações de salto. (6 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Pujante', description: 'Converte Adaptação(cervo) em Sucesso(joaninha) para deslocar objetos pesados. (6 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Pujante', description: 'Mantém um dado a mais para quebrar ou danificar objetos inanimados - Requer assimilação 3 para adquirir. (6 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Pujante', description: 'Pode utilizar armas improvisadas ou naturais com Prática de Armas como se fossem armas brancas - Requer Assimilação 5 para adquirir. (6 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Pujante', description: 'Em rolagens assimiladas para testes de práticas esportivas os dados da prática não são descartados - requer Assimilação 7 para adquirir. (6 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Imponente', description: 'Adicione +1 ponto em Conhecimento Social (pode ultrapassar o limite máximo). (7 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Imponente', description: 'Em ações de Influência para intimidar ou demonstrar autoridade pode converter Adaptação(cervo) em Sucesso(joaninha). (7 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Imponente', description: 'No início da fase de conflito pode usar um ponto de Assimilação para retirar um dado (à escolha do Assimilador) de Conflito que contenha ameaça senciente - requer Assimilação 3 para adquirir. (7 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Imponente', description: 'O Líder Nato pode ceder para anu lar de aliados - requer Assimilação 5 para adquirir. (7 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Imponente', description: 'Uma vez por Fase pode transferir um ponto de Determinação para um aliado - requer Assimilação 7 para adquirir. (7 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Esguia', description: 'Adicione +1 ponto em Prática de Infiltração (pode ultrapassar o limite máximo). (8 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Esguia', description: 'Se estiver se movendo furtivamente ao iniciar um Conflito, não precisa utilizar Reação na primeira rodada. (8 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Esguia', description: 'Em rolagem para evitar detecção, o esguio pode adicionar à face de um dado de Infiltração - requer Assimilação 3 para adquirir. (8 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Esguia', description: 'Sempre que adicionar Sucesso(joaninha) para ação de Fuga em conflito, adicione um a mais. - requer Assimilação 5 para adquirir. (8 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Esguia', description: 'Ignora o requisito mínimo individual para Fuga coletiva de Conflito - requer Assimilação 7 para adquirir. (8 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Sensitiva', description: 'Consegue sentir olhares hostis mesmo sem ver a ameaça (9 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Sensitiva', description: 'Consegue sentir a presença de criaturas assimiladas em um raio de 15m(9 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Sensitiva', description: 'Pode usar Adaptação(cervo) ou Sucesso(joaninha) em qualquer teste de interação social para saber o nivel de assimilação de uma criatura olhando fixamente por alguns segundos - requer Assimilação 3 para adquirir.(9 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Sensitiva', description: 'Sempre que o Assimilador sacar uma carta do baralho de ameaças ele deve avisar isso antes ao Sensitivo - requer Assimilação 5 para adquirir. (9 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação Sensitiva', description: 'Pode mudar a ação declarada sem gastar Adaptação(cervo). - requer Assimilação 7 para Adquirir. (9 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Presa', description: 'Pode usar audição aguçada e gastar um ponto de Assimilação para agir com Percepção em qualquer situação em que agiria com Reação. (10 de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Presa', description: 'Pode usar um ponto de Assimilação para aumentar sua velocidade e manter um dado a mais em rolagem de Fuga. (10 de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Presa', description: 'Enxerga normalmente na penumbra - requer Assimilação 3 para adquirir. (10 de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Presa', description: 'Não pode ser rastreado - requer Assimilação 5 para adquirir. (10 de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Presa', description: 'Pode gastar um ponto de Assimilação e abdicar de sua próxima rolagem para cancelar uma ativação de Ameaça em um conflito - requer Assimilação 7 para adquirir (10 de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },  
  { name: 'Assimilação de Feromônios', description: 'Conta como se tivesse um ponto a mais em Influência para atrair a atenção de criaturas da mesma espécie. (Valete de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Feromônios', description: 'Feromônios de alarme transformam adaptações em sucessos em ações de intimidação (Valete de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Feromônios', description: 'Feromônios de trilha deixam um rastro que só pode ser seguido por aliados - requer Assimilação 3 para adquirir. (Valete de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Feromônios', description: 'Feromônios de recrutamento indicam recursos na região (não precisa ser verdade) o Infectado escolhe quem capta esses finais - requer Assimilação 5 para adquirir. (Valete de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação de Feromônios', description: 'Feromônios de ataque custam 1 de mutação e aumentam 1d12 em todas as rolagens de Neutralização de Ameaças do Infectado e de seus aliados em cenas de conflito - requer Assimilação 7 para adquirir. (Valete de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Flora', description: 'Adicione +1 ponto na Aptidão Conhecimento Agrário (pode ultrapassar o limite máximo) (Dama de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Flora', description: 'Use 1 ponto de assimilação: revive vegetação morta, desde que ainda não esteja decomposta (Dama de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Flora', description: 'Consegue sentir as funções vitais da flora e curar suas enfermidades - demanda trabalho agrônomo - requer Assimilação 3 para adquirir (Dama de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Flora', description: 'É capaz de realizar fotossíntese - Requer Assimilação 5 para adquirir. (Dama de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Flora', description: 'Pode acelerar em até 10 vezes o crescimento da vegetação - requer Assimilação 7 para adquirir (Dama de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Fauna', description: 'Adicione +1 ponto em Conhecimento Biológico (pode ultrapassar o limite máximo) (Rei de Copas)', category: 'Evolutivas', successCost: 1, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Fauna', description: 'Use 1 ponto de assimilação: dobra a recuperação de saúde da criatura tocada por uma semana. (Rei de Copas de Copas)', category: 'Evolutivas', successCost: 2, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Fauna', description: 'Consegue sentir as funções vitais da fauna e não é percebido como ameaça ou presa por animais - demanda trabalho agrônomo - requer Assimilação 3 para adquirir (Rei de Copas)', category: 'Evolutivas', successCost: 3, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Fauna', description: 'Pode domesticar animais silvestres através de um teste de Influência + Resolução  requer Assimilação 5 para adquirir (Rei de Copas)', category: 'Evolutivas', successCost: 4, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
  { name: 'Assimilação da Fauna', description: 'Cria rebanho que o segue por conta própria testando Influência + Biológico - requer Assimilação 7 para adquirir. (Rei de Copas)', category: 'Evolutivas', successCost: 5, adaptationCost: 0, pressureCost: 0, evolutionType: 'copas', isCustom: false },
];

async function preloadData() {
  try {
    console.log('Conectado ao MongoDB. Preenchendo o banco com dados iniciais...');

    await Item.deleteMany();
    await Item.insertMany(initialItems);

    await CharacterTrait.deleteMany();
    await CharacterTrait.insertMany(initialCharacterTraits);

    await Assimilation.deleteMany();
    await Assimilation.insertMany(initialAssimilations);

    console.log('Dados pré-carregados com sucesso!');
  } catch (error) {
    console.error('Erro ao pré-carregar os dados:', error);
  } finally {
    mongoose.connection.close();
  }
}

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Erro: variável de ambiente MONGO_URI não definida no arquivo .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexão com o MongoDB estabelecida.');
    await preloadData();
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }
})();