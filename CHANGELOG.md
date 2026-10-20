# Changelog

## 0.1.5

Novidades:

- Horímetro com **horas, minutos e segundos em chaves separadas** ("O CLP manda em: Horas, minutos e segundos separados"). A chave do símbolo é a das horas; os minutos e os segundos têm campo próprio (segundos opcional). Mostra `1.520 h 07 min 43 s`.

## 0.1.4

Novidades:

- **Várias telas no mesmo canvas**: barra Telas no editor (+ Tela, Renomear, Apagar tela), abas no topo do dashboard, ação de clique **Ir para outra tela** e `msg.ui_update.screen`.
- Opção **Movimento** do nó: sempre que ligado (padrão), só no tema Clássico ou nunca. Correias, correntes, polias, engrenagens, rodas, esteiras, ventiladores, rolos e o fluxo das linhas agora andam também no ISA-101.
- Transmissão por correia e por corrente: as polias giram e a correia corre. Novas engrenagens, polias e rodas já vêm girando.
- **Cor ligado / Cor desligado** em todo símbolo que liga e desliga, nas formas e nas linhas.
- Linhas: **sentido do fluxo** invertido e **espessura** em pixels.
- Cilindro: **quando ativo o pistão avança ou recua** (a cor segue o ativo). Peças que se movem: **quando a chave ligar a peça** avança ou recua.
- **Inverter sinal** em todas as formas do Corpo (fim de curso, sensores, boia).

## 0.1.3

Novidades:

- 20 peças podem seguir um **valor de posição** (mín. a máx.) em vez de liga/desliga: cilindro, atuador, garra, pórtico, SCARA, delta, mesa elevatória, dançarino, desviador, injetora, guilhotina, furadeira, prensa, tampadora, envolvedora, boia, fim de curso, manômetro, FRL e enchedora (as garrafas enchem pelo nível).
- **Montagens prontas** no menu Blocos: cilindro com válvula e fins de curso, esteira com sensor e desviador, estação de envase, prensa com cortina de luz e emergência, pórtico pega e coloca. Perguntam o nome e montam as chaves.
- Opção **Quando a chave desligar: ficar apagado** (posto sem peça, palete vazio).
- Painel IHM acende a tela, operador escurece quando está no posto, silenciador solta ar, unidade hidráulica com luz de ligada.
- Exemplo **envase** (`/dashboard/envase`).

## 0.1.2

Novidades:

- 55 peças novas para montar máquinas no símbolo **Corpo**, em quatro menus novos: **Pneumática**, **Sensores**, **Manuseio** e **Produção**.
- As peças seguem a chave: haste do cilindro sai, garra fecha, feixe do sensor é cortado, lâmina desce, mesa sobe, molde fecha, sinalizador acende, botão de emergência afunda.
- Encoder, mesa giratória e serra podem girar com a chave.
- Opção **Escurecer quando a chave ligar** em qualquer forma do Corpo.

## 0.1.1

Segurança / security:

- Os cliques do dashboard chegam ao nó por um plugin do Dashboard 2.0: a página não consegue mais mandar valores ou mensagens próprias pelo nó, só os comandos dos símbolos.
- Quem pode **comandar**, **reconhecer** e **suprimir** alarmes (lista de usuários no nó, conferida no Node-RED).
- Senha: 5 erros em 5 minutos bloqueiam por 1 minuto; o aviso vai só para quem errou.
- Pulso solto pelo servidor quando a página fecha, cai ou para de responder. Pulso com senha passou a funcionar (pede a senha uma vez).
- Endereço de salvar do editor no dashboard aceita só caminho do próprio servidor; a chave de edição expira e sai da barra de endereço.
- O salvar no Node-RED fala só com o próprio computador.

Correções:

- Reconhecer alarme pelo fluxo (`_hmiAck`) não dá mais erro.
- Tendência de 1 h cobre a hora toda (amostras distribuídas no tempo) e sobrevive ao deploy.
- Mensagens para o dashboard menores (sem os campos de quem mandou, histórico só quando muda).
- `msg.enabled = false` desliga os comandos; `msg.ui_update` muda tema, tamanho e opções.
- "Reconhecer todos" não reconhece suprimidos; texto e prioridade do alarme seguem o símbolo depois do deploy; alarmes da partida saem depois que o fluxo começa.
- Blocos importados são conferidos.

Novidades:

- Qualidade do dado (`msg.quality`, valor velho), confirmação do CLP depois de um comando, intertravamento com cadeado, maior mudança de uma vez no ajuste.
- Faceplate de regulador PID (PV, SP, saída, Auto/Manual).
- Teclado numérico na tela para valores e senha.
- Borda de alarme no símbolo e destacar o símbolo pela lista de alarmes.
- Bloco com parâmetro (`{{tag}}`, várias cópias de uma vez).
- Símbolo **SVG com partes ligadas**.
- Fundo **Cor do Dashboard**.

## 0.1.0 (2026-10-17)

Primeira versão publicada. / First published version.

- Alças de tamanho na forma livre e nas linhas, e botões para girar 90° e espelhar.
- Tendência com histórico guardado no nó: a curva já aparece cheia quando a página abre.
- Alarmes: suprimir por N minutos (aba Suprimidos, eventos SUPRIMIDO / LIBERADO) e som (bipe em alarme novo ou a cada 10 s até reconhecer, com silenciar por navegador).
- Imagens no README, exemplo de pintura com tendência e som.

## 0.0.13

- Menu **Mecânica**: engrenagem, coroa, polia, roda (podem girar pela chave), transmissão por correia e corrente, redutor, acoplamento, mola, fuso, guia linear, cremalheira, braço, pino, bico, tambor, cilindro, cone, caixa 3D, chapa com furos, rasgo, grade, porta, visor.
- Formas: anel, meio círculo, quarto de círculo, pentágono, octógono, estrela, cruz, seta larga.
- **Forma livre**: polígono com pontos editáveis, cantos retos ou curvas suaves, enche pelo valor.

## 0.0.12

- Gráfico de barras com meta, rosca e OEE.
- Texto com várias chaves (`{chave}`), encher qualquer forma pelo valor.
- Editor: busca de símbolo, zoom, guias, travar, camadas, blocos reutilizáveis (exportar / importar).
- Exemplos: pintura, esteira e CLP Schneider.

## 0.0.11

- Lista e resumo de alarmes (ISA-18.2) com reconhecimento e histórico.
- Faceplate, senha por comando e `msg.audit` em todo comando.

## 0.0.1 – 0.0.10

- Canvas com editor de arrastar e soltar, edição no próprio dashboard, temas ISA-101 e Clássico.
- Símbolos de equipamentos, processo, fábrica, elétrica, estruturas, linhas, valores, estados e comandos.
- Ações de clique (valor, inverter, pulso, digitar, página), escala, regras, inversão de sinal, grupos, alinhar e distribuir.
