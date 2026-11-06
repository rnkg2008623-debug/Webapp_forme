// Physics HL A3「Work, energy and power」の解説。出典: 配布された教科書の第3章(3.1〜3.4)。「TEST YOUR UNDERSTANDING」は Practice で使うため、入れていない。
const p = (en, ja) => ({ t: 'p', en, ja });
const h = (text, ja) => ({ t: 'h', text, ja });
const eq = (...lines) => ({ t: 'eq', lines });
const key = (en, ja) => ({ t: 'key', en, ja });
const tip = (en, ja) => ({ t: 'tip', en, ja });
const ctx = (title, en, ja) => ({ t: 'ctx', title, en, ja });
const ex = (no, q, steps, ja) => ({ t: 'ex', no, q, steps, ja });
const chk = (no, q, a, ja) => ({ t: 'chk', no, q, a, ja });
const fig = (id, cap, ja) => ({ t: 'fig', id, cap, ja });

export const TOPICS3 = {
  'A3-1': {
    code: 'A3.1', title: 'Work', icon: 'work',
    lead: 'Work done by a force, by a varying force, and its link to kinetic, gravitational and elastic potential energy.',
    leadJa: '力がする「仕事」、変化する力の仕事、そして、運動エネルギー・重力による位置エネルギー・弾性エネルギーとのつながりを学びます。',
    goals: ['Calculate the work done by a force', 'Appreciate that work is a transfer of energy', 'Use the work–kinetic energy relation', 'Work with gravitational and elastic potential energy'],
    sections: [
      { id: 'intro', title: 'Introduction', blocks: [
        p('This chapter deals with the related concepts of work, energy and power, three fundamental quantities in physics. The work done by the net force is the change in the kinetic energy of the body. Kinetic energy is one of many forms of energy used to describe a mechanical system, along with gravitational and elastic potential energies. In the absence of resistive forces the total mechanical energy (kinetic and potential) stays the same, which leads to our first conservation law.',
          'この章では、関連する3つの量、「仕事」「エネルギー」「仕事率」を学びます。どれも、物理の基本の量です。合力がする仕事は、物体の運動エネルギーの変化に等しくなります。運動エネルギーは、力学の系を表す、いくつものエネルギー(重力による位置エネルギー、弾性エネルギーなど)の1つです。抵抗力がなければ、力学的エネルギーの合計(運動 + 位置)は変わらず、最初の保存則が得られます。'),
      ] },
      { id: 'force', title: 'Work done by a force', blocks: [
        p('Take a constant force (constant in size and direction) that moves a block along a straight line through a distance s, the force making an angle θ with the displacement. The work done is W = Fs cos θ. Since F cos θ is the component of the force along the displacement, the work is the force along the displacement times the distance travelled.',
          '大きさも向きも一定の力が、ブロックを、まっすぐ距離 s だけ動かすとします。力は、変位と角度 θ をなします。このとき、仕事は W = Fs cos θ です。F cos θ は、変位の向きの力の成分なので、「変位の向きの力」×「動いた距離」が仕事になります。'),
        eq('W = F s cos θ'),
        key('The work done by a force is the product of the force in the direction of the displacement times the distance travelled. Unit: the joule, 1 J = 1 N m.', '力がする仕事は、「変位の向きの力」×「動いた距離」。単位はジュール(1 J = 1 N m)。'),
        p('cos θ can be positive, negative or zero, so work can be positive (force along the motion), negative (force against the motion, θ = 180°) or zero (force perpendicular to the motion, θ = 90°).',
          'cos θ は、正・負・0 のどれにもなるので、仕事も、正(力が運動の向き)、負(力が運動と反対向き、θ = 180°)、0(力が運動に垂直、θ = 90°)のどれにもなります。'),
        ex('Worked example 3.1', 'A mass is pulled along a level road by a rope making an angle of 34° with the horizontal. The force in the rope is 24 N. Calculate the work done by this force in moving the mass 8.0 m.', ['W = Fs cos θ = 24 × 8.0 × cos 34° = 160 J.'], '公式に入れるだけです。力と、動いた向きの間の角度が、θ です。'),
        ex('Worked example 3.2', 'A car with its engine off moves on a horizontal road. A constant force of 620 N opposes the motion. The car stops after 84 m. Calculate the work done on the car by the opposing force.', ['The force is opposite to the displacement, θ = 180°: W = 620 × 84 × cos 180° = −52 kJ.'], '力が運動と反対向きなので θ = 180°、cos 180° = −1 で、仕事は負(−52 kJ)です。負の仕事は、物体からエネルギーを「うばう」ことを表します。'),
        ex('Worked example 3.3', 'You stand on roller skates facing a wall and push against it, moving away. Discuss whether the force exerted by the wall on you did any work.', ['No work was done by the contact force, because the point at which the force is applied has not moved. (So where did the energy you gained come from?)'], '壁が、あなたに及ぼす力の「作用点」は、動いていないので、その力は、仕事をしていません。エネルギーの出どころは、あなた自身の筋肉(の化学エネルギー)です。'),
      ] },
      { id: 'varying', title: 'Work done by a varying force', blocks: [
        p('If the force is not constant, divide the motion into very small distances Δs over which the force is almost constant. The work is FΔs, the area of a thin rectangle. Adding the rectangles gives the area under the curve. So the work done by a force is the area under the graph of force against distance.',
          '力が一定でないときは、動きを、力がほぼ一定とみなせる、ごく小さな距離 Δs に分けます。その間の仕事は FΔs で、細い長方形の面積です。長方形の面積を足し合わせると、曲線の下の面積になります。つまり、力がする仕事は、力と距離のグラフの下の面積です。'),
        key('Work done = area under the force–distance graph.', '仕事 = 力–距離グラフの下の面積。'),
        fig('workgraph', 'Work done by a varying force is the area under the F–s graph (a trapezoid here, with area (a + b)/2 × h).', '変化する力がする仕事は、F–s グラフの下の面積です(ここでは台形で、面積は (a + b)/2 × h)。'),
        ex('Worked example 3.4', 'A force varies with distance according to a straight-line graph from 2.0 N at d = 0 to 10 N at d = 4.0 m. What is the work done in moving 4.0 m?', ['The area under the graph is a trapezoid: W = ((2.0 + 10)/2) × 4.0 = 24 J.'], '台形の面積は、「平行な2辺の平均 × 間の距離」。(2.0 + 10) ÷ 2 × 4.0 = 24 J。'),
      ] },
      { id: 'circular', title: 'Work done in circular motion', blocks: [
        p('In circular motion the centripetal force points toward the centre. Break the path into short straight segments: the force is always at right angles to each segment, so the work done along each is zero (cos 90° = 0). Hence the work done by the centripetal force in circular motion is zero.',
          '円運動では、向心力は、中心を向きます。経路を、短い直線に分けると、力は、どの区間でも、その区間に垂直です。ですから、各区間の仕事は 0(cos 90° = 0)で、円運動で、向心力がする仕事は 0 です。'),
        chk('Check yourself 1', 'The work done by the centripetal force in a full revolution is zero because (a) the displacement is zero (b) the force is at a right angle to the velocity (c) the centripetal force does not move its point of application (d) forces do work only when they move the body along a straight line.', 'B', '答え: b。力が、速度(動く向き)に、いつも垂直だからです。aも「変位は0」ですが、1周のあいだの仕事は、力と動きの角度で、決まります。向心力は、動く向きと垂直なので、途中のどの区間でも、仕事は 0 です。'),
      ] },
      { id: 'wke', title: 'The work–kinetic energy relation', blocks: [
        p('A net force F acts on a particle of mass m, giving acceleration a = F/m. With initial speed u and speed v after a distance s, kinematics gives v² = u² + 2as = u² + 2(F/m)s. Rearranging, Fs = ½mv² − ½mu². Fs is the work done by the net force. The quantity ½mv² is the energy due to motion, the kinetic energy E_K.',
          '質量 m の粒子に、合力 F が働くと、加速度は a = F/m です。最初の速さを u、距離 s 進んだあとの速さを v とすると、運動学から v² = u² + 2as = u² + 2(F/m)s。整理すると Fs = ½mv² − ½mu²。Fs は、合力がした仕事です。½mv² は、運動によるエネルギーで、運動エネルギー E_K と呼びます。'),
        eq('E_K = ½mv²', 'W_net = ΔE_K'),
        key('Work–kinetic energy relation: the net work done on a body equals the change in its kinetic energy. Work done is energy transferred.', '仕事と運動エネルギーの関係: 物体にされた「正味の仕事」は、運動エネルギーの変化に等しい。仕事は、移されたエネルギーと考えられる。'),
        ex('Worked example 3.5', 'A 2.5 kg block slides on a rough horizontal surface with initial speed 8.6 m s⁻¹ and stops after 16 m. Determine the magnitude of the frictional force.', ['Only friction does work, opposite to the motion: W_net = f × 16 × (−1).', 'ΔE_K = 0 − ½ × 2.5 × 8.6² = −92.45 J.', '−16f = −92.45 ⇒ f = 5.8 N.'], '摩擦力の向きは、運動と反対(180°)なので、仕事は負。運動エネルギーの変化は、−92.45 J(止まるので、最後は 0)。この2つを等しいとおきます。'),
        ex('Worked example 3.6', 'You throw a 0.25 kg ball so that it leaves your hand with speed 12 m s⁻¹. Calculate the work done by your hand on the ball.', ['We do not know the force or the distance, but W_net = ΔE_K = ½ × 0.25 × 12² = 18 J.'], '力も距離も分からなくても、運動エネルギーの変化が分かれば、仕事が分かります。これが、この関係の便利なところです。'),
        ex('Worked example 3.7', 'In the previous example your hand moved 0.90 m while throwing. Estimate the average net force on the ball.', ['Fs = 18 J with s = 0.90 m gives F = 20 N.'], '仕事 = 力 × 距離 から、平均の力は 18 ÷ 0.90 = 20 N。'),
        ex('Worked example 3.8', 'A mass m hangs from two strings at equal angles to the vertical. The strings are shortened very slowly so the mass is raised a distance h. Determine the work done by the tension in each string.', ['The net work is zero (the net force is zero, or ΔE_K = 0). The work done by gravity is −mgh, so the tensions together do +mgh, and each does mgh/2.'], 'ゆっくり上げるので、運動エネルギーは変わらず、合力の仕事は 0。重力の仕事 −mgh を打ち消すために、2本の糸の張力が、合わせて +mgh の仕事をします。同じ大きさなので、1本あたり mgh/2。'),
      ] },
      { id: 'gravity', title: 'Work done by gravity and gravitational potential energy', blocks: [
        p('Weight is mg directed vertically down. If a body moves horizontally, the angle between force and motion is 90°, so the work done by gravity is mgs cos 90° = 0. If it falls a vertical distance h, gravity is parallel to the displacement and does +mgh. If it moves up by h, gravity is opposite to the displacement and does −mgh.',
          '重さは、鉛直下向きの mg です。水平に動くなら、力と動きの角度は 90° なので、重力の仕事は mgs cos 90° = 0。鉛直に h だけ落ちるなら、重力は変位と同じ向きなので +mgh。h だけ上がるなら、重力は変位と反対向きなので −mgh です。'),
        tip('When a body is displaced so that its final position is at the same vertical height as its original position, the work done by the weight is zero.', '試験のコツ: 最後の位置の高さが、最初の位置と同じなら、重さがした仕事は 0。'),
        p('If we use a rope to lower or raise the body at constant speed by a height h, the work done by the weight is the same, but the rope force F is equal and opposite to the weight, so F does −mgh when lowering and +mgh when raising. Always keep a clear picture of the force whose work you are calculating.',
          'ロープで、一定の速さで、高さ h だけ下げたり、上げたりするときも、重さの仕事は同じです。ロープの力 F は、重さと大きさが等しく向きが反対なので、下げるときは −mgh、上げるときは +mgh の仕事をします。「どの力の仕事を計算しているか」を、いつもはっきりさせましょう。'),
        p('For the Earth–mass system, the gravitational potential energy E_P is the work done by the moving force in placing a body a height h above the surface: E_P = mgh. Any horizontal surface can be chosen as zero. This formula is approximate and only valid if h is very small compared with the Earth\'s radius.',
          '地球と物体の系では、「重力による位置エネルギー E_P」は、物体を、地表から高さ h まで、持ち上げるために、外から加えた力がする仕事です。E_P = mgh。ゼロの高さは、どの水平面にとってもかまいません。この式は近似で、h が地球の半径よりずっと小さいときだけ使えます。'),
        eq('E_P = mgh'),
        tip('Gravitational potential energy is the energy of a system due to its position and represents the work done by an external agent in bringing the system to that position.', '試験のコツ: 重力による位置エネルギーは、位置によってもつ、系のエネルギーで、外から、その位置まで持ってくるのにした仕事を表す。'),
      ] },
      { id: 'spring', title: 'Tension in a spring and elastic potential energy', blocks: [
        p('A spring obeys Hooke\'s law F = kx, so the graph of force against extension is a straight line through the origin, and the work done is the area under it: a triangle of base x and height kx. The work to extend a spring from its natural length by x is W = ½kx². This work is stored as elastic potential energy E_H = ½kx² (H for Hooke), for extension or compression x.',
          'ばねは、フックの法則 F = kx にしたがうので、力と伸びのグラフは、原点を通る直線で、仕事は、その下の面積、つまり、底辺 x、高さ kx の三角形です。自然長から x だけ伸ばすのにする仕事は W = ½kx²。この仕事は、「弾性エネルギー」E_H = ½kx²(H はフックの H)として、ばねに蓄えられます(伸びでも、縮みでも、x は変形の大きさ)。'),
        fig('springwork', 'The work done in stretching a spring is the area of the triangle under the F–x line: ½kx².', 'ばねを伸ばす仕事は、F–x の直線の下の三角形の面積 ½kx²。'),
        eq('E_H = ½kx²', 'extending from x₁ to x₂:   W = ½k(x₂² − x₁²)'),
        tip('In the data booklet the formula uses Δx in place of x. The work done extending a spring from x₁ to x₂ (x₂ > x₁) is ½k(x₂² − x₁²).', '試験のコツ: データブックレットでは、x の代わりに Δx を使っています。x₁ から x₂(x₂ > x₁)へ伸ばす仕事は ½k(x₂² − x₁²)。'),
        chk('Check yourself 2', 'A toy gun has a spring compressed by an amount e. It shoots a ball with speed v. What speed would the same ball have if the spring were compressed by 2e?', 'The elastic energy is four times as large and so is the kinetic energy of the ball. Hence the speed is twice as large.', '答え: 2倍(2v)。弾性エネルギーは x² に比例するので、2e なら 4倍。運動エネルギー ½mv² も4倍なので、速さは 2倍です。'),
        ex('Worked example 3.9', 'A mass of 8.4 kg rests on a vertical spring whose base is attached to the floor. The spring compresses by 5.2 cm. (a) Calculate the spring constant. (b) Determine the energy stored in the spring.', ['(a) Equilibrium: mg = kx ⇒ k = mg/x = 8.4 × 9.8 / (5.2 × 10⁻²) = 1583 ≈ 1600 N m⁻¹.', '(b) E_H = ½kx² = ½ × 1583 × (5.2 × 10⁻²)² = 2.1 J.'], '(a) 止まっているので、重さ mg と、ばねの力 kx がつり合います。(b) その k で、½kx²。単位の cm を m に直すのを、忘れずに(5.2 cm = 5.2 × 10⁻² m)。'),
      ] },
    ],
    reflect: ['Do you understand what is meant by the work done by a force?', 'Do you know how to apply the work–kinetic energy principle?', 'Do you know what information a graph of force versus distance gives?'],
    reflectJa: ['「力がする仕事」の意味が分かる?', '仕事と運動エネルギーの関係を使える?', '力–距離グラフから、何が分かるか分かる?'],
    check: ['calculate the work done by a force', 'appreciate that work done is equivalent to a transfer of energy', 'describe the connection between the net work done and the change in kinetic energy', 'work with gravitational energy and elastic potential energy'],
    checkJa: ['力がする仕事を計算できる', '仕事がエネルギーの移動と同じだと分かる', '正味の仕事と運動エネルギーの変化の関係を説明できる', '重力の位置エネルギーと弾性エネルギーを扱える'],
  },

  'A3-2': {
    code: 'A3.2', title: 'Conservation of energy', icon: 'conserve',
    lead: 'In an isolated system the total mechanical energy is conserved; with external forces, ΔE_T = W_ext.',
    leadJa: '孤立した系では、力学的エネルギーの合計は保存されます。外から力がはたらくときは、ΔE_T = W_ext になります。',
    goals: ['Apply the law of conservation of mechanical energy', 'Deal with situations where an external force acts on the system'],
    sections: [
      { id: 'cons', title: 'Conservation of total mechanical energy', blocks: [
        p('Potential energy is a property of a system, not of an individual particle, and is a scalar. Why is mgh useful enough to deserve a name? Consider a body falling freely: at height h₁ its speed is v₁ and at h₂ it is v₂. Kinematics gives v₂² = v₁² + 2g(h₁ − h₂), which rearranges to ½v₂² + gh₂ = ½v₁² + gh₁. Multiplying by m: ½mv₂² + mgh₂ = ½mv₁² + mgh₁. The sum of the kinetic energy and the gravitational potential energy stays the same as the mass falls.',
          '位置エネルギーは、個々の粒子ではなく、「系」がもつ性質で、スカラー量です。なぜ mgh に、名前をつけるほど、役に立つのでしょうか。自由落下する物体を考えます。高さ h₁ で速さ v₁、高さ h₂ で速さ v₂ とします。運動学から v₂² = v₁² + 2g(h₁ − h₂)。これを整理すると ½v₂² + gh₂ = ½v₁² + gh₁。m をかけると ½mv₂² + mgh₂ = ½mv₁² + mgh₁。落ちている間、運動エネルギーと位置エネルギーの「和」は、変わりません。'),
        eq('E_T = E_K + E_P = ½mv² + mgh', 'with springs:   E_T = E_K + E_P + E_H = ½mv² + mgh + ½kx²'),
        p('E_T is conserved when friction and resistance forces are absent and no other forces from outside the system act. A car on a level road stops after the engine is turned off: E_T is not conserved because resistance forces do work. If the driver accelerates, an external force (ground on tyres) does work and increases E_T.',
          'E_T が保存されるのは、摩擦力や抵抗力がなく、系の外からの、他の力が働かないときです。平らな道の上の車は、エンジンを切ると止まります。抵抗力が仕事をするので、E_T は保存されません。アクセルを踏むと、外からの力(地面がタイヤにする力)が仕事をして、E_T が増えます。'),
        key('If no work is done on the system from outside, the system is isolated and its total mechanical energy is conserved. (Weight and spring tension are not external forces: their effects are already in the potential energies.)', '系の外から仕事がされなければ、その系は「孤立」していて、力学的エネルギーの合計は「保存」される。(重さとばねの力は、外からの力ではありません。その効果は、位置エネルギーに含まれているからです。)'),
        chk('Check yourself 3', 'A ball starting from rest descends the same vertical height along four paths (a vertical drop, a straight slope, a curved slide, a stepped slope), with the path length increasing from left to right. In which case is the final speed greatest?', 'It is the same since the vertical height is the same.', '答え: 同じ。摩擦がなければ、最後の速さは、高さの差だけで決まり(½mv² = mgh)、経路の形や長さには、よりません。'),
        ex('Worked example 3.10', 'Determine the minimum speed of the mass at the initial point such that it makes it over a barrier of height h = 0.80 m.', ['It must reach the highest point; at the very least with zero speed there. E_T at the top = mgh; at the start E_T = ½mv².', '½mv² = mgh ⇒ v = √(2gh) = √(2 × 9.81 × 0.80) = 3.96 ≈ 4.0 m s⁻¹. The mass plays no role.'], '頂点でちょうど速さ 0 になる、ぎりぎりの場合を考えます。最初の運動エネルギーが、頂点の位置エネルギーに変わるので、½mv² = mgh。質量は、両辺で消えます。'),
        ex('Worked example 3.11', 'A ball rolls off a 1.0 m high table with speed 4.0 m s⁻¹. Calculate its speed as it strikes the floor.', ['E_initial = ½mu² + mgh, E_final = ½mv². Equating: v² = u² + 2gh = 16 + 19.62 = 35.62 ⇒ v ≈ 6.0 m s⁻¹.', 'It is the same if the ball is projected at an angle (only height matters).', 'Heights can be measured from any convenient horizontal surface: measuring from 3 m below the Earth\'s surface, or from the table, gives the same result for v² = u² + 2g × 1.'], '放物運動でも、エネルギー保存で解くと、簡単です。投げる向きは、関係ありません(高さだけが、効きます)。高さの基準は、どこにとってもよく、どの基準でも、同じ答えになることを、教科書は、2通りで確かめています。'),
        ex('Worked example 3.12', 'Two identical balls are launched from a table with the same speed u, one vertically up and the other vertically down. The table height above the floor is h. Which ball hits the floor with the greater speed?', ['At launch both have the same kinetic and potential energy; on the floor only kinetic. So the speeds are identical: ½mv² = ½mu² + mgh ⇒ v = √(u² + 2gh).'], '上向きでも、下向きでも、最初の運動エネルギーと位置エネルギーが同じなので、床に着く速さも同じです。'),
        ex('Worked example 3.13', 'A pendulum of length 1.0 m is released from rest with the string at 10° to the vertical. Find the speed of the mass when it passes its lowest position.', ['Measure heights from the lowest point. Δh = 1.0 − 1.0 cos 10° = 0.015 m.', '½mv² = mgΔh ⇒ v = √(2gΔh) = 0.54 m s⁻¹. The mass drops out.'], '最下点を高さ 0 にとり、おもりが下がる高さ Δh = 1.0 − 1.0 cos 10° を求めます。Δh は、糸の長さと角度から、図で考えます。'),
        ex('Worked example 3.14', 'A 4.2 kg body with initial speed 5.6 m s⁻¹ begins to move up an incline and is momentarily brought to rest after colliding with a spring (k = 2200 N m⁻¹), stopping a vertical distance h = 0.85 m above its initial position. Determine the compression of the spring. (No friction.)', ['Isolated system: E_T is conserved. Initially only kinetic: ½ × 4.2 × 5.6² = 65.856 J.', 'At the stop: mgh + ½kx² = 4.2 × 9.81 × 0.85 + ½ × 2200 x² = 35.02 + 1100x².', '1100x² = 30.84 ⇒ x² = 0.02804 ⇒ x = 0.17 m.'], '最初は運動エネルギーだけ、止まったときは、重力の位置エネルギーと、ばねの弾性エネルギーの和です。2つを等しいとおいて、x を求めます。'),
      ] },
      { id: 'external', title: 'What happens when external forces do work?', blocks: [
        p('If there are interactions with the surroundings, E_T can change: work W_ext done by the surroundings and/or a transfer of thermal energy (heat) Q. So ΔE_T = W_ext + Q. In this chapter Q = 0, so ΔE_T = W_ext.',
          '周囲との相互作用があると、E_T は変わります。周囲がする仕事 W_ext や、熱エネルギー(熱)Q の出入りです。つまり ΔE_T = W_ext + Q。この章では Q = 0 なので、ΔE_T = W_ext です。'),
        eq('ΔE_T = W_ext + Q', 'Q = 0:   ΔE_T = W_ext'),
        fig('system', 'Interactions with the surroundings (work done on the system and heat supplied) can change the total energy of a system.', '周囲との相互作用(系にされる仕事と、供給される熱)が、系のエネルギーの合計を変えることがあります。'),
        tip('Do not confuse the work–kinetic energy relation W_net = ΔE_K with ΔE_T = W_ext. The first relates the net work on a system to the change in its kinetic energy; the other relates the work done by external forces to the change of the total energy.', '試験のコツ: W_net = ΔE_K と ΔE_T = W_ext を、混同しないこと。前者は「正味の仕事」と「運動エネルギーの変化」、後者は「外力がした仕事」と「全エネルギーの変化」を結びつけます。'),
        ex('Worked example 3.15', 'A 2.0 kg body (initially at rest) slides down a curved path of total length 22 m, starting from a vertical height of 5.0 m above the bottom. At the bottom its speed is 6.0 m s⁻¹. (a) Show there is a resisting force. (b) Assuming it is constant and opposite to the velocity, find its magnitude.', ['(a) Top: E = 0 + 2.0 × 9.8 × 5.0 = 98 J. Bottom: ½ × 2.0 × 6.0² + 0 = 36 J. The energy decreased, so an external resisting force is present.', '(b) ΔE_T = W_ext ⇒ W_ext = −62 J. fs × (−1) = −62 ⇒ f = 62/22 = 2.8 N.'], '(a) 最初と最後の、全エネルギーを比べて、減っていれば、摩擦などが仕事をした証拠です。(b) 減ったぶん(62 J)が、摩擦力の仕事 −fs に等しい。距離 s は、経路の長さ(22 m)です。高さの差(5.0 m)ではありません。'),
        ex('Worked example 3.16', 'A 5.00 kg mass moves up an incline with initial velocity 2.0 m s⁻¹, acted on by an external force of 55 N in the direction of the velocity, opposed by friction. After 18 m along the incline it has risen 3.0 m vertically and its velocity is 15 m s⁻¹. Determine the frictional force.', ['ΔE_T = (½ × 5.0 × 15² + 5.0 × 9.81 × 3.0) − ½ × 5.0 × 2.0² = 699.7 J.', 'W_ext = (55 − f) × 18 = 699.7 ⇒ 55 − f = 38.87 ⇒ f ≈ 16 N.'], '全エネルギーの増加(699.7 J)が、外力がした仕事 (55 − f) × 18 に等しい。「進んだ距離 18 m」と「上がった高さ 3.0 m」を、使い分けましょう。'),
      ] },
    ],
    reflect: ['Do you know when mechanical energy is conserved?', 'Can you solve problems with energy conservation?'],
    reflectJa: ['力学的エネルギーが、保存される条件が分かる?', 'エネルギー保存の問題を、解ける?'],
    check: ['apply the law of conservation of energy', 'deal with situations where an external force acts on the system'],
    checkJa: ['エネルギー保存則を使える', '外力が働く場合を扱える'],
  },

  'A3-3': {
    code: 'A3.3', title: 'Power and efficiency', icon: 'power',
    lead: 'How fast work is done (power), and how much of the energy supplied is useful (efficiency).',
    leadJa: '仕事を、どれだけ速くするか(仕事率)と、与えたエネルギーのうち、どれだけが役に立つか(効率)を学びます。',
    goals: ['Define power, P = ΔW/Δt = Fv', 'Define efficiency', 'Solve problems with power and efficiency'],
    sections: [
      { id: 'power', title: 'Power', blocks: [
        p('When a machine performs work, it matters how much work is done in a given time. A cyclist does a lot of work over a lifetime, but a car engine can do the same in much less time. Power is the rate at which work is done (or energy is transferred): P = ΔW/Δt. Its unit is the watt, 1 W = 1 J s⁻¹.',
          '機械が仕事をするとき、「どれだけの仕事を」だけでなく、「どれだけの時間で」するかも大切です。サイクリストが、一生かけてする仕事を、車のエンジンは、ずっと短い時間でできます。仕事率(パワー)は、仕事をする(エネルギーを移す)速さです。P = ΔW/Δt。単位はワット、1 W = 1 J s⁻¹。'),
        eq('P = {ΔW|Δt}', '1 W = 1 J s⁻¹'),
        p('For a constant force F moving a body a small distance Δx in time Δt: P = FΔx/Δt = Fv, where v is the instantaneous speed. As the speed increases, the power needed increases. For an aircraft at constant speed, the force pushing it forward F equals the total air resistance (no acceleration), so the air resistance can be found from the engine power and the speed.',
          '一定の力 F が、物体を、時間 Δt のあいだに、ごく小さな距離 Δx 動かすとき、P = FΔx/Δt = Fv です(v は瞬間の速さ)。速さが増えると、必要な仕事率も増えます。一定の速さで飛ぶ飛行機では、前に押す力 F が、全体の空気抵抗と等しい(加速度が 0)ので、エンジンの仕事率と速さから、空気抵抗が求められます。'),
        eq('P = F v'),
        tip('You may be asked for the average power. It can be proven that it is F̄ × (v + u)/2, where F̄ is the average force and u and v the initial and final speeds.', '試験のコツ: 平均の仕事率を聞かれることがあります。平均の仕事率は F̄ × (v + u)/2(F̄ は平均の力、u と v は最初と最後の速さ)です。'),
        ex('Worked example 3.17', 'Estimate the minimum power required to lift a mass of 50.0 kg up a vertical distance of 12 m in 5.0 s.', ['W = mgh = 50.0 × 9.81 × 12 = 5.89 × 10³ J.', 'P = W/Δt = 5.89 × 10³ / 5.0 ≈ 1200 W.', 'This is the minimum: in practice the mass must also be accelerated, and friction must be overcome.'], '持ち上げる仕事 mgh を、時間で割ります。実際には、質量を加速する仕事や、摩擦に打ち勝つ仕事も必要なので、これは「最小」の仕事率です。'),
        chk('Check yourself 4', 'A boy of mass 60 kg jumps straight up from a crouching position. His centre of mass rises by 0.50 m before he loses contact with the ground, then a further 0.80 m. What is the average power developed? (He pushes with a constant force; g = 10 m s⁻².)', 'The boy raises his centre of mass by a total of 1.3 m, so the work done by the muscles is mgh = 60 × 10 × 1.3 = 780 J. His launch speed is v = √(2gh) = 4.0 m s⁻¹. a = v²/(2 × 0.5) = 16 m s⁻², so the contact time is t = 4.0/16 = 0.25 s. Average power = 780/0.25 = 3120 ≈ 3 kW. (Equivalently F = mg + ma = 1560 N and P = F(u + v)/2 = 1560 × 2.0 = 3120 W.)', '答え: 約 3 kW。①筋肉がした仕事は、重心が上がった合計 1.3 m ぶんの mgh = 780 J。②離れるときの速さは √(2 × 10 × 0.80) = 4.0 m s⁻¹。③地面に触れている間の加速度は 16 m s⁻²、時間は 0.25 s。④仕事率 = 780 ÷ 0.25 = 3120 W。もう1つの方法は、力 F = 1560 N と、平均の速さ 2.0 m s⁻¹ から、P = Fv̄ = 3120 W。'),
      ] },
      { id: 'efficiency', title: 'Efficiency', blocks: [
        p('When a machine such as an electric motor raises a load, electrical energy is supplied (the input). The motor uses some of it for the useful work of raising the load, but some overcomes friction and becomes thermal energy. So the ratio below is less than one. It is the efficiency η of the machine.',
          '電動機のような機械で、荷物を持ち上げるとき、電気エネルギーが供給されます(入力)。電動機は、その一部を、荷物を持ち上げる、役に立つ仕事に使いますが、一部は、摩擦に打ち勝つために使われ、熱エネルギーになります。ですから、下の比は、1 より小さくなります。これが、機械の効率 η です。'),
        eq('η = {useful energy out|actual energy in} = {useful power out|actual power in}'),
        p('Example: a 15 kg body is pulled up a rough 45° incline at constant speed; friction is 42 N. Then R = mg cos θ = 104.1 N and F = mg sin θ + f = 104.1 + 42 = 146.1 N. Over 25 m along the plane, W = 146.1 × 25 = 3653 J. The body rises 25 sin 45° = 17.7 m, so the potential energy increases by mgh = 2605 J. Efficiency = 2605/3653 = 0.71.',
          '例: 質量 15 kg の物体を、荒い 45° の斜面に沿って、一定の速さで引き上げます。摩擦力は 42 N。すると R = mg cos θ = 104.1 N、F = mg sin θ + f = 104.1 + 42 = 146.1 N。斜面に沿って 25 m 引くと、W = 146.1 × 25 = 3653 J。物体は 25 sin 45° = 17.7 m 上がるので、位置エネルギーは mgh = 2605 J 増えます。効率 = 2605 ÷ 3653 = 0.71 です。'),
        fig('incline3', 'Forces on a body pulled up an incline: pulling force F, friction f, normal force R and weight mg.', '斜面を引き上げられる物体に働く力。引く力 F、摩擦力 f、垂直抗力 R、重さ mg。'),
        ex('Worked example 3.18', 'A 0.50 kg toy train moves at constant velocity 0.30 m s⁻¹ on a level track. The motor power is 2.0 W and the total force opposing the motion is 5.0 N. (a) Determine the efficiency of the motor. (b) Assuming the efficiency and opposing force stay the same, find the speed of the train climbing a 10.0° incline.', ['(a) Constant speed, so the motor force is 5.0 N. Power used in moving the train = Fv = 5.0 × 0.30 = 1.5 W. Efficiency = 1.5/2.0 = 0.75 (75%).', '(b) F = mg sin θ + 5.0 = 0.50 × 9.81 × sin 10° + 5.0 = 5.852 N. Efficiency = 5.852 v / 2.0 = 0.75 ⇒ v = 2.0 × 0.75 / 5.852 = 0.26 m s⁻¹.'], '(a) 一定の速さなので、モーターの力は 5.0 N。有用な仕事率 Fv = 1.5 W を、入力 2.0 W で割ります。(b) 斜面では、必要な力が増え(mg sin θ が加わる)、効率が同じなら、速さが下がります。'),
      ] },
    ],
    reflect: ['Do you understand power and efficiency, and can you use them to solve problems?'],
    reflectJa: ['仕事率と効率が分かり、問題に使える?'],
    check: ['understand the concept of power and efficiency and use them to solve problems'],
    checkJa: ['仕事率と効率の考え方を理解し、問題を解くのに使える'],
  },

  'A3-4': {
    code: 'A3.4', title: 'Energy transfers', icon: 'transfer',
    lead: 'Following energy as it changes form, and Sankey diagrams to show it.',
    leadJa: 'エネルギーが、形を変えながら移っていく様子を追い、それを、サンキー図で表す方法を学びます。',
    goals: ['Describe energy transfers', 'State the law of conservation of energy', 'Use Sankey diagrams'],
    sections: [
      { id: 'transfers', title: 'Energy transfers', blocks: [
        p('In a system with no external forces doing work, the total mechanical energy is conserved. During a motion the individual stores (kinetic, gravitational potential, elastic potential) change but the total stays the same. A ball rolling down an incline transfers gravitational potential energy (gpe) to kinetic energy; eventually it stops because its kinetic energy is "lost" to the surroundings as thermal energy (and some sound). A ball rising up an incline does the reverse. A released compressed spring transfers elastic potential energy to kinetic energy.',
          '外から仕事をする力がない系では、力学的エネルギーの合計は保存されます。運動の間に、個々のエネルギー(運動、重力の位置エネルギー、弾性エネルギー)は変わりますが、合計は同じです。斜面を転がり下りるボールは、重力の位置エネルギー(gpe)を、運動エネルギーに移します。やがて止まるのは、運動エネルギーが、熱エネルギー(と少しの音)として、周囲に「失われる」からです。斜面を上がるボールは、その逆です。縮んだばねを放すと、弾性エネルギーが、運動エネルギーに移ります。'),
        p('Later we meet other forms (thermal, electrical, magnetic, nuclear). Including them, the total energy is always conserved. This generalised law has been tested in every system at every scale, from the subatomic to the cosmological, and never found violated.',
          'このあと、熱、電気、磁気、核などの、他の形のエネルギーも出てきます。それらも含めると、全エネルギーは、いつも保存されます。この、一般化された法則は、素粒子から宇宙まで、あらゆる規模の、あらゆる系で確かめられ、破れたことが、ありません。'),
        key('Law of conservation of energy: energy cannot be created or destroyed; it can only be transferred from one form to another.', 'エネルギー保存則: エネルギーは、つくり出すことも、消すこともできない。ある形から、別の形に、移るだけ。'),
        p('So a block slowing down because of friction can be described in two equivalent ways. Description 1: the total energy is just kinetic, and it is not conserved because an external force does work on the system. Description 2: friction reduced the kinetic energy, but this produced thermal energy; including thermal energy in the total, the total energy is conserved.',
          '摩擦で、遅くなって止まるブロックは、2通りの、同じ内容の言い方で説明できます。説明1: 全エネルギーは、運動エネルギーだけで、外力(摩擦力)が系に仕事をするので、保存されない。説明2: 摩擦が運動エネルギーを減らしたが、そのぶん熱エネルギーが生まれた。熱エネルギーも全エネルギーに含めれば、全エネルギーは保存される。'),
        chk('Check yourself 5', 'A block slides down an inclined plane at constant speed. What energy transfers are taking place? (a) gpe to kinetic (b) kinetic to gpe (c) kinetic to thermal (d) gpe to thermal', 'D (kinetic energy is constant).', '答え: d。一定の速さなので、運動エネルギーは変わりません。下がったぶんの位置エネルギーが、摩擦で、熱エネルギーに変わっています。'),
      ] },
      { id: 'sankey', title: 'Sankey diagrams', blocks: [
        p('A convenient way to show energy transfers is a Sankey diagram. Each transfer is an arrow whose width is proportional to the amount (or percentage) of energy transferred. The textbook example is a wind turbine: 100 units of energy come in from the kinetic energy of the wind. Down arrows are losses: 40 to aerodynamic limits/turbulence, 25 to friction in turning the turbine, 5 to losses to the grid. The useful output is 30 units, so the efficiency is 30%.',
          'エネルギーの移り変わりを表すのに便利なのが、サンキー図です。移動を1本の矢印で表し、矢印の幅を、移ったエネルギーの量(または割合)に比例させます。教科書の例は、風力発電のタービンです。風の運動エネルギーから、100 のエネルギーが入ります。下向きの矢印が損失で、空気力学的な限界・乱流で 40、タービンの回転の摩擦で 25、送電の損失で 5。有用な出力は 30 なので、効率は 30% です。'),
        fig('sankey', 'Sankey diagram for a wind turbine: 100 units in, losses of 40, 25 and 5, 30 units of useful output (efficiency 30%).', '風力発電機のサンキー図。入力 100、損失 40・25・5、有用な出力 30(効率 30%)。'),
        eq('efficiency = {useful output|input} = {30|100} = 30%'),
        chk('Check yourself 6', 'What is the efficiency of the transfers shown in the Sankey diagram in Figure 3.34?', '40%', '答え: 40%。図の「出力の矢印の幅」÷「入力の矢印の幅」を、方眼の数で読みます。損失の矢印を全部引くと、出力が残ります。'),
        p('Links: the law of conservation of energy appears throughout the course. In Unit B it lets us calculate the average temperature of the Earth and is applied to thermodynamics; electrons colliding with ions in a conductor transfer energy, so the conductor warms. In Unit C it implies that ripples in a lake get smaller as they spread. In Unit D it says something about planetary orbits. In Unit E, conservation of energy together with Einstein\'s mass–energy equivalence implies that vast amounts of energy may be released in nuclear reactions.',
          'つながり: エネルギー保存則は、このコースのあちこちに出てきます。ユニットBでは、地球の平均気温の計算や熱力学に使い、導体の中では、電子がイオンと衝突してエネルギーを渡すので、導体が温まります。ユニットCでは、湖の波紋が、広がるにつれて小さくなる理由になります。ユニットDでは、惑星の軌道について、教えてくれます。ユニットEでは、アインシュタインの質量とエネルギーの等価性と合わせて、核反応で、大量のエネルギーが出ることを意味します。'),
      ] },
    ],
    reflect: ['Can you describe the energy transfers taking place in various contexts?'],
    reflectJa: ['いろいろな場面で、エネルギーの移り変わりを、説明できる?'],
    check: ['discuss energy transfers', 'use Sankey diagrams'],
    checkJa: ['エネルギーの移り変わりを説明できる', 'サンキー図を使える'],
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

export const FIGS3 = {
  workgraph() {
    return svg(480, 260, `${arrow(60, 220, 450, 220)}${arrow(60, 220, 60, 20)}${txt(456, 224, 'd/m')}${txt(30, 18, 'F/N')}
      <path d="M60 220 L60 170 L320 70 L320 220Z" fill="#7fd4ff" opacity=".22"/><line x1="60" y1="170" x2="320" y2="70" stroke="#ff6b6b" stroke-width="2.6"/><line x1="320" y1="70" x2="320" y2="220" stroke="${W}" stroke-dasharray="4 4"/>
      ${txt(40, 174, 'a')}${txt(326, 76, 'b')}${txt(180, 205, 'h')}${txt(140, 150, 'area = (a + b)/2 × h = work', 'font-size="14"')}`, 'Area under a force-distance graph');
  },
  springwork() {
    return svg(460, 260, `${arrow(60, 220, 430, 220)}${arrow(60, 220, 60, 20)}${txt(436, 224, 'extension')}${txt(30, 18, 'F')}
      <path d="M60 220 L300 70 L300 220Z" fill="#7fd4ff" opacity=".28"/><line x1="60" y1="220" x2="400" y2="30" stroke="#ff6b6b" stroke-width="2.4"/><line x1="60" y1="70" x2="300" y2="70" stroke="${W}" stroke-dasharray="4 4"/><line x1="300" y1="70" x2="300" y2="220" stroke="#4aa8ff" stroke-width="1.6"/>
      ${txt(30, 74, 'kx')}${txt(296, 238, 'x')}${txt(160, 190, 'work = ½ k x²', 'font-size="14"')}`, 'Work done stretching a spring');
  },
  system() {
    return svg(480, 250, `<circle cx="240" cy="125" r="72" fill="#4ade80" opacity=".25" stroke="#4ade80" stroke-width="2"/>${txt(214, 130, 'system', 'font-size="15"')}
      ${arrow(60, 125, 164, 125, '#7fd4ff')}${txt(40, 112, 'work done', 'fill="#7fd4ff"')}${arrow(240, 20, 240, 50, '#ff6b6b')}${txt(256, 30, 'heat supplied', 'fill="#ff6b6b"')}${txt(300, 225, 'surroundings')}`, 'System and surroundings');
  },
  incline3() {
    const th = rad(32), ox = 60, oy = 230, L = 380, px = ox + L * Math.cos(th), py = oy - L * Math.sin(th);
    const cx = 250, cy = oy - (cx - ox) * Math.tan(th) - 24, d = Math.cos(th), s = Math.sin(th);
    return svg(520, 270, `<path d="M${ox} ${oy} L${px} ${py} L${px} ${oy}Z" fill="none" stroke="${W}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="7" fill="#ffd24a"/>
      ${arrow(cx, cy, cx + 90 * d, cy - 90 * s, '#4ade80')}${txt(cx + 96 * d, cy - 94 * s, 'F', 'fill="#4ade80"')}
      ${arrow(cx, cy, cx - 46 * d, cy + 46 * s, '#ff6b6b')}${txt(cx - 62 * d - 6, cy + 56 * s + 12, 'f', 'fill="#ff6b6b"')}
      ${arrow(cx, cy, cx - 58 * s, cy - 58 * d, '#7fd4ff')}${txt(cx - 78 * s, cy - 62 * d, 'R', 'fill="#7fd4ff"')}
      ${arrow(cx, cy, cx, cy + 86, '#ffd24a')}${txt(cx + 8, cy + 98, 'mg', 'fill="#ffd24a"')}${txt(ox + 52, oy - 6, 'θ')}`, 'Forces on a body pulled up an incline');
  },
  sankey() {
    // 入力 100 を、幅の太い帯で左から右へ。途中で、損失が下へ枝分かれし、残った 30 が右へ出ていく(幅は、量に比例)
    const k = 1.5, top = 30;
    const x0 = 30, x1 = 170, x2 = 330, x3 = 470;
    let s = `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${100 * k}" fill="#7fd4ff" opacity=".45" stroke="#7fd4ff"/>${txt(x0 + 10, top + 20, '100', 'font-size="16"')}${txt(x0 + 10, top + 40, 'input: kinetic', 'font-size="12"')}${txt(x0 + 10, top + 56, 'energy of the wind', 'font-size="12"')}`;
    s += `<rect x="${x1}" y="${top}" width="${x3 - x1}" height="${30 * k}" fill="#4ade80" opacity=".4" stroke="#4ade80"/><path d="M${x3} ${top - 8} L${x3 + 44} ${top + 15 * k} L${x3} ${top + 30 * k + 8}Z" fill="#4ade80" opacity=".7"/>${txt(x1 + 20, top + 15 * k + 5, '30  useful output (electricity)', 'font-size="13"')}`;
    const L = [[40, 'aerodynamic limits / turbulence', '#ff6b6b', x1 + 14], [25, 'friction in turning the turbine', '#ffb454', x1 + 14 + 40 * 0 + 0]];
    const y = top + 30 * k, xs = [x1 + 14, x1 + 80, x1 + 146], endY = top + 100 * k + 14;
    [[40, 'aerodynamic limits / turbulence', '#ff6b6b'], [25, 'friction in turning the turbine', '#ffb454'], [5, 'losses to the grid', '#c084fc']].forEach(([v, lab, col], i) => {
      const x = xs[i], w = Math.max(6, v * k * 0.55), h = endY - y;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" opacity=".45" stroke="${col}"/><path d="M${x - 7} ${endY} L${x + w / 2} ${endY + 24} L${x + w + 7} ${endY}Z" fill="${col}" opacity=".8"/>`;
      s += `<rect x="40" y="${endY + 48 + i * 26 - 11}" width="12" height="12" fill="${col}" opacity=".8"/>${txt(60, endY + 48 + i * 26, `${v}  ${lab}`, 'font-size="13"')}`;
    });
    return svg(660, 400, s, 'Sankey diagram for a wind turbine');
  },
};
