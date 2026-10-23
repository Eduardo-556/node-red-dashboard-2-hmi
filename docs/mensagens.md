# Que mensagem cada símbolo recebe

Este guia explica como o **hmi canvas** recebe os dados e o que cada símbolo espera
encontrar na chave dele. O resto (desenhar, regras, comandos, alarmes) está no
[README](../README.md).

## 1. Como os dados chegam no canvas

O canvas tem **uma entrada**. Tudo o que você manda nela vira uma lista de
**chaves**, e cada símbolo mostra uma chave (o campo **Chave** do símbolo, no
painel da direita do editor).

### Jeito 1: um objeto em `msg.payload`

Cada propriedade do objeto é uma chave:

```js
msg.payload = {
    "rpm": 1450,
    "velocidade": 42.5,
    "motorLigado": true,
    "estado": "GIRANDO"
}
```

O símbolo com chave `rpm` mostra 1450, o de chave `motorLigado` fica ligado, e
assim por diante.

### Jeito 2: um valor solto com `msg.topic`

```js
msg.topic = "temperatura"
msg.payload = 21.5
```

É o mesmo que mandar `{ "temperatura": 21.5 }`.

### Pode mandar várias mensagens, cada uma com uma parte

**Não precisa mandar tudo de uma vez.** O canvas guarda o último valor de cada
chave e junta o que chega:

```js
// mensagem 1, do CLP a cada 1 s
msg.payload = { "rpm": 1450, "motorLigado": true }
// mensagem 2, do banco a cada 30 s
msg.payload = { "bobinasHoje": 7, "linha_tempo": [ ... ] }
```

Depois das duas, o canvas tem as quatro chaves. Uma mensagem só com `rpm` não
apaga `bobinasHoje`. Por isso dá para ligar vários fluxos no mesmo canvas: a
leitura do CLP, a consulta do banco, um inject de teste.

- Uma chave só muda quando chega de novo.
- Para limpar uma chave (o símbolo mostra "—"), mande ela com `null`.
- Uma lista ou objeto (tabela, linha do tempo) é trocado inteiro: a nova lista
  substitui a anterior, ela não é somada.
- Quem abre a página depois recebe todas as chaves de uma vez, então a tela já
  aparece completa.

### Nome da chave

A chave é o **nome inteiro da propriedade**, com qualquer caractere. Se a
propriedade se chama `"BT_04.estado"`, a chave é `BT_04.estado`. O canvas **não**
entra em objetos aninhados: com `msg.payload = { BT_04: { estado: "GIRANDO" } }`
não existe a chave `BT_04.estado`. Monte as chaves "achatadas" numa function:

```js
const out = {};
for (const m of maquinas) {
    out[m.id + '.estado'] = m.estado;       // "BT_04.estado"
    out[m.id + '.girando'] = m.girando;     // "BT_04.girando"
}
msg.payload = out;
return msg;
```

### Outras propriedades da mensagem

| Propriedade | Para que serve |
|---|---|
| `msg.quality` | `{ "temp": "bad" }` (ou `"uncertain"`, ou `"good"` para limpar): os símbolos dessa chave ficam apagados com × ou ?. |
| `msg.enabled` | `false` desliga todos os comandos do canvas (só visualização). |
| `msg.ui_update` | Muda opções do canvas em funcionamento, por exemplo `{ "screen": "Alarmes" }` abre essa tela. |
| `msg._hmiAck` | Reconhece alarmes pelo fluxo: o id do alarme, `"symbol:<id>"` ou `"all"`. |

## 2. Tipos de valor

### Liga / desliga

Os símbolos que acendem, giram ou mudam de cor (motor, LED, bobinadeira,
esteira, válvula...) decidem se estão ligados assim:

| Valor recebido | Fica |
|---|---|
| `true` / `false` | ligado / desligado |
| número diferente de 0 (`1`, `-3`, `0.5`) | ligado |
| `0` ou `"0"` | desligado |
| texto que não é número (`"ON"`, `"GIRANDO"`) | ligado (texto vazio = desligado) |
| `null`, sem valor, `""` | sem dado (desenho de "desconhecido", nem ligado nem desligado) |

Opções de cada símbolo que mudam isso:
- **Ligado quando: maior que o limite**: ligado só quando o valor é maior que o
  **Limite** (ex. velocidade > 5).
- **Inverter sinal**: troca ligado e desligado (sensor NF, entrada ativa em 0).

Atenção: o texto `"false"` conta como ligado, porque não é número. Mande o
booleano `false` ou o número `0`.

### Número

Número ou texto com número (`42.5` ou `"42.5"`). A **escala** do símbolo pode
converter o valor do CLP (`× 0.1`, `÷ 10`, `+ offset`) antes de mostrar.
`true`/`false` aparecem como ON/OFF.

### Data e hora (tabela e linha do tempo)

Texto `"2026-10-23 05:10:00"` (horário local), número em milissegundos ou em
segundos, ou um `Date`.

## 3. Símbolo por símbolo

Na coluna **A chave recebe** está o valor da chave principal (o campo
**Chave**). Os campos terminados em "Chave ..." são chaves extras, que você
escreve no símbolo e manda no mesmo payload.

### Valores

| Símbolo | A chave recebe | Chaves extras | Exemplo |
|---|---|---|---|
| Tag | número (ou texto) | — | `{ "rpm": 1450 }` |
| KPI | número (ou texto). O **Subtítulo** pode ter `{outraChave}` | as do subtítulo | `{ "bobinas": 7, "t1": 5 }` com subtítulo `turno 1: {t1}` |
| Texto | opcional: um valor mostrado depois do texto. O texto pode ter `{chave}`; `{chave:1}` mostra 1 casa decimal e `{chave:t}` mostra como veio (sem separador de milhar) | as do texto | texto `operador {op:t}` com `{ "op": 2888 }` |
| Medidor, Barra | número entre **Mínimo** e **Máximo** | — | `{ "pressao": 6.2 }` |
| Barra ISA-101 | número | **Chave do setpoint** (número) | `{ "temp": 72, "tempSP": 75 }` |
| Tendência | número; o nó guarda os últimos segundos da **Janela** e desenha a curva | — | `{ "vel": 42.5 }` a cada segundo |
| Tabela | **lista de objetos**. **Colunas** = `campo:Rótulo:alinhamento:largura` | — | ver abaixo |
| Contador | horas (ou minutos, ou segundos, conforme **O CLP manda em**), ou número de partidas | **Chave dos minutos**, **Chave dos segundos** (quando vem separado) | `{ "horimetro": 1520 }` |

Tabela:

```js
msg.payload = {
    "bobinas_lista": [
        { "hora": "08:42", "operador": 3360, "espiras": 386 },
        { "hora": "07:43", "operador": 3360, "espiras": 440 }
    ]
}
// Colunas: hora:Hora, operador:Operador, espiras:Espiras:r
```

Com **Campo que dá a cor da linha** = `tipo` e **Estados** =
`Parada=Parada:alarm, Almoço=Almoço:info`, cada linha pinta o campo `tipo`
com a cor do estado.

### Gráficos

| Símbolo | A chave recebe | Exemplo |
|---|---|---|
| Gráfico de barras | **Jeito A**, uma chave por barra: preencha **Chaves** com `turno1:Turno 1, turno2:Turno 2` (a Chave do símbolo fica vazia). **Jeito B**, uma chave com uma lista: deixe **Chaves** vazio e mande `[118, 126, 109]` (rótulos em **Rótulos**) ou `[{ "h": "05", "q": 7 }]` (campo do rótulo `h`, campo do valor `q`) | `{ "turno1": 40, "turno2": 35 }` ou `{ "por_hora": [{ "h": "05", "q": 7 }, { "h": "06", "q": 9 }] }` |
| Rosca (donut) | igual ao gráfico de barras; o que passar de 6 fatias vira "Outros" | `{ "motivos": [{ "motivo": "Falta de material", "mins": 40 }] }` |
| OEE | nada na chave do símbolo: usa **Chave da disponibilidade**, **da performance** e **da qualidade** (em % ou de 0 a 1), ou **Chave do OEE pronto** | `{ "disp": 92, "perf": 88, "qual": 99 }` |
| Linha do tempo de estados | **lista de trechos** `{ ini, fim, estado }` | ver abaixo |

Linha do tempo:

```js
msg.payload = {
    "BT_04.linha_tempo": [
        { "ini": "2026-10-23 05:10:00", "fim": "2026-10-23 06:00:00", "estado": "GIRANDO" },
        { "ini": "2026-10-23 05:40:00", "fim": "2026-10-23 05:55:00", "estado": "PARADA" },
        { "ini": "2026-10-23 07:00:00", "fim": null, "estado": "GIRANDO" }
    ]
}
```

- `ini` e `fim` (ou `start` e `end`): data e hora. `fim` vazio = trecho aberto,
  vai até agora.
- **Campo do estado** (padrão `estado`): o nome do campo que diz o estado.
- **Estados**: `GIRANDO=Girando:ok, PARADA=Parada:alarm`. O valor antes do `=`
  tem que ser igual ao que vem no campo; o resto é o texto e a cor. Cores: `ok`,
  `alarm`, `warn`, `info`, `low`, `off`, `c0`..`c5` ou `#hex`. Valor fora da lista
  fica cinza.
- Quando dois trechos se cruzam, aparece o que vem **depois na lista**. Mande
  primeiro o tempo girando/parado e depois as paradas, que ficam por cima.
- A linha do tempo **não monta histórico de um booleano**. Se você só tem
  `girando: true/false`, guarde as mudanças (no banco ou num contexto) e mande a
  lista de trechos.

### Estados

| Símbolo | A chave recebe | Chaves extras | Exemplo |
|---|---|---|---|
| LED | liga/desliga | — | `{ "bomba1": true }` |
| Status | liga/desliga; mostra **Texto ligado** ou **Texto desligado** | — | `{ "auto": 1 }` |
| Status (vários estados) | texto ou número; **Estados** = `valor=Texto:cor` | as de `{chave}` na **Linha de baixo** | `{ "estado": "PARADA", "motivo": "Falta de material" }` com linha de baixo `{motivo}` |
| Alarme | liga/desliga; só aparece quando ligado | — | `{ "emergencia": true }` |
| Torre de sinalização | nada na chave do símbolo: **Chave vermelho**, **amarelo**, **verde**, **azul** (liga/desliga) | as quatro | `{ "torreVm": false, "torreVd": true }` |
| Modo (MAN / AUTO) | número ou texto; **Textos** = `0=MANUAL,1=AUTO`; o **Valor normal** fica discreto, os outros destacados | — | `{ "modo": 1 }` |
| Intertravamento / permissivo | liga/desliga | — | `{ "portaFechada": true }` |
| Lista de alarmes, Resumo de alarmes | nada: mostram os alarmes do próprio canvas (limites dos símbolos e chaves de falha) | — | — |

### Equipamentos, Processo, Elétrica e Fábrica

Quase todos recebem **liga/desliga** na chave principal (ligado = gira, acende,
anima). Muitos têm **Chave da falha** (liga/desliga): quando ligada, o símbolo
fica vermelho e entra na lista de alarmes com a **Prioridade** escolhida.

| Símbolo | A chave recebe | Chaves extras |
|---|---|---|
| Bobina, Rolo, Faca circular, Sensor, Cilindro | liga/desliga | — |
| Motor, Válvula, Bomba, Esteira, Ventilador, Resistência | liga/desliga | Chave da falha |
| Bobinadeira | liga/desliga (eixo girando) | Chave da falha |
| Compressor, Soprador, Válvula 3 vias, Misturador, Trocador de calor, Caldeira, Torre de resfriamento, Chiller, Ciclone | liga/desliga | Chave da falha |
| Cabine de pintura, Calandra, Mesa de rolos, Contator, Gerador, Transformador | liga/desliga | Chave da falha |
| Robô | liga/desliga | Chave da falha, Chave soldando (faísca) |
| Disjuntor | liga/desliga (fechado) | Chave disparado |
| Tanque | número (nível entre Vazio e Cheio) | — |
| Válvula de controle, Damper | número (posição entre fechada e aberta) | Chave da falha |
| Prensa / dobradeira | número (posição do martelo) | Chave da falha |
| Ponte rolante / talha | número (posição do carro) | Chave da altura do gancho, Chave com carga, Chave da falha |
| Veículo (carrinho, AGV, empilhadeira) | número (posição) ou liga/desliga, conforme **A chave é** | Chave da falha |
| Filtro de mangas | número (ΔP) | — |
| Medidor de vazão, Instrumento ISA, Balança | número | — |
| Estufa / forno | número (temperatura) | Chave porta aberta, Chave aquecendo |
| Fonte de solda | número (corrente) | Chave arco aberto (vazio = valor > 0), Chave da falha |
| Inversor de frequência | número (Hz) | Chave rodando (vazio = valor ≠ 0), Chave reverso (vazio = valor negativo), Chave da falha |
| Medidor de energia | número (potência) | Chave da energia (kWh) |

### Formas, Linhas e Comandos

| Símbolo | A chave recebe |
|---|---|
| Corpo / forma livre | opcional. Com **Encher pelo valor da chave**: número entre mín. e máx. Com **Girar / correr quando a chave ligar** ou peças que se movem: liga/desliga ou posição. Sem nada disso, a chave pode ficar vazia. |
| Imagem | opcional: liga/desliga troca para a **imagem quando ligado** |
| SVG com partes ligadas | nada na chave do símbolo: cada linha de **Ligações** (`idDoDesenho = chave`) lê uma chave |
| Linha (chapa, tubulação, esteira, sinal), Conexão, Seta | liga/desliga (anima o fluxo ou acende) |
| Botão, Chave seletora | liga/desliga, só para mostrar o estado atual (texto ligado). O clique sai pela saída do nó |
| Ajuste (setpoint) | número atual; o valor digitado sai pela saída do nó |

## 4. Exemplo completo

Um fluxo da bobinadeira BT 04 mandando duas mensagens diferentes para o mesmo
canvas:

```js
// do CLP, a cada mudança
msg.payload = { "BT_04.girando": true, "BT_04.estado": "GIRANDO" };

// do banco, a cada 30 s
msg.payload = {
    "BT_04.bobinas": 7,
    "BT_04.operador": 3360,
    "BT_04.linha_tempo": [ { "ini": "2026-10-23 05:10:00", "fim": null, "estado": "GIRANDO" } ],
    "BT_04.bobinas_lista": [ { "hora": "08:42", "operador": 3360, "espiras": 386 } ]
};
```

| Símbolo | Chave |
|---|---|
| Bobinadeira | `BT_04.girando` |
| Status (vários estados) | `BT_04.estado` |
| KPI "Bobinas hoje" | `BT_04.bobinas` |
| Texto | (vazio), texto `operador {BT_04.operador:t}` |
| Linha do tempo | `BT_04.linha_tempo` |
| Tabela | `BT_04.bobinas_lista` |
