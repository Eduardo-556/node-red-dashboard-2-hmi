# Changelog

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
