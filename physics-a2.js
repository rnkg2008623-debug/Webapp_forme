// Physics HL A2「Forces and momentum」の解説。出典: 配布された教科書の第2章(2.1〜2.3)。「TEST YOUR UNDERSTANDING」は Practice で使うため、入れていない。
// ブロックの書き方は physics-a5.js と同じ。式の {a|b} は分数。
const p = (en, ja) => ({ t: 'p', en, ja });
const h = (text, ja) => ({ t: 'h', text, ja });
const eq = (...lines) => ({ t: 'eq', lines });
const key = (en, ja) => ({ t: 'key', en, ja });
const tip = (en, ja) => ({ t: 'tip', en, ja });
const tok = (en, ja) => ({ t: 'tok', en, ja });
const ctx = (title, en, ja) => ({ t: 'ctx', title, en, ja });
const ex = (no, q, steps, ja) => ({ t: 'ex', no, q, steps, ja });
const chk = (no, q, a, ja) => ({ t: 'chk', no, q, a, ja });
const fig = (id, cap, ja) => ({ t: 'fig', id, cap, ja });

export const TOPICS2 = {
  'A2-1': {
    code: 'A2.1', title: 'Forces and their direction', icon: 'forces',
    lead: 'The forces you will meet, how to draw free-body diagrams, and the condition for equilibrium.',
    leadJa: 'これから出会う力の種類、自由物体図(フリーボディダイアグラム)の描き方、そして「つり合い」の条件を学びます。',
    goals: ['Treat bodies as point particles', 'Construct and interpret free-body force diagrams', 'Apply the equilibrium condition ΣF = 0', 'Use weight, tension, Hooke\'s law, normal, drag, buoyant and frictional forces'],
    sections: [
      { id: 'intro', title: 'Introduction', blocks: [
        p('This chapter introduces Newton\'s laws of motion, on which a lot of classical physics is based. It was once thought that knowing the present state of a system and all the forces acting on it would let us predict its future state completely. We learn to identify the forces on a system, find the net force, and apply Newton\'s laws to describe the motion. Guiding questions: what is the connection between force and motion? How does knowing the forces on a body let us predict its state of motion?',
          'この章では、ニュートンの運動の法則を学びます。古典物理学の多くは、この法則に基づいています。かつては、「いまの状態と、働くすべての力が分かれば、将来の状態を完全に予測できる」と考えられていました。ここでは、物体に働く力を正しく見つけ、合力を求め、ニュートンの法則で運動を説明できるようにします。この章の問いは、「力と運動には、どんなつながりがあるか」と「物体に働く力が分かると、運動の状態を予測できるのはなぜか」です。'),
      ] },
      { id: 'forces', title: 'Forces', blocks: [
        p('A force, which we commonly associate with a pull or a push, is a vector quantity. We represent forces with arrows whose length is proportional to the magnitude of the force. It is important to identify the direction of forces correctly. This chapter deals with: weight, string tension, spring tension, normal contact forces, drag forces, buoyant forces (upthrust) and frictional forces.',
          '力は、ふつう「引く」「押す」と結びつけられる、ベクトル量です。力は、大きさに比例した長さの矢印で表します。力の向きを正しく見つけることが大切です。この章で扱う力は、重さ(重力)、糸の張力、ばねの力、垂直抗力(接触力)、抵抗力(ドラッグ)、浮力、摩擦力です。'),
        h('Weight', '重さ(重力)'),
        p('Weight is the gravitational force between a body and the planet it is on: W = mg, where m is the mass and g the gravitational field strength of the planet (N kg⁻¹, which is the same as m s⁻², the "acceleration of free fall"). On the surface of the Earth g = 9.81 N kg⁻¹, often approximated to 10 N kg⁻¹. Weight is always directed vertically downward.',
          '重さは、物体と、その物体がある惑星との間の重力です。W = mg(m は質量、g はその惑星の重力場の強さ)。g の単位は N kg⁻¹ で、これは m s⁻²(自由落下の加速度)と同じです。地表では g = 9.81 N kg⁻¹ で、10 N kg⁻¹ と近似することも多いです。重さの向きは、いつも鉛直下向きです。'),
        eq('W = mg'),
        p('The mass of an object is the same everywhere in the universe, but its weight depends on location. A 70 kg mass weighs 687 N at the Earth\'s surface (g = 9.81), 635 N at a height of 250 km (g = 9.07), and 623 N on Venus (g = 8.9).',
          '物体の質量は、宇宙のどこでも同じですが、重さは場所で変わります。質量 70 kg の物体は、地表(g = 9.81)で 687 N、高さ 250 km(g = 9.07)で 635 N、金星(g = 8.9)で 623 N です。'),
        h('Tension', '張力'),
        p('The force that arises in a body when it is stretched or compressed is called tension. A taut string is under tension; the force comes from interactions between the molecules of the material and is electrical in nature. It is created when two forces pull in opposite directions at the ends of the string. The tension is directed along the string. If a mass hangs from a ceiling, the string pulls down on the ceiling and up on the mass. In most cases we idealise the string as massless (its mass is negligible compared with the other masses); then the tension T is the same at all points of the string. A slack string has zero tension.',
          '物体が、引き伸ばされたり、縮められたりすると生じる力を、張力と呼びます。ピンと張った糸は、張力を受けています。この力は、材料の分子どうしの相互作用で生じる、電気的な性質の力です。糸の両端を、反対向きに引くと生じます。張力の向きは、糸に沿った向きです。天井から質量をつるすと、糸は、天井を下に、質量を上に引きます。ふつうは、糸を「質量がない」と理想化します(他の質量にくらべて、無視できるほど小さい、という意味)。そのとき、張力 T は、糸のどこでも同じです。たるんだ糸の張力は 0 です。'),
        h('Springs and Hooke\'s law', 'ばねとフックの法則'),
        p('A spring that is stretched develops a tension force that tends to bring the length back to its original value; a compressed spring tries to restore it too. For a range of extensions the force is proportional to the extension: T = kx, where k is the spring constant. This relation is Hooke\'s law.',
          '引き伸ばされたばねは、もとの長さに戻そうとする力を出します。縮められたばねも、同じです。ある範囲では、この力は、伸び(縮み)に比例します。T = kx(k はばね定数)。この関係を、フックの法則と呼びます。'),
        eq('T = kx'),
        chk('Check yourself 1', 'A block is attached to a vertical spring. Will the extension of the spring be different on the Earth and on the Moon?', 'Yes, because the weight of the block is less on the Moon.', '答え: はい。月では、ブロックの重さが小さいので、ばねの伸びも小さくなります(kx = mg だから、x = mg/k で、g が小さければ x も小さい)。'),
        h('Normal contact forces', '垂直抗力'),
        p('If a body touches another body, there is a normal contact force between them. It is perpendicular to the surface exerting the force (hence "normal") and, like tension, electrical in origin. A simple model: atoms connected by springs. The block pushes down on the atoms of the table, compressing the springs under it, which creates the upward force on the block.',
          '物体が、他の物体にふれていると、2つの間に垂直抗力が働きます。この力は、力を出している面に垂直なので、「垂直(normal)」と呼びます。張力と同じで、電気的な起源の力です。簡単なモデルは、ばねでつながった原子です。ブロックが、机の原子を押し下げ、下のばねを縮めると、その反動で、ブロックを押し上げる力が生じます。'),
        h('Drag forces', '抵抗力'),
        p('Drag forces oppose the motion of a body through a fluid (a gas or a liquid): air resistance on a car, or the resistance on a marble dropped into honey. They are directed opposite to the velocity and depend on the speed and shape of the body; the higher the speed, the higher the drag. For a small sphere of radius r moving through a fluid at speed v, the drag is given by Stokes\' law, where η is the viscosity of the fluid (water about 10⁻³ Pa s, motor oil 0.5 Pa s, honey 1.5 Pa s; viscosity decreases with increasing temperature).',
          '抵抗力は、流体(気体や液体)の中を動く物体の運動を、さまたげる力です。車が受ける空気抵抗や、ビー玉を蜂蜜に落としたときの抵抗が、例です。向きは、速度と反対で、大きさは、物体の速さと形で決まり、速いほど大きくなります。半径 r の小さな球が、流体の中を速さ v で動くときの抵抗は、ストークスの法則で表されます。η は流体の粘性率です(水は約 10⁻³ Pa s、モーターオイル 0.5 Pa s、蜂蜜 1.5 Pa s。温度が上がると、粘性率は下がります)。'),
        eq('F_D = 6πηrv'),
        h('Buoyant forces (upthrust)', '浮力'),
        p('Any object in a fluid experiences an upward buoyant force F_B = ρgV_imm, where ρ is the density of the fluid and V_imm the volume of the body that is immersed. If the buoyant force equals the weight the body floats; if it is less than the weight the body sinks. The buoyant force is caused by the fluid pressure, which is greater at the bottom of the body than at the top.',
          '流体の中の物体は、上向きの浮力 F_B = ρgV_imm を受けます。ρ は流体の密度、V_imm は流体に沈んでいる部分の体積です。浮力が重さと等しければ、浮きます。浮力が重さより小さければ、沈みます。浮力は、流体の圧力が原因で、物体の下側のほうが、上側より、圧力が大きいために生じます。'),
        eq('F_B = ρ g V_imm'),
        h('Frictional forces', '摩擦力'),
        p('Frictional forces generally oppose the motion of a body, and are also electrical in origin. Dynamic friction arises whenever one body slides over another. Static friction arises whenever there is a tendency for motion, not necessarily motion itself: a block resting on an incline tends to slide down, so friction acts up the plane; a block pulled with a small force on a rough road does not move because friction equals the pulling force. A more realistic model has surface irregularities (asperities) that interlock and oppose sliding.',
          '摩擦力は、ふつう、物体の運動をさまたげる力で、これも電気的な起源です。物体が、他の物体の上をすべるときに働くのが、動摩擦力です。静摩擦力は、「動こうとする傾向」があるだけで働きます(実際に動いている必要はありません)。斜面に置かれたブロックは、すべり落ちようとするので、斜面に沿って上向きの摩擦力が働きます。荒い道の上のブロックを、小さな力で引いても動かないのは、摩擦力が、引く力と等しくなるからです。もっと現実的なモデルでは、面の細かい凹凸(アスペリティ)がかみ合って、すべりをさまたげます。'),
        p('There is no theory of friction that follows from the fundamental laws of physics, but some simple empirical "laws" are useful (only approximately true): (1) the area of contact does not affect the frictional force; (2) dynamic friction f_d = μ_d R, with R the normal force and μ_d the coefficient of dynamic friction; (3) dynamic friction does not depend on the sliding speed; (4) the maximum static friction is f_s = μ_s R, with μ_s the coefficient of static friction and μ_s > μ_d.',
          '摩擦を、基本の物理法則から導く理論は、ありませんが、実験から分かる、簡単な「法則」が役に立ちます(あくまで近似です)。(1) 接触面積は、摩擦力に影響しない。(2) 動摩擦力 f_d = μ_d R(R は垂直抗力、μ_d は動摩擦係数)。(3) 動摩擦力は、すべる速さによらない。(4) 静摩擦力の最大値は f_s = μ_s R(μ_s は静摩擦係数で、μ_s > μ_d)。'),
        eq('dynamic:  f_d = μ_d R', 'static (maximum):  f_s ≤ μ_s R,   μ_s > μ_d'),
        tip('One of the most common mistakes is to think that μ_s R is the formula for the static friction force. It is not: it gives the maximum possible static friction. The actual static friction just matches the applied force until that maximum is reached.', '試験のコツ: 最もよくある間違いは、μ_s R が静摩擦力の式だと思うこと。これは「最大の」静摩擦力です。実際の静摩擦力は、この最大値に達するまでは、加えた力と、ちょうど同じ大きさになります。'),
        fig('friction', 'Friction f against pulling force F. While static, f = F; once F exceeds μₛR the friction drops to the constant dynamic value μᵈR and the body accelerates.', '摩擦力 f と、引く力 F の関係。止まっている間は f = F。F が μₛR を超えると、摩擦力は、一定の動摩擦力 μ_d R に急に下がり、物体は加速します。'),
        p('This is a familiar everyday phenomenon: it takes a lot of force to start a heavy piece of furniture moving (you must exceed the maximum static friction), but once it moves, pushing becomes easier (you are now opposed by the smaller dynamic friction).',
          '日常でおなじみの現象です。重い家具は、動かし始めるのに大きな力が要りますが(最大静摩擦力を超えないといけない)、動き出すと、押すのが楽になります(より小さな動摩擦力だけが、さまたげるため)。'),
        chk('Check yourself 2', 'A block of weight 5.0 N rests on a rough horizontal table. The coefficient of static friction is 0.60. A horizontal force of 2.2 N is applied. What is the frictional force on the block?', 'The minimum force needed to move the block is 0.60 × 5.0 = 3.0 N, so the block will not move. The frictional force is then 2.2 N.', '答え: 2.2 N。最大静摩擦力は 0.60 × 5.0 = 3.0 N で、2.2 N はそれより小さいので、動きません。静摩擦力は、加えた力にちょうど等しい 2.2 N です(3.0 N ではありません)。'),
        p('Later chapters deal with other forces: the electric force, the magnetic force and the nuclear force.',
          'このあとの章では、電気力、磁気力、核力など、他の力も学びます。'),
      ] },
      { id: 'fbd', title: 'Free-body force diagrams', blocks: [
        p('A free-body force diagram shows the magnitude and direction of all the forces acting on a chosen body. The body is drawn on its own, free of its surroundings and of any bodies it touches. It is important to draw the free-body diagram for every body of interest, and the length of each arrow should be proportional to the magnitude of the force.',
          '自由物体図(フリーボディダイアグラム)は、選んだ1つの物体に働く、すべての力の大きさと向きを描いた図です。物体を、周りの環境や、ふれている他の物体から、切り離して、1つだけ描きます。力学の問題では、注目する物体ごとに、正しい自由物体図を描くことが大切で、矢印の長さは、力の大きさに比例させます。'),
        key('Free-body diagram: draw only the forces acting ON the chosen body (weight, tension, normal force, friction, drag, ...). Do not draw forces that the body exerts on others.', '自由物体図: 選んだ物体「が受ける」力だけを描く(重さ、張力、垂直抗力、摩擦力、抵抗力…)。その物体が、他の物体に及ぼす力は描かない。'),
        ex('Worked example 2.1', '(a) Draw the free-body diagram for a pendulum when the bob is at the extreme left position. (b) Draw it for a ball moving on the inside surface of a vertical circle at three positions (bottom, top, right side).', ['(a) Two forces on the bob: the weight (down) and the tension (along the string, towards the support).', '(b) Weight (down) and the normal force from the surface, which is perpendicular to the surface and points toward the centre of the circle: up at the bottom, down at the top, to the left at the right side.'], '(a) 振り子のおもりには、重さ(下向き)と、張力(糸に沿って、支点向き)の2つだけです。(b) ボールには、重さ(下向き)と、面からの垂直抗力(面に垂直で、円の中心向き)が働きます。底では上向き、頂点では下向き、右端では左向きです。「遠心力」は、描きません(2.3 で説明します)。'),
      ] },
      { id: 'equilibrium', title: 'Equilibrium', blocks: [
        p('Equilibrium of a point particle means that the resultant (net) force on the particle is zero. The net force ΣF is the single force whose effect equals the combined effect of the individual forces. When forces are in the same or opposite directions, add and subtract them, taking one direction as positive. Example: 12 + 6.0 − 8.0 = 10 N to the right; or 5.0 + 6.0 − 4.0 − 8.0 = −1.0 N, meaning 1.0 N vertically down.',
          '質点が「つり合い」の状態にあるとは、その質点に働く「合力(正味の力)」が 0 だ、ということです。合力 ΣF は、個々の力を合わせたのと同じ効果をもつ、1つの力です。力が、同じ向きか、反対向きなら、1つの向きを正にして、足し引きします。例: 12 + 6.0 − 8.0 = 10 N(右向き)。または 5.0 + 6.0 − 4.0 − 8.0 = −1.0 N(鉛直下向きに 1.0 N)。'),
        eq('Equilibrium:   ΣF = 0'),
        ex('Worked example 2.2', 'Determine the magnitude of the force F given that the block is in equilibrium. (Forces: 6.0 N, F and 6.0 N to the right, 15 N to the left.)', ['For equilibrium ΣF = 0: 6.0 + F + 6.0 − 15 = 0 ⇒ F = 3.0 N.'], '右向きを正として、すべての力を足して 0 とおくだけです。'),
        ex('Worked example 2.3', 'A brick of weight 50 N rests on a horizontal surface; μ_s = 0.60 and μ_d = 0.20. A horizontal force F, increasing uniformly from zero, is applied. Once the brick starts moving the pulling force stops increasing. Estimate the net force on the moving brick.', ['Maximum static friction: f_s = μ_s R = 0.60 × 50 = 30 N, so the brick starts to move when F is just above 30 N.', 'Once moving the friction is μ_d R = 0.20 × 50 = 10 N. The net force is just over 30 − 10 = 20 N.'], '動き出す直前の力は、最大静摩擦力(30 N)です。動き出すと、摩擦力は動摩擦力(10 N)に下がるので、引く力が、ほぼ 30 N のままなら、合力は約 20 N になります(これが、動き出したレンガを加速させます)。'),
        chk('Check yourself 3', 'An ice cube floats in water in a glass. What happens to the level of the water when the ice cube melts?', 'It stays the same. The buoyant force equals the weight of the ice cube and also the weight of the displaced water, so when the ice cube melts its volume will be that of the displaced water.', '答え: 変わりません。氷は、自分の重さと同じ重さの水を押しのけて浮いています。溶けると、その重さの水になるので、体積は、押しのけていた水の体積と同じになります。'),
        ex('Worked example 2.4', 'An iceberg floats in seawater. The density of ice is 920 kg m⁻³ and that of seawater 1020 kg m⁻³. Estimate the fraction of the iceberg\'s volume that is under water.', ['The weight (W = ρ_ice gV) is balanced by the buoyant force (F_B = ρ_water gV_imm).', 'ρ_ice gV = ρ_water gV_imm ⇒ V_imm / V = ρ_ice / ρ_water = 920 / 1020 = 0.90.'], '浮いているので、重さ = 浮力。g が両辺で消えるので、水に沈む体積の割合は、密度の比になります。約90%が水の中です。'),
        ex('Worked example 2.5', 'A small sphere of radius r and density ρ_body falls vertically through a viscous fluid of viscosity η and density ρ_fluid with constant speed v. Show that v = (2/9)(ρ_body − ρ_fluid) r² g / η.', ['Constant speed means equilibrium: W = B + F_D (weight down; buoyancy and drag up).', 'ρ_body gV = ρ_fluid gV + 6πηrv, with V = 4πr³/3.', '6πηrv = (4πr³ g / 3)(ρ_body − ρ_fluid) ⇒ v = (2/9)(ρ_body − ρ_fluid) r² g / η.'], '「一定の速さ」=「つり合い」なので、下向きの重さと、上向きの浮力+抵抗力を等しくします。球の体積 V = 4πr³/3 を代入して、v について解くと、式が得られます。これが、液体中を落ちる球の「終端速度」です。'),
        chk('Check yourself 4', 'A car moves on a straight horizontal road with constant speed. The force due to the engine pushing the car forward is F. Is the total resistive force on the car less than F, equal to F, or greater than F?', 'The net force is zero, so the resistive force is equal to F.', '答え: F に等しい。一定の速さ(加速度 0)なので、合力は 0。前向きの F と、後ろ向きの抵抗力の合計が、つり合います。'),
      ] },
    ],
    reflect: ['Do you know how to find the net force on a body?', 'Can you draw free-body diagrams?'],
    reflectJa: ['物体に働く合力の求め方が分かる?', '自由物体図を描ける?'],
    check: ['construct free-body diagrams showing the correct direction of forces and find the net force on a body', 'apply the condition for equilibrium, ΣF = 0'],
    checkJa: ['力の向きを正しく描いた自由物体図を作り、合力を求められる', 'つり合いの条件 ΣF = 0 を使える'],
  },

  'A2-2': {
    code: 'A2.2', title: 'Newton’s laws of motion', icon: 'newton',
    lead: 'Inertia, equilibrium with angles, F = ma and action–reaction pairs — and how to solve problems with them.',
    leadJa: '慣性、角度のあるつり合い、F = ma、作用・反作用を学び、それを使って、問題を解く方法を身につけます。',
    goals: ['State and apply Newton\'s three laws', 'Resolve forces into components', 'Solve F = ma problems step by step', 'Handle inclined planes and several bodies'],
    sections: [
      { id: 'first', title: 'Newton’s first law of motion', blocks: [
        p('Imagine two identical, windowless train carriages: one at rest in the station, one moving in a straight line at constant speed on a perfectly smooth ride. Every physics experiment gives identical results in both. We cannot tell which is "really at rest" or "really moving". It is natural to believe that there is no net force in either case.',
          '同じ、窓のない電車の車両が2つあるとします。1つは駅で止まっていて、もう1つは、揺れのないなめらかな走りで、一定の速さで直進しています。どんな物理の実験も、2つの車両で、同じ結果になります。「本当に止まっているのはどちらか」「本当に動いているのはどちらか」は、分かりません。どちらにも、合力がない、と考えるのが自然です。'),
        key('Newton\'s first law: when the net force on a body is zero, the body moves with constant velocity (which may be zero); in other words it moves on a straight line with constant speed (which may be zero).', 'ニュートンの第1法則: 物体に働く合力が 0 のとき、物体は、一定の速度(0 のこともある)で動く。つまり、一定の速さで、直線上を動く(速さが 0 のこともある)。'),
        p('In effect the first law defines what a force is: a force is what changes a body\'s velocity. It is not what is required to keep something moving, as Aristotle thought. Used in reverse: if a body is not moving with constant velocity (it changes speed, or direction, or both), a force must be acting on it. Since the Earth revolves around the Sun, we know a force acts on the Earth.',
          '第1法則は、実質的に「力とは何か」を定義しています。力は、物体の速度を「変えるもの」です。アリストテレスが考えたような、「動き続けるために必要なもの」ではありません。逆向きに使うこともできます。物体が、一定の速度で動いていない(速さか向きか、両方が変わる)なら、力が働いているはずです。地球は、太陽のまわりを回っているので、地球には、力が働いているのが分かります。'),
        p('The first law is also called the law of inertia. Inertia is what keeps a body in the same state of motion when no forces act. When a car accelerates forward, passengers are pushed back into their seats because their original state was low speed. When a car brakes abruptly, passengers are thrown forward. This is why seat belts and air bags are a good idea.',
          '第1法則は、「慣性の法則」とも呼ばれます。慣性とは、力が働かないとき、物体を、同じ運動の状態に保つ性質です。車が前に加速すると、乗っている人は、もとの(遅い)状態を保とうとして、座席に押しつけられます。急ブレーキでは、前に投げ出されます。シートベルトやエアバッグが、役に立つ理由です。'),
      ] },
      { id: 'third', title: 'Newton’s third law of motion', blocks: [
        key('Newton\'s third law: if body X exerts a force on body Y, then body Y exerts an equal and opposite force on body X.', 'ニュートンの第3法則: 物体Xが物体Yに力を及ぼすとき、物体YもXに、大きさが等しく、向きが反対の力を及ぼす。'),
        p('These equal and opposite forces act on different bodies. So you cannot use the law to claim that a body can never have a net force because every force has an equal and opposite one. Examples: (1) a person on roller-skates pushes a wall and moves away (the wall pushes back); (2) a bathroom scale reads the force you exert on it, which equals your weight only when the scale is at rest; (3) a hovering helicopter pushes air down and the air pushes it up; (4) the Earth pulls a 2 kg book with about 20 N, so the book pulls the Earth up with 20 N.',
          '大きさが等しく、向きが反対の、この2つの力は、「別々の物体」に働きます。ですから、「すべての力には、等しく反対の力があるから、合力はありえない」とは、言えません。例: (1) ローラースケートで壁を押すと、壁に押し返されて、離れる。(2) 体重計は、自分が体重計に及ぼす力を表示する。これが体重と等しいのは、体重計が止まっているときだけ。(3) 空中に静止するヘリコプターは、空気を下に押し、空気に上に押し返される。(4) 地球は、質量 2 kg の本を、約 20 N で引くので、本も、地球を 20 N で、上に引く。'),
        p('Be careful: two equal and opposite forces do not always form a third-law pair. A 3 kg block resting on a table has its weight (30 N, down) and the normal force from the table (30 N, up). They are equal and opposite but act on the same body, so they have nothing to do with the third law. (The partner of the weight is an upward force on the Earth; the partner of the normal force is a downward force on the table.) The third law also applies without contact, e.g. the electric force between two charges and the gravitational force between two masses.',
          '注意: 大きさが等しく、向きが反対の2つの力が、いつも第3法則の「ペア」とは限りません。机の上で、止まっている 3 kg のブロックには、重さ(30 N、下向き)と、机からの垂直抗力(30 N、上向き)が働きます。これは、大きさが等しく向きが反対ですが、同じ物体に働いているので、第3法則とは関係ありません。(重さの相手は、地球にかかる上向きの力。垂直抗力の相手は、机にかかる下向きの力です。) 第3法則は、接触がなくても成り立ちます。電荷どうしの電気力や、2つの質量の間の万有引力がその例です。'),
        key('Newton\'s third-law pair: same type of force, equal size, opposite direction, acting on DIFFERENT bodies.', '第3法則のペア: 同じ種類の力で、大きさが等しく、向きが反対で、「別々の」物体に働く。'),
        ctx('Science in context', 'Helicopters, planes and rockets function because of Newton\'s third law.', '科学の文脈: ヘリコプター、飛行機、ロケットは、ニュートンの第3法則のおかげで、動いています。'),
      ] },
      { id: 'equil2', title: 'Equilibrium with forces at angles', blocks: [
        p('When forces act at angles, we resolve them into components along chosen axes whose origin is the body. In equilibrium both ΣF_x = 0 and ΣF_y = 0. The three force vectors form a closed triangle. Example (Figure 2.36): F₂ = 22.0 N down, F₃ = 29.0 N at 37° above the negative x-axis; find F₁.',
          '力が、角度をもって働くときは、物体を原点にとった軸の向きに、力を「成分」に分けます。つり合いでは、ΣFₓ = 0 と ΣF_y = 0 の、両方が成り立ちます。3つの力のベクトルは、閉じた三角形になります。例(図2.36): F₂ = 22.0 N(下向き)、F₃ = 29.0 N(負の x 軸から 37° 上向き)のとき、F₁ を求めます。'),
        fig('triangle', 'Three forces in equilibrium on one point; the three vectors form a triangle.', '1つの点に働く3つの力のつり合い。3つのベクトルは、三角形をつくります。'),
        eq('F₂ₓ = 0,   F₂y = −22.0 N', 'F₃ₓ = −29.0 cos 37° = −23.16 N,   F₃y = 29.0 sin 37° = 17.45 N', 'ΣFₓ = 0:  F₁ₓ − 23.16 = 0 ⇒ F₁ₓ = 23.16 N', 'ΣF_y = 0:  F₁y − 22 + 17.45 = 0 ⇒ F₁y = 4.55 N', 'F₁ = √(23.16² + 4.55²) = 23.6 N,   θ = tan⁻¹(4.55/23.16) = 11.1°'),
        tip('If we know the x and y components of a force, its magnitude is F = √(Fₓ² + F_y²).', '試験のコツ: 力の x 成分と y 成分が分かれば、大きさは F = √(Fₓ² + F_y²)。'),
        ctx('Science in context', 'The Temple of Hephaestus in Athens still stands after 2500 years because it was built according to the laws of equilibrium.', '科学の文脈: アテネのヘファイストス神殿は、つり合いの法則にしたがって建てられたので、2500年たった今も、立っています。'),
        ex('Worked example 2.6', 'A body of weight 98.0 N hangs from two strings attached to the ceiling (T at 30° above the horizontal to the left, S at 50° above the horizontal to the right). Determine the tension in each string.', ['Components: Tₓ = −T cos 30°, T_y = T sin 30°; Sₓ = S cos 50°, S_y = S sin 50°; W_y = −98.0 N.', 'ΣFₓ = 0: −T cos 30° + S cos 50° = 0 ⇒ S = T cos 30° / cos 50° = 1.3473 T.', 'ΣF_y = 0: T sin 30° + S sin 50° − 98 = 0 ⇒ T(sin 30° + 1.3473 sin 50°) = 98.', 'T = 63.96 ≈ 64.0 N, S = 1.3473 × 63.96 = 86.17 ≈ 86.2 N.'], '手順: ①各力を x と y の成分に分ける、②ΣFₓ = 0 から、S を T で表す、③ΣF_y = 0 に代入して T を求める、④S を求める。角度は、水平とのなす角か、鉛直とのなす角か、問題ごとに確認して、cos と sin の使い分けを間違えないように。'),
        ex('Worked example 2.7', 'A mass of 125 g hangs from a vertical spring of k = 58 N m⁻¹. (a) Find the extension. (b) Will the extension change on the Moon?', ['(a) Equilibrium: kx = mg ⇒ x = mg/k = 0.125 × 9.81 / 58 = 0.021 m = 2.1 cm.', '(b) The extension will be less on the Moon, because the acceleration of gravity is less.'], 'ばねの力 kx と、重さ mg が、つり合います。単位を、kg と m に直して計算します(125 g = 0.125 kg)。'),
      ] },
      { id: 'second', title: 'Newton’s second law of motion', blocks: [
        key('Newton\'s second law: the net force on a body of constant mass is proportional to the body\'s acceleration and is in the same direction as the acceleration.', 'ニュートンの第2法則: 質量が一定の物体に働く合力は、その物体の加速度に比例し、加速度と同じ向き。'),
        eq('F⃗ = m a⃗'),
        p('The constant of proportionality is the mass m. For a freely falling body the net force is its weight mg, so mg = ma and a = g: the acceleration of a freely falling body is exactly g. Experiments since Galileo show that all bodies fall with the same acceleration in a vacuum, whatever their density, mass, shape or material (the hammer and feather dropped on the Moon in Apollo 15). The equation F = ma defines the newton: 1 N is the force that accelerates 1 kg by 1 m s⁻² in the direction of the force. The force in the second law is the net force ΣF.',
          '比例定数は、質量 m です。自由落下する物体の合力は、重さ mg なので、mg = ma から a = g。つまり、自由落下の加速度は、ちょうど g です。ガリレオ以来の実験で、真空中では、密度・質量・形・材質に関係なく、すべての物体が、同じ加速度で落ちることが分かっています(アポロ15号で、月面でハンマーと羽を落とした実験)。F = ma は、力の単位ニュートンを定義します。1 N は、質量 1 kg の物体に、1 m s⁻² の加速度を与える力です。第2法則の F は、「合力」ΣF です。'),
        tip('How to solve an F = ma problem. Step 1: make a diagram and choose the positive direction. Step 2: make a free-body diagram. Step 3: find the net force from the diagram. Step 4: set the net force equal to ma. Step 5: solve for the unknown.', '試験のコツ: F = ma の問題の解き方。①図を描き、正の向きを決める。②自由物体図を描く。③自由物体図から、合力を求める。④合力 = ma とおく。⑤未知の量を求める。'),
        p('Example: a 5.0 kg block is accelerated to the right by a horizontal force F with a = 0.80 m s⁻²; friction is 12 N. Net force = F − 12; F − 12 = 5.0 × 0.80 = 4.0 ⇒ F = 16 N.',
          '例: 5.0 kg のブロックを、水平な力 F で、右へ a = 0.80 m s⁻² で加速します。摩擦力は 12 N。合力 = F − 12 なので、F − 12 = 5.0 × 0.80 = 4.0 より F = 16 N。'),
        chk('Check yourself 5', 'An elevator moving upwards is slowing down to a stop. Which diagram (A, B or C) shows the forces on the elevator? (A: up and down arrows equal; B: up arrow longer than down arrow; C: down arrow longer than up arrow.)', 'C, because the net force has to be opposite to the velocity.', '答え: C。上向きに動いて「減速」しているので、加速度は下向き、つまり、合力は下向きです。下向きの力(重さ)のほうが、上向きの力(張力)より大きい図です。'),
        ex('Worked example 2.8', 'A person of mass 70 kg stands on the floor of an elevator. Find the normal force from the floor when the elevator (a) is standing still, (b) moves up at constant speed 3.0 m s⁻¹, (c) moves up with acceleration 4.0 m s⁻², (d) moves down with acceleration 4.0 m s⁻². (g = 10 m s⁻²)', ['Forces: weight mg down, normal force R up.', '(a), (b) No acceleration, so ΣF = 0: R = mg = 7.0 × 10² N.', '(c) Up positive: R − mg = ma ⇒ R = mg + ma = 700 + 280 = 9.8 × 10² N.', '(d) Down positive: mg − R = ma ⇒ R = mg − ma = 700 − 280 = 4.2 × 10² N.'], '(b) 一定の速さなら、加速度 0 なので、止まっているときと同じ。「速さ」ではなく「加速度」が、垂直抗力を決めます。(c) 上向きに加速すると、床は、重さより大きな力で押すので、重く感じます。(d) 下向きに加速すると、軽く感じます。'),
        ex('Worked example 2.9', 'A 70 kg man in an elevator moving up at 3.0 m s⁻¹ comes to rest in 2.0 s. Find the normal force during the deceleration. Repeat for an elevator going down and then stopping.', ['Up positive. Going up and stopping: a = (0 − 3.0)/2.0 = −1.5 m s⁻². R − mg = ma ⇒ R = 70 × (−1.5) + 700 = 595 ≈ 6.0 × 10² N.', 'Going down and stopping: a = (0 − (−3.0))/2.0 = +1.5 m s⁻². R = ma + mg = 105 + 700 = 805 ≈ 8.0 × 10² N.'], '上向きに動いて止まるときは、加速度が下向き(−1.5)なので、R が小さくなり、「軽く」感じます。下向きに動いて止まるときは、加速度が上向き(+1.5)なので、R が大きくなり、「重く」感じます。軽さ・重さの感覚は、垂直抗力で決まっています。'),
      ] },
      { id: 'incline', title: 'The inclined plane', blocks: [
        p('A block rests on an incline at angle θ. Show it as a point; the forces are the normal force R (perpendicular to the plane), the weight mg (down) and friction f (up the plane). Choose the x-axis along the incline (the direction of possible motion). The weight\'s components are mg sin θ along the plane and mg cos θ perpendicular to it. In equilibrium: f = mg sin θ and R = mg cos θ.',
          '角度 θ の斜面の上に、ブロックが乗っています。ブロックは点で表し、力は、垂直抗力 R(斜面に垂直)、重さ mg(下向き)、摩擦力 f(斜面に沿って上向き)です。x 軸は、動きうる向き、つまり斜面に沿って取ります。重さの成分は、斜面に沿って mg sin θ、斜面に垂直に mg cos θ です。つり合いでは、f = mg sin θ、R = mg cos θ。'),
        fig('incline', 'Forces on a block on an incline: R perpendicular to the plane, mg down (components mg sinθ along and mg cosθ across the plane), f up the plane.', '斜面上のブロックに働く力。R は斜面に垂直、mg は下向き(斜面に沿った成分 mg sinθ と、垂直な成分 mg cosθ)、f は斜面に沿って上向き。'),
        eq('f = mg sin θ,   R = mg cos θ'),
        p('The largest angle θ_max for equilibrium is where friction is at its maximum: μ_s mg cos θ_max = mg sin θ_max, so μ_s = tan θ_max. On a frictionless incline the unbalanced force mg sin θ gives the acceleration a = g sin θ (independent of the mass).',
          'つり合いを保てる、最大の角度 θ_max は、摩擦力が最大のときです。μ_s mg cos θ_max = mg sin θ_max より μ_s = tan θ_max。なめらかな(摩擦のない)斜面では、つり合わない力 mg sin θ が加速度を生み、a = g sin θ(質量によりません)になります。'),
        eq('μ_s = tan θ_max', 'frictionless:  a = g sin θ'),
        chk('Check yourself 6', 'A block of mass 2.0 kg slides down a frictionless inclined plane with acceleration 4.0 m s⁻². What is the acceleration of a 5.0 kg block sliding down the same plane?', 'The same; the acceleration is independent of mass.', '答え: 同じ(4.0 m s⁻²)。a = g sin θ に、質量が出てこないからです。'),
      ] },
      { id: 'multi', title: 'Cases with more than one body', blocks: [
        p('Apply the five steps to each body. Example: blocks of 4.0 and 6.0 kg joined by a string on a frictionless table; a 100 N force pulls the 6.0 kg block. The string is inextensible, so both move with the same acceleration a. On the 6.0 kg block: 100 − T = 6a. On the 4.0 kg block: T = 4a. Adding gives a = 10 m s⁻² and T = 4.0 × 10 = 40 N. The 100 N force acts only on the body on the right; it is a common mistake to say the left body is also acted on by 100 N.',
          '各物体に、5つの手順を適用します。例: 4.0 kg と 6.0 kg のブロックを、糸でつないで、なめらかな机の上に置き、6.0 kg のブロックを 100 N で引きます。糸は伸びないので、2つは同じ加速度 a で動きます。6.0 kg: 100 − T = 6a。4.0 kg: T = 4a。2式を足して a = 10 m s⁻²、T = 4.0 × 10 = 40 N。100 N の力は、右の物体にだけ働きます。左の物体にも 100 N が働く、というのは、よくある間違いです。'),
        eq('100 − T = 6a', 'T = 4a   ⇒   a = 10 m s⁻²,  T = 40 N'),
        p('Often we may treat the bodies as one: net force 100 N on a body of mass 10 kg gives a = 10 m s⁻². The tension cancels (it has become an internal force). But to find the tension we must separate the bodies again: T = 4a = 40 N.',
          '2つの物体を、1つの物体として扱うこともできます。質量 10 kg の物体に、合力 100 N なので a = 10 m s⁻²。張力は、打ち消し合います(内力になるため)。ただし、張力を求めるには、また分けて考えます。T = 4a = 40 N。'),
        chk('Check yourself 7', 'Two blocks of mass 3 kg and 5 kg are joined by a string and allowed to fall freely. What is the tension in the string?', 'The acceleration of each block is g. The net force on the bottom block is mg − T = ma, so T = 0 since a = g.', '答え: 0。2つとも、自由落下で、加速度は g。下のブロックについて、mg − T = ma で a = g なので、T = 0。糸は、たるんでいます。'),
        ex('Worked example 2.10 (Atwood’s machine)', 'Two blocks, m = 4.0 kg and M = 6.0 kg, are joined by a string over a pulley. They are released from rest. Determine the acceleration of each block.', ['Method 1 (each body): T − mg = ma (1); Mg − T = Ma (2). Adding: Mg − mg = (m + M)a, so a = ((M − m)/(M + m)) g = 2.0 m s⁻².', 'Tension: T = m a + mg = (2Mm/(M + m)) g = 48 N.', 'Method 2 (one system): the net force on the pair is Mg − mg and the mass is M + m, so the same a. T is internal and does not appear.', 'Checks: if M ≫ m, a → g and T → 2mg; if M = m, a = 0.'], '2つの物体を、別々に考える方法(式(1)と(2)を足す)と、1つの系として考える方法の、2通りがあります。結果の、確かめも大切です。M が m よりずっと大きいと a → g(重いほうが、ほぼ自由落下)、M = m だと a = 0(つり合う)。アトウッドの装置は、g をゆっくりにして測るのに使われます。'),
        ex('Worked example 2.11', 'A block of mass M on a frictionless table is connected over a pulley to a smaller block m hanging down. Find the acceleration of each block and the tension.', ['On m: mg − T = ma; on M: T = Ma. Adding: a = mg / (m + M).', 'T = Mmg / (m + M). With M = 8.0 kg and m = 2.0 kg: a = 2.0 m s⁻² and T = 16 N.', 'Method 2: treat as one body: mg = (M + m)a gives the same a. (If M ≫ m, a → 0.)'], '机の上の M は、張力 T だけで引かれ(T = Ma)、つるされた m は、mg − T で加速します(mg − T = ma)。足すと、a = mg/(m + M)。'),
        ex('Worked example 2.12', 'A 4.0 kg block rests on a 6.0 kg block on a frictionless surface. A horizontal force F acts on the bottom block; μ_s between the blocks is 0.60. What is the largest F so that both move together without sliding?', ['Friction between the blocks pushes the top block forward. Its maximum value: f_max = μ_s N = 0.60 × 40 = 24 N.', 'Top block: 24 = 4a ⇒ a = 6.0 m s⁻². Bottom block: F − 24 = 6a.', 'F = 24 + 36 = 60 N.'], '上のブロックを、加速させるのは、ブロックどうしの静摩擦力だけです。その最大値(24 N)が、上のブロックの最大の加速度(6.0 m s⁻²)を決めます。下のブロックには、F と摩擦の反作用(24 N、後ろ向き)が働くので、F − 24 = 6a。'),
        ex('Worked example 2.13', 'The force F in the previous example is 80 N, and μ_d between the blocks is 0.50. What is the acceleration of each block?', ['80 N exceeds 60 N, so the blocks slide. f = μ_d N = 0.50 × 40 = 20 N.', 'Bottom: 80 − 20 = 6a₁ ⇒ a₁ = 10 m s⁻². Top: 20 = 4a₂ ⇒ a₂ = 5.0 m s⁻².', 'Both accelerate forward, but relative to the bottom block the top block slides backward.'], '60 N を超えるので、すべり始めます。摩擦力は、動摩擦力(20 N)に変わります。下は a₁ = 10、上は a₂ = 5.0 m s⁻² なので、下のほうが速く進み、上のブロックは、下に対して、後ろへすべります。'),
        p('Links: Newton\'s second law F = ma becomes, in calculus form (a = d²x/dt²), d²x/dt² − F/m = 0, a differential equation. Given how the force depends on time or position, solving it gives the actual path. For example, Newton showed that if the force depends on position as F ∝ 1/x² the path must be a conic section (ellipse, circle, ...). If F ∝ x (as in a spring) the motion is oscillation about a fixed point. The same equation applied in different contexts gives the type of motion.',
          'つながり: ニュートンの第2法則 F = ma は、微積分で書くと(a = d²x/dt²)、d²x/dt² − F/m = 0 という微分方程式になります。力が、時間や位置に、どう依存するかが分かれば、これを解いて、実際の経路が分かります。たとえば、力が位置に、F ∝ 1/x² のように依存するなら、経路は、円錐曲線(だ円、円など)になる、とニュートンは示しました。ばねのように F ∝ x なら、運動は、1点のまわりの振動になります。同じ式が、場面ごとに、運動の種類を決めるのです。'),
      ] },
    ],
    reflect: ['Can you find the components of a force along given axes?', 'Can you find the magnitude and direction of a force given its components?', 'Can you identify forces which make a Newton third law pair?', 'Can you solve problems with Newton’s second law?', 'Can you solve problems in which frictional forces are present?', 'Can you solve problems involving forces and accelerations in a variety of situations?'],
    reflectJa: ['力を、与えられた軸の成分に分けられる?', '成分から、力の大きさと向きを求められる?', '第3法則のペアになる力を見分けられる?', '第2法則の問題を、解ける?', '摩擦力のある問題を、解ける?', 'いろいろな場面の、力と加速度の問題を、解ける?'],
    check: ['understand and apply Newton’s laws of motion', 'solve problems when friction is present'],
    checkJa: ['ニュートンの運動の法則を理解して使える', '摩擦力のある問題を解ける'],
  },

  'A2-3': {
    code: 'A2.3', title: 'Circular motion', icon: 'circular',
    lead: 'Why a body moving in a circle at constant speed is accelerating, and which force provides the centripetal acceleration.',
    leadJa: '円運動をする物体が、一定の速さでも「加速している」理由と、向心加速度を生み出す力を学びます。',
    goals: ['Use period, frequency, angular speed and linear speed', 'Explain centripetal acceleration', 'Identify centripetal forces', 'Understand that a body in circular motion is not in equilibrium'],
    sections: [
      { id: 'omega', title: 'Circular motion and angular speed', blocks: [
        p('Circular motion is common, and includes the approximately circular motion of the planets around the Sun. It requires a force directed towards the centre; for planets a new force, gravitation, had to be discovered. An object moves on a circle of radius r with constant speed v. Let T be the time for one revolution, the period. The object covers 2πr in a time T.',
          '円運動は、とても身近な運動で、惑星が太陽のまわりを(ほぼ円で)回る運動も、その1つです。円運動には、中心に向かう力が必要です。惑星の場合は、そのために、万有引力という新しい力が、見つけられました。半径 r の円の上を、一定の速さ v で動く物体を考えます。1周にかかる時間を T とし、「周期」と呼びます。1周で 2πr の距離を、時間 T で進みます。'),
        eq('v = {2πr|T}'),
        p('The object sweeps out an angle of 2π radians in one period, so we define the angular speed ω = (angle swept)/(time taken) = Δθ/Δt = 2π/T, in rad s⁻¹ (or s⁻¹). The frequency f is the number of full revolutions per second, f = 1/T, so ω = 2πf. Comparing v = 2πr/T with ω = 2π/T gives v = rω, the relation between linear speed and angular speed.',
          '1周のあいだに、物体は 2π ラジアンの角度を動くので、「角速度」を ω = (動いた角度) ÷ (かかった時間) = Δθ/Δt = 2π/T と定義します。単位は rad s⁻¹(または s⁻¹)です。「振動数(周波数)」f は、1秒あたりの回転数で、f = 1/T。したがって ω = 2πf。v = 2πr/T と ω = 2π/T を比べると、v = rω が得られ、これが、線速度と角速度の関係です。'),
        eq('ω = {Δθ|Δt} = {2π|T} = 2πf', 'f = {1|T}', 'v = rω = {2πr|T} = 2πrf'),
        key('Linear speed v (m s⁻¹) = radius r × angular speed ω (rad s⁻¹). One revolution = 2π rad.', '線速度 v (m s⁻¹) = 半径 r × 角速度 ω (rad s⁻¹)。1回転 = 2π ラジアン。'),
        tok('Stars trace arcs in the night sky. The ancients said the stars rotate around a fixed Earth; today we say the Earth rotates about its axis. Which view is correct, and how do we know? In 1851 Foucault built a long pendulum with a heavy bob; when set oscillating, its plane of oscillation rotates slowly clockwise (in the northern hemisphere), simply explained by the rotation of the Earth. The same reason that makes the Foucault pendulum precess is responsible for patterns of wind and ocean currents. It is remarkable how very simple observations reveal something deep about the world (like Eratosthenes\' measurement of the Earth\'s radius, or Olbers\' observation about the dark night sky).',
          '知の理論(TOK): 星は、夜空に弧を描きます。昔の人は、「星が、止まった地球のまわりを回る」と説明しましたが、今は「地球が自転している」と説明します。どちらが正しく、どうやって分かるのでしょうか。1851年、フーコーは、重いおもりをつけた長い振り子をつくりました。振らせると、振動の面が、ゆっくり時計回りに(北半球で)回ります。これは、地球の自転で、簡単に説明できます。フーコーの振り子の面が回る理由は、風や海流のパターンの原因でもあります。とても単純な観察が、世界の深い仕組みを明らかにすることに、おどろかされます(エラトステネスによる地球の半径の測定や、オルバースの「夜空が暗い」という観察も同じです)。'),
        ex('Worked example 2.14', 'Calculate (a) the angular speed of the Earth as it rotates around the Sun, (b) the angle swept in 30 days, (c) the linear speed of the Earth. (Orbit radius 1.5 × 10¹¹ m)', ['(a) T ≈ 365 days: ω = 2π/T = 2π / (365 × 24 × 60 × 60) = 1.99 × 10⁻⁷ ≈ 2.0 × 10⁻⁷ s⁻¹.', '(b) θ = (30/365) × 2π = 0.52 rad ≈ 30°.', '(c) v = ωr = 1.99 × 10⁻⁷ × 1.5 × 10¹¹ = 29 580 ≈ 3.0 × 10⁴ m s⁻¹.'], '1年を秒に直すのがコツです(365 × 24 × 60 × 60 s)。(b) 30日は、1周(365日)の 30/365 なので、角度も 2π の 30/365。(c) v = rω で、約 30 km/s。地球は、じつは、とても速く動いています。'),
      ] },
      { id: 'centripetal', title: 'Centripetal acceleration', blocks: [
        p('In circular motion, even if the linear speed is constant the velocity is not: it changes direction. So there is acceleration. (The derivation below can be skipped; go to the result.) The acceleration is a⃗ = Δv⃗/Δt, where Δv⃗ is a vector. The vector changes if its magnitude changes, or its direction changes, or both. For constant speed it is the direction that changes, so we find Δv⃗ = v⃗_Q − v⃗_P.',
          '円運動では、線速度の「大きさ(速さ)」が一定でも、「速度」は一定ではありません。向きが変わるからです。つまり、加速度があります。(以下の導出は、飛ばして、結果に進んでもかまいません。) 加速度は a⃗ = Δv⃗/Δt で、Δv⃗ はベクトルです。ベクトルは、大きさが変わるか、向きが変わるか、その両方で変わります。速さが一定なら、変わるのは向きで、Δv⃗ = v⃗_Q − v⃗_P を求めます。'),
        p('The triangle formed by v⃗_P, v⃗_Q and Δv⃗ is isosceles with two sides v. For a small angle Δθ the third side |Δv⃗| is approximately an arc of radius v: Δv = vΔθ. So a = Δv/Δt = vΔθ/Δt = vω, and with ω = v/r, a = v²/r. As Δt → 0, Δv⃗ becomes perpendicular to v⃗: the acceleration points toward the centre of the circle. This is centripetal acceleration.',
          'v⃗_P、v⃗_Q、Δv⃗ がつくる三角形は、2辺が v の二等辺三角形です。角 Δθ が小さいとき、3つ目の辺 |Δv⃗| は、半径 v の円弧とほぼ同じで、Δv = vΔθ。よって a = Δv/Δt = vΔθ/Δt = vω。ω = v/r を使うと a = v²/r。Δt → 0 では、Δv⃗ は v⃗ に垂直になり、加速度は円の中心を向きます。これが「向心加速度」です。'),
        fig('centripetal', 'In uniform circular motion the velocity (red) is tangent to the circle and the acceleration (green) points to the centre.', '等速円運動では、速度(赤)は円の接線の向き、加速度(緑)は中心を向きます。'),
        key('A body moving on a circle of radius r with speed v has centripetal acceleration of magnitude a_c = v²/r, directed toward the centre of the circle.', '半径 r の円の上を、速さ v で動く物体は、大きさ a_c = v²/r の向心加速度をもち、その向きは円の中心。'),
        eq('a_c = {v²|r} = ω²r = {4π²r|T²} = 4π²rf²'),
        p('Which form to use depends on what is given: v and r, ω and r, T and r, or f and r.',
          'どの形を使うかは、与えられた量(v と r、ω と r、T と r、f と r)で選びます。'),
        chk('Check yourself 8', 'The Earth has a mass of 6 × 10²⁴ kg and completes one revolution around the Sun in a circular orbit of radius 1.5 × 10¹¹ m. What is the gravitational force between the Earth and the Sun?', 'a_c = 4π²r/T² = 4π² × 1.5 × 10¹¹ / (365 × 24 × 60 × 60)² ≈ 6 × 10⁻³ m s⁻², so F = Ma = 6 × 10²⁴ × 6 × 10⁻³ = 3.6 × 10²² N.', '答え: 約 3.6 × 10²² N。地球の向心加速度 a_c = 4π²r/T² を求め、F = Ma に入れます。この力が、太陽と地球の間の万有引力です。'),
        ex('Worked example 2.15', '(a) A particle moves on a circle of radius 2.0 m with angular speed 2.1 s⁻¹. Find its centripetal acceleration. (b) The radius of the Earth is 6.4 × 10⁶ m. Find the centripetal acceleration due to the spinning Earth for someone on the equator. (c) A mass moves counterclockwise with constant speed. Find the direction of the velocity change from A to B.', ['(a) a_c = ω²r = 2.1² × 2.0 ≈ 8.8 m s⁻².', '(b) v = 2πR/T = 2π × 6.4 × 10⁶ / (24 × 60 × 60) = 4.65 × 10² m s⁻¹, a = v²/R = 3.4 × 10⁻² m s⁻². Quite small compared with g, so we are not aware of it.', '(c) The velocity change is Δv = v_B − v_A, a vector difference. For A (velocity vertical) to B (velocity pointing left) it points toward the centre of the circle (to the lower left).'], '(a) a_c = ω²r に入れるだけ。(b) 赤道の1日の自転でも、向心加速度は、g の 0.3% 程度なので、日常では気づきません。(c) 速度の「差」(ベクトル)を、図で求めると、中心を向きます。'),
      ] },
      { id: 'force', title: 'Centripetal forces', blocks: [
        p('If we know a body moves in a circle, then a net force must be acting on it, since it accelerates. If the speed is constant, the net force points toward the centre: a centripetal force. For a car on a circular level road, friction between the tyres and the road provides the centripetal force. If the friction is not large enough, the car skids outward onto a circle of larger radius.',
          '物体が、円運動をしているなら、加速しているので、合力が働いているはずです。速さが一定なら、合力は中心を向きます。これが「向心力」です。水平な円形の道を走る車では、タイヤと道の間の摩擦力が、向心力になります。摩擦力が足りないと、車は、外側へすべって、より大きな半径の円を描きます。'),
        chk('Check yourself 9', 'A pendulum swings back and forth. At the instant the string is vertical, is the pendulum bob in equilibrium?', 'No. The bob moves in a circular arc and so has centripetal acceleration towards the centre of the arc. Hence the tension force is greater than the weight.', '答え: いいえ。おもりは、円弧の上を動いているので、中心(支点)向きの向心加速度があります。したがって、張力は、重さより大きいです(T − mg = mv²/r)。'),
        ex('Worked example 2.16', '(a) The coefficient of static friction between the tyres of a car of mass 1100 kg and dry asphalt is about 0.70. Find the maximum speed for a circular turn of radius 95 m. (b) In wet conditions μ is 0.40. Predict the safe maximum speed.', ['(a) f_max = μ_s N = 0.70 × 1100 × 9.81 = 7554 ≈ 7.6 × 10³ N provides the centripetal force: mv²/r = f ⇒ v = √(fr/m) = √(7554 × 95/1100) ≈ 26 m s⁻¹.', '(b) mv²/r = μ mg ⇒ v = √(μ g r): the mass is not relevant. New speed = 26 × √(0.40/0.70) ≈ 20 m s⁻¹.'], '摩擦力が、向心力になります。式を整理すると v = √(μgr) で、質量が消えます。μ が小さい雨の日は、安全な最高速度が、約 20 m s⁻¹ に下がります。'),
        tip('It is very important that you understand worked example 2.17.', '試験のコツ: 例題 2.17 は、とても大切です。しっかり理解しましょう。'),
        ex('Worked example 2.17', 'A particle is tied to a string and moves with constant speed in a horizontal circle. The string is tied to the ceiling. Draw the forces on the particle.', ['The common mistake is to draw a horizontal force toward the centre and call it the centripetal force. The list of forces available is: weight, normal forces, friction, tension, resistance, electric forces, ... There is no entry for a centripetal force.', 'Think of "centripetal" as an adjective describing forces already acting. Here the only forces are the weight and the tension. The weight is equal and opposite to the vertical component of the tension, so the only force left is the horizontal component of the tension: this is the centripetal force. It is not a new force, only a component of a force already acting.'], '「向心力」という名前の、新しい力が増えるわけではありません。「向心」は、すでに働いている力(ここでは、張力の水平成分)を、説明する形容詞です。自由物体図には、重さと張力だけを描きます。張力の鉛直成分が、重さとつり合い、水平成分が、向心力になります。'),
        ex('Worked example 2.18', 'A mass m is tied to a string and made to move in a vertical circle of radius R with constant speed v. (a) Determine the tension at the lowest and highest points. (b) Calculate the minimum speed so that the string never goes slack.', ['(a) Lowest point: T₁ − mg = mv²/r ⇒ T₁ = mv²/r + mg. Highest point: mg + T₂ = mv²/r ⇒ T₂ = mv²/r − mg.', '(b) The string goes slack when T₂ becomes zero at the top, so we need v² > gr.'], '底では、張力が上向き、重さが下向きなので、T₁ − mg が向心力。頂点では、張力も重さも下向き(中心向き)なので、T₂ + mg が向心力。頂点で T₂ = 0 になる限界から、v² = gr が最小の条件です。'),
        key('There is no "centrifugal force" pushing a body away from the centre. A body in circular motion cannot be in equilibrium, so no outward force is required.', '物体を、中心から外に押す「遠心力」という力は、ありません。円運動をしている物体は、つり合いの状態ではないので、外向きの力は、必要ありません。'),
        ctx('Nature of science: simple deductions', 'Newton\'s second law implies that when a body accelerates, a net force ma must act on it, in the direction of the acceleration. Circular motion involves an acceleration toward the centre, so the (approximately) circular motion of the planets implies a force. Newton used this to deduce the gravitational force: the same force responsible for the falling of objects to the Earth\'s surface is responsible for the motion of planets around the Sun.',
          '科学の本質: 単純な推論。ニュートンの第2法則から、物体が加速しているときは、加速度と同じ向きに、ma の合力が働いている、ということになります。円運動には、中心向きの加速度があるので、惑星の(ほぼ)円運動は、力の存在を意味します。ニュートンは、これを使って、万有引力を導きました。物体が地表に落ちる原因の力と、惑星が太陽のまわりを回る原因の力は、同じなのです。'),
      ] },
    ],
    reflect: ['Do you understand why in circular motion a force directed towards the centre is necessary?', 'Can you solve problems with circular motion?'],
    reflectJa: ['円運動で、中心向きの力が必要な理由が分かる?', '円運動の問題を、解ける?'],
    check: ['identify centripetal forces', 'understand that a body in circular motion is not in equilibrium', 'solve problems with circular motion'],
    checkJa: ['向心力を見分けられる', '円運動をする物体は、つり合いの状態でないと分かる', '円運動の問題を解ける'],
  },
};

// ---------- 図(SVG) ----------
const W = '#fff';
const svg = (w, h, body, label) => `<svg class="ph-fig" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const arrow = (x1, y1, x2, y2, col = W, wd = 1.8) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${wd}"/><path d="M${x2} ${y2} L${(x2 - s * Math.cos(a - .4)).toFixed(1)} ${(y2 - s * Math.sin(a - .4)).toFixed(1)} L${(x2 - s * Math.cos(a + .4)).toFixed(1)} ${(y2 - s * Math.sin(a + .4)).toFixed(1)}Z" fill="${col}"/>`;
};
const txt = (x, y, s, o = '') => `<text x="${x}" y="${y}" fill="${W}" font-size="13" font-family="Georgia, serif" ${o}>${s}</text>`;
const rad = d => d * Math.PI / 180;

export const FIGS2 = {
  friction() {
    return svg(520, 270, `${arrow(60, 220, 480, 220)}${arrow(60, 220, 60, 20)}${txt(486, 224, 'F')}${txt(40, 18, 'f')}
      <path d="M60 220 L260 80 L260 130 L460 130" fill="none" stroke="#ff6b6b" stroke-width="2.6"/>
      <line x1="60" y1="80" x2="260" y2="80" stroke="${W}" stroke-dasharray="4 4"/><line x1="60" y1="130" x2="460" y2="130" stroke="${W}" stroke-dasharray="4 4"/>
      ${txt(14, 84, 'μₛR')}${txt(14, 134, 'μ_dR')}${txt(110, 244, 'no motion (f = F)')}${txt(300, 244, 'accelerated motion (f = μ_dR)')}`, 'Friction against pulling force');
  },
  triangle() {
    const cx = 150, cy = 130;
    const left = `${arrow(40, cy, 270, cy, '#888', 1)}${arrow(cx, 230, cx, 14, '#888', 1)}${txt(274, cy + 14, 'x')}${txt(cx + 6, 14, 'y')}
      ${arrow(cx, cy, cx + 78, cy - 16, '#7fd4ff')}${txt(cx + 80, cy - 20, 'F₁', 'fill="#7fd4ff"')}
      ${arrow(cx, cy, cx, cy + 80, '#ff6b6b')}${txt(cx + 6, cy + 92, 'F₂ = 22.0 N', 'fill="#ff6b6b"')}
      ${arrow(cx, cy, cx - 90 * Math.cos(rad(37)) , cy - 90 * Math.sin(rad(37)), '#ffd24a')}${txt(cx - 130, cy - 70, 'F₃ = 29.0 N', 'fill="#ffd24a"')}${txt(cx - 36, cy - 6, '37°')}`;
    const t = (x, y) => [330 + x, 70 + y];
    const A = t(30, 80), B = t(190, 20), C = t(190, 160);
    const right = `${arrow(A[0], A[1], B[0], B[1], '#7fd4ff')}${arrow(B[0], B[1], C[0], C[1], '#ff6b6b')}${arrow(C[0], C[1], A[0], A[1], '#ffd24a')}${txt(A[0] + 70, A[1] - 22, 'F₁', 'fill="#7fd4ff"')}${txt(B[0] + 6, 100, 'F₂', 'fill="#ff6b6b"')}${txt(A[0] + 70, C[1] - 10, 'F₃', 'fill="#ffd24a"')}`;
    return svg(560, 250, left + right, 'Three forces in equilibrium');
  },
  incline() {
    const th = rad(28), ox = 60, oy = 230, L = 380;
    const px = ox + L * Math.cos(th), py = oy - L * Math.sin(th);
    const cx = 270, cy = oy - (cx - ox) * Math.tan(th) - 22;
    const d = Math.cos(th), s = Math.sin(th);
    return svg(520, 270, `<path d="M${ox} ${oy} L${px} ${py} L${px} ${oy}Z" fill="none" stroke="${W}" stroke-width="1.6"/>
      <circle cx="${cx}" cy="${cy}" r="6" fill="#ff6b6b"/>
      ${arrow(cx, cy, cx - 60 * s, cy - 60 * d, '#7fd4ff')}${txt(cx - 84, cy - 66, 'R', 'fill="#7fd4ff"')}
      ${arrow(cx, cy, cx, cy + 84, '#ffd24a')}${txt(cx + 8, cy + 96, 'mg', 'fill="#ffd24a"')}
      ${arrow(cx, cy, cx + 62 * d, cy - 62 * s, '#4ade80')}${txt(cx + 66, cy - 66, 'f', 'fill="#4ade80"')}
      <line x1="${cx}" y1="${cy}" x2="${cx - 84 * s * s}" y2="${cy + 84 * s * d}" stroke="#ffd24a" stroke-dasharray="3 3"/>${txt(cx - 120, cy + 56, 'mg sinθ', 'font-size="11"')}${txt(cx + 40, cy + 74, 'mg cosθ', 'font-size="11"')}
      ${txt(ox + 52, oy - 6, 'θ')}`, 'Block on an inclined plane');
  },
  centripetal() {
    const cx = 170, cy = 130, r = 90;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${W}" stroke-dasharray="5 5"/><circle cx="${cx}" cy="${cy}" r="3" fill="${W}"/>`;
    [0, 90, 200, 300].forEach(a => { const x = cx + r * Math.cos(rad(a)), y = cy - r * Math.sin(rad(a)); const vx = -Math.sin(rad(a)), vy = -Math.cos(rad(a)); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff"/>${arrow(x, y, x + 52 * vx, y + 52 * vy, '#ff6b6b')}${arrow(x, y, x + (cx - x) * .42, y + (cy - y) * .42, '#4ade80')}`; });
    return svg(400, 260, s + txt(300, 60, 'v', 'fill="#ff6b6b"') + txt(300, 82, 'a_c', 'fill="#4ade80"'), 'Velocity and centripetal acceleration');
  },
};
