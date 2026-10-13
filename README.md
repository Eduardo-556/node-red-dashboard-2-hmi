# node-red-dashboard-2-hmi

Build machine HMI screens for **Node-RED Dashboard 2.0** by dragging symbols onto a canvas. Wire one object (for example the output of `node-red-contrib-schneider-modbus-tags`) into the canvas and every symbol shows its own key. No SVG or Vue to write.

> **Status: prototype (0.0.x).** 50+ palette items (shapes, equipment, lines, values, states, commands), click commands and the drag-and-drop editor. Not published to npm yet.

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
| Formas | Imagem própria (SVG, PNG, JPG até 400 KB, ou um endereço), com uma segunda imagem opcional para quando a chave ligar. Retângulo, cantos redondos, chanfrado em cima, chanfrado nos cantos, curva à esquerda/direita, arco em cima, cápsula (tanque deitado), círculo/elipse, triângulo, trapézio, base/pé, funil, silo, hexágono, losango, paralelogramo, em L, em U, painel elétrico, proteção (tracejado) e fosso. Tons: equipamento, escuro, fosso, só contorno, tracejado. |
| Equipamentos | Bobina, rolo, motor, válvula, bomba, tanque (nível), esteira, cilindro (avançado/recuado), ventilador, faca circular, resistência e sensor (fotoelétrico, indutivo, fim de curso). Motor, válvula, bomba, esteira, ventilador e resistência aceitam uma **chave de falha**. |
| Linhas | Material/chapa, tubulação, esteira e sinal. Arraste os pontos; puxe o ponto do meio para criar uma dobra; duplo clique apaga um ponto. |
| Valores | Tag, KPI, texto, medidor (ponteiro), barra vertical e tendência (gráfico dos últimos segundos). Tag, medidor e barra têm escala e alarme abaixo/acima de um limite. |
| Estados | LED, status (texto ligado/desligado), alarme (só aparece quando ativo) e torre de sinalização (uma chave para cada cor). |
| Comandos | Botão (pulso), chave seletora (inverte) e ajuste/setpoint (abre um campo para digitar o valor, com mínimo e máximo). |

### Escala

Em **Escala do valor**, o símbolo mostra `valor × multiplicar + somar`. Ex.: o CLP manda `1450` e com multiplicar `0,1` a tela mostra `145,0`. Num setpoint com escala, o valor digitado volta para o CLP já convertido.

### Regras

Qualquer símbolo pode ter **regras**: quando uma chave (ou a do próprio símbolo) estiver ligada, desligada, igual, diferente, maior ou menor que um valor, o símbolo fica vermelho, amarelo, azul, verde, apagado, pisca ou some. Ex.: esconder a bobina quando `temBobina` = 0. As regras usam o valor do CLP, sem escala. No editor, símbolos escondidos aparecem transparentes.

### Comandos (clique no dashboard)

Qualquer símbolo pode ter uma ação em **Ao clicar no dashboard**. A mensagem sai pela saída do nó com `msg.topic` (o tópico da ação, ou a chave do payload) e `msg.payload`:

| Ação | Envia |
|---|---|
| Enviar um valor | O valor configurado (número, `true`/`false` ou texto). |
| Inverter | O contrário do valor atual da chave: 1/0, ou `true`/`false` se a chave for booleana. |
| Pulso | 1 ao apertar e 0 ao soltar (ou `true`/`false`). Bom para botões de partida do CLP. |
| Digitar um valor | Abre um campo para digitar um número; fora do mínimo/máximo configurado não é enviado. |
| Ir para outra página | Abre outra página do dashboard (escolhida na lista) ou um endereço. Não sai mensagem pelo nó. |

**Pedir confirmação** abre um "Confirmar?" antes de enviar. O valor enviado é sempre o que está configurado no nó; o navegador só avisa qual símbolo foi clicado.

### Editor

- Arraste da barra de cima ou clique no símbolo para colocar no meio.
- Botões **Duplicar**, **Frente**, **Trás** e **Excluir** no painel do símbolo.
- Vários símbolos: `Shift`+clique, ou arraste numa área vazia para fazer um retângulo de seleção. Arrastar um move todos, e o painel mostra **Alinhar** (esquerda, centro, direita, topo, meio, base) e **Distribuir**.
- **↶ / ↷** desfazem e refazem.
- Teclas: `Delete` apaga, setas movem (`Shift` = 10 px), `Ctrl+Z` / `Ctrl+Y` desfazem e refazem, `Ctrl+C` / `Ctrl+V` copiam e colam (também entre canvas abertos na mesma aba do navegador), `Ctrl+D` duplica, `Ctrl+A` seleciona tudo, `Esc` limpa a seleção.

### Temas

- **ISA-101** (padrão): cinza e plano, cor só para condição anormal e alarme. Equipamento ligado fica cinza escuro, parado fica claro. O alarme usa cor, forma e número da prioridade.
- **Clássico**: escuro, no estilo dos painéis em SVG feitos à mão, com bobinas girando.

### Opções do canvas

| Opção | Para quê |
|---|---|
| Show in | Página inteira ou dentro de um grupo. |
| Screen | Tamanho da tela em pixels (o sistema de coordenadas dos símbolos). |
| Background | **Cor do tema** ou **Transparente** (aparece o fundo da página do dashboard). |
| Fit | **Caber na tela**: a tela inteira aparece sem rolar. **Largura toda**: ocupa a largura e a altura acompanha. |
| Offline after | Segundos sem dados até a tela esmaecer e mostrar SEM COMUNICAÇÃO (0 desliga). |
| Number format | Formato dos números, ex. `pt-BR` (1.450,5) ou `en-US` (1,450.5). |

### Exemplo

**Menu → Importar → Exemplos → node-red-dashboard-2-hmi → tela-basica**. Abre em `/dashboard/hmi`, ocupando a página inteira.

---

## English

1. Drop an **hmi canvas** node (Dashboard 2 category) into your flow. **Show in**: whole page (default) or a group. Pick the screen size in pixels and the theme.
2. Build the screen in the node's edit dialog (with a full-screen option), or deploy and click **Editar no dashboard** to edit it on the real dashboard page, with live values, then **Salvar e fazer Deploy**.
3. Click a symbol to set its payload key, position, size, rotation and options.
4. Wire any node that sends an object, e.g. `{ "rpm": 1450, "speed": 42.5 }`. Each symbol shows its key. Keys are merged, so a message with only `rpm` keeps `speed`. For a single value, use `msg.topic` as the key.

Palette (dropdown per category): 22 shapes; reel, roller, motor, valve, pump, tank, conveyor, cylinder, fan, circular knife, heater, sensor; lines (strip, pipe, conveyor, signal; editable points); tag, KPI, text, gauge, vertical bar, trend; LED, status chip, alarm banner, stack light; button, selector switch, setpoint. Editor: multi-select (Shift+click or rubber band), align and distribute, undo/redo, copy/paste, duplicate, bring to front/send to back.

Click commands: any symbol can send a message from the node's output when clicked on the dashboard: a fixed value, a toggle of its key, a pulse (1 on press, 0 on release) a typed number checked against a min/max, or navigation to another dashboard page, with optional confirmation. `msg.topic` is the action topic or the symbol key. **Background** can be the theme colour or transparent.

Per symbol: **scale** (`raw × factor + offset`, reversed for typed setpoints) and **rules** (when a key is on/off/=/≠/>/< a value: red, yellow, blue, green, dimmed, blinking or hidden). **Image** symbol: your own SVG/PNG/JPG (up to 400 KB, stored in the flow) or a URL, with an optional second image for the on state.

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
