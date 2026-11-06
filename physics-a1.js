// Physics HL A1「Kinematics」の解説。出典: 配布された教科書の第1章(1.1〜1.4)。「TEST YOUR UNDERSTANDING」は Practice で使うため、入れていない。
// ブロックの種類・書き方は physics-a5.js と同じ(p / h / eq / key / tip / tok / ctx / ex / chk / fig)。式の {a|b} は分数。
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

export const TOPICS1 = {
  'A1-1': {
    code: 'A1.1', title: 'Displacement, distance, speed and velocity', icon: 'disp',
    lead: 'The basic vocabulary of motion: position, displacement, distance, speed and velocity.',
    leadJa: '運動を表す基本の言葉です。位置、変位、道のり(距離)、速さ、速度の違いをはっきりさせます。',
    goals: ['Learn the difference between displacement and distance', 'Learn the difference between speed and velocity', 'Use s = sᵢ + vt for motion at constant velocity', 'Read position–time and velocity–time graphs for uniform motion'],
    sections: [
      { id: 'intro', title: 'Introduction to kinematics', blocks: [
        p('This chapter introduces the basic concepts used to describe motion. First we consider motion in a straight line with constant velocity, then motion with constant acceleration. Knowing uniformly accelerated motion lets us analyse more complicated motions such as projectiles. When acceleration is not constant we use graphical analysis. Guiding questions: which equations describe the motion of an object, and how does graphical analysis help us to describe motion?',
          'この章では、運動を表す基本の考え方を学びます。まず、まっすぐな線の上を一定の速度で動く運動、次に、一定の加速度で動く運動を考えます。「等加速度運動」が分かると、放物運動のような、もっと複雑な運動も調べられます。加速度が一定でないときは、グラフで調べます。この章の問いは、「物体の運動を表すのは、どんな式か」と「グラフで調べると、運動を表すのにどう役立つか」です。'),
      ] },
      { id: 'position', title: 'Position and displacement', blocks: [
        p('In straight-line (one-dimensional) motion the particle is constrained to a straight line, so its position is given by one coordinate on that line. Position is a vector, but on a line the vector can only point one way or the opposite, so a positive or negative number is enough. We write x for a horizontal line, y for a vertical line and s for any line. Which side of zero is positive is an arbitrary choice.',
          '1次元(直線)の運動では、粒子はまっすぐな線の上だけを動きます。そのため、位置は、その線の上の座標1つで表せます。位置はベクトルですが、線の上では、向きは「こちら」か「その逆」の2通りだけなので、正か負の数で足ります。水平な線では x、鉛直な線では y、一般の線では s を使います。どちら側を正にするかは、自由に決めてかまいません。'),
        p('The change in position is the displacement: Δs = s_final − s_initial. Displacement is a vector.',
          '位置の変化を「変位」と呼びます。Δs = s(最後) − s(最初)。変位はベクトルです(符号が向きを表します)。'),
        eq('Δs = s_final − s_initial'),
        p('Table 1.1 of the textbook gives four motions. Check that you can find the displacement and the direction of motion yourself:',
          '教科書の表1.1の4つの例です。変位と運動の向きを、自分で計算できるか確かめましょう。'),
        eq('12 m → 28 m:  Δs = +16 m  (towards increasing s)', '−6 m → −14 m:  Δs = −8 m  (towards decreasing s)', '10 m → −5 m:  Δs = −15 m  (towards decreasing s)', '−20 m → −15 m:  Δs = +5 m  (towards increasing s)'),
        p('The sign of Δs tells the direction: positive means towards increasing s, negative towards decreasing s. The size of the number is how far the position changed.',
          '符号が向きを表します。正なら s が増える向き、負なら s が減る向きです。数の大きさは、位置がどれだけ変わったかを表します。'),
      ] },
      { id: 'distance', title: 'Distance versus displacement', blocks: [
        p('Motion 1: a particle goes from −4 m to 16 m. Displacement Δs = 16 − (−4) = 20 m. The distance travelled is the actual length of the path: 20 m. Motion 2: a particle goes from 12 m to 20 m, then back to 4 m. Displacement Δs = 4 − 12 = −8 m. But the path is 8 m out and 16 m back, so the distance is 24 m.',
          '動き1: −4 m から 16 m へ。変位 Δs = 16 − (−4) = 20 m。道のり(距離)は、実際に通った道の長さで 20 m。動き2: 12 m から 20 m まで行って、4 m まで戻る。変位 Δs = 4 − 12 = −8 m。ところが、行きが 8 m、帰りが 16 m なので、道のりは 24 m です。'),
        fig('dist', 'Two motions on a number line. Top: 20 m displacement, 20 m distance. Bottom: displacement −8 m, distance 24 m.', '数直線の上の2つの動き。上: 変位 20 m、道のり 20 m。下: 変位 −8 m、道のり 24 m。'),
        key('Distance is a scalar quantity; displacement is a vector quantity. They differ whenever the direction of motion changes.', '道のり(距離)はスカラー量、変位はベクトル量。向きが変わると、2つの値は違ってきます。'),
        p('Why does this matter? Displacement only cares where you started and where you ended. Distance counts every metre you actually walked, so it is never negative and never smaller than the size of the displacement.',
          'なぜ大事か。変位は、「出発点」と「到着点」だけで決まります。道のりは、実際に歩いたすべての長さを数えるので、負にはならず、変位の大きさより小さくもなりません。'),
      ] },
      { id: 'velocity', title: 'Velocity and average speed', blocks: [
        p('In uniform motion the position changes by equal amounts in equal intervals of time. The velocity v is the displacement divided by the time taken. The average speed is the total distance divided by the time taken.',
          '「等速(一様)な運動」では、等しい時間に、位置が同じだけ変わります。速度 v は、変位を、かかった時間で割ったものです。平均の速さは、道のりの合計を、かかった時間で割ったものです。'),
        eq('v = {Δs|Δt}', 'average speed = {total distance|time taken}'),
        p('Using the two motions above. Motion 1 took 4.0 s: velocity = 20 / 4.0 = 5.0 m s⁻¹, and the average speed is the same, 20 m / 4.0 s = 5.0 m s⁻¹. Motion 2 took 6.0 s: velocity = −8.0 / 6.0 = −1.3 m s⁻¹, but the average speed = 24 / 6.0 = 4.0 m s⁻¹. So when direction changes, average speed and velocity are not the same.',
          '上の2つの動きで計算します。動き1(4.0 s): 速度 = 20 ÷ 4.0 = 5.0 m s⁻¹。道のりも 20 m なので、平均の速さも 5.0 m s⁻¹ で、同じです。動き2(6.0 s): 速度 = −8.0 ÷ 6.0 = −1.3 m s⁻¹ ですが、平均の速さは 24 ÷ 6.0 = 4.0 m s⁻¹。このように、向きが変わると、平均の速さと速度は、同じになりません。'),
        key('Velocity is a vector (it has a sign/direction). Speed is a scalar (always ≥ 0).', '速度はベクトル(符号=向きをもつ)。速さはスカラー(つねに0以上)。'),
      ] },
      { id: 'constantv', title: 'Motion with constant velocity: s = sᵢ + vt', blocks: [
        p('For uniform motion v = (s − s_i)/(t − 0), which rearranges to s = s_i + vt. Here s is the position at time t, s_i is the initial position and v the constant velocity. (The textbook writes s_i for s_initial.)',
          '等速の運動では、v = (s − s_i) ÷ (t − 0)。これを変形すると、s = s_i + vt になります。s は時刻 t の位置、s_i は最初の位置、v は一定の速度です(教科書では s_initial を s_i と書きます)。'),
        eq('s = sᵢ + vt'),
        tip('This formula can only be used when the velocity is constant.', '試験のコツ: この式は、速度が一定のときだけ使えます。'),
        p('Graphs. For uniform motion the position–time graph is a straight line whose gradient is the velocity, and the velocity–time graph is a horizontal straight line. Positive velocity means s is increasing; negative velocity means s is decreasing. The area under the velocity–time graph from 0 to t is vt, which is s − s_i. So the area under a velocity–time graph is the displacement.',
          'グラフです。等速の運動では、位置と時間のグラフは直線で、その傾き(勾配)が速度です。速度と時間のグラフは、水平な直線です。速度が正なら s は増え、負なら s は減ります。速度と時間のグラフの、0 から t までの面積は vt で、これは s − s_i に等しくなります。つまり、速度と時間のグラフの面積が、変位です。'),
        fig('uniform', 'Uniform motion: the s–t graph is a straight line (gradient = velocity); the v–t graph is horizontal and the shaded area vt is the displacement.', '等速の運動。s–t グラフは直線で(傾き = 速度)、v–t グラフは水平。色をつけた面積 vt が変位です。'),
        chk('Check yourself 1', 'An object moves from A to B at speed 15 m s⁻¹ and returns from B to A at speed 30 m s⁻¹. What is the average speed for the round trip?', 'Let d be the distance between A and B. d = 15 t₁ = 30 t₂, so t₁ = 2 t₂. Average speed = 2d / (t₁ + t₂) = 2 × 30 t₂ / 3 t₂ = 20 m s⁻¹.', '答え: 20 m s⁻¹。平均の速さは、「速さの平均」(22.5)ではありません。道のりの合計 ÷ 時間の合計です。行きの時間は、帰りの2倍(速さが半分だから)なので、2d ÷ (t₁ + t₂) = 60t₂ ÷ 3t₂ = 20 m s⁻¹。'),
        ex('Worked example 1.1', 'Cyclists A and B start at the same time. A starts at 0 km with velocity +20 km h⁻¹; B starts 150 km away at −30 km h⁻¹. (a) When and where do they meet? (b) What is each cyclist\'s displacement when they meet? (c) On another occasion B starts 1 h after A. When do they meet?', ['(a) s_A = 0 + 20t, s_B = 150 − 30t. They meet when s_A = s_B: 20t = 150 − 30t ⇒ 50t = 150 ⇒ t = 3.0 h. Position: 20 × 3.0 = 60 km.', '(b) Displacement of A: 60 − 0 = 60 km. Displacement of B: 60 − 150 = −90 km.', '(c) s_A = 20t as before; B has moved for only (t − 1) h, so s_B = 150 − 30(t − 1). 20t = 150 − 30(t − 1) ⇒ 50t = 180 ⇒ t = 3.6 h.'], '「出会う」=「同じ位置にいる」と読み替えて、位置の式を等しいとおくのが、基本の解き方です。(b) 変位は「最後 − 最初」なので、Bは負(−90 km、つまり逆向き)。(c) Bが1時間遅れて出発するので、Bの時間は (t − 1) にします。'),
      ] },
    ],
    reflect: ['Do you understand the difference between distance and displacement?', 'Do you understand the difference between speed and velocity?'],
    reflectJa: ['道のり(距離)と変位の違いが分かる?', '速さと速度の違いが分かる?'],
    check: ['define and distinguish between position, displacement, average and instantaneous velocity and average and instantaneous acceleration'],
    checkJa: ['位置・変位・平均と瞬間の速度・平均と瞬間の加速度を、定義して区別できる'],
  },

  'A1-2': {
    code: 'A1.2', title: 'Uniformly accelerated motion: the equations of kinematics', icon: 'accel',
    lead: 'Defining velocity and acceleration precisely, and the four equations for motion with constant acceleration.',
    leadJa: '速度と加速度を正確に定義し、等加速度運動の4つの式(運動学の式)を導いて、使いこなします。',
    goals: ['Define average and instantaneous velocity and acceleration', 'Use v = u + at, Δs = (u+v)t/2, Δs = ut + ½at² and v² = u² + 2aΔs', 'Read gradients and areas of motion graphs', 'Solve free-fall problems with g'],
    sections: [
      { id: 'inst', title: 'Velocity when the motion is not uniform', blocks: [
        p('When velocity is not constant, define the average velocity as v̄ = Δs/Δt, with Δs the total displacement and Δt the total time. To get the velocity at one instant, make the time interval Δt very, very small: the instantaneous velocity is the limit of Δs/Δt as Δt → 0. It is the rate of change of position, i.e. the gradient of the position–time graph.',
          '速度が一定でないときは、平均の速度を v̄ = Δs/Δt(Δs は全体の変位、Δt は全体の時間)と定義します。ある「瞬間」の速度を知るには、Δt をどんどん小さくします。Δt → 0 のときの Δs/Δt の極限が「瞬間の速度」です。これは、位置の変化の割合、つまり位置と時間のグラフの傾き(勾配)です。'),
        eq('v̄ = {Δs|Δt}', 'v = lim(Δt→0) {Δs|Δt}'),
        p('On a curved s–t graph, pick a point and draw the tangent. The gradient of the tangent is the velocity at that point. In the textbook, the tangent at t = 3.0 s has gradient (25 − 1.0)/(5.0 − 1.0) = 6.0 m s⁻¹. At t = 0 the tangent is horizontal, so the velocity is zero. From now on we drop the word "instantaneous". The magnitude of the velocity is the (instantaneous) speed.',
          '曲がった s–t グラフでは、ある点で接線を引きます。その接線の傾きが、その点での速度です。教科書では、t = 3.0 s の接線の傾きは (25 − 1.0) ÷ (5.0 − 1.0) = 6.0 m s⁻¹。t = 0 では接線が水平なので、速度は 0 です。以降は「瞬間の」を省いて、単に「速度」と言います。速度の大きさが、(瞬間の)速さです。'),
        fig('parab', 'On a curved position–time graph the gradient of the tangent gives the velocity at that point.', '曲がった位置–時間グラフでは、接線の傾きが、その点の速度になります。'),
      ] },
      { id: 'accel', title: 'Acceleration', blocks: [
        p('When the velocity changes we have acceleration. The average acceleration is ā = Δv/Δt. For a body whose velocity goes from 2.0 m s⁻¹ to 8.0 m s⁻¹ in 3.0 s: ā = (8.0 − 2.0)/3.0 = 2.0 m s⁻². Instantaneous acceleration (just "acceleration") is the limit as Δt → 0: the rate of change of velocity, the gradient of the velocity–time graph. Acceleration is a vector.',
          '速度が変わるとき、「加速度」があると言います。平均の加速度は ā = Δv/Δt です。2.0 m s⁻¹ から 8.0 m s⁻¹ まで 3.0 s で変わる物体なら、ā = (8.0 − 2.0) ÷ 3.0 = 2.0 m s⁻²。瞬間の加速度(単に「加速度」)は、Δt → 0 の極限で、速度の変化の割合、つまり速度と時間のグラフの傾きです。加速度はベクトルです。'),
        eq('ā = {Δv|Δt}', 'a = lim(Δt→0) {Δv|Δt}'),
        p('Uniformly accelerated motion means that the acceleration is constant: the v–t graph is a non-horizontal straight line, and in equal intervals of time the velocity changes by the same amount. When the acceleration is positive, the velocity is increasing; negative acceleration means v is decreasing. For constant acceleration, instantaneous and average acceleration are the same.',
          '「等加速度運動」は、加速度が一定の運動です。v–t グラフは、水平でない直線になり、等しい時間に、速度が同じだけ変わります。加速度が正なら速度は増え、負なら速度は減ります。加速度が一定なら、瞬間の加速度と平均の加速度は、同じです。'),
        key('Positive acceleration: v is increasing. Negative acceleration: v is decreasing. (Be careful: if v is negative, a positive acceleration makes the object slow down.)', '加速度が正 → 速度は増える。負 → 速度は減る。(注意: 速度が負のとき、加速度が正だと、物体は「減速」します。符号は向きの話です。)'),
      ] },
      { id: 'equations', title: 'The equations of kinematics', blocks: [
        p('Let the initial velocity (at t = 0) be u and the velocity at time t be v. Then a = Δv/Δt = (v − u)/(t − 0), which gives the first equation:',
          '最初(t = 0)の速度を u、時刻 t の速度を v とします。a = Δv/Δt = (v − u) ÷ (t − 0) から、最初の式が得られます。'),
        eq('v = u + at'),
        ex('Worked example 1.2', 'A particle has initial velocity 12 m s⁻¹ and a constant acceleration of −3.0 m s⁻². Determine the time at which it stops instantaneously.', ['It stops when v = 0. v = u + at ⇒ 0 = 12 + (−3.0) × t ⇒ 3.0t = 12 ⇒ t = 4.0 s.'], '「止まる」=「v = 0」に読み替えるのがコツです。加速度が負なので、速度が 12 から減り続け、4.0 s で 0 になります。'),
        p('Displacement from the v–t graph. Approximate the straight line by a staircase. The area under the staircase is the change in position, since the velocity is constant on each step. Making the steps smaller and smaller, the staircase area and the area under the line become indistinguishable.',
          'v–t グラフから、変位を求めます。直線を階段で近似します。各段では速度が一定なので、階段の面積は位置の変化です。段をどんどん細かくすると、階段の面積と直線の下の面積は、見分けがつかなくなります。'),
        key('The area under a velocity–time graph is the change in position, i.e. the displacement.', 'v–t グラフの下の面積が、位置の変化(変位)。'),
        fig('vtarea', 'A straight-line v–t graph can be approximated by a staircase; the area (a trapezoid) is the displacement.', '直線の v–t グラフは、階段で近似できます。面積(台形)が変位です。'),
        p('The shape is a trapezoid, so the area is the average of the two parallel sides times the width. Substituting v = u + at gives the next equations.',
          '形は台形なので、面積は「平行な2辺の平均 × 幅」です。v = u + at を代入すると、続きの式が得られます。'),
        eq('Δs = ({u + v|2}) t', 'Δs = ({u + u + at|2}) t = ut + ½at²'),
        p('Eliminate t. From v = u + at, t = (v − u)/a. Substituting into Δs = ut + ½at² gives Δs = (v² − u²)/(2a), i.e. v² = u² + 2aΔs (usually s_i = 0, so v² = u² + 2as). This equation is useful when no information about time is available.',
          '時間 t を消します。v = u + at から t = (v − u)/a。これを Δs = ut + ½at² に代入すると、Δs = (v² − u²) ÷ 2a、つまり v² = u² + 2aΔs になります(通常は s_i = 0 なので v² = u² + 2as)。時間についての情報がないときに便利な式です。'),
        key('For straight-line motion with constant acceleration:  v = u + at;  Δs = ((u + v)/2) t;  Δs = ut + ½at²;  v² = u² + 2aΔs.  These equations can be used only when the acceleration is constant. If the initial position is zero, Δs may be written s.', '直線上の等加速度運動の4つの式: v = u + at / Δs = ((u + v)/2) t / Δs = ut + ½at² / v² = u² + 2aΔs。使えるのは、加速度が一定のときだけ。最初の位置が 0 なら、Δs は s と書いてよい。'),
        eq('v = u + at', 'Δs = ({u + v|2}) t', 'Δs = ut + ½at²', 'v² = u² + 2aΔs'),
        p('How to choose the equation: list the five quantities u, v, a, t, Δs. Write down the three you know and the one you want. Pick the equation that contains exactly those four and not the fifth. For example, if t is not given and not wanted, use v² = u² + 2aΔs.',
          '式の選び方です。u, v, a, t, Δs の5つの量を並べて、「分かっている3つ」と「求めたい1つ」を書き出します。その4つだけを含み、残り1つを含まない式を選びます。たとえば、t が与えられず、求めもしないなら、v² = u² + 2aΔs です。'),
        fig('parab2', 'Position–time graphs for uniform acceleration are parabolas: concave up for positive acceleration (left), concave down for negative acceleration (right).', '等加速度運動の位置–時間グラフは放物線。加速度が正なら下に凸(左)、負なら上に凸(右)。'),
        tip('Table 1.2: gradient and area. Position–time graph: gradient = velocity. Velocity–time graph: gradient = acceleration, area = change in position (displacement). Acceleration–time graph: area = change in velocity.', '試験のコツ(表1.2): s–t グラフは、傾き = 速度。v–t グラフは、傾き = 加速度、面積 = 位置の変化(変位)。a–t グラフは、面積 = 速度の変化。'),
        eq('graph        gradient        area', 'position–time    velocity        —', 'velocity–time    acceleration    displacement', 'acceleration–time  —           change in velocity'),
        chk('Check yourself 2', 'The graph of position against time (Figure 1.11 in the textbook) goes up to a maximum near 0.4 s, down through zero at 1.0 s to a minimum near 1.5 s, then up through zero at 2.0 s. Indicate the intervals of time for which the acceleration is (a) positive, (b) negative, (c) zero.', 'Positive from 1.0 s on, because the curve is concave up; negative from 0 s to 1.0 s (concave down); zero at 1.0 s.', '答え: 曲線が「下に凸(水を入れられる形)」の区間は加速度が正、「上に凸」の区間は負、凸の向きが変わる点(変曲点)で 0。この図では、1.0 s 以降が正、0〜1.0 s が負、1.0 s ちょうどで 0 です。'),
      ] },
      { id: 'examples', title: 'Worked examples with the four equations', blocks: [
        ex('Worked example 1.3', 'A particle has initial velocity 2.00 m s⁻¹ and acceleration 4.00 m s⁻². Find its displacement after 10.0 s.', ['Δs = ut + ½at² = 2.00 × 10.0 + ½ × 4.00 × 10.0² = 220 m'], 'u, a, t が分かっていて、Δs がほしいので、Δs = ut + ½at² を使います。'),
        ex('Worked example 1.4', 'A car has initial velocity 5.0 m s⁻¹. After a displacement of 20 m its velocity is 7.0 m s⁻¹. Find the acceleration.', ['No time is given, so use v² = u² + 2aΔs: 7.0² = 5.0² + 2a × 20 ⇒ 24 = 40a ⇒ a = 0.60 m s⁻².'], '時間が出てこないので、v² = u² + 2aΔs を選びます。'),
        ex('Worked example 1.5', 'A body has initial velocity 4.0 m s⁻¹. After 6.0 s the velocity is 12 m s⁻¹. Determine the displacement in the 6.0 s.', ['Use Δs = ((v + u)/2) t = ((12 + 4.0)/2) × 6.0 = 48 m.', 'A slower method: v = u + at ⇒ 12 = 4.0 + 6.0a ⇒ a = 1.333 m s⁻², then Δs = ut + ½at² = 4.0 × 6.0 + ½ × 1.333 × 36 = 48 m.'], 'u, v, t の3つが分かっているので、加速度を求めずに Δs = ((v + u)/2) t を使うのが近道です。遠回りの方法でも、同じ 48 m になります。'),
        ex('Worked example 1.6', 'Ball X starts from rest with constant acceleration 2.0 m s⁻². 2.0 s later, ball Y starts from the same position with constant velocity 9.0 m s⁻¹. Find where the balls meet and describe what happens.', ['Let them meet t s after X starts. s_X = ½at² = ½ × 2.0 × t² = t².', 's_Y = 9(t − 2) (Y has moved for only t − 2 s).', 'Equal positions: t² = 9(t − 2) ⇒ t² − 9t + 18 = 0 ⇒ t = 3.0 s and 6.0 s, at positions 9.0 m and 36 m.', 'At 3.0 s Y catches X and passes it; at 6.0 s X catches Y and passes it (X keeps speeding up).'], '2次方程式を解くと、解が2つ(3.0 s と 6.0 s)出るのがポイントです。意味は、「最初は後からスタートしたYが追いつく」→「Xが加速し続けるので、もう一度追いつき返す」です。位置–時間グラフを描くと、2回交わる様子がよく分かります。'),
        ex('Worked example 1.7', 'A particle starts at the origin with velocity 10 m s⁻¹ for 5 s. The velocity is then abruptly reversed to −5 m s⁻¹ for 10 s. Find (a) the displacement, (b) the total distance, (c) the average speed, (d) the average velocity.', ['Use the v–t graph. (a) First part: 10 × 5.0 = 50 m. Second part: −5.0 × 10 = −50 m. Displacement = 50 − 50 = 0 m.', '(b) 50 m out and 50 m back: total distance 100 m.', '(c) Average speed = 100/15 = 6.7 m s⁻¹.', '(d) Average velocity = 0 (displacement is zero).'], 'v–t グラフの、面積(符号つき)が変位です。(a) 前半の +50 m と、後半の −50 m で、合計 0。(b) 道のりは、符号を無視して足して 100 m。(c) 平均の速さは、道のり ÷ 時間。(d) 平均の速度は、変位 ÷ 時間 = 0。「変位 0」でも、「道のり」は 0 ではない点に注意。'),
        ex('Worked example 1.8', 'An object with initial velocity 20 m s⁻¹ and initial position −75 m has constant acceleration −2 m s⁻². Sketch the position–time graph for the first 20 s.', ['s = sᵢ + ut + ½at² = −75 + 20t − t².', 'At 5 s the object reaches the origin and overshoots; it returns to the origin at 15 s. The furthest it gets from the origin is 25 m (at 10 s, where v = 0). Velocity at 5 s is 10 m s⁻¹ and at 15 s it is −10 m s⁻¹.'], '位置の式 s = −75 + 20t − t² を、そのままグラフにします(上に凸の放物線)。頂点は、速度が 0 になる t = 10 s で、そこが原点から最も遠い位置 25 m です。0 になる t = 5 s と 15 s で、原点を通ります。'),
      ] },
      { id: 'freefall', title: 'A special acceleration: free fall', blocks: [
        p('If we neglect air resistance and other friction, an object thrown into the air has the acceleration of free fall, caused by the attraction between the Earth and the body. Its magnitude is g; near the Earth\'s surface g = 9.8 m s⁻² (sometimes approximated to 10 m s⁻²). Its direction is always vertically downwards.',
          '空気抵抗などの摩擦力を無視すると、空中に投げた物体は「自由落下の加速度」で動きます。これは、地球と物体の引き合いによる加速度です。大きさを g と書き、地表付近で g = 9.8 m s⁻²(10 m s⁻² で近似することもあります)です。向きは、いつも鉛直下向きです。'),
        key('Free fall: a = g = 9.8 m s⁻² downwards, whether the object is going up, at the top, or coming down.', '自由落下: 上がっている途中も、頂点も、落ちる途中も、加速度は、つねに下向きに g = 9.8 m s⁻²。'),
        ex('Worked example 1.9', 'An object is thrown vertically upwards with initial velocity 20 m s⁻¹ from the edge of a cliff 25 m above the sea. Determine (a) the maximum height, (b) the time to reach it, (c) the time to hit the sea, (d) the speed when it hits the sea. (g ≈ 10 m s⁻²)', ['Use y for position, up positive, zero at the starting point. a = −g.', '(a) v² = u² − 2gy; at the top v = 0: 0 = 20² − 2 × 10 × y ⇒ y = 20 m.', '(b) v = u − gt: 0 = 20 − 10t ⇒ t = 2.0 s.', '(c) The sea is at y = −25 m: −25 = 20t − 5t² ⇒ t² − 4t − 5 = 0 ⇒ t = −1.0 s or 5.0 s. Choose the positive root: t = 5.0 s. (Check: 2.0 s up, then falling 45 m from the top: 45 = 5t² ⇒ t = 3.0 s; total 2.0 + 3.0 = 5.0 s.)', '(d) v = u − gt = 20 − 10 × 5.0 = −30 m s⁻¹. The speed is 30 m s⁻¹.'], '最初に「上を正」と「原点 = 投げた場所」を決めるのが大切です。そうすると、海面は y = −25 m、加速度は −g です。(a) 頂点では v = 0 を使う。(b) 同じく v = 0 から時間。(c) 2次方程式の、負の解(−1.0 s)は、「過去」の意味で、答えになりません。(d) 速度は −30 m s⁻¹(下向き)ですが、「速さ」は大きさなので 30 m s⁻¹。'),
        chk('Check yourself 3', 'A ball is thrown vertically upwards with a speed of 20 m s⁻¹ and another vertically downwards with the same speed from the same height. What interval separates the landing times of the two balls? (g = 10 m s⁻²)', 'It takes 2 s to get to the maximum height and 2 s to return to the starting point, so the interval is 4 s.', '答え: 4 s。上に投げたボールは、2 s で頂点に着き、さらに 2 s で、投げた高さに戻ります。このとき速さは 20 m s⁻¹(下向き)で、下に投げたボールの、最初の状態と同じです。ですから、着地時刻の差は、往復の 4 s です。'),
      ] },
    ],
    reflect: ['Are you confident using the equations of kinematics?', 'Can you tell when the equations of kinematics cannot be used?'],
    reflectJa: ['運動学の式を、自信をもって使える?', '運動学の式が使えない場合(加速度が一定でない)を、判断できる?'],
    check: ['solve problems using the equations of kinematics'],
    checkJa: ['運動学の式を使って、問題を解ける'],
  },

  'A1-3': {
    code: 'A1.3', title: 'Graphs of motion', icon: 'linegraph',
    lead: 'When acceleration is not constant the kinematics equations fail, but gradients and areas of graphs still work.',
    leadJa: '加速度が一定でないときは、運動学の式は使えません。それでも、グラフの「傾き」と「面積」なら使えます。',
    goals: ['Analyse motion with graphs when acceleration is not constant', 'Sketch the velocity graph from a position graph', 'Sketch the acceleration graph from a velocity graph'],
    sections: [
      { id: 'why', title: 'Why graphs?', blocks: [
        p('If the acceleration is constant, the equations of Section 1.2 hold and can be used to analyse a motion problem. If the acceleration is not constant, those equations do not apply and cannot be used. But we can still analyse the motion with graphs. The main tools are the gradients and areas summarised in Table 1.2.',
          '加速度が一定なら、1.2 の式が成り立ち、問題を解くのに使えます。加速度が一定でなければ、それらの式は成り立たず、使えません。それでも、グラフなら、運動を調べられます。主な道具は、表1.2にまとめた「傾き」と「面積」です。'),
        eq('position–time graph:      gradient = velocity', 'velocity–time graph:      gradient = acceleration,  area = displacement', 'acceleration–time graph:  area = change in velocity'),
      ] },
      { id: 'sketch', title: 'From a position graph to velocity and acceleration graphs', blocks: [
        p('Take the position–time graph of Figure 1.19. We want the shape of the velocity–time graph. Velocity is the gradient of the position graph. At t = 0 the gradient is positive. As time goes on it is still positive but gets smaller, and at t = 0.25 s it is zero. It then becomes negative, getting more and more negative, with its most negative value at t = 0.5 s. It stays negative past 0.5 s, but the curve gets less steep, and the gradient is zero again at 0.75 s. From then it is positive and increases until 1.0 s. We only need the shape, not numbers on the vertical axis.',
          '図1.19の、位置と時間のグラフを使います。速度と時間のグラフの「形」を知りたいとします。速度は、位置のグラフの傾きです。t = 0 では傾きは正です。時間がたつと、傾きは正のまま小さくなり、t = 0.25 s で 0 になります。その後、傾きは負になり、どんどん負の向きに大きくなって、t = 0.5 s で、いちばん負になります。0.5 s を過ぎても負ですが、曲線がゆるやかになり、0.75 s で、また傾きが 0 になります。そこから傾きは正になり、1.0 s まで増えます。ここで必要なのは「形」で、縦軸の数値は要りません。'),
        fig('threegraphs', 'Position, velocity and acceleration graphs of the same motion (shapes only). Each graph is the gradient of the one above it.', '同じ運動の、位置・速度・加速度のグラフ(形だけ)。上のグラフの「傾き」が、次のグラフになります。'),
        p('In exactly the same way, the shape of the acceleration–time graph comes from the gradient of the velocity graph (Figure 1.21). So the recipe is always: look at the gradient of the graph you have. Where it is zero, the new graph crosses zero. Where the graph is steepest, the new graph has its largest size.',
          '同じやり方で、加速度と時間のグラフの形は、速度のグラフの傾きから分かります(図1.21)。つまり、手順はいつも同じで、「今あるグラフの傾き」を見ます。傾きが 0 の所は、新しいグラフが 0 を通ります。いちばん急な所は、新しいグラフの値が、いちばん大きくなります。'),
        key('Gradient of position–time = velocity. Gradient of velocity–time = acceleration. To go the other way (velocity → position, acceleration → velocity) use the area under the graph.', '位置–時間の傾き = 速度、速度–時間の傾き = 加速度。逆向き(速度 → 位置、加速度 → 速度)には、グラフの下の「面積」を使います。'),
        chk('Check yourself 4', 'In Figure 1.22 the velocity–time graph rises to a maximum near 0.5 s, falls through zero at 1.0 s, reaches a minimum near 1.5 s and rises through zero at 2.0 s. (a) State the time(s) at which the acceleration is zero. (b) When is the acceleration negative? (c) At what time is the acceleration most negative? (d) At 2.3 s, do you expect the displacement to be positive or negative, and why?', '(a) Zero at about 0.4 s and 1.6 s. (b) Negative from 0.4 s to 1.6 s. (c) Most negative at 1.0 s. (d) The displacement from 0 to 1.0 s is about the same in magnitude as that from 1.0 s to 2.0 s, so the displacement at 2.3 s will be positive.', '答え: (a) 速度のグラフの山と谷(傾きが 0)の、約 0.4 s と 1.6 s。(b) 傾きが負の、0.4〜1.6 s。(c) 傾きが最も急な負の、1.0 s。(d) 0〜1.0 s の面積(正)と、1.0〜2.0 s の面積(負)は、大きさがほぼ同じで打ち消し合うので、2.0 s 以降の正の面積が加わり、2.3 s の変位は正です。'),
      ] },
    ],
    reflect: ['Do you know what information a graph of position versus time gives?', 'Do you know what information a graph of velocity versus time gives?'],
    reflectJa: ['位置–時間のグラフから、何が分かるか分かる?', '速度–時間のグラフから、何が分かるか分かる?'],
    check: ['analyse motion through graphs'],
    checkJa: ['グラフを使って、運動を分析できる'],
  },

  'A1-4': {
    code: 'A1.4', title: 'Projectile motion', icon: 'projectile',
    lead: 'Two-dimensional motion under gravity, treated as two independent one-dimensional motions — and what air resistance changes.',
    leadJa: '重力のもとでの2次元の運動を、「2つの独立した1次元の運動」として扱います。空気抵抗がある場合に何が変わるかも学びます。',
    goals: ['Describe the motion of a projectile', 'Treat horizontal and vertical motion separately', 'Find maximum height, time of flight and range', 'Understand fluid resistance and terminal speed'],
    sections: [
      { id: 'indep', title: 'Horizontal and vertical motion are independent', blocks: [
        p('Figure 1.32 shows the positions of two objects every 0.2 s: one simply dropped from rest, the other launched horizontally with no vertical component of velocity. In the vertical direction both fall the same distance in the same time, so they hit the ground at the same time.',
          '図1.32は、2つの物体の位置を0.2 sごとに示しています。1つは静かに落としたもの、もう1つは、水平に発射したもの(鉛直方向の速度は 0)です。鉛直方向には、どちらも、同じ時間に同じ距離を落ちるので、同時に地面に着きます。'),
        tok('How do we understand this fact? A black ball is projected horizontally with velocity v and a blue ball is dropped from the same height. Observer X is at rest on the ground. Observer Y moves to the right with velocity v/2. Y sees the black ball moving right with v/2 and the blue ball approaching with −v/2: the two motions are identical except for direction, so Y finds that both reach the ground at the same time. Since time is absolute in Newtonian physics, they reach the ground at the same time for every other observer too.',
          '知の理論(TOK): この事実は、どう理解できるでしょうか。黒いボールを、水平に速度 v で発射し、青いボールを、同じ高さから落とします。観測者Xは地面で静止、観測者Yは右へ速度 v/2 で動きます。Yから見ると、黒いボールは右へ v/2、青いボールは −v/2 で近づいてきます。2つの運動は、向きを除いて同じなので、Yは「同時に地面に着く」と結論します。ニュートン力学では時間は絶対なので、他のどの観測者にとっても、同時に着きます。'),
        p('The motion of a ball projected at some angle can be analysed by looking separately at the horizontal and vertical directions: there is no acceleration horizontally, and the acceleration is g vertically.',
          '斜めに投げたボールの運動は、水平方向と鉛直方向を、別々に見て調べられます。水平方向には加速度がなく、鉛直方向の加速度は g です。'),
        key('Projectile motion = constant velocity horizontally + free fall (acceleration g downwards) vertically. The two directions are independent; only the time t links them.', '放物運動 = 水平方向の等速運動 + 鉛直方向の自由落下(下向きに加速度 g)。2つの方向は、たがいに独立で、時間 t だけが両者をつなぎます。'),
      ] },
      { id: 'components', title: 'Components and equations', blocks: [
        p('A projectile is launched at an angle θ to the horizontal with speed u. The components of the initial velocity are u_x = u cos θ and u_y = u sin θ. At a later time t the components are v_x and v_y. In the x direction the acceleration is zero; in the y direction it is −g.',
          '水平から角度 θ の向きに、速さ u で発射します。最初の速度の成分は、u_x = u cos θ、u_y = u sin θ です。時刻 t の速度の成分を v_x、v_y とします。x 方向の加速度は 0、y 方向の加速度は −g です。'),
        eq('Horizontal:  v_x = u cos θ', 'Vertical:     v_y = u sin θ − gt'),
        p('The position of the projectile is the position vector r, from the origin to the projectile; its components are x and y. The velocity vectors are tangents to the parabolic path.',
          '粒子の位置は「位置ベクトル」r(原点から物体への矢印)で表し、その成分が x と y です。速度のベクトルは、放物線の経路の接線の向きになります。'),
        tip('All we are doing is using v = u + at and s = ut + ½at² separately for x and y. In the x direction a = 0; in the y direction a = −g.', '試験のコツ: やっていることは、v = u + at と s = ut + ½at² を、x と y で別々に使うだけです。x 方向は a = 0、y 方向は a = −g。'),
        eq('Horizontal:  x = ut cos θ', 'Vertical:     y = ut sin θ − ½gt²', 'v² = u² − 2gy    (equivalently  v_y² = u_y² − 2gy)'),
        tip('Always choose your x- and y-axes so that the origin is the point where the launch takes place.', '試験のコツ: x 軸と y 軸は、原点が「発射する点」になるように選ぶこと。'),
        chk('Check yourself 5', 'A projectile is launched with kinetic energy K at 60° to the horizontal. What is its kinetic energy at the highest point? (Kinetic energy = ½mv²)', 'K = ½mu². At the highest point the speed is the horizontal component u cos 60°, so KE = ½mu² cos² 60° = ½mu² × ¼ = K/4.', '答え: K/4。頂点では、鉛直方向の速度が 0 で、水平方向の速度 u cos 60° = u/2 だけが残ります。速さが半分なら、運動エネルギーは (1/2)² = 1/4 倍です。'),
        ex('Worked example 1.10', 'A body is launched with speed 18.0 m s⁻¹ at (a) 30°, (b) 0°, (c) 90° to the horizontal. Find the x- and y-components of the initial velocity in each case.', ['(a) v_x = u cos θ = 18.0 × cos 30° = 15.6 m s⁻¹; v_y = u sin θ = 18.0 × sin 30° = 9.00 m s⁻¹.', '(b) v_x = 18.0 m s⁻¹; v_y = 0.', '(c) v_x = 0; v_y = 18.0 m s⁻¹.'], 'cos と sin を、角度に入れるだけです。0°(水平投射)なら全部が水平成分、90°(真上)なら全部が鉛直成分、という極端な場合も、確かめておきましょう。'),
        ex('Worked example 1.11', 'For a projectile launched at some angle above the horizontal, sketch graphs of the horizontal and vertical components of velocity against time.', ['v_x is constant: a horizontal line.', 'v_y decreases linearly with gradient −g: it starts positive, crosses zero at the top, and becomes negative.'], '水平成分は、加速度 0 なので、一定(水平な直線)。鉛直成分は、加速度 −g なので、傾き −g の直線で、正の値から始まり、頂点で 0 を通って負になります。'),
        ex('Worked example 1.12', 'An object is launched horizontally from a height of 20 m with speed 15 m s⁻¹ (g = 10 m s⁻²). Determine (a) the time to hit the ground, (b) the horizontal distance, (c) the speed when it hits the ground.', ['(a) θ = 0°, so y = −½gt². y = −20 m: −20 = −5t² ⇒ t = 2.0 s.', '(b) x = ut = 15 × 2.0 = 30 m.', '(c) v² = u² − 2gy = 15² − 2 × 10 × (−20) ⇒ v = 25 m s⁻¹.'], '時間は、鉛直方向だけで決まります(y = −½gt²)。その時間を水平方向の x = ut に入れて、距離を求めます。(c) 速さは v² = u² − 2gy で、水平と鉛直の成分を、まとめて計算できます(15² + 20² = 25²)。'),
        ex('Worked example 1.13', 'An object is launched horizontally with velocity 12 m s⁻¹. Determine (a) the vertical component of velocity after 4.0 s, (b) the x- and y-components of its position vector after 4.0 s.', ['(a) v_x = 12 m s⁻¹ at all times. v_y = −gt = −40 m s⁻¹ (g = 10).', '(b) x = ut = 12.0 × 4.0 = 48 m; y = −½gt² = −5 × 16 = −80 m.'], 'とても基本的な問題で、教科書にも「これはできるようにしておくこと」と書かれています。水平方向は等速、鉛直方向は自由落下、と分けて計算します。'),
        tip('Worked example 1.13 is a basic problem — you must know how to do this!', '試験のコツ: 例題 1.13 は基本の問題。必ず解けるようにしておくこと!'),
      ] },
      { id: 'range', title: 'Maximum height, time of flight and range', blocks: [
        p('Figure 1.37 shows an object thrown at θ = 30° with speed 20 m s⁻¹, positions every 0.2 s. The dots get closer together as the object rises (speed decreasing) and move apart on the way down (speed increasing). It reaches a maximum height of 5.1 m and travels a horizontal distance of 35 m.',
          '図1.37は、θ = 30°、速さ 20 m s⁻¹ で投げた物体の、0.2 sごとの位置です。上がるときは、点の間隔がだんだん狭くなり(速さが減る)、下がるときは、広がります(速さが増える)。最高点の高さは 5.1 m、水平方向に 35 m 進みます。'),
        fig('proj', 'A launch at 30° with initial speed 20 m s⁻¹ (dots every 0.2 s). Maximum height 5.1 m, range 35 m.', '30°、初速 20 m s⁻¹ での発射(点は0.2 sごと)。最高点 5.1 m、到達距離 35 m。'),
        p('Time to the top: v_y = 0 gives 0 = u sin θ − gt, so t = u sin θ / g. Substituting into y gives the maximum height. By symmetry the flight takes twice as long to come back to y = 0, so the time of flight is 2u sin θ / g, and the range is x = u cos θ × 2u sin θ / g.',
          '頂点までの時間: v_y = 0 から、0 = u sin θ − gt、つまり t = u sin θ / g。これを y に代入すると、最高点の高さが出ます。経路は左右対称なので、y = 0 に戻るまでの時間は、その2倍(2u sin θ / g)で、到達距離は x = u cos θ × 2u sin θ / g です。'),
        eq('t_top = {u sin θ|g}', 'y_max = {u² sin²θ|2g}', 'time of flight = {2u sin θ|g}', 'range  x = {2u² sin θ cos θ|g} = {u² sin 2θ|g}'),
        tip('You should not remember these formulas by heart. You should be able to derive them quickly.', '試験のコツ: これらの式は、丸暗記しないこと。素早く導けるようにしておく。(v_y = 0 で頂点の時間、その2倍で滞空時間、x = u cos θ × t で距離。)'),
        p('Using 2 sin θ cos θ = sin 2θ, the range is u² sin 2θ / g. sin 2θ is largest (equal to 1) when 2θ = 90°, i.e. θ = 45°: the maximum range is obtained with a launch angle of 45°. The equation also says that two different launch angles give the same range for the same speed; the two angles add up to 90°.',
          '2 sin θ cos θ = sin 2θ を使うと、到達距離は u² sin 2θ / g。sin 2θ は、2θ = 90°、つまり θ = 45° のとき、最大(= 1)になります。つまり、発射角 45° のとき、最も遠くへ届きます。同じ初速で、同じ距離になる発射角が2つあり(たとえば 30° と 60°)、その2つの角を足すと 90° になります。'),
        chk('Check yourself 6', 'On Earth the maximum height and range of a projectile are H and R. The projectile is launched with the same velocity on a planet where the acceleration of free fall is 2g. What are the maximum height and range there?', 'Both H and R are inversely proportional to the acceleration of free fall, so both are halved.', '答え: どちらも半分(H/2 と R/2)。最高点の高さ u²sin²θ / 2g も、到達距離 u²sin2θ / g も、g に反比例するので、g が2倍なら、どちらも半分になります。'),
        ex('Worked example 1.14', 'A projectile is launched at 32.0° to the horizontal with initial speed 25.0 m s⁻¹. Determine the maximum height reached. (g = 9.81 m s⁻²)', ['v_y = u sin θ − gt = 0 at the top: t = 25.0 × sin 32.0° / 9.81 = 1.35 s.', 'y = ut sin θ − ½gt² = 25 × sin 32.0° × 1.35 − ½ × 9.81 × 1.35² = 8.95 m.', 'Equivalently 0 = (u sin θ)² − 2gy ⇒ y = (25.0 × sin 32.0°)² / (2 × 9.81) = 8.95 m.'], '時間を経由する方法(1.35 s)と、v² = u² − 2gy で、時間を使わずに直接出す方法があります。後者のほうが、短くて、計算ミスが減ります。'),
        ex('Worked example 1.15', 'A projectile is launched horizontally from a height of 42 m. As it hits the ground its velocity makes an angle of 55° with the horizontal. Find the initial velocity of launch. (g = 9.8 m s⁻²)', ['y = −½gt² (θ = 0°): −42 = −½ × 9.8 t² ⇒ t = 2.928 s.', 'v_y = 0 − 9.8 × 2.928 = −28.69 m s⁻¹.', 'tan 55° = |v_y| / |v_x| ⇒ v_x = 28.69 / tan 55° = 20.09 ≈ 20 m s⁻¹. Since the launch is horizontal, this is the initial velocity.'], '着地するときの速度の「向き」は、tan θ = |v_y| / |v_x| で結びます。v_x は、飛んでいる間ずっと変わらないので、着地時の v_x が、そのまま初速です。'),
        p('Links: in projectile motion there is one constant force, always vertical: the weight of the body. The result is a parabolic path. The only other case with a constant-magnitude, constant-direction force is a charge moving in a uniform electric field, so a charge projected at an angle in such a field also follows a parabola (see Chapter 19).',
          'つながり: 放物運動では、向きが、いつも鉛直の、一定の力(重さ)だけが働き、その結果、経路は放物線になります。大きさと向きが一定の力が働く、もう1つの場合が、一様な電場の中を動く電荷です。ですから、そのような電場の中で、斜めに打ち出した電荷も、放物線を描きます(第19章)。'),
      ] },
      { id: 'drag', title: 'Fluid resistance and terminal speed', blocks: [
        p('So far we have neglected air resistance. In general, whenever a body moves through a fluid (gas or liquid) it feels a fluid resistance force, directed opposite to its velocity. Typically F = kv for low speeds and F = kv² for high speeds (k a constant). Its magnitude increases with speed.',
          'ここまでは、空気抵抗を無視してきました。一般に、物体が流体(気体や液体)の中を動くと、速度と逆向きの「流体抵抗」を受けます。ふつう、速さが小さいときは F = kv、大きいときは F = kv² です(k は定数)。大きさは、速さが増えると増えます。'),
        p('Imagine dropping a body of mass m with air resistance F = kv. At first the only force is the weight, so the body accelerates. As the speed increases, so does the resistance; eventually it equals the weight, the acceleration becomes zero, and the body moves at a constant speed called the terminal speed v_T.',
          '質量 m の物体を、空気抵抗 F = kv のもとで落とすとします。最初は、重さだけが働くので、加速します。速さが増えると、抵抗も増え、やがて、重さと等しくなって、加速度が 0 になり、一定の速さで動くようになります。この速さが「終端速度(終端速さ)」v_T です。'),
        eq('mg = kv_T', 'v_T = {mg|k}'),
        fig('terminal', 'With air resistance proportional to speed: the speed approaches the terminal speed and the acceleration falls from g to zero.', '速さに比例する空気抵抗があるとき、速さは終端速さに近づき、加速度は g から 0 に減っていきます。'),
        p('The effect of air resistance on projectiles is very pronounced. With air resistance the range and maximum height are smaller, the path is no longer symmetrical, and the projectile hits the ground at a steeper angle.',
          '放物運動への空気抵抗の影響は、とても大きいです。空気抵抗があると、到達距離も最高点も小さくなり、経路は左右対称でなくなり、物体は、より急な角度で着地します。'),
        fig('drag', 'Path of a projectile without air resistance (blue) and with air resistance (red): smaller range and height, steeper landing.', '空気抵抗がない場合(青)とある場合(赤)の経路。到達距離も高さも小さく、着地の角度が急になります。'),
        ex('Worked example 1.16', 'The air resistance in the motion of the textbook graph (terminal speed 30 m s⁻¹) is F = 0.653v. Determine the mass of the projectile.', ['v_T = mg / k ⇒ m = k v_T / g = 0.653 × 30 / 9.8 ≈ 2.0 kg.'], 'グラフから終端速さ 30 m s⁻¹ を読み取り、v_T = mg/k を、m について解きます。'),
        ctx('Nature of science: the simple and the complex', 'Careful observation of motion led to the equations for uniform acceleration along a straight line. Yet the falling leaf is far more complicated: it is acted on by its weight and by air resistance that changes constantly with its orientation and speed, there is wind, and turbulence greatly affects its motion. The physics of this section does not explain a falling leaf. But learning the principles in a simple context allows their application in more involved situations.',
          '科学の本質: 単純なものと複雑なもの。運動を、注意深く観察して、直線上の等加速度運動の式が生まれました。ところが、落ち葉は、はるかに複雑です。重さに加えて、向きと速さで刻々と変わる空気抵抗、風、乱流が運動に大きく影響します。この節の内容だけでは、落ち葉の運動は説明できません。それでも、単純な場面で原理を学ぶと、もっと複雑な場面にも応用できるのです。'),
      ] },
    ],
    reflect: ['Do you understand how to solve problems with projectile motion?', 'Can you explain why a body reaches terminal speed if it is acted upon by a speed-dependent resistance force?', 'Can you describe the effect of air resistance on the path of a projectile?'],
    reflectJa: ['放物運動の問題を、解ける?', '速さに依存する抵抗力を受けるとき、物体が終端速さに達する理由を、説明できる?', '空気抵抗が、放物運動の経路に与える影響を、説明できる?'],
    check: ['solve problems with projectile motion', 'describe the effect of air resistance force on projectile motion'],
    checkJa: ['放物運動の問題を解ける', '空気抵抗が放物運動に与える影響を説明できる'],
  },
};

// ---------- 図(SVG) ----------
const W = '#fff';
const svg = (w, h, body, label) => `<svg class="ph-fig" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const arrow = (x1, y1, x2, y2, col = W, wd = 1.6) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${wd}"/><path d="M${x2} ${y2} L${(x2 - s * Math.cos(a - .4)).toFixed(1)} ${(y2 - s * Math.sin(a - .4)).toFixed(1)} L${(x2 - s * Math.cos(a + .4)).toFixed(1)} ${(y2 - s * Math.sin(a + .4)).toFixed(1)}Z" fill="${col}"/>`;
};
const txt = (x, y, s, o = '') => `<text x="${x}" y="${y}" fill="${W}" font-size="13" font-family="Georgia, serif" ${o}>${s}</text>`;
const path = (pts, col, wd = 2.2, dash = '') => `<path d="${pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('')}" fill="none" stroke="${col}" stroke-width="${wd}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const curve = (f, x0, x1, map, col, n = 120, wd = 2.2) => path(Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return map(x, f(x)); }), col, wd);

export const FIGS1 = {
  dist() {
    const nl = (y, a, b, label) => { const px = v => 40 + (v + 6) * 22; let s = arrow(px(-6), y, px(22), y); for (let v = -4; v <= 20; v += 2) s += `<line x1="${px(v)}" y1="${y - 4}" x2="${px(v)}" y2="${y + 4}" stroke="${W}"/>${txt(px(v) - 6, y + 20, v)}`; return s + txt(px(21) - 6, y - 8, 's/m'); };
    const px = v => 40 + (v + 6) * 22;
    return svg(640, 230, `${nl(70)}${arrow(px(-4), 50, px(16), 50, '#ff6b6b')}${txt(px(3), 40, 'Δs = 20 m, distance = 20 m', 'fill="#ff6b6b"')}
      ${nl(180)}<path d="M${px(12)} 150 L${px(20)} 150 L${px(20)} 160 L${px(4)} 160" fill="none" stroke="#7fd4ff" stroke-width="2"/>${arrow(px(12), 160, px(4), 160, '#7fd4ff')}${txt(px(0), 138, 'Δs = −8 m, distance = 24 m', 'fill="#7fd4ff"')}`, 'Distance and displacement');
  },
  uniform() {
    const w = 540, h = 250;
    const left = `${arrow(40, 210, 240, 210)}${arrow(40, 210, 40, 20)}${txt(246, 214, 't')}${txt(30, 16, 's')}<line x1="40" y1="160" x2="230" y2="50" stroke="#ffd24a" stroke-width="2.6"/>${txt(60, 235, 'position–time: gradient = v', 'font-size="12"')}`;
    const right = `${arrow(300, 210, 520, 210)}${arrow(300, 210, 300, 20)}${txt(526, 214, 't')}${txt(286, 16, 'v')}<rect x="300" y="90" width="150" height="120" fill="#ffd24a" opacity=".3"/><line x1="300" y1="90" x2="450" y2="90" stroke="#ffd24a" stroke-width="2.6"/><line x1="450" y1="90" x2="450" y2="210" stroke="#ffd24a" stroke-dasharray="4 4"/>${txt(345, 160, 'area = vt', 'font-size="14"')}${txt(320, 235, 'velocity–time: area = displacement', 'font-size="12"')}`;
    return svg(w, h, left + right, 'Uniform motion graphs');
  },
  parab() {
    const f = t => 3 + 0.35 * t * t + 0.4 * t;   // 位置(適当な曲線)
    const map = (t, s) => [50 + t * 78, 210 - s * 5.4];
    const t0 = 3, s0 = f(t0), sl = 0.7 * t0 + 0.4;
    const tg = t => s0 + sl * (t - t0);
    return svg(480, 250, `${arrow(50, 210, 450, 210)}${arrow(50, 210, 50, 14)}${txt(456, 214, 't/s')}${txt(34, 12, 's/m')}${curve(f, 0, 4.9, map, '#7fd4ff')}${path([map(0.8, tg(0.8)), map(4.9, tg(4.9))], '#ff6b6b', 1.8)}<circle cx="${map(t0, s0)[0]}" cy="${map(t0, s0)[1]}" r="4.5" fill="${W}"/>${txt(map(3, 0)[0] - 8, 228, 't = 3.0 s')}${txt(map(3.3, tg(3.3))[0] + 12, map(3.3, tg(3.3))[1] + 18, 'tangent: gradient = v', 'fill="#ff6b6b" font-size="12"')}`, 'Tangent to a position-time curve');
  },
  vtarea() {
    const px = t => 60 + t * 36, py = v => 220 - v * 18;
    const u = 3, vv = 10, T = 8;
    let stairs = '';
    for (let i = 0; i < 8; i++) { const t0 = i, t1 = i + 1, v0 = u + (vv - u) * t0 / T; stairs += `<rect x="${px(t0)}" y="${py(v0)}" width="${px(t1) - px(t0)}" height="${220 - py(v0)}" fill="#7fd4ff" opacity=".25" stroke="#7fd4ff" stroke-width=".8"/>`; }
    return svg(420, 250, `${arrow(60, 220, 400, 220)}${arrow(60, 220, 60, 14)}${txt(404, 224, 'time')}${txt(40, 12, 'v')}${stairs}<line x1="${px(0)}" y1="${py(u)}" x2="${px(T)}" y2="${py(vv)}" stroke="#ff6b6b" stroke-width="2.4"/><line x1="${px(0)}" y1="${py(vv)}" x2="${px(T)}" y2="${py(vv)}" stroke="${W}" stroke-dasharray="4 4"/>${txt(36, py(u) + 4, 'u')}${txt(36, py(vv) + 4, 'v')}${txt(px(T) - 4, 238, 't')}${txt(px(3), 205, 'area = Δs', 'font-size="14"')}`, 'Staircase approximation of a velocity-time graph');
  },
  parab2() {
    const mk = (ox, sign) => { const f = t => sign * (0.5 * 3 * (t - 1.4) * (t - 1.4)) + (sign > 0 ? -2 : 6); const map = (t, s) => [ox + t * 60, 120 - s * 8]; return `${arrow(ox - 10, 120, ox + 190, 120)}${arrow(ox, 200, ox, 14)}${txt(ox + 194, 124, 't')}${txt(ox - 14, 12, 's')}${curve(f, 0, 3, map, sign > 0 ? '#7fd4ff' : '#ff9d6b')}`; };
    return svg(480, 230, `${mk(30, 1)}${mk(270, -1)}${txt(60, 222, 'a > 0 (concave up)', 'font-size="12"')}${txt(300, 222, 'a < 0 (concave down)', 'font-size="12"')}`, 'Parabolic position-time graphs');
  },
  threegraphs() {
    const mk = (y0, f, col, label) => { const map = (t, v) => [60 + t * 330, y0 - v * 42]; return `${arrow(50, y0, 420, y0)}${arrow(60, y0 + 50, 60, y0 - 54)}${txt(424, y0 + 4, 't/s')}${txt(34, y0 - 50, label)}${curve(f, 0, 1, map, col)}`; };
    return svg(460, 480, `${mk(70, t => Math.sin(2 * Math.PI * t), '#7fd4ff', 's')}${mk(230, t => Math.cos(2 * Math.PI * t), '#ffd24a', 'v')}${mk(390, t => -Math.sin(2 * Math.PI * t), '#ff6b6b', 'a')}`, 'Position, velocity and acceleration graphs of one motion');
  },
  proj() {
    const u = 20, th = Math.PI / 6, g = 9.8, ux = u * Math.cos(th), uy = u * Math.sin(th), T = 2 * uy / g;
    const sc = 17, map = (x, y) => [40 + x * sc, 200 - y * sc * 1.6];
    const f = x => x * Math.tan(th) - g * x * x / (2 * ux * ux);
    let dots = ''; for (let t = 0; t <= T + 1e-6; t += 0.2) { const [px, py] = map(ux * t, uy * t - 0.5 * g * t * t); dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#ff6b6b"/>`; }
    const ym = uy * uy / (2 * g);
    return svg(680, 240, `${arrow(30, 200, 660, 200)}${arrow(40, 210, 40, 14)}${txt(646, 220, 'x/m')}${txt(18, 14, 'y/m')}${curve(f, 0, ux * T, map, '#7fd4ff', 80, 1.4)}${dots}${arrow(map(0, 0)[0], map(0, 0)[1], map(3.4, 3.4 * Math.tan(th))[0], map(3.4, 3.4 * Math.tan(th))[1], '#ffd24a')}${txt(map(2.6, 0.5)[0], map(2.6, 0.5)[1] + 6, 'θ = 30°, u = 20 m/s', 'font-size="12"')}${txt(map(ux * T / 2 - 4, ym)[0], map(0, ym)[1] - 10, 'y_max = 5.1 m', 'font-size="12"')}${txt(map(ux * T - 6, 0)[0], 220, 'range 35 m', 'font-size="12"')}`, 'Projectile launched at 30 degrees');
  },
  terminal() {
    const map1 = (t, v) => [60 + t * 17, 100 - v * 2.8], map2 = (t, a) => [60 + t * 17, 230 - a * 7.6];
    const v = t => 30 * (1 - Math.exp(-t * 9.8 / 30)), a = t => 9.8 * Math.exp(-t * 9.8 / 30);
    return svg(460, 270, `${arrow(50, 100, 430, 100)}${arrow(60, 104, 60, 6)}${txt(434, 104, 't/s')}${txt(40, 12, 'v/m s⁻¹')}${curve(v, 0, 20, map1, '#7fd4ff')}<line x1="60" y1="${map1(0, 30)[1]}" x2="400" y2="${map1(0, 30)[1]}" stroke="${W}" stroke-dasharray="4 4"/>${txt(350, map1(0, 30)[1] - 6, 'v_T = 30', 'font-size="12"')}
      ${arrow(50, 230, 430, 230)}${arrow(60, 234, 60, 140)}${txt(434, 234, 't/s')}${txt(40, 134, 'a/m s⁻²')}${curve(a, 0, 20, map2, '#ff6b6b')}${txt(70, map2(0, 9.8)[1] + 4, 'g', 'font-size="12"')}`, 'Speed and acceleration with air resistance');
  },
  drag() {
    const map = (x, y) => [40 + x * 0.18, 210 - y * 0.12];
    const g = 9.8, u = 160, th = 50 * Math.PI / 180, ux = u * Math.cos(th), uy = u * Math.sin(th);
    const pa = []; for (let i = 0; i <= 100; i++) { const t = 2 * uy / g * i / 100; pa.push(map(ux * t, uy * t - 0.5 * g * t * t)); }
    const pb = []; const k = 0.045; let x = 0, y = 0, vx = ux, vy = uy; const dt = 0.05;
    for (let i = 0; i < 4000; i++) { pb.push(map(x, y)); const v = Math.hypot(vx, vy); vx += -k * v * vx * dt; vy += (-g - k * v * vy) * dt; x += vx * dt; y += vy * dt; if (y < 0) break; }
    return svg(520, 240, `${arrow(30, 210, 500, 210)}${arrow(40, 220, 40, 14)}${txt(488, 230, 'x')}${txt(24, 14, 'y')}${path(pa, '#7fd4ff', 2)}${path(pb, '#ff6b6b', 2)}${txt(300, 60, 'no air resistance', 'fill="#7fd4ff" font-size="12"')}${txt(150, 170, 'with air resistance', 'fill="#ff6b6b" font-size="12"')}`, 'Projectile path with and without air resistance');
  },
};
