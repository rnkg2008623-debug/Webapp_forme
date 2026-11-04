// 問題集: A1.2.3 Logic Gates(IBDP Computer Science HL)。問題文と採点基準(mark scheme)は、配布された問題集のとおり。
// 種類: text = 文章で答える(採点基準の各ポイントを、自分でチェックして採点) / short = 短い答え(自動で採点。直せる) /
//       table = 真理値表(自動で採点) / band = 長文(採点基準の観点を見て、0〜満点を自分で付ける)
export const SECTIONS = [
  { id: 'A', title: 'Section A', sub: 'Key term definitions' },
  { id: 'B', title: 'Section B', sub: 'Recall and state' },
  { id: 'C', title: 'Section C', sub: 'Symbols, truth tables and Boolean expressions' },
  { id: 'D', title: 'Section D', sub: 'Purpose and application' },
  { id: 'E', title: 'Section E', sub: 'Extended response' },
  { id: 'F', title: 'Section F', sub: 'Inquiry question (links to TOK)' },
];

const t = (marks, pts, model, extra = {}) => ({ type: 'text', marks, pts, model, ...extra });
const s = (accept, answer, extra = {}) => ({ type: 'short', marks: 1, accept, answer, ...extra });
const ABC = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]];
const AB = [[0, 0], [0, 1], [1, 0], [1, 1]];
const table = (marks, inputs, rowsIn, outs, note) => ({ type: 'table', marks, inputs, out: 'X', rows: rowsIn.map((r, i) => [...r, outs[i]]), note });

export const QUESTIONS = [
  // ---------- Section A ----------
  { sec: 'A', q: '**Define** the term *logic gate*.', parts: [t(2, ['A circuit / electronic component', 'that takes one or more binary inputs and produces a single binary output based on Boolean logic'], 'A circuit/electronic component [1] that takes one or more binary inputs and produces a single binary output based on Boolean logic [1].')] },
  { sec: 'A', q: '**Define** the term *Boolean algebra*.', parts: [t(2, ['A system of logic', 'using TRUE/FALSE or 1/0 values and operators such as AND, OR and NOT'], 'A system of logic [1] using TRUE/FALSE or 1/0 values and operators such as AND, OR and NOT [1].')] },
  { sec: 'A', q: '**Define** the term *truth table*.', parts: [t(2, ['A table that shows all possible combinations of inputs', 'and the corresponding output(s) for a gate or circuit'], 'A table that shows all possible combinations of inputs [1] and the corresponding output(s) for a gate or circuit [1].')] },
  { sec: 'A', q: '**State** what is meant by the *AND* operation.', parts: [t(1, ['Output is 1 only if both inputs are 1'], 'Output is 1 only if both inputs are 1 [1].')] },
  { sec: 'A', q: '**State** what is meant by the *OR* operation.', parts: [t(1, ['Output is 1 if at least one input is 1'], 'Output is 1 if at least one input is 1 [1].')] },
  { sec: 'A', q: '**State** what is meant by the *NOT* operation.', parts: [t(1, ['Inverts the input (1 becomes 0, 0 becomes 1)'], 'Inverts the input (1 becomes 0, 0 becomes 1) [1].')] },
  { sec: 'A', q: '**Define** the term *XOR*.', parts: [t(1, ['A gate/operation whose output is 1 if the inputs are different (exclusive OR)'], 'A gate/operation whose output is 1 if the inputs are different (exclusive OR) [1].')] },
  { sec: 'A', q: '**Define** the term *XNOR*.', parts: [t(1, ['A gate/operation whose output is 1 if the inputs are the same (the inverse of XOR)'], 'A gate/operation whose output is 1 if the inputs are the same (the inverse of XOR) [1].')] },
  { sec: 'A', q: '**Define** the term *combinational logic*.', parts: [t(2, ['Circuits whose output depends only on the current inputs', 'with no memory of previous states'], 'Circuits whose output depends only on the current inputs [1], with no memory of previous states [1].')] },
  { sec: 'A', q: '**Define** the term *sequential logic*.', parts: [t(2, ['Circuits whose output depends on current inputs', 'and also on previous states, i.e. they have memory'], 'Circuits whose output depends on current inputs [1] and also on previous states, i.e. they have memory [1].')] },
  { sec: 'A', q: '**Distinguish** between combinational logic and sequential logic.', parts: [t(2, ['Combinational output depends only on current inputs', 'whereas sequential output also depends on stored/previous state'], 'Combinational output depends only on current inputs [1], whereas sequential output also depends on stored/previous state [1].')] },

  // ---------- Section B ----------
  { sec: 'B', q: 'State the output of a NOR gate when both inputs are 0.', parts: [s(['1'], '1')] },
  { sec: 'B', q: 'State which gate produces an output of 1 only when its inputs are different.', parts: [s(['xor', 'xorgate', 'exclusiveor'], 'XOR')] },
  { sec: 'B', q: 'State the Boolean expression for a NAND gate.', parts: [t(1, ['X = NOT (A · B), written as an overbar over A · B'], 'X = NOT (A · B), written as an overbar over A · B [1].')] },
  { sec: 'B', q: 'State the output of an XNOR gate when A = 1 and B = 0.', parts: [s(['0'], '0')] },
  { sec: 'B', q: 'State the output of a NAND gate when both inputs are 1.', parts: [s(['0'], '0')] },
  { sec: 'B', q: 'Identify the gate that is the opposite of an OR gate.', parts: [s(['nor', 'norgate'], 'NOR')] },
  { sec: 'B', q: 'Outline why the word "gate" is used in the term "logic gate".', parts: [t(2, ['A gate controls whether and how information flows through a circuit', 'like a physical gate that lets things through or blocks them'], 'A gate controls whether and how information flows through a circuit [1], like a physical gate that lets things through or blocks them [1].')] },

  // ---------- Section C ----------
  { sec: 'C', q: 'Draw the symbol and construct the truth table for an XNOR gate.', parts: [
    t(1, ['Symbol: an XOR shape (OR with the extra curved line) with a bubble on the output'], 'Symbol: an XOR shape (OR with the extra curved line) with a bubble on the output [1].', { label: 'Symbol', placeholder: 'Describe the symbol you would draw…' }),
    table(1, ['A', 'B'], AB, [1, 0, 0, 1]),
  ] },
  { sec: 'C', q: 'Construct the truth table for a NAND gate and give its Boolean expression.', parts: [
    table(2, ['A', 'B'], AB, [1, 1, 1, 0], '2 marks; 1 if one row is wrong.'),
    t(1, ['Expression: X = NOT (A · B)'], 'Expression: X = NOT (A · B) [1].', { label: 'Boolean expression', placeholder: 'X = …' }),
  ] },
  { sec: 'C', q: 'Construct the truth table for a NOT gate.', parts: [table(1, ['A'], [[0], [1]], [1, 0])] },
  { sec: 'C', q: 'Complete the table: give the Boolean expression for each gate, and its output when A = 1 and B = 1.', parts: [
    s(['ab', 'aandb', 'a.b'], 'A · B (or A AND B)', { label: 'AND: Boolean expression (a)' }),
    s(['1'], '1', { label: 'AND: output when A = 1, B = 1 (b)' }),
    s(['not(a+b)', 'nota+b', 'anorb', 'notaorb', 'nor'], 'NOT (A + B) (or A NOR B)', { label: 'NOR: Boolean expression (c)' }),
    s(['0'], '0', { label: 'NOR: output when A = 1, B = 1 (d)' }),
  ] },
  { sec: 'C', q: 'Construct a truth table for the expression **X = (A AND B) OR (NOT C)**.', parts: [table(4, ['A', 'B', 'C'], ABC, [1, 0, 1, 0, 1, 0, 1, 1], 'Deduct 1 mark per 2 incorrect rows.')] },
  { sec: 'C', q: 'Construct a truth table for the expression **X = (A XOR B) AND C**.', parts: [table(4, ['A', 'B', 'C'], ABC, [0, 0, 0, 1, 0, 1, 0, 0], 'Deduct 1 mark per 2 incorrect rows.')] },
  { sec: 'C', q: 'Draw a logic circuit for **X = NOT (A OR B)** using only an OR gate and a NOT gate. State which single gate it is equivalent to.', parts: [
    t(2, ['A and B feed an OR gate', 'The output of the OR gate feeds a NOT gate'], 'Circuit: A and B feed an OR gate, and its output feeds a NOT gate [2].', { label: 'Circuit', placeholder: 'Describe your circuit…' }),
    s(['nor', 'norgate'], 'A NOR gate', { label: 'Equivalent single gate' }),
  ] },

  // ---------- Section D ----------
  { sec: 'D', q: 'State **two** ways in which logic gates are used in computer systems.', parts: [t(2, ['First valid use', 'Second valid use'], 'Any two [1 each]: binary arithmetic; control logic/decision making; ALU/memory/processing logic; combinational and sequential circuits; network routing; graphics processing.')] },
  { sec: 'D', q: 'Describe how logic gates contribute to binary arithmetic.', parts: [t(2, ['Gates combine to form adders', 'that perform addition/comparison on binary digits by following Boolean rules'], 'Gates combine to form adders [1] that perform addition/comparison on binary digits by following Boolean rules [1].')] },
  { sec: 'D', q: 'Explain why XOR and AND gates are used together to build a **half adder**. Give the Boolean expression for each output.', parts: [t(4, ['XOR gives the sum bit, because it outputs 1 when the inputs differ (1+0 or 0+1)', 'AND gives the carry bit, because a carry occurs only when both inputs are 1', 'Sum = A ⊕ B', 'Carry = A · B'], 'XOR gives the sum bit, because it outputs 1 when the inputs differ (1+0 or 0+1) [1]. AND gives the carry bit, because a carry occurs only when both inputs are 1 [1]. Sum = A ⊕ B [1]. Carry = A · B [1].')] },
  { sec: 'D', q: 'State the output (sum and carry) of a half adder when A = 1 and B = 1.', parts: [s(['0'], '0', { label: 'Sum' }), s(['1'], '1', { label: 'Carry' })] },
  { sec: 'D', q: 'Outline the role of logic gates in the **Arithmetic Logic Unit (ALU)**.', parts: [t(2, ['The ALU uses combinations of gates (AND, OR, XOR)', 'to perform arithmetic (e.g. addition) and logical operations/comparisons'], 'The ALU uses combinations of gates (AND, OR, XOR) [1] to perform arithmetic (e.g. addition) and logical operations/comparisons [1].')] },
  { sec: 'D', q: 'Describe how NOR or NAND gates can be used to build an **SR latch** to store one bit of data.', parts: [t(3, ['Two NOR (or NAND) gates are cross-coupled, so each output feeds the other\'s input', 'This feedback lets the circuit hold a stable state (0 or 1)', 'after the inputs return to their inactive values, so one bit is stored/remembered'], 'Two NOR (or NAND) gates are cross-coupled, so each output feeds the other\'s input [1]. This feedback lets the circuit hold a stable state (0 or 1) [1] after the inputs return to their inactive values, so one bit is stored/remembered [1].')] },
  { sec: 'D', q: 'Outline how logic gates are used in **multiplexers** and **demultiplexers**.', parts: [t(2, ['Gates (typically AND/OR/NOT) use select inputs', 'to route one of several input signals to an output (multiplexer), or one input to one of several outputs (demultiplexer)'], 'Gates (typically AND/OR/NOT) use select inputs [1] to route one of several input signals to an output (multiplexer), or one input to one of several outputs (demultiplexer) [1].')] },
  { sec: 'D', q: 'Explain why XOR and XNOR gates are commonly used in **data transfer and encryption**.', parts: [t(3, ['XOR is reversible/symmetric: applying XOR with the same key twice returns the original data', 'Data bits can be combined with a key bit-by-bit', 'XOR/XNOR also detect differences or equality between bits, e.g. for error checking/parity'], 'XOR is reversible/symmetric: applying XOR with the same key twice returns the original data [1]. Data bits can be combined with a key bit-by-bit [1]. XOR/XNOR also detect differences or equality between bits, e.g. for error checking/parity [1].')] },
  { sec: 'D', q: 'Outline how logic gates support **decision-making (branching)** in a processor.', parts: [t(2, ['Gates evaluate conditions (e.g. comparisons or flags)', 'and the result determines which instruction or path is executed next'], 'Gates evaluate conditions (e.g. comparisons or flags) [1] and the result determines which instruction or path is executed next [1].')] },

  // ---------- Section E ----------
  { sec: 'E', q: 'A security system sounds an alarm (X = 1) when a door sensor (A) is triggered **and** the system is armed (B), **or** when a tamper switch (C) is triggered.', parts: [
    t(2, ['(A · B)', '+ C  (i.e. X = (A AND B) OR C)'], '(a) X = (A · B) + C [2].', { label: '(a) Boolean expression for X', placeholder: 'X = …' }),
    t(3, ['An AND gate with inputs A and B', 'Its output and C feed an OR gate', 'The output of the OR gate is X'], '(b) AND gate with inputs A and B, its output and C feeding an OR gate, whose output is X [3].', { label: '(b) Logic circuit', placeholder: 'Describe your circuit…' }),
    table(4, ['A', 'B', 'C'], ABC, [0, 1, 0, 1, 0, 1, 1, 1], 'Deduct 1 mark per 2 incorrect rows.'),
  ] },
  { sec: 'E', q: '**Explain** why combinational circuits alone are not sufficient to build computer memory.', parts: [t(3, ['Combinational outputs depend only on current inputs', 'so they cannot retain a value once the inputs change', 'Memory needs feedback/state, which is provided by sequential circuits such as latches and flip-flops built from gates'], 'Combinational outputs depend only on current inputs [1], so they cannot retain a value once the inputs change [1]. Memory needs feedback/state, which is provided by sequential circuits such as latches and flip-flops built from gates [1].')] },
  { sec: 'E', q: '**Discuss** the importance of logic gates as the "building blocks of all digital systems".', parts: [{ type: 'band', marks: 6, guide: ['All digital hardware reduces to combinations of a few gate types.', 'Gates implement binary arithmetic (adders, ALU).', 'Gates form memory (latches, flip-flops).', 'Gates provide control and decision-making in CPUs.', 'Gates enable routing (multiplexers), graphics, networking and encryption.', 'NAND/NOR are universal, so any circuit can be built from one gate type.', 'Counterpoint: gates alone are not enough, as software, clocks, power and architecture are also needed.', 'Counterpoint: abstraction means designers rarely work at gate level today.'], bands: '1–2 = a list of uses with little explanation. 3–4 = explained points, one-sided. 5–6 = balanced, well-supported, with a clear conclusion.' }] },

  // ---------- Section F ----------
  { sec: 'F', q: '**Discuss** the limits of reducing human decision-making to binary logic.', hint: 'Consider: ambiguity, context, emotion, ethics, incomplete information, probability and "fuzzy" reasoning.', parts: [{ type: 'band', marks: 6, guide: ['Binary logic (true/false) suits well-defined, rule-based decisions and is fast, consistent and repeatable.', 'Human decisions involve ambiguity, partial truths and degrees (e.g. "somewhat likely"), which fuzzy logic or probability model better.', 'Emotions, values, ethics and intuition are hard to encode as rules.', 'Context matters: the same inputs may need different outputs.', 'Incomplete or uncertain information cannot be captured by only 0/1.', 'Risk of bias or oversimplification in automated decisions (e.g. AI/algorithmic decisions affecting people).', 'Counterpoint: complex behaviour can be built from many simple gates, and neural networks and AI run on binary hardware.', 'Counterpoint: modelling can be sufficient for many practical tasks.'], bands: '1–2 = general statements. 3–4 = some developed, relevant arguments. 5–6 = balanced, with examples and a justified conclusion.' }] },
];

export const QUIZ_META = { code: 'A1.2.3', title: 'Logic Gates', total: QUESTIONS.reduce((n, q) => n + q.parts.reduce((m, p) => m + p.marks, 0), 0) };
