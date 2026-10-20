# node-red-dashboard-2-hmi

Build machine HMI screens for **Node-RED Dashboard 2.0** by dragging symbols onto a canvas. Wire one object (for example the output of `node-red-contrib-schneider-modbus-tags`) into the canvas and every symbol shows its own key. No SVG or Vue to write.

![Linha de pintura](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/pintura.png)

| Editor | Faceplate |
|---|---|
| ![Editor](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/editor.png) | ![Faceplate](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/faceplate.png) |
| **Peças mecânicas** | **CLP Schneider M221** |
| ![Mecânica](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/mecanica.png) | ![CLP](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/clp-schneider.png) |

**Requer** Node-RED 3+ e `@flowfuse/node-red-dashboard` (Dashboard 2.0) 1.x. Instale pelo **Gerenciar paleta** procurando `node-red-dashboard-2-hmi`, ou `npm install node-red-dashboard-2-hmi` na pasta do Node-RED. Novidades em [CHANGELOG.md](CHANGELOG.md).

[Português](#português) · [English](#english)

---

## Português

### Como usa

1. Arraste o nó **hmi canvas** (categoria Dashboard 2) para o fluxo. Em **Show in**, escolha **Página inteira** (o canvas ocupa a página toda) ou **Grupo** (fica dentro de um grupo, como os outros widgets). Escolha também o tamanho da tela em pixels e o tema.
2. Monte a tela de um destes jeitos:
   - **Na janela do nó:** arraste os símbolos da barra para a tela. O botão **Tela cheia** abre o editor na tela toda.
   - **No próprio dashboard:** faça o Deploy e clique em **Editar no dashboard**. A página abre em outra aba, em modo de edição e com os valores reais. Arraste, mova, configure e clique em **Salvar e fazer Deploy**. Se o editor do Node-RED estiver aberto, ele avisa que o fluxo mudou no servidor; é só aceitar a atualização.
3. Clique num símbolo para escolher a chave do payload, posição, tamanho, rotação e opções do símbolo.
4. Ligue no canvas qualquer nó que mande um objeto, por exemplo `{ "rpm": 1450, "velocidade": 42.5 }`. Cada símbolo mostra a chave dele. As chaves vão se somando: uma mensagem só com `rpm` não apaga `velocidade`.
5. Para mandar um valor solto, use `msg.topic` como chave: `msg.topic = "temp"`, `msg.payload = 21.5`.

### Símbolos

Na barra do editor, cada categoria abre um menu com miniaturas. Arraste o item para a tela ou clique para colocar no meio.

| Categoria | Itens |
|---|---|
| Formas | Imagem própria (SVG, PNG, JPG até 400 KB, ou um endereço), com uma segunda imagem opcional para quando a chave ligar. Retângulo, cantos redondos, chanfrado em cima, chanfrado nos cantos, curva à esquerda/direita, arco em cima, cápsula (tanque deitado), círculo/elipse, triângulo, trapézio, base/pé, funil, silo, hexágono, losango, paralelogramo, em L, em U, painel elétrico, proteção (tracejado) e fosso. Tons: os do tema (equipamento, escuro, fosso), só contorno, tracejado, os da tela da slitter (metal, metal com borda clara, aço escuro, grafite, fosso fundo, parede, piso, piso escuro, sensor) e cor personalizada. |
| Estruturas | Viga (vista lateral), viga I, perfil U, cantoneira, viga treliçada, tubo/eixo, coluna com chapas, pedestal, pedestal com mancal, mão-francesa, cavalete, suporte com pés e chapa de base/sapata. Mesmos tons das formas; gire para ficar na vertical. |
| Equipamentos | Bobina, rolo, motor, válvula, bomba, tanque (nível), esteira, cilindro (avançado/recuado), ventilador, faca circular, resistência e sensor (fotoelétrico, indutivo, fim de curso). Motor, válvula, bomba, esteira, ventilador e resistência aceitam uma **chave de falha**. Todo símbolo liga/desliga tem **Inverter sinal**, para sensor NF ou entrada ativa em 0. |
| Processo | Compressor, soprador, filtro de mangas (ΔP), válvula de controle (posição em %), válvula 3 vias, damper, misturador, trocador de calor, caldeira, torre de resfriamento, chiller, ciclone, medidor de vazão e instrumento ISA (bolha com letras, número e montagem). |
| Fábrica | Ponte rolante (posição do carro, altura do gancho e carga) e talha, robô (faísca quando solda), fonte de solda, estufa/forno (temperatura, porta aberta, aquecendo), cabine de pintura, calandra de 3 rolos, prensa/dobradeira (posição do martelo), balança, carrinho de transferência, AGV, empilhadeira e mesa de rolos. |
| Elétrica | Inversor de frequência (Hz, rodando, reverso, falha), disjuntor (fechado/aberto/disparado), contator, transformador (com texto de tensão), gerador e medidor de energia (kW e kWh). |
| Linhas | Material/chapa, tubulação, esteira e sinal. Arraste os pontos; puxe o ponto do meio para criar uma dobra; duplo clique apaga um ponto. Conexões de tubo (cotovelo, tê, cruzeta, flange, redução, tampão) e setas (simples, dupla, sentido). |
| Valores | Tag, KPI, texto, medidor (ponteiro), barra vertical e tendência (gráfico dos últimos segundos). Tag, medidor e barra têm escala e alarme abaixo/acima de um limite. **Barra ISA-101**: faixa normal, alarmes L/H e LL/HH, seta do valor e marcador de setpoint (outra chave), vertical ou horizontal. Contador de horas (o CLP pode mandar em h, min ou s) e de partidas. |
| Estados | LED, status (texto ligado/desligado), alarme (só aparece quando ativo), torre de sinalização (uma chave para cada cor), modo (MAN/AUTO/LOCAL/REMOTO, destaca o modo fora do normal), intertravamento (cadeado) e permissivo. |
| Comandos | Botão (pulso), chave seletora (inverte) e ajuste/setpoint (abre um campo para digitar o valor, com mínimo e máximo). |

### Escala

Em **Escala do valor**, o símbolo mostra `valor × multiplicar ÷ dividir + somar`. Ex.: o CLP manda `1450` e com dividir por `10` a tela mostra `145,0`. Num setpoint com escala, o valor digitado volta para o CLP já convertido.

### Texto com várias chaves

No **Texto** (e no subtítulo do **KPI**), `{chave}` vira o valor daquela chave do payload, e `{chave:1}` mostra com 1 casa decimal. Ex.: `Lote {lote} – {pecas} pç` mostra `Lote A12 – 1.450 pç`. No editor, chave sem valor aparece como `{chave}`.

### Formas para desenhar máquinas

- **Mecânica** (menu próprio): engrenagem, coroa de corrente, polia, roda, transmissão por correia e por corrente, redutor, acoplamento, mola, fuso, guia linear com carro, cremalheira, braço/elo, pino, bico, tambor, cilindro em pé, cone, caixa 3D, chapa com furos, rasgo, grade de proteção, porta e visor. Engrenagem, coroa, polia e roda podem **girar quando a chave ligar** (horário ou anti-horário).
- **Pneumática**: cilindro pneumático, atuador linear elétrico, válvula 5/2 com solenoide, unidade de conservação (FRL), ventosa, garra, unidade hidráulica, acumulador, manômetro, solenoide e silenciador.
- **Sensores**: fotoelétrico, indutivo/capacitivo, fim de curso, encoder, cortina de luz, scanner a laser, câmera, leitor de código, chave de nível, termopar, botão de emergência, sinalizador e chave de segurança da porta.
- **Manuseio**: servomotor, motorredutor, mesa giratória, pórtico X/Z, robô SCARA, robô delta, mesa elevatória, braço dançarino, operador, painel IHM e botoeira.
- **Produção**: rosca transportadora, elevador de canecas, alimentador vibratório, calha, desviador, extrusora, injetora, guilhotina, serra, spindle, furadeira, prensa C, enchedora, tampadora, rotuladora, envolvedora de palete, caixa, garrafa, lata e palete.
- Com uma **chave**, essas peças mostram o estado: a haste do cilindro sai, a garra fecha, o feixe do sensor é cortado, a lâmina desce, a mesa sobe, o pórtico desce, o molde fecha, a enchedora enche, o sinalizador acende. Encoder, mesa giratória e serra podem girar. Qualquer forma pode **escurecer quando a chave ligar**.
- **Posição pelo valor**: cilindro, atuador, garra, pórtico, SCARA, delta, mesa elevatória, dançarino, desviador, injetora, guilhotina, furadeira, prensa, tampadora, envolvedora, boia, fim de curso, manômetro, FRL e enchedora podem seguir um número (campo "A peça se move" = "Pela posição"). O valor entre mín. e máx. vira de recuado a avançado: a haste fica na posição do encoder, o ponteiro marca a pressão, as garrafas enchem pelo nível.
- **Quando a chave desligar** = "Ficar apagado": a peça fica clarinha e tracejada, para mostrar posto sem peça, palete vazio ou caixa ausente. O painel IHM acende a tela, o operador fica escuro quando está no posto, o silenciador solta ar e a unidade hidráulica tem luz de ligada.
- **Montagens prontas** no menu Blocos: cilindro com válvula e fins de curso, esteira com sensor e desviador, estação de envase, prensa com cortina de luz e emergência, pórtico pega e coloca. Ao colocar, o editor pergunta o nome (ex.: `Y1`) e as chaves já vêm prontas (`Y1.avancado`, `Y1.recuado`, `Y1.solenoide`). Vários nomes separados por vírgula colocam uma cópia de cada.

![Exemplo envase](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/envase.png)

![Peças para máquinas](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/pecas-maquinas.png)
- **Formas** ganhou anel, meio círculo, quarto de círculo, pentágono, octógono, estrela, cruz e seta larga.
- **Forma livre**: um polígono com pontos que você arrasta. Puxe o ponto azul do meio de um lado para criar um ponto novo; duplo clique apaga um ponto. **Cantos: curvas suaves** arredonda o desenho. As alças em volta (ou largura e altura) mudam o tamanho mantendo o desenho, e os botões ↻ ↺ ↔ ↕ giram 90° e espelham. Linhas também têm esses botões. Também enche pelo valor da chave.

Todas usam os mesmos tons do **Corpo** (tema, escuro, metal, cor personalizada...).

### Encher qualquer forma

Qualquer forma de **Formas** (silo, funil, círculo, forma livre...) pode encher pelo valor da chave: em **Encher pelo valor da chave** escolha de baixo para cima, de cima para baixo ou para os lados, e o vazio/cheio. Dá para mostrar o valor no meio e trocar a cor do nível.

### Gráficos

Categoria **Gráficos**:

- **Gráfico de barras**: uma barra por chave (`turno1:1º turno, turno2:2º turno`), ou uma chave que traz uma lista (`[118, 126, 109]`) com os rótulos separados por vírgula. Linha de **Meta** opcional; barras abaixo da meta podem ficar amarelas.
- **Rosca (donut)**: uma fatia por chave, com total no meio e legenda em %.
- **OEE**: disponibilidade × performance × qualidade (em % ou de 0 a 1), ou a chave do OEE pronto. Fica amarelo abaixo da meta e vermelho abaixo do limite.

### Tendência

O nó guarda os últimos minutos de cada chave usada numa **Tendência** (a janela do símbolo), então quem abre a tela depois já vê a curva cheia.

### Regras

Qualquer símbolo pode ter **regras**: quando uma chave (ou a do próprio símbolo) estiver ligada, desligada, igual, diferente, maior ou menor que um valor, o símbolo fica vermelho, amarelo, azul, verde, apagado, pisca ou some. Ex.: esconder a bobina quando `temBobina` = 0. As regras usam o valor do CLP, sem escala. No editor, símbolos escondidos aparecem transparentes. **Copiar** (numa regra) ou **Copiar todas** guarda as regras; **Colar regra** adiciona em outro símbolo, ou em todos os selecionados. Regra com chave vazia passa a usar a chave do símbolo onde foi colada.

### Comandos (clique no dashboard)

Qualquer símbolo pode ter uma ação em **Ao clicar no dashboard**. A mensagem sai pela saída do nó com `msg.topic` (o tópico da ação, ou a chave do payload) e `msg.payload`:

| Ação | Envia |
|---|---|
| Enviar um valor | O valor configurado (número, `true`/`false` ou texto). |
| Inverter | O contrário do valor atual da chave: 1/0, ou `true`/`false` se a chave for booleana. |
| Pulso | 1 ao apertar e 0 ao soltar (ou `true`/`false`). Bom para botões de partida do CLP. |
| Digitar um valor | Abre um teclado numérico na tela (bom para touch); fora do mínimo/máximo ou acima da **maior mudança de uma vez** não é enviado. |
| Ir para outra página | Abre outra página do dashboard (escolhida na lista) ou um endereço. Não sai mensagem pelo nó. |
| Abrir faceplate | Abre uma janela com estado, valor, modo, horas, partidas, alarmes do equipamento e os botões **Ligar**, **Desligar** e **Reset** (cada um com seu tópico e valor). Botão sem tópico não aparece. Para malhas de controle (**Regulador PID**): PV, SP e saída com barra, e botões **Auto**, **Manual**, **Alterar SP** e **Saída manual**. Clique com o botão direito (ou toque longo) também abre. |

**Pedir confirmação** abre um "Confirmar?" antes de enviar. O valor enviado é sempre o que está configurado no nó; o navegador só avisa qual símbolo foi clicado.

**Pedir senha** exige a senha do canvas (campo **Senha** no nó, guardada nas credenciais do Node-RED, fora do flow). Senha errada não envia nada e mostra "Senha incorreta" só para quem tentou. Sem senha configurada, ações com senha ficam bloqueadas.

Todo comando sai com `msg.audit = { ts, symbol, action, topic, value, user, socketId }`: quando, qual símbolo, o que foi enviado e quem (o usuário vem do login do dashboard, quando existe, como no FlowFuse). Ligue num nó de arquivo ou banco de dados para ter o registro de comandos.

### Alarmes

O canvas monta uma lista de alarmes (estilo ISA-18.2) com tudo que os símbolos já sabem: chave de falha, limites baixo/alto (e muito baixo/muito alto na barra ISA-101), banners de alarme e disjuntor disparado. Cada alarme guarda a hora em que entrou, e sai da lista só quando voltou ao normal **e** foi reconhecido. A lista e o histórico (últimos 500 eventos) sobrevivem a deploy e reinício se o contexto do Node-RED for persistente.

- **Lista de alarmes** (categoria Estados): abas Ativos e Histórico, prioridade com cor, botão ✓ por alarme e **Reconhecer todos**. Alarme não reconhecido pisca.
- **Resumo de alarmes**: sino com "N ALARMES · M novos", na cor da prioridade mais alta. Bom para o cabeçalho de todas as telas.
- Num símbolo, **Na lista de alarmes: não** tira ele da lista; **Prioridade** muda de 1 a 3.
- **Suprimir** (botão II na linha): esconde o alarme da lista e dos contadores pelo tempo configurado na Lista de alarmes (30 min por padrão). Fica na aba **Suprimidos**, com hora de volta e quem suprimiu; ▶ libera antes. Suprimir e liberar vão para o histórico.
- **Som** (no nó): sem som, bipe quando entra alarme novo, ou bipe a cada 10 s até reconhecer. O botão 🔔 na lista silencia só aquele navegador. O navegador só toca som depois de um clique na página.
- O símbolo com alarme ganha uma borda na cor da prioridade, piscando até reconhecer. Clique numa linha da lista para destacar o símbolo na tela.
- Reconhecer pelo fluxo: mande `msg._hmiAck = "all"` (ou o id do alarme) para o nó.
- Com **Eventos: enviar** no nó, cada mudança sai como `{ topic: 'alarme', payload: { event: 'ATIVO' | 'NORMAL' | 'RECONHECIDO', text, priority, ts, user } }`.

### Editor

- Arraste da barra de cima ou clique no símbolo para colocar no meio.
- Botões **Duplicar**, **Frente**, **Trás** e **Excluir** no painel do símbolo.
- Vários símbolos: `Shift`+clique, ou arraste numa área vazia para fazer um retângulo de seleção. Arrastar um move todos.
- Barra de organizar (ícones ao lado dos menus): alinhar à esquerda, centro, direita, topo, meio e base (com um símbolo só, alinha na tela), distribuir na horizontal/vertical, mesma largura, mesma altura e mesmo tamanho do último clicado, agrupar e desagrupar.
- Tamanho: 8 alças em volta do símbolo (cantos e lados). `Shift` num canto mantém a proporção. Funciona também com o símbolo girado.
- Grupos: `Ctrl+G` agrupa, `Ctrl+Shift+G` desagrupa. Clique seleciona e move o grupo inteiro; duplo clique num símbolo do grupo edita só ele. Alinhar e distribuir tratam cada grupo como uma peça.
- **↶ / ↷** desfazem e refazem.
- **Buscar símbolo…**: procura pelo nome em todas as categorias (ex.: "bomba", "viga"). `Enter` coloca o primeiro.
- **Zoom**: botões 🔍, `Ctrl` + roda do mouse ou `Ctrl` `+`/`-`/`0`. Com zoom, a roda do mouse, o botão do meio ou `Espaço` + arrastar movem a tela.
- **Guias**: ao arrastar, o símbolo encaixa nas bordas e no centro dos outros símbolos e da tela, com uma linha rosa. `Alt` desliga enquanto arrasta.
- **Travar** (`Ctrl+L`): o símbolo não é selecionado nem movido clicando na tela; bom para fundos e estruturas.
- **Camadas**: lista de todos os símbolos (o de cima primeiro) com busca por nome ou chave. Clique seleciona (até os travados), 🔒 trava, 👁 esconde só no editor. **Nome (em Camadas)** dá um nome a cada símbolo.
- **Blocos**: selecione símbolos e **Salvar seleção** guarda como bloco. O bloco entra em qualquer tela (clique ou arraste) já agrupado. Os blocos ficam no navegador; **Exportar** / **Importar** levam para outro computador num arquivo .json.
- **Bloco com parâmetro**: ao salvar, preencha **Parte que muda** (ex.: `M1`). Ela vira `{{tag}}` nas chaves, tópicos e textos. Ao colocar o bloco, o editor pergunta o valor; vários separados por vírgula (`M1, M2, M3`) colocam uma cópia para cada, lado a lado.
- Teclas: `Delete` apaga, setas movem (`Shift` = 10 px), `Ctrl+Z` / `Ctrl+Y` desfazem e refazem, `Ctrl+C` / `Ctrl+V` copiam e colam (também entre canvas abertos na mesma aba do navegador), `Ctrl+D` duplica, `Ctrl+A` seleciona tudo, `Esc` limpa a seleção.

### Qualidade do dado

- `msg.quality = { "temp": "bad" }` (ou `"uncertain"`, ou `"good"` para limpar) marca a chave: os símbolos dela ficam apagados com × (ruim) ou ? (incerto).
- **Valor velho** (no nó): uma chave que não recebe leitura há N segundos fica apagada com um relógio.

### SVG com partes ligadas

Símbolo em **Formas** para usar um desenho próprio (Inkscape, draw.io, P&ID). Escolha o arquivo .svg e escreva as ligações, uma por linha:

```
motor1 = M1.ligado          o elemento com id motor1 fica escuro quando a chave liga
falha1 = M1.falha : alarme  vermelho quando liga (": atencao" amarelo, ": esconder" some)
tempTxt = # temperatura     o texto mostra o valor
```

O editor lista os ids do desenho. Scripts, eventos e links para fora do desenho são removidos.

### Temas

- **ISA-101** (padrão): cinza e plano, cor só para condição anormal e alarme. Equipamento ligado fica cinza escuro, parado fica claro. O alarme usa cor, forma e número da prioridade.
- **Clássico**: escuro, no estilo dos painéis em SVG feitos à mão, com bobinas girando.

### Várias telas no mesmo canvas

Acima do desenho fica a barra **Telas**: **+ Tela** cria outra tela (Principal, Mecânica, Alarmes...), duplo clique ou **Renomear** muda o nome, **Apagar tela** tira a tela e os símbolos dela. No dashboard as telas viram abas no topo (opção **Telas** do nó: abas ou sem abas). Para trocar de tela por um botão, use a ação **Ir para outra tela (deste canvas)**. O fluxo também abre uma tela: `msg.ui_update = { screen: "Alarmes" }`.

### Movimento e cores

- **Movimento** (opção do nó): **Sempre que ligado** faz correias, correntes, polias, engrenagens, rodas, roscas, esteiras, ventiladores, rolos e o fluxo das linhas andarem quando a chave liga, nos dois temas. **Só no tema Clássico** deixa o ISA-101 parado; **Nunca** desliga tudo (o piscar de alarme continua).
- Transmissão por correia e por corrente: as polias giram e a correia corre. Novas engrenagens, polias e rodas já vêm com **Girar / correr quando a chave ligar** = horário.
- **Cor ligado** e **Cor desligado** em todo símbolo que liga e desliga, nas formas e nas linhas. **Tema** volta à cor do tema.
- Linhas: **Sentido do fluxo** (do primeiro ao último ponto ou invertido) e **Espessura da linha** em pixels.
- Cilindro e pistão: **Quando ativo o pistão** avança ou recua. A cor segue o "ativo", a haste vai para o lado escolhido. Nas peças que se movem (cilindro pneumático, garra, pórtico, guilhotina...) a opção é **Quando a chave ligar a peça**: avança/desce/fecha ou recua/sobe/abre, e também vale para a posição pelo valor.
- **Inverter sinal** agora existe em todas as formas do Corpo (fim de curso, sensores, boia...), para contato NF ou entrada ativa em 0.

![Movimento e cores](https://raw.githubusercontent.com/Eduardo-556/node-red-dashboard-2-hmi/main/docs/img/movimento-cores.png)

### Opções do canvas

| Opção | Para quê |
|---|---|
| Show in | Página inteira ou dentro de um grupo. |
| Screen | Tamanho da tela em pixels (o sistema de coordenadas dos símbolos). |
| Movimento | **Sempre que ligado** (padrão), **Só no tema Clássico** ou **Nunca**. |
| Telas | **Abas no topo** quando o canvas tem mais de uma tela, ou **Sem abas** (troca só por botão ou pelo fluxo). |
| Background | **Cor do tema**, **Transparente** (aparece o fundo da página do dashboard) ou **Cor do Dashboard** (segue o tema claro/escuro do Dashboard). |
| Fit | **Caber na tela**: a tela inteira aparece sem rolar. **Largura toda**: ocupa a largura e a altura acompanha. |
| Offline after | Segundos sem dados até a tela esmaecer e mostrar SEM COMUNICAÇÃO (0 desliga). |
| Number format | Formato dos números, ex. `pt-BR` (1.450,5) ou `en-US` (1,450.5). |
| Valor velho | Segundos sem leitura de uma chave até marcá-la como velha (0 desliga). |
| Confirmação | Segundos esperando o CLP devolver o valor de um comando (0 desliga). |
| Comandar / Reconhecer / Suprimir | Quem pode (nomes separados por vírgula; vazio = todos, `-` = ninguém). |

`msg.ui_update` muda em funcionamento: `theme`, `animate` (`always`, `classic`, `never`), `screen` (abre a tela em todas as páginas), `background`, `viewW`, `viewH`, `fit`, `locale`, `offlineAfter`, `staleAfter`, `alarmSound`.

### Exemplo

**Menu → Importar → Exemplos → node-red-dashboard-2-hmi**:

| Exemplo | Abre em | O que mostra |
|---|---|---|
| tela-basica | `/dashboard/hmi` | Slitter com bobinas, motor, tags e alarme. |
| pintura | `/dashboard/pintura` | Linha de pintura simulada: desengraxe, cabine, robô, estufa, tintas enchendo, OEE, peças por turno, tempo parado e lista de alarmes. Faceplate no motor da esteira. |
| esteira | `/dashboard/esteira` | Três esteiras simuladas com partir/parar, velocidade, horas por motor, boas × refugo e caixas por hora. |
| envase | `/dashboard/envase` | Linha de envase montada com as montagens prontas: a garrafa chega, o cilindro trava, as garrafas enchem pelo nível, tampa, rotula e solta. |
| clp-schneider | `/dashboard/clp` | Leitura de um M221 com o **node-red-contrib-schneider-modbus-tags** direto no canvas (as chaves são os nomes da lista de tags) e comandos convertidos para escrita Modbus. Tem um inject de valores de teste para ver a tela sem CLP. |

Pintura, esteira e envase funcionam sem CLP: uma função gera os valores a cada segundo e os comandos da tela mudam a simulação.

---

## English

1. Drop an **hmi canvas** node (Dashboard 2 category) into your flow. **Show in**: whole page (default) or a group. Pick the screen size in pixels and the theme.
2. Build the screen in the node's edit dialog (with a full-screen option), or deploy and click **Editar no dashboard** to edit it on the real dashboard page, with live values, then **Salvar e fazer Deploy**.
3. Click a symbol to set its payload key, position, size, rotation and options.
4. Wire any node that sends an object, e.g. `{ "rpm": 1450, "speed": 42.5 }`. Each symbol shows its key. Keys are merged, so a message with only `rpm` keeps `speed`. For a single value, use `msg.topic` as the key.

Palette (dropdown per category): 22 shapes; process (compressor, blower, bag filter, control valve, 3-way valve, damper, mixer, heat exchanger, boiler, cooling tower, chiller, cyclone, flowmeter, ISA instrument bubble); factory (overhead crane and hoist, robot, welder, oven, paint booth, 3-roll bending machine, press brake, scale, transfer cart, AGV, forklift, roller table); electrical (VFD, breaker, contactor, transformer, generator, energy meter); ISA-101 analog bar (L/H, LL/HH, setpoint), run-hours and start counters, mode and interlock/permissive indicators, pipe fittings and arrows; structures (beam side view, I-beam, U-channel, angle, truss, tube, column, pedestal, bearing pedestal, bracket, A-frame, stand, base plate); reel, roller, motor, valve, pump, tank, conveyor, cylinder, fan, circular knife, heater, sensor; lines (strip, pipe, conveyor, signal; editable points); tag, KPI, text, gauge, vertical bar, trend; LED, status chip, alarm banner, stack light; button, selector switch, setpoint. Editor: multi-select (Shift+click or rubber band), toolbar to align (to each other, or to the screen for one item) and distribute, same width/height/size, groups (Ctrl+G, double click edits one member), 8 resize handles (Shift keeps ratio, works rotated), shape tones from the slitter screen plus custom colours, undo/redo, copy/paste, duplicate, bring to front/send to back.

Trend history is kept by the node, so a page opened later shows the last minutes. Alarms can be shelved (suppressed for N minutes, with a Shelved tab and history events) and the node can beep on new alarms or every 10 s until acknowledged (muted per browser).

Click commands: any symbol can send a message from the node's output when clicked on the dashboard: a fixed value, a toggle of its key, a pulse (1 on press, 0 on release) a typed number checked against a min/max, navigation to another dashboard page, or a **faceplate** popup (state, value, mode, hours, starts, the equipment's alarms and Start/Stop/Reset buttons), with optional confirmation and optional **password** (stored in the node credentials). Every command carries `msg.audit` (`ts, symbol, action, topic, value, user, socketId`) for a command log.

Alarms (ISA-18.2 style): the canvas tracks every fault key, lo/hi limit, alarm banner and tripped breaker with activation time and acknowledgement; an alarm leaves the list once it is back to normal and acknowledged. **Alarm list** symbol (active and history tabs, ack one or all) and **alarm summary** symbol; optional alarm events on the node output. `msg.topic` is the action topic or the symbol key. **Background** can be the theme colour or transparent.

Per symbol: **scale** (`raw × factor ÷ divisor + offset`, reversed for typed setpoints) and **rules** (when a key is on/off/=/≠/>/< a value: red, yellow, blue, green, dimmed, blinking or hidden; copy one or all rules and paste them into other symbols or the whole selection). Every on/off symbol has **Invert signal** (normally closed sensors, active-low inputs). **Image** symbol: your own SVG/PNG/JPG (up to 400 KB, stored in the flow) or a URL, with an optional second image for the on state.

Machine parts (gears and pulleys that turn while a key is on, belt and chain drives, gearbox, coupling, spring, lead screw, linear guide, rack, link, 3D boxes and cylinders, guards, doors), more geometric shapes and a **free shape** (polygon with draggable points, straight or smooth). Text with `{key}` placeholders (several keys in one line), any shape filled by a value, charts (bar chart with goal line, donut, OEE = availability × performance × quality). Editor: symbol search, zoom and pan, smart guides, lock, layers panel (search, lock, hide in editor), and **blocks**: save a selection and reuse it on any screen (stored in the browser, export/import as JSON). Examples: paint line, conveyors (both simulated) and a Schneider M221 screen using node-red-contrib-schneider-modbus-tags.

Security and operation (0.1.1): page clicks go to the node through a small Dashboard 2.0 plugin, so a page can only trigger the commands configured on the symbols (never send values or its own messages). Per-canvas user lists for **commands**, **acknowledge** and **shelve** (user from the dashboard login or `httpNodeAuth`; empty = everybody, `-` = nobody), checked in Node-RED. Password tries are rate limited. Hold-to-run pulses are released by the node when the page closes, disconnects or stops answering. **Interlocks** per command (keys that must be on, `!` for off) with a padlock mark, max step for typed setpoints, **write confirmation** (dashed border until the key reads back the value, red on timeout), **data quality** (`msg.quality`, and stale keys), alarm border on the symbol (click a row in the alarm list to highlight it), PID faceplate (PV/SP/OP, auto/manual, setpoint and manual output), on-screen numeric keypad, `msg.enabled` and `msg.ui_update`, flow acknowledgement (`msg._hmiAck`), **parameterized blocks** (`{{tag}}`, place M1, M2, M3 at once) and an **SVG with bound parts** symbol (element ids follow keys; scripts and external links are stripped).

Machine parts (0.1.2): four new palette menus for the **Corpo** symbol, **Pneumática** (cylinders, 5/2 valve, FRL, gripper, vacuum cup...), **Sensores** (photo eye, proximity, light curtain, laser scanner, camera, e-stop, beacon...), **Manuseio** (servo, gearmotor, rotary table, gantry, SCARA, delta, scissor lift...) and **Produção** (screw conveyor, extruder, injection machine, guillotine, saw, filler, capper, labeler, wrapper, bottles, pallets...). With a key they show state: rod out, gripper closed, beam cut, blade down, mold closed, beacon lit.

Machine parts (0.1.3): 20 moving parts can follow a **position value** (min..max) instead of on/off, a part can go **ghost** when its key is off (no part / empty pallet), and the **Blocos** menu has **ready-made assemblies** (cylinder with valve and limit switches, conveyor with sensor and diverter, filling station, press with light curtain, pick and place gantry) whose keys use the name asked on drop. New example `envase`.

0.1.4: **several screens in one canvas** (Telas bar in the editor, tabs on the dashboard, "Ir para outra tela" click action, `msg.ui_update.screen`), **motion** setting (always / only Classic / never) so belts, chains, pulleys, gears, fans, rollers and line flow move in the ISA-101 theme too, belt and chain drives turn their pulleys, **own on/off colours** on every on/off symbol, shape and line, line **flow direction** and **thickness**, cylinder **advance or retract when active** (colour follows "active"), and **invert signal** on every Corpo shape (limit switches, sensors).

Themes: **ISA-101** (default; grey and flat, colour only for abnormal states and alarms, alarms coded by colour, shape and priority number) and **Classic** (dark, animated reels).

## Development

```
npm install
npm run build   # widget (resources/ui-hmi-canvas.umd.js) and editor library (resources/hmi-editor.js)
npm test
```

The symbol library (`ui/symbols/`) and the editor (`ui/editor/`) are shared: the same code runs in the Node-RED dialog and on the dashboard page.

## License

MIT
