// Physics HL A5「Galilean and special relativity」の解説。出典: 配布された教科書の第6章(6.1〜6.3)。
// 「TEST YOUR UNDERSTANDING」は、Practice で使うため、ここには入れていない。
// ブロックの種類: h(小見出し) / p(説明) / eq(式) / key(重要ポイント) / tip(試験のコツ) / tok(知の理論) / ctx(科学の文脈) / ex(例題) / chk(確認問題) / fig(図)
// 文章は en(英語) と ja(日本語の解説)。式の中の {a|b} は、分数(a/b)として表示する。
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

export const TOPICS = {
  'A5-1': {
    code: 'A5.1', title: 'Reference frames and Lorentz transformations', icon: 'frames',
    lead: 'Special relativity starts from two simple postulates and ends with new rules for converting space and time between observers.',
    leadJa: '特殊相対性理論は、2つの単純な前提(公準)から出発し、観測者ごとの「空間と時間の測り方」を変換する新しいルールにたどり着きます。',
    goals: ['Understand reference frame and inertial reference frame', 'Use the Galilean transformation equations', 'State Einstein\'s two postulates', 'Use the Lorentz transformation equations for two frames', 'Use the spacetime interval as an invariant quantity'],
    sections: [
      { id: 'intro', title: 'Introduction', blocks: [
        p('This chapter covers the kinematics of the theory of special relativity that Einstein introduced in 1905. It overturns our everyday ideas of space and time: lengths shrink, moving clocks run slow, and the speed of light becomes the ultimate speed limit for anything with mass. Guiding question: what are the consequences of the constancy of the speed of light for our understanding of space and time?',
          'この章では、1905年にアインシュタインが発表した特殊相対性理論の「運動学」の部分を学びます。日常の空間と時間の常識がくつがえります。長さは縮み、動く時計はゆっくり進み、光の速さは、質量をもつ物体にとっての速さの限界になります。この章の問いは、「光の速さが一定であることは、空間と時間の理解に何をもたらすか?」です。'),
      ] },
      { id: 'frames', title: 'Events and reference frames', blocks: [
        p('In experiments we (the observers) record the time and position of events. To do this we use a reference frame: a set of coordinate axes plus clocks at every point in space, all synchronised. If this set is not accelerating, it is an inertial reference frame.',
          '実験では、観測者が「出来事(イベント)」が起きた時刻と位置を記録します。そのために使うのが「座標系(参照系)」です。座標軸と、空間のすべての点に置いた同期した時計の組、と考えてください。この座標系が加速していなければ「慣性系」と呼びます。'),
        p('For a lightning strike, the observer reads the clock at the point where it struck (that is the time of the event) and reads the coordinates of that point (that is the position). In the textbook example, lightning strikes at t = 3 s at x = 60 m, y = 0 (the z coordinate is ignored).',
          '雷が落ちたなら、観測者は、落ちた場所にある時計の値を「イベントの時刻」、その場所の座標を「イベントの位置」として記録します。教科書の例では、t = 3 s、x = 60 m、y = 0 で雷が落ちています(z 座標は無視します)。'),
        key('An event is something that happens at a definite place and time. A reference frame is a set of axes and synchronised clocks. If it does not accelerate, it is inertial.', 'イベントとは、決まった場所・時刻に起きる出来事。参照系は、座標軸と同期した時計の組。加速していなければ「慣性系」。'),
        chk('Check yourself 1', 'Which of these are inertial frames? (a) a sky diver falling freely (b) a sky diver at terminal velocity (c) a train moving at constant speed on a straight line (d) a plane taking off (e) the earth as it rotates around the sun', 'B and C, because there is no acceleration.', '答え: bとc。加速度がないからです。自由落下中(a)は重力で加速しており、離陸中(d)は加速中、地球(e)は公転・自転で向きが変わり続けるので加速しています(厳密には、ごく小さい近似で慣性系と見なします)。等速直線運動(c)と、速度が一定になった終端速度(b)だけが慣性系です。'),
      ] },
      { id: 'galilean', title: 'Galilean transformations', blocks: [
        p('Now take two observers: one on the ground (frame S) and one on a train moving at speed v relative to the ground (frame S\'). Their origins coincide when both clocks read zero. When the train has moved for a time t it has travelled a distance vt, so a position x on the ground is x\' = x − vt on the train. Before relativity, time was assumed to be absolute: t\' = t.',
          '地面にいる観測者(座標系S)と、地面に対して速さ v で動く電車の観測者(座標系S\')を考えます。2つの時計がどちらも 0 を示すとき、2つの原点は重なっているとします。時間 t がたつと電車は vt だけ進むので、地面で x の場所は、電車では x\' = x − vt の場所になります。相対性理論の前は、時間は誰にとっても同じ(絶対時間)だと考えられていたので、t\' = t としていました。'),
        eq('x′ = x − vt', 't′ = t'),
        key('x′ = x − vt and t′ = t are two of the Galilean transformation equations.', 'x′ = x − vt と t′ = t は、ガリレイ変換の式のうちの2つ。'),
        p('Example from the text: lightning strikes at x = 60 m, t = 3 s on the ground. The train moves at 15 m s⁻¹, so the train observer assigns x′ = 60 − 15 × 3 = 15 m and t′ = 3 s to the same event. The two observers disagree about the position but agree about the time.',
          '教科書の例です。地面で x = 60 m、t = 3 s に雷が落ちました。電車は 15 m s⁻¹ で走っているので、電車の観測者は同じイベントを x′ = 60 − 15 × 3 = 15 m、t′ = 3 s と記録します。位置は2人で食い違いますが、時刻は一致します。'),
        h('Velocity addition (Galilean)', '速度の足し算(ガリレイ版)'),
        p('A ball rolls on the floor of a train moving at 20 m s⁻¹. In 2 s the ball rolls 20 m along the floor, so the train observer finds u′ = 10 m s⁻¹. The train moves 40 m in the same time, so the ground observer sees the ball travel 60 m: u = 30 m s⁻¹ = 10 + 20. In general u = u′ + v, or u′ = u − v. This is the last of the Galilean transformation equations.',
          '速さ 20 m s⁻¹ で走る電車の床でボールを転がします。2秒でボールが床の上を 20 m 進むので、電車の観測者にとってのボールの速度は u′ = 10 m s⁻¹。同じ2秒で電車は 40 m 進むので、地面の観測者にはボールが 60 m 進んで見え、u = 30 m s⁻¹(= 10 + 20)です。一般に、u = u′ + v(または u′ = u − v)となり、これがガリレイ変換の最後の式です。'),
        eq('u = u′ + v', 'u′ = u − v'),
        chk('Check yourself 2', 'A bird flies due south at 4 m s⁻¹ and a glider flies due north at 5 m s⁻¹. What is the velocity of the bird relative to the glider?', '9 m s⁻¹ due south.', '答え: 南向きに 9 m s⁻¹。北向きを正とすると、鳥は −4、グライダーは +5。鳥のグライダーに対する速度は u′ = u − v = −4 − 5 = −9 m s⁻¹(南向きに 9 m s⁻¹)です。'),
        ex('Worked example 6.1', 'A ball rolls at 2 m s⁻¹ to the right relative to the floor of a train. The train moves (a) to the right at 12 m s⁻¹, (b) to the left at 12 m s⁻¹. What is the ball\'s velocity relative to the ground?', ['(a) u = u′ + v = 2 + 12 = 14 m s⁻¹', '(b) u = u′ + v = 2 − 12 = −10 m s⁻¹'], '右向きを正にして、u = u′ + v に入れるだけです。(b)は電車が左向きなので v = −12。結果の −10 m s⁻¹ は「左向きに 10 m s⁻¹」を表します。'),
      ] },
      { id: 'light', title: 'The problem with light', blocks: [
        p('Replace the rolling ball by a beam of light with speed c as measured on the train. Galilean addition would give the ground observer c + v, a higher speed. At the end of the 19th century many experiments looked for changes in the speed of light depending on the motion of its source, and none were found. Einstein had strong theoretical reasons, from Maxwell\'s electromagnetism, to expect the same speed for all inertial observers. Either Galileo\'s velocity formula or Maxwell was wrong; Einstein trusted Maxwell, so the Galilean equations had to be revised.',
          'ボールを、電車の観測者から見て速さ c の光に置き換えます。ガリレイの足し算では、地面の観測者には光が c + v という、より速い速さで見えるはずです。19世紀の終わりには、光源の運動によって光の速さが変わるかどうかを調べる実験が数多く行われましたが、変化は見つかりませんでした。アインシュタインは、マクスウェルの電磁気学から、光の速さはすべての慣性系の観測者で同じになるはずだと強く考えていました。ガリレイの速度の式が間違いか、マクスウェルが間違いか。アインシュタインはマクスウェルを信じたので、ガリレイの式のほうを作り直すことにしました。'),
      ] },
      { id: 'postulates', title: 'The postulates of special relativity', blocks: [
        p('Einstein based his theory on two postulates. The first is Galileo\'s old principle, extended from mechanics to all laws of physics. The second is new.',
          'アインシュタインは、2つの公準(前提)から理論を作りました。1つ目は、ガリレイの昔からの原理を、力学だけでなく物理法則すべてに広げたもの。2つ目は、まったく新しいものです。'),
        key('Postulate 1: All the laws of physics are the same in all inertial frames.', '公準1: すべての物理法則は、すべての慣性系で同じ形になる(どの慣性系も特別ではない)。'),
        key('Postulate 2: The speed of light in vacuum is the same for all inertial observers.', '公準2: 真空中の光の速さは、すべての慣性系の観測者にとって同じ。'),
        tok('Einstein was so sure about the constancy of the speed of light that he made it a principle. Conclusive experimental proof came only in 1964 at CERN: neutral pions moving at 0.99975c decayed into two photons going in different directions, and both photons were measured at c with great accuracy. The speed of light does not depend on the speed of its source. The simple postulates have far-reaching consequences; the theory changed ideas about space and time that had stood for over two thousand years.',
          '知の理論(TOK): アインシュタインは、光速不変をとても確信していたので、原理に格上げしました。決定的な実験は1964年のCERNで行われました。0.99975c で動く中性パイ中間子が、2つの光子に崩壊して別々の向きに飛び、どちらの光子も非常に高い精度で c と測定されました。光の速さは光源の速さに依存しません。公準は単純ですが、結果はとても大きく、2000年以上疑われなかった空間と時間の考え方を変えました。'),
      ] },
      { id: 'lorentz', title: 'The Lorentz transformations', blocks: [
        p('From the two postulates Einstein showed (1905) that the correct equations relating the coordinates of one event in frames S and S′ are the Lorentz transformations. Lorentz had found them earlier (1890) by requiring electromagnetism to have the same laws in all inertial frames; Einstein re-derived them from more general principles.',
          '2つの公準から、アインシュタインは1905年に、同じイベントのSとS′での座標を結びつける正しい式(ローレンツ変換)を導きました。ローレンツは1890年に、「電磁気学の法則がすべての慣性系で同じになる」ことを求めて、すでに同じ式を見つけていました。アインシュタインは、より一般的な原理から、それを導き直したのです。'),
        eq('Galileo:   x′ = x − vt        t′ = t', 'Einstein: x′ = γ(x − vt)       t′ = γ(t − {v|c²}x)', 'Inverse:  x = γ(x′ + vt′)       t = γ(t′ + {v|c²}x′)', 'γ = {1|√(1 − v²/c²)}'),
        p('The factor γ is the gamma factor. Frame S′ moves with speed v to the right relative to S, and the origins coincide when t = t′ = 0. The first column gives x′ and t′ from x and t, the second gives x and t from x′ and t′. Always γ ≥ 1.',
          'γ(ガンマ)をガンマ因子と呼びます。S′はSに対して右向きに速さ v で動き、t = t′ = 0 のとき原点が重なっているものとします。1列目はx, tからx′, t′を、2列目は逆にx′, t′からx, tを求める式です。γ は、つねに 1 以上です。'),
        fig('gamma', 'Gamma factor against speed. It stays close to 1 up to about half the speed of light, then rises to infinity as v → c.', 'γのグラフ。光速の半分くらいまではほぼ 1 のままで、v が c に近づくと無限大に向かって急に大きくなります。'),
        p('Three things to notice. (1) If v is much smaller than c, then γ ≈ 1 and v/c² is negligible, so the Lorentz equations reduce to the Galilean ones: relativity matters only at speeds close to c. (2) For v ≥ c the equations make no sense (the square root is zero or imaginary): no material body can reach or exceed the speed of light. (3) The equations connect the coordinates of a single event in the two frames.',
          '大切な点が3つあります。(1) v が c よりずっと小さいと、γ ≈ 1 で v/c² も無視できるので、ローレンツ変換はガリレイ変換に一致します。つまり、相対性理論の効果が目立つのは、光速に近い速さのときだけです。(2) v が c 以上だと、ルートの中が 0 や負になり、式が意味をなしません。これは、質量をもつ物体が光速に達したり超えたりできないことの表れです。(3) これらの式は、1つのイベントの、2つの座標系での座標を結びつけるものです。'),
        chk('Check yourself 3', 'You are on an island watching the mainland, 20 km away. The instant you see light from the headlights of a car on the mainland, the clock strikes midnight. Is the time coordinate of the event "light is emitted from the headlights" midnight?', 'No. We have to subtract the time it took the light to reach the observer.', '答え: いいえ。光が自分に届くまでの時間を引かなければなりません。イベントの「時刻」は、そのイベントが起きた場所の時計で決まります。「見えた瞬間」は、光がかかった時間のぶんだけ遅れています。'),
        ex('Worked example 6.2', 'Lightning strikes the ground (frame S) at x = 3500 m, t = 5.0 s. Find where and when it struck according to a rocket flying past at 0.80c to the right.', ['γ = 1 / √(1 − 0.80²) = 5/3', 'x′ = γ(x − vt) = (5/3)(3500 − 0.80 × 3×10⁸ × 5.0) = −2.0 × 10⁹ m', 't′ = γ(t − vx/c²) = (5/3)(5.0 − 0.80 × 3×10⁸ × 3500 / (3×10⁸)²) = 8.3 s', 'Check: in S, c²t² − x² = (3×10⁸ × 5.0)² − 3500² = 2.25 × 10¹⁸ m². In S′, c²t′² − x′² = (3×10⁸ × 8.3)² − (2.0×10⁹)² = 2.25 × 10¹⁸ m². The same value in both frames.'], '手順は、①γを求める(v/c = 0.80 なので γ = 5/3)、②式に代入、の2つです。ロケットの観測者は、雷が自分の後方、約 2×10⁹ m の場所で、8.3 s のときに落ちたと記録します。2人の座標は食い違いますが、どちらも正しいのです。最後に、c²t² − x² が両方の座標系で同じ値(2.25×10¹⁸ m²)になることに気づくと、次の「時空間隔」の話につながります。'),
        ex('Worked example 6.3', 'A rocket moves at 0.80c past a space station. (a) Where is the rocket, according to the station, when the rocket clock shows 0.60 µs? (b) What does the station clock read at that position?', ['The event is x′ = 0, t′ = 0.60 µs in the rocket frame (γ = 5/3).', '(a) x = γ(x′ + vt′) = (5/3)(0 + 0.80 × 3×10⁸ × 0.60×10⁻⁶) = 240 m', '(b) t = γ(t′ + vx′/c²) = (5/3)(0.60 µs + 0) = 1.0 µs', 'Check: c²t² − x² = (3×10⁸ × 1.0×10⁻⁶)² − 240² = 32 400 m², and c²t′² − x′² = (3×10⁸ × 0.60×10⁻⁶)² − 0 = 32 400 m².'], 'ロケットの時計で 0.60 µs たつとき、ロケット自身の位置は x′ = 0 です。ここでは、S′ → S の向きの変換(式の符号が + になる側)を使います。駅の観測者には、ロケットが 240 m 進み、駅の時計は 1.0 µs を示します。ロケットの時計(0.60 µs)より、駅の時計(1.0 µs)のほうが進んでいる点に注意してください(次のトピックの「時間の遅れ」につながります)。'),
        tip('You must be able to use the Lorentz equations in both directions: from S to S′ and from S′ to S.', '試験のコツ: ローレンツ変換は、S→S′ と S′→S の両方向で使えるようにしておくこと。符号(−か+か)の違いに注意。'),
        p('Often we want the difference between two events. For events 1 and 2, define Δx = x₂ − x₁ and Δt = t₂ − t₁ in S (and Δx′, Δt′ in S′). The same equations apply to the differences:',
          '2つのイベントの「差」がほしいことがよくあります。イベント1、2について、Sでの差を Δx = x₂ − x₁、Δt = t₂ − t₁、S′での差を Δx′、Δt′ とします。差にも、同じ形の式が成り立ちます。'),
        eq('Δx′ = γ(Δx − vΔt)       Δt′ = γ(Δt − {v|c²}Δx)', 'Δx = γ(Δx′ + vΔt′)       Δt = γ(Δt′ + {v|c²}Δx′)'),
        ex('Worked example 6.4', 'A rocket moves at 0.80c relative to a lab. Its length measured by the rocket observers is 630 m. A photon is emitted from the back and travels to the front. Find the time taken according to observers in the rocket and in the laboratory.', ['Event 1: emission. Event 2: arrival at the front. In the rocket frame S′: Δx′ = 630 m.', 'Δt′ = 630 / c = 2.1 µs', 'In the lab frame S: Δx = γ(Δx′ + vΔt′) = (5/3)(630 + 0.80c × 2.1×10⁻⁶) = 1890 m', 'Δt = γ(Δt′ + vΔx′/c²) = (5/3)(2.1×10⁻⁶ + 0.80c × 630 / c²) = 6.3 µs'], 'ロケットの中では、光が 630 m の長さを速さ c で進むので 2.1 µs。実験室の観測者は、光がロケットの動きのぶん、さらに遠くまで進む(1890 m)と見ますが、光の速さはここでも c なので、かかる時間は 1890 m ÷ c ≈ 6.3 µs。公準2(光の速さは誰から見ても c)が、ちゃんと成り立っています。'),
      ] },
      { id: 'interval', title: 'The spacetime interval', blocks: [
        p('Different inertial observers assign different space and time coordinates to the same events, yet they agree on one quantity: the spacetime interval. In S it is (Δs)² = (cΔt)² − (Δx)², and in S′ it has exactly the same value.',
          '異なる慣性系の観測者は、同じイベントに、異なる空間座標と時間座標を割り当てます。それでも、全員が同じ値になる量が1つあります。「時空間隔」です。Sでは (Δs)² = (cΔt)² − (Δx)² で、S′でも、まったく同じ値になります。'),
        eq('(cΔt)² − (Δx)² = (cΔt′)² − (Δx′)²'),
        key('The spacetime interval between two events is invariant: every inertial observer gets the same value.', '2つのイベントの間の時空間隔は「不変量」。すべての慣性系の観測者が、同じ値を得る。'),
        p('In practice, if we know three of Δt, Δx, Δt′, Δx′, we can find the fourth. Example: observer X sits at the origin of S′, which moves past S at 0.80c. In S, X turns a light on at t = 0 and off at t = 4.0 s. How long was the light on according to S′?',
          '実際には、Δt, Δx, Δt′, Δx′ のうち3つが分かれば、残り1つが求められます。例: 観測者XはS′の原点にいて、S′はSに対して 0.80c で動いています。Sの観測者から見て、Xは t = 0 に電灯をつけ、t = 4.0 s に消しました。S′では、何秒つけていたことになるでしょうか。'),
        eq('Δt = 4.0 s,  Δx = 0.80c × 4.0 = 9.6 × 10⁸ m,  Δx′ = 0', '(3×10⁸ × 4.0)² − (9.6×10⁸)² = (cΔt′)² − 0', 'Δt′ = 2.4 s   (the same as γ-transformation: Δt′ = (5/3)(4.0 − 0.80 × 0.80 × 4.0) = 2.4 s)'),
        p('Since X is at rest in S′ (Δx′ = 0), 2.4 s is the proper time of X. In S the clock looks slower: 4.0 s elapse while only 2.4 s elapse for X.',
          'XはS′で静止している(Δx′ = 0)ので、2.4 s がXにとっての固有時間です。Sから見ると、Xの時間は遅れていて、Sで 4.0 s たつあいだに、Xの時計は 2.4 s しか進みません。'),
        chk('Check yourself 4', 'A photon travels from A to B in a straight line. What is the spacetime interval between these points?', 'If A and B are separated by Δx, the photon takes Δx/c. So c²(Δt)² − (Δx)² = c²(Δx/c)² − (Δx)² = 0.', '答え: 0。光は Δx を Δt = Δx/c で進むので、(cΔt)² = (Δx)²、つまり間隔は 0 です。光でつながる2つのイベントの時空間隔は、どの観測者にとっても 0 です。'),
        tok('There is no question as to which observer is right when they measure time intervals. Both are right. Two inertial observers moving at constant velocity relative to each other both reach valid conclusions, according to the principle of relativity.',
          '知の理論(TOK): 時間の間隔を測るとき、どちらの観測者が正しいか、という問いは成り立ちません。どちらも正しいのです。等速で動き合う2人の慣性系の観測者は、相対性原理により、どちらも有効な結論に達します。'),
      ] },
    ],
    reflect: ['Do you understand what an inertial reference frame is, and can you identify one?', 'Do you understand the postulates of relativity?', 'Can you apply the Lorentz transformation formulas?'],
    reflectJa: ['慣性系とは何かが分かり、見分けられる?', '相対性理論の公準(2つの前提)を言える?', 'ローレンツ変換の式を使いこなせる?'],
    check: ['understand the term reference frame', 'work with the Galilean transformation equations', 'recite the postulates of the special theory of relativity', 'appreciate the constancy of the speed of light', 'apply the Lorentz transformation equations'],
    checkJa: ['「参照系」の意味が分かる', 'ガリレイ変換の式が使える', '特殊相対性理論の公準が言える', '光速不変の意味が分かる', 'ローレンツ変換の式が使える'],
  },

  'A5-2': {
    code: 'A5.2', title: 'Effects of relativity', icon: 'clock',
    lead: 'The Lorentz equations predict that moving clocks run slow, moving rods shrink, velocities never add up beyond c, and simultaneity depends on the observer.',
    leadJa: 'ローレンツ変換からは、動く時計はゆっくり進み、動く棒は縮み、速度は足しても c を超えず、「同時」は観測者で変わる、という結果が出ます。',
    goals: ['Use proper time interval and proper length', 'Solve time dilation and length contraction problems', 'Use relativistic velocity addition', 'Explore relativistic simultaneity', 'Understand muon decay as evidence for time dilation and length contraction'],
    sections: [
      { id: 'dilation', title: 'Time dilation', blocks: [
        p('An observer in S′ measures the time Δt′ between successive ticks of a clock at rest in S′. The ticks occur at the same place, so Δx′ = 0. The observer in S then measures:',
          'S′の観測者が、S′で静止している時計の「チクタク」の間隔 Δt′ を測ります。2つのチクタクは同じ場所で起きるので、Δx′ = 0 です。このとき、Sの観測者が測る間隔は次のようになります。'),
        eq('Δt = γ(Δt′ + {vΔx′|c²}) = γΔt′'),
        p('So the interval between ticks of a clock moving relative to the observer is greater than the interval measured where the clock is at rest. This is time dilation. The time measured in S′ is special: it is the time between two events at the same point in space, called the proper time interval. ("Proper" is just a name; it does not mean more correct.)',
          '観測者に対して動いている時計の、チクタクの間隔は、時計が静止している座標系で測った間隔より長くなります。これが「時間の遅れ(時間の伸び)」です。S′で測った時間は特別で、「同じ場所で起きた2つのイベントの間の時間」です。これを固有時間間隔と呼びます(「固有」は名前にすぎず、「より正しい」という意味ではありません)。'),
        key('A proper time interval is the time between two events that take place at the same point in space.', '固有時間間隔とは、空間の同じ点で起きた2つのイベントの間の時間。'),
        eq('time interval = γ × proper time interval = {1|√(1 − v²/c²)} × proper time interval'),
        ex('Worked example 6.5', 'The time between ticks of a clock on a fast rocket is half of what Earth observers record. Find the speed of the rocket relative to Earth.', ['The rocket observers measure the proper time (same place). Earth\'s interval is twice as long, so γ = 2.', '2 = 1/√(1 − v²/c²)  ⇒  √(1 − v²/c²) = 1/2  ⇒  1 − v²/c² = 1/4', 'v²/c² = 3/4  ⇒  v = 0.866c'], '「地球側の時間が2倍」=「γ = 2」と読み替えるのがコツです。あとは式を v について解くだけ。固有時間を測るのは、ロケットの時計がチクタクする2つのイベントが「同じ場所」で起きる、ロケット側の観測者です。'),
        ex('Worked example 6.6', 'A rocket passes a lab observer at v = 0.85c. The lab observer measures a radioactive isotope at rest in the lab to have a half-life of 2.0 min. Find the half-life measured by the rocket observers.', ['The two events (a sample with a given mass, then half that mass) occur at the same place in the lab, so the lab observer measures the proper time interval: 2.0 min.', 'Rocket observers measure γ × 2.0 min = {1|√(1 − 0.85²)} × 2.0 min = 3.80 min'], 'ポイントは、「どちらの観測者が固有時間を測るか」です。試料は実験室で止まっているので、2つのイベントは実験室の同じ場所。固有時間を測るのは実験室の観測者(2.0 min)で、ロケットの観測者には、γ倍の 3.80 min に見えます。注意: 固有時間を測るのは「動いている側」ではありません。「動いている」と言えるのは相対的なことで、ロケットの観測者から見れば、実験室が v = −0.85c で動いています。'),
        ctx('Science in context: GPS', 'GPS depends on precise signals from satellites moving at about 4 km s⁻¹. The gamma factor for this speed exceeds 1 by about 9 × 10⁻¹¹. In one day (86 400 s) the clock error would be 9 × 10⁻¹¹ × 86 400 ≈ 8 µs. For signals at the speed of light, that is a position error of about 8 × 10⁻⁶ × 3 × 10⁸ = 2400 m, which would make GPS worthless. (GPS also needs corrections from general relativity.)',
          '科学の文脈: GPS。GPSは、秒速約4 kmで動く衛星からの信号を、正確に測ることで成り立っています。この速さのγは、1より 9×10⁻¹¹ ほど大きくなります。1日(86 400 s)では、時計のずれは約 9×10⁻¹¹ × 86 400 ≈ 8 µs。光の速さで進む信号なら、位置の誤差は約 8×10⁻⁶ × 3×10⁸ = 2400 m にもなり、GPSは使い物になりません。(実際のGPSは、一般相対性理論による補正も使っています。)'),
      ] },
      { id: 'contraction', title: 'Length contraction', blocks: [
        p('Now take a rod at rest in S′. The observer in S′ finds its length Δx′ = L₀ (the ends can be measured at different times since the rod is not going anywhere). But for the observer in S the rod moves, so its two ends must be recorded at the same time, Δt = 0. Writing Δx = L and using Δx′ = γ(Δx − vΔt):',
          'S′で静止している棒を考えます。S′の観測者は、棒の長さ Δx′ = L₀ を測ります(棒は動かないので、両端を測る時刻が違っても構いません)。ところがSの観測者にとって棒は動いているので、両端の位置を「同じ時刻(Δt = 0)」に記録しないといけません。Δx = L とおいて、Δx′ = γ(Δx − vΔt) を使うと、次のようになります。'),
        eq('L₀ = γ(L − 0)', 'L = {L₀|γ}'),
        p('The rod, moving relative to S, is shorter in S than the length measured in S′ where it is at rest. This is length contraction. A frame in which an object is at rest is that object\'s rest frame.',
          '動いている棒は、棒が静止しているS′で測った長さより、Sでは短くなります。これが「長さの収縮」です。ある物体が静止している座標系を、その物体の「静止系」と呼びます。'),
        key('The length Δx′ = L₀ measured in the frame where the rod is at rest is the proper length.   length = proper length / γ', '棒が静止している座標系で測った長さ L₀ が「固有長さ」。 長さ = 固有長さ ÷ γ。'),
        tip('Only lengths in the direction of motion are contracted.', '試験のコツ: 縮むのは、運動の向きの長さだけ。(進行方向と垂直な長さは変わりません。)'),
        ex('Worked example 6.7', 'An unmanned spacecraft leaves Earth at 0.80c towards a planet 40 ly away (measured by Earth). How long does the trip take according to (a) Earth clocks, (b) spacecraft clocks?', ['(a) Earth: 40 ly / 0.80c = 50 yr', '(b) Leaving Earth and arriving at the planet happen at the same place in the spacecraft frame, so the spacecraft measures a proper time: 50 / γ = 50 / (5/3) = 30 yr', 'Equivalent argument: in the spacecraft frame the planet comes towards it at 0.80c across a contracted distance 40 / γ = 24 ly, taking 24 ly / 0.80c = 30 yr.'], '同じ旅を、2通りに説明できます。(1) 時間の遅れ: 宇宙船の時計は固有時間を測るので、50年 ÷ γ = 30年。(2) 長さの収縮: 宇宙船から見ると、惑星までの距離が 40 ly ÷ γ = 24 ly に縮んで見え、24 ly ÷ 0.80c = 30年。どちらも30年で一致します。'),
        tok('Time dilation is a real effect. In the Hafele–Keating experiment, atomic clocks flown on aeroplanes at ordinary speeds showed readings smaller than matching clocks left on the ground, by amounts consistent with relativity. It is an everyday effect in particle accelerators, whose particles travel very close to the speed of light, and it has been verified by muon decay experiments.',
          '知の理論(TOK): 時間の遅れは「本物の」効果です。ハーフェル・キーティング実験では、高精度な原子時計を飛行機に乗せて飛ばし、地上に残した時計と比べると、相対性理論の予測どおりのずれが見つかりました。光速に近い速さで粒子を走らせる加速器でも、日常的に必要な効果で、ミューオン崩壊の実験でも確かめられています。'),
      ] },
      { id: 'velocity', title: 'Addition of velocities', blocks: [
        p('S′ moves at constant speed v relative to S. An object has velocity u′ in S′ and u in S. The Galilean answer u = u′ + v cannot be right. Einstein showed that the Lorentz equations give:',
          'S′はSに対して一定の速さ v で動いています。ある物体の速度は、S′では u′、Sでは u です。ガリレイの答え u = u′ + v は、正しくありえません。アインシュタインは、ローレンツ変換から、次の式が出ることを示しました。'),
        eq('u = {u′ + v|1 + u′v/c²}', 'u′ = {u − v|1 − uv/c²}'),
        p('Example: S is the ground and S′ a rocket moving at 0.80c. The rocket fires a missile at 0.50c relative to the rocket. Then u = (0.50c + 0.80c) / (1 + 0.50 × 0.80) = 1.30c / 1.40 = 0.93c. The Galilean answer would be 1.30c, which is impossible. Whatever u′ and v are (below c), u is always less than c.',
          '例: Sを地面、S′を 0.80c で動くロケットとします。ロケットから見て 0.50c でミサイルを発射すると、u = (0.50c + 0.80c) / (1 + 0.50 × 0.80) = 1.30c ÷ 1.40 = 0.93c。ガリレイの足し算なら 1.30c になって、ありえません。u′ や v が c に近くても、u は、つねに c より小さくなります。'),
        ex('Worked example 6.8', 'A rocket moves at 0.90c relative to the ground and emits a beam of light forward. The rocket measures its speed as c. Show that ground observers also measure c.', ['u = (u′ + v) / (1 + u′v/c²) with v = 0.90c, u′ = c', 'u = (c + 0.90c) / (1 + c × 0.90c / c²) = 1.90c / 1.90 = c'], '光の速さ u′ = c を、速度の足し算の式に入れると、どんな v でも答えは c になります。これは、公準2(光速不変)を、式が自動的に満たしていることを表します。'),
        ex('Worked example 6.9', 'Two rockets move away from each other at 0.80c (A, to the left) and 0.90c (B, to the right) relative to the ground. What is the velocity of B as measured by A?', ['Let S = ground, S′ = rocket A, so v = −0.80c. Rocket B: u = +0.90c.', 'u′ = (u − v) / (1 − uv/c²) = (0.90c + 0.80c) / (1 + 0.72) = 1.70c / 1.72 = +0.988c ≈ +0.99c', 'Check from the other side: S′ = rocket B (v = +0.90c), u = −0.80c → u′ = (−0.80c − 0.90c)/(1 + 0.72) ≈ −0.99c.'], '「AからBを見た速度」を求めるので、Aの座標系をS′、地面をSにします。Aは左向きなので v = −0.80c(符号に注意)。答えは +0.988c ≈ 0.99c で、c を超えません。ガリレイの足し算なら 1.70c になってしまいます。逆にBからAを見ても、−0.99c になり、対称です。'),
      ] },
      { id: 'simultaneity', title: 'Simultaneity', blocks: [
        p('Suppose two events happen at the same time in S′, so Δt′ = 0. What is the time between them in S? The Lorentz equation gives Δt = γ(Δt′ + vΔx′/c²) = γ vΔx′/c². If Δx′ ≠ 0, the events are not simultaneous in other frames. If Δx′ = 0 (same place), they are simultaneous in every frame.',
          'S′で、2つのイベントが「同時」(Δt′ = 0)に起きたとします。Sでは、その間の時間はどうなるでしょうか。ローレンツ変換より、Δt = γ(Δt′ + vΔx′/c²) = γ vΔx′/c² です。Δx′ ≠ 0 なら、他の座標系では同時ではありません。Δx′ = 0(同じ場所)なら、どの座標系でも同時です。'),
        eq('Δt = γ(Δt′ + {v|c²}Δx′) = γ {v|c²} Δx′   (when Δt′ = 0)'),
        key('Events that are simultaneous for one observer and happen at different points in space are not simultaneous for another observer in relative motion. But if two events are simultaneous for one observer and take place at the same point in space, they are simultaneous for all observers.', '重要ポイント: ある観測者にとって同時で、異なる場所で起きたイベントは、相対運動をしている別の観測者には同時ではない。逆に、ある観測者にとって同時で、同じ場所で起きたイベントは、すべての観測者にとって同時。'),
        p('The train example. T stands in the middle of a train carriage moving to the right relative to the station. Light signals leave the ends A and B at the same time according to T, and reach T together. The ground observer G disagrees: the emissions happen at different places, so they are not simultaneous for G. The arrivals at T happen at one place, so they are simultaneous for G as well. Which signal left first according to G? T moves away from the signal from A (and towards the one from B), so A\'s signal has a longer way to go. Since both arrive at the same time at the same speed c, the signal from A must have been emitted before B\'s.',
          '電車の例です。Tは、駅に対して右へ動く車両の真ん中に立っています。Tから見て、車両の両端AとBから、同時に光が出て、同時にTに届きます。ところが地面のGは、「同時ではない」と言います。出発した場所が違うので、Gには同時ではありません。一方、Tに届く2つのイベントは同じ場所なので、Gにも同時です。Gから見て、先に出たのはどちらでしょう。TはAからの光から遠ざかり、Bからの光には近づくので、Aからの光は、より長い距離を進まなければなりません。同時に届き、速さも同じ c なので、Aの光のほうが、Bより先に出たことになります。'),
        chk('Check yourself 5', 'Two observers N and M are at rest on the ground. M is midway between two street lights and sees them turn on at the same time. (a) Does M receive light from the two lamps at the same time? (b) Do the lights turn on at the same time according to N? (c) Does N receive light from the two lamps at the same time?', '(a) Yes. (b) Yes. (c) No.', '答え: (a) はい(Mは真ん中にいるので、同時に届く)。(b) はい(NもMも地面で静止していて、同じ座標系。同時なのは座標系で決まる)。(c) いいえ(Nは真ん中にいないので、近いほうの光が先に届く)。「同時」かどうかは、観測者の運動で決まりますが、「見えるタイミング」は、位置でも変わります。区別しましょう。'),
        ex('Worked example 6.10', 'Redo the train situation quantitatively. The proper length of the train (frame S′) is 300 m and it moves at 0.98c to the right. According to the ground observer (frame S), which light is emitted first and by how much?', ['Δt′ = 0 and Δx′ = x′B − x′A = 300 m. γ = 1/√(1 − 0.98²) = 5.0', 'Δt = tB − tA = γ(Δt′ + vΔx′/c²) = 5.0 × (0 + 0.98c × 300 / c²) = +4.9 µs', 'The positive sign means tB > tA: the light from A was emitted 4.9 µs before the light from B.'], 'Δt′ = 0 と Δx′ = 300 m を、ローレンツ変換に入れるだけです。結果が正(+4.9 µs)ということは、Bのほうが遅れた、つまり「Aの光が4.9 µs 先に出た」ことを表します。'),
      ] },
      { id: 'muon', title: 'Muon decay', blocks: [
        p('Muons are particles like electrons but more massive and unstable; they decay into electrons with an average lifetime of about 2.2 × 10⁻⁶ s (μ⁻ → e⁻ + ν̄e + νμ). This is the lifetime when the muon is at rest: the proper time interval between creation and decay.',
          'ミューオンは、電子に似た粒子ですが、より重く、不安定で、平均寿命が約 2.2×10⁻⁶ s で電子に崩壊します(μ⁻ → e⁻ + ν̄e + νμ)。この寿命は、ミューオンが静止しているときのもの、つまり「生成から崩壊までの固有時間間隔」です。'),
        p('Consider a muon created at the top of a 3.0 km mountain, moving down at 0.99c. Without time dilation it would travel only 0.99 × 3×10⁸ × 2.2×10⁻⁶ = 0.653 km before decaying, so a detector at the foot would see electrons, not muons. But experiments see muons.',
          '高さ 3.0 km の山の頂上で、ミューオンが生成され、0.99c で下に向かいます。時間の遅れがなければ、崩壊するまでに進める距離は 0.99 × 3×10⁸ × 2.2×10⁻⁶ = 0.653 km だけで、山のふもとの検出器には、ミューオンではなく電子が届くはずです。ところが実験では、ミューオンが検出されます。'),
        eq('Earth frame: lifetime = γ × proper time = {2.2×10⁻⁶ s|√(1 − 0.99²)} = 1.56 × 10⁻⁵ s', 'Distance = 0.99 × 3×10⁸ × 1.56×10⁻⁵ = 4.63 km  >  3.0 km  ✓'),
        p('How does an observer riding with the muon explain it? For that observer the 3.0 km height is not a proper length (the Earth is moving up towards them), so it is length-contracted to 3.0 × √(1 − 0.99²) = 0.42 km. The Earth\'s surface approaches at 0.99c, meeting the muon after 0.42×10³ / (0.99 × 3×10⁸) = 1.4 × 10⁻⁶ s, before it decays. Both explanations agree.',
          'ミューオンに乗った観測者は、どう説明するでしょうか。この観測者にとっては、地上の観測者が測った 3.0 km は固有長さではありません(地球のほうが上に動いてくるため)。そのため 3.0 × √(1 − 0.99²) = 0.42 km に縮んで見えます。地表が 0.99c で近づいてくるので、出会うまでの時間は 0.42×10³ ÷ (0.99×3×10⁸) = 1.4×10⁻⁶ s。崩壊(2.2×10⁻⁶ s)の前に、地表に着くのです。2つの説明は、一致しています。'),
        key('Muon decay experiments are direct confirmations of time dilation and indirect confirmations of length contraction.', 'ミューオン崩壊の実験は、時間の遅れの直接の確認であり、長さの収縮の間接的な確認でもある。'),
        ex('Worked example 6.11', 'At SLAC, electrons with v = 0.960c travel 3.00 km. (a) Time according to the laboratory? (b) Time according to an observer travelling with the electrons? (c) The speed of the accelerator in the electrons\' rest frame?', ['(a) t = 3.00×10³ / (0.960 × 3.00×10⁸) = 1.04 × 10⁻⁵ s', '(b) Arrival at the start and the end happen at the same point for the electrons, so it is a proper time. γ = 1/√(1 − 0.960²) = 3.571; proper time = 1.04×10⁻⁵ / 3.571 = 2.91 × 10⁻⁶ s', '(c) For the electron, the track is length-contracted: 3.00 km / 3.571 = 0.840 km. Speed = 0.840×10³ / 2.91×10⁻⁶ = 2.89 × 10⁸ m s⁻¹ ≈ 0.96c'], '(a) は普通の「距離÷速さ」。(b) は、電子にとって「出発」と「到着」が同じ場所で起きる、つまり電子の時計が固有時間を測ります。γ で割ります。(c) 電子から見ると、加速器のほうが動いていて、長さが 3.00 km ÷ γ = 0.840 km に縮みます。距離÷時間 = 0.96c で、当然ながら、加速器の速さは、もとの 0.960c と一致します。'),
        ctx('Science in context: General arguments apply to special cases, not the other way around', 'Before Einstein, the Michelson–Morley experiment gave a puzzling result about the speed of light. One attempt to explain it was to assume that moving lengths appear shorter; Lorentz showed that using his transformation equations removed certain difficulties with electromagnetism. But it was Einstein who re-derived these equations from far more general principles, the postulates. Demanding that all inertial observers see the same laws of physics and the same speed of light in vacuum, the Lorentz equations emerge as the simplest linear equations that can achieve this.',
          '科学の文脈: 一般的な議論は特別な場合に当てはまるが、その逆は成り立たない。アインシュタインより前、マイケルソン・モーリーの実験が、光の速さについて不思議な結果を出していました。解決の試みの1つが「動く物体は縮んで見える」という仮定で、ローレンツは、自分の変換式を使うと、電磁気学の難問が解けることを示しました。しかし、それらの式を、はるかに一般的な原理(2つの公準)から導き直したのは、アインシュタインでした。「すべての慣性系で、同じ物理法則と、同じ真空中の光の速さ」を求めると、ローレンツ変換が、それを満たす最も簡単な1次式として出てくるのです。'),
      ] },
    ],
    reflect: ['Do you understand the concepts of time dilation and length contraction?', 'Do you understand how muon decay experiments provide evidence for relativity?'],
    reflectJa: ['時間の遅れと長さの収縮の考え方が分かる?', 'ミューオン崩壊の実験が、相対性理論の証拠になる理由が分かる?'],
    check: ['understand the effects of time dilation and length contraction', 'apply the relativistic velocity addition formula', 'describe how muon decay experiments provide evidence for relativity'],
    checkJa: ['時間の遅れと長さの収縮が分かる', '相対論的な速度の足し算の式が使える', 'ミューオン崩壊が相対性理論の証拠になる理由を説明できる'],
  },

  'A5-3': {
    code: 'A5.3', title: 'Spacetime diagrams', icon: 'spacetime',
    lead: 'A picture of relativity: events, worldlines and light cones on a diagram with ct on the vertical axis (Minkowski diagrams).',
    leadJa: '相対性理論を「絵」で理解します。縦軸に ct をとった図の上に、イベント、世界線、光円錐を描きます(ミンコフスキー図)。',
    goals: ['Use spacetime diagrams (Minkowski diagrams)', 'Find the speed of one frame from its axes', 'Read time dilation, length contraction and simultaneity from a diagram', 'Understand which events can cause which'],
    sections: [
      { id: 'basics', title: 'Spacetime diagrams, worldlines and light cones', blocks: [
        p('The idea of drawing relativistic phenomena on one diagram was introduced by H. Minkowski, one of Einstein\'s friends. In earlier chapters we plotted position (vertical) against time (horizontal). In relativity it is customary to swap the axes: time is vertical and position is horizontal. These are spacetime diagrams (also called Minkowski diagrams). It is convenient to plot ct instead of t on the vertical axis, so both axes have units of length.',
          '同じ図の上に、相対論の現象を描くアイデアは、アインシュタインの友人ミンコフスキーによるものです。これまでは、位置を縦、時間を横にとっていました。相対論では、時間を縦、位置を横にとる習慣があります。これが時空図(ミンコフスキー図)です。縦軸には t ではなく ct をとります。そうすると、縦軸も横軸も、長さの単位になります。'),
        p('Example: an event at x = 5.0 m and ct = 6.0 m has t = 6.0 / (3.0 × 10⁸) = 2.0 × 10⁻⁸ s. We read coordinates in the usual way, by drawing lines through the point parallel to the axes.',
          '例: x = 5.0 m、ct = 6.0 m のイベントは、t = 6.0 ÷ (3.0×10⁸) = 2.0×10⁻⁸ s です。座標は、いつもどおり、点から軸に平行な線を引いて読みます。'),
        h('Worldlines', '世界線'),
        p('A particle at rest at x = a stays at the same position as time goes by; the sequence of events forms a vertical line, called its worldline. A particle that starts at x = 0, t = 0 and moves at constant positive velocity has a slanted worldline. From the diagram, tan θ = x/(ct) = v/c, where θ is the angle between the worldline and the ct axis.',
          'x = a で静止している粒子は、時間がたっても同じ位置にいるので、そのイベントの並びは、縦の直線になります。これを「世界線」と呼びます。x = 0、t = 0 から、一定の正の速度で動く粒子の世界線は、斜めになります。図から、tan θ = x/(ct) = v/c です。ここで θ は、世界線と ct 軸のなす角です。'),
        eq('tan θ = {x|ct} = {v|c}'),
        key('The tangent of the angle between a worldline and the ct axis equals v/c. A photon has θ = 45°. Nothing can exceed c, so any particle\'s worldline makes an angle less than 45° with the ct axis.', '世界線と ct 軸のなす角の tan は、v/c に等しい。光子は 45°。c を超えるものはないので、あらゆる粒子の世界線は、ct 軸と 45° より小さい角をなす。'),
        fig('cone', 'Worldlines (left) and light cones (right). The blue worldline is impossible (faster than light). Events E could cause lie in the yellow future cone; events that could have influenced E lie in the blue past cone.', '左: いろいろな世界線。青い線は、光より速いのでありえません。右: 未来と過去の光円錐。イベントEが原因になりうる出来事は、黄色の(未来の)領域、Eに影響を与えられた出来事は、青の(過去の)領域に入ります。'),
        p('Event E (for example an explosion) could cause an event L (the glass of a window shattering) only if L lies in the yellow region, because the fastest signal travels at c. So the signal from E to L must lie within that region.',
          'イベントE(たとえば爆発)が、イベントL(窓ガラスが割れる)の原因になれるのは、Lが黄色の領域にあるときだけです。いちばん速い信号でも、速さ c だからです。EからLへの信号は、この領域の中に収まらなければなりません。'),
        tip('An event E can be the cause of an event L if the time separating E and L is greater than or equal to the travel time of a photon from the position of E to that of L.', '試験のコツ: EがLの原因になれるのは、EとLの時間差が、光がEの位置からLの位置まで進む時間以上のとき。'),
      ] },
      { id: 'axes', title: 'Two frames on one diagram: the primed axes', blocks: [
        p('Axes do not have to be perpendicular. On a diagram with slanted axes, we find the coordinates of a point by drawing lines parallel to the axes and seeing where they cut the axes.',
          '座標軸は、直角でなくても構いません。斜めの軸の図でも、点から軸に平行な線を引いて、軸と交わる場所を読めば、座標が分かります。'),
        p('Now take a second inertial frame S′ moving to the right at speed v, with origins coinciding at t = t′ = 0. The worldline of the origin of S′ is the set of events with x′ = 0, so it is the ct′ axis. It makes an angle θ = tan⁻¹(v/c) with the ct axis. The x′ axis must make the same angle θ with the x axis: a photon sent out from the origin has distance L and time L/c in S′, so its speed in S′ is also c, and its 45° worldline must be the mirror line between the two axes. So the primed axes are tilted symmetrically about the 45° line.',
          '次に、右へ速さ v で動く、別の慣性系S′を考えます。t = t′ = 0 で原点が重なっているとします。S′の原点の世界線は、x′ = 0 のイベントの集まりなので、S′の ct′ 軸です。この軸は、ct 軸と θ = tan⁻¹(v/c) の角をなします。x′ 軸は、x 軸と同じ角 θ をなしていなければなりません。原点から出た光は、S′でも速さ c でなければならず、そのための 45° の世界線が、2つの軸の「鏡の線」になるからです。つまり、S′の軸は、45°の線に対して対称に傾きます。'),
        fig('axes', 'The primed axes (red). The ct′ axis is the worldline of the origin of S′; the x′ axis is tilted by the same angle towards the photon line. Marks on the primed axes are not at 1 m by the ruler: the scale is different.', '赤い軸がS′の軸。ct′ 軸はS′の原点の世界線で、x′ 軸は、45°の線のまわりに、対称な角度に傾きます。赤い軸の目盛り「1」は、定規で測った1 mではありません。目盛りの大きさが、黒い軸とは違います。'),
        ex('Worked example 6.12', 'Use the spacetime diagram (Figure 6.26) to estimate the speed of S′ relative to S.', ['On the diagram the ct′ axis rises 5.0 m in ct while moving 3.0 m in x.', 'tan θ = 3.0 / 5.0 = 0.60 = v/c  ⇒  v = 0.60c'], 'ct′ 軸の傾きを読み取るだけです。x の変化 ÷ ct の変化 = v/c です。縦に 5.0、横に 3.0 なので、v/c = 0.60。'),
        h('Finding the scale on the primed axes', '赤い軸の目盛りを求める'),
        p('The red axes have a different scale from the black axes, so we cannot lay a ruler on x′ to find a length of 1. Instead use the Lorentz transformation. For S′ moving at 0.60c, γ = 1.25. The point x′ = 1, ct′ = 0 is at x = γ(x′ + vt′) = 1.25 in S. The point ct′ = 1, x′ = 0 is at ct = γ(ct′ + (v/c)x′) = 1.25 (and x = 0.75). So "1" on each primed axis is 1.25 on the black scale along the same direction.',
          '赤い軸の目盛りは、黒い軸と違うので、x′ 軸に定規を当てて「1」の長さを測る、ということはできません。代わりに、ローレンツ変換を使います。v = 0.60c のとき γ = 1.25。x′ = 1、ct′ = 0 の点は、Sでは x = γ(x′ + vt′) = 1.25。ct′ = 1、x′ = 0 の点は、Sでは ct = γ(ct′ + (v/c)x′) = 1.25(x は 0.75)。つまり、赤い軸の「1」は、黒い目盛りで 1.25 に当たる場所にあります。'),
        ex('Worked example 6.13', 'Find the scale on the red axes of a diagram where S′ moves at about 0.75c.', ['γ = 1/√(1 − 0.75²) ≈ 1.5.', 'The "1" on each red axis is where the blue lines meet them (about 1.5 on the black scale).'], 'v ≈ 0.75c を読み取り、γ を計算します(≈ 1.5)。「1」の印は、γ(≈ 1.5)を使って、赤い軸の上に付けます。速く動くほど、γ が大きく、印は、遠くに付きます。'),
      ] },
      { id: 'lc', title: 'Length contraction on a diagram', blocks: [
        p('Spacetime diagrams show length contraction very directly. Take a rod of proper length 1 m at rest in S′. Its left end is at x′ = 0 (the ct′ axis), its right end at x′ = 1 (a line parallel to the ct′ axis through the "1" mark). The observers in S measure the rod by recording both ends at the same time in S, i.e. along a line parallel to the x axis. The two worldlines cut the x axis at 0 and 0.8 m, so the rod is 0.8 m long in S.',
          '時空図は、長さの収縮を、とても直接的に見せてくれます。S′で静止している、固有長さ 1 m の棒を考えます。左端は x′ = 0(ct′ 軸)、右端は x′ = 1(「1」の印を通り、ct′ 軸に平行な線)です。Sの観測者は、Sでの同じ時刻に、両端を記録します。つまり、x 軸に平行な線の上で測ります。2本の世界線が x 軸と交わるのは 0 と 0.8 m の位置なので、Sでの棒の長さは 0.8 m です。'),
        fig('length', 'A rod at rest in S′ (red = left end, blue = right end). Measured at the same time in S, its length is 0.8 m < 1 m.', 'S′で静止した棒(赤が左端、青が右端)。Sの同じ時刻で測ると、長さは 0.8 m < 1 m になります。'),
        p('The same works the other way round: a rod of proper length 1 m at rest in S looks 0.8 m long to observers in S′ (the measurement is made along a line parallel to the x′ axis). Each observer sees the other\'s rod as shorter, and neither is wrong.',
          '逆の場合も同じです。Sで静止している固有長さ 1 m の棒は、S′の観測者には 0.8 m に見えます(測るのは x′ 軸に平行な線の上です)。どちらの観測者も、相手の棒が短く見え、どちらも間違っていません。'),
        tip('If the rod is moving, its length must be measured with the positions of its ends recorded at the same time. Only lengths in the direction of motion are contracted.', '試験のコツ: 棒が動いているなら、両端の位置を同じ時刻に記録して長さを測ること。縮むのは、運動の向きの長さだけ。'),
        tip('Do not be misled by Euclidean geometry! The length in S′ looks longer on the page, but it is not: the scales on the two sets of axes are different.', '試験のコツ: ふつうの(ユークリッド)幾何の感覚に、だまされないこと。紙の上では、S′の長さのほうが長く見えますが、そうではありません。2組の軸の目盛りが違うからです。'),
      ] },
      { id: 'td', title: 'Time dilation on a diagram', blocks: [
        p('A clock at rest at the origin of S′ ticks at O and again at P, where ct′ = 1. To find the duration according to S, draw a line through P parallel to the x axis; it meets the ct axis at Q. OQ is greater than 1 (1.25 for v = 0.60c). So the moving clock\'s tick lasts longer in S: time dilation.',
          'S′の原点に静止した時計が、Oでチクタクし、もう一度Pでチクタクします。Pは ct′ = 1 の点です。Sでの時間を調べるには、Pを通って x 軸に平行な線を引き、ct 軸と交わる点をQとします。OQは1より長くなります(v = 0.60c なら 1.25)。つまり、動く時計のチクタクは、Sでは長くかかる。これが時間の遅れです。'),
        fig('time', 'The green line is the worldline of a clock at rest in S′. The tick lasts ct′ = 1 at P, but ct = 1.25 at Q for S.', '緑の線は、S′で静止している時計の世界線。チクタクは、S′では ct′ = 1(点P)ですが、Sでは ct = 1.25(点Q)になります。'),
        p('Likewise, a clock at rest at the origin of S ticks at O and P (ct = 1). Draw a line from P parallel to the x′ axis; it meets the ct′ axis at Q, and OQ is longer than 1. So each observer sees the other\'s clock run slow.',
          '同様に、Sの原点に静止している時計が、OとP(ct = 1)でチクタクします。Pから x′ 軸に平行な線を引くと、ct′ 軸と交わる点Qができ、OQは1より長くなります。つまり、お互いに、相手の時計がゆっくり進んで見えます。'),
        tip('Do not be misled by Euclidean geometry! In triangle OPQ the hypotenuse OP should be the longest side. But the geometry of spacetime diagrams is not Euclidean, and the Pythagorean theorem does not hold.', '試験のコツ: ふつうの幾何の感覚に、だまされないこと。三角形OPQでは、斜辺OPがいちばん長いはずですが、時空図の幾何はユークリッド幾何ではないので、ピタゴラスの定理は成り立ちません。'),
      ] },
      { id: 'sim', title: 'Simultaneity on a diagram', blocks: [
        p('Simultaneity is easy to see on a spacetime diagram. In the textbook figure, events A and B are simultaneous in S (ct = 1.2 for both); they lie on a line parallel to the x axis. In S′ they are not simultaneous: B occurs first. How much earlier? Take Δx = 1.0 − 0.5 = 0.5 m and Δt = 0:',
          '同時かどうかは、時空図ではとても分かりやすくなります。教科書の図では、イベントAとBはSで同時(どちらも ct = 1.2)で、x 軸に平行な線の上に並びます。S′では同時ではなく、Bのほうが先に起きます。どれだけ先でしょう。Δx = 1.0 − 0.5 = 0.5 m、Δt = 0 を使います。'),
        eq('cΔt′ = c(t′B − t′A) = γ(cΔt − {v|c}Δx) = 1.25 × (0 − 0.60 × 0.5) = −0.38 m'),
        p('The negative sign means B occurs earlier in S′, as the diagram shows. Rule of thumb: events on a line parallel to the x axis are simultaneous in S; events on a line parallel to the x′ axis are simultaneous in S′.',
          '負の符号は、S′ではBのほうが先に起きることを表します。図が示すとおりです。覚え方: x 軸に平行な線の上のイベントは、Sで同時。x′ 軸に平行な線の上のイベントは、S′で同時。'),
        chk('Check yourself 6', 'A rocket moves past the ground. Two trees are hit by lightning at the instant the rocket is halfway between the trees, simultaneous as far as the rocket is concerned. Use a spacetime diagram to determine which tree is hit first according to the ground, and whether light from the strikes reaches the rocket at the same time.', 'The left tree was hit first according to the ground. Photon lines from the two strikes arrive at the rocket at the same time.', '答え: 地面から見ると、左の木が先に雷に打たれます。両方の雷からの光は、ロケットに同時に届きます。ロケットの観測者にとっては、ロケットが2本の木の真ん中にいる瞬間に、同時に雷が落ちていて、光は同時に届きます(光が届くのは、同じ場所のイベントなので、すべての観測者にとって同時です)。'),
        ex('Worked example 6.14', 'The diagram shows events A, B and C. List the events from earliest to latest in each frame.', ['In S (blue frame): A and C are simultaneous (on a line parallel to x) and occur after B.', 'In S′ (red frame): B and C are simultaneous (on a line parallel to x′) and occur before A.'], '各座標系の「同時の線」を、軸に平行に引いて、どのイベントが、その線の上に乗るかを見ます。軸が違えば、同時の線の向きも違い、イベントの順番も変わります。(ただし、原因と結果の関係にあるイベントの順番は、どの座標系でも入れ替わりません。)'),
        ex('Worked example 6.15', 'A spacecraft moves away from Earth at 0.60c. At ct = 0, as it begins to move, a flash of light leaves a space station at rest 4.0 ly from Earth (according to Earth). Using a spacetime diagram, estimate the time the flash reaches the spacecraft according to (a) Earth and (b) the spacecraft.', ['Draw the photon worldline leaving x = 4.0 ly at 45° and find where it meets the spacecraft\'s worldline.', '(a) Earth: 0.6ct + ct = 4  ⇒  ct = 2.5 ly', '(b) Spacecraft: the scale on its worldline uses γ = 1.25 (the "1" is at 1.25 on the black scale); measuring along the worldline gives ct′ = 2.0 ly.'], '光の世界線(45°)と、宇宙船の世界線(傾き 0.60)の交点を探します。地球側は、読み取るだけでも、式でも出せます。宇宙船側は、赤い軸の目盛りに γ = 1.25 を使うので、定規ではなく、目盛りの印を使って読みます。'),
        chk('Check yourself 7', 'Verify the conclusion of worked example 6.15 using Lorentz transformations.', 'In S the light reaches the spacecraft when 0.6ct + ct = 4, so ct = 2.5 ly and x = 0.6 × 2.5 = 1.5 ly. With γ = 1.25: ct′ = 1.25 × (2.5 − 0.6 × 1.5) = 2.0 ly.', '答え: 地球側で、ct = 2.5 ly、x = 1.5 ly。ローレンツ変換: ct′ = γ(ct − (v/c)x) = 1.25 × (2.5 − 0.6 × 1.5) = 2.0 ly。図から読んだ答えと一致します。'),
        ex('Worked example 6.16', 'Two stars, A at −3 ly and B at +3 ly, both explode at ct = 0. A spacecraft moving at +0.60c is at x = 0 when ct = 0. Use a spacetime diagram to decide (a) which star exploded first according to the spacecraft observers and (b) from which star the light reaches the spacecraft first.', ['Draw lines through the explosion events parallel to the spacecraft\'s x′ axis and see where they meet the ct′ axis: B exploded first.', 'Photon lines at 45° from A and B: the light from B arrives first.'], 'S′で同時な線は、x′ 軸に平行です。Bの爆発は、その線で見ると、ct′ 軸の「より下(早い)」にあるので、Bが先に爆発したことになります。光の到着は、45°の光線を引いて比べます。ここでも、宇宙船が、Bに向かって動いているので、Bの光が先に届きます。'),
        ctx('Science in context: The power of diagrams', 'Spacetime diagrams offer a simple, pictorial way of understanding relativity, and can resolve misunderstandings and "paradoxes". They are especially useful for seeing which events can or cannot cause one another. Feynman diagrams are another example, as is the use of vectors instead of components.',
          '科学の文脈: 図の力。時空図は、相対性理論を、単純で、絵として理解させてくれ、誤解や「パラドックス」を解消するのに使えます。どのイベントが原因になれるか、なれないかを知るのに、とくに便利です。ファインマン図や、成分ではなくベクトルを使うことも、同じ例です。'),
        p('Links: the formulas of special relativity make no sense when the speed of a material object reaches or exceeds c, so c is a limiting speed. But Newtonian mechanics says that, as long as we provide energy to a body, its speed grows without limit. So Newtonian mechanics must also be modified: mass and energy are equivalent and can be converted into each other (see Unit E).',
          'つながり(Links): 相対性理論の式は、物体の速さが c に達する、または超えると、意味をなしません。つまり c は、速さの限界です。ところが、ニュートン力学では、エネルギーを与え続ければ、速さはいくらでも増えます。そのため、ニュートン力学も修正が必要で、質量とエネルギーは同等で、たがいに変換できることになります(ユニットEで学びます)。'),
      ] },
    ],
    reflect: ['Can you find the speed of an object from its worldline on a spacetime diagram?', 'Can you explain time dilation using a spacetime diagram?', 'Can you explain length contraction using a spacetime diagram?'],
    reflectJa: ['時空図で、世界線から、物体の速さを求められる?', '時空図で、時間の遅れを説明できる?', '時空図で、長さの収縮を説明できる?'],
    check: ['understand the spacetime interval', 'work with spacetime diagrams', 'describe various events through spacetime diagrams'],
    checkJa: ['時空間隔が分かる', '時空図が使える', '時空図でいろいろなイベントを説明できる'],
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

// データ座標 (x: 0..2.2, ct: 0..2.2) → 画面。原点は (60, 270)
const U = 105;
const px = x => 60 + x * U, py = c => 270 - c * U;
function axesBase() {
  return `${arrow(px(-0.1), py(0), px(2.15), py(0))}${arrow(px(0), py(-0.1), px(0), py(2.15))}${txt(px(2.15) - 4, py(0) + 18, 'x / m')}${txt(px(0) + 8, py(2.15) + 4, 'ct / m')}`;
}
const redAxes = (v = 0.6) => `${arrow(px(0), py(0), px(2.0 * 1), py(2.0 * v), '#ff6b6b')}${arrow(px(0), py(0), px(2.0 * v * 0.8 + 0.2), py(2.0 * 0.8 + 0.2), '#ff6b6b')}`;
const lineThrough = (x0, c0, dx, dc, t0, t1, col, wd = 1.6, dash = '') => `<line x1="${px(x0 + dx * t0).toFixed(1)}" y1="${py(c0 + dc * t0).toFixed(1)}" x2="${px(x0 + dx * t1).toFixed(1)}" y2="${py(c0 + dc * t1).toFixed(1)}" stroke="${col}" stroke-width="${wd}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;

export const FIGS = {
  gamma() {
    const w = 520, h = 270, l = 56, b = 232, tw = 440, th = 200;
    let d = '';
    for (let i = 0; i <= 200; i++) { const v = i / 200 * 0.992, g = 1 / Math.sqrt(1 - v * v); if (g > 10) break; d += `${i ? 'L' : 'M'}${(l + v * tw).toFixed(1)} ${(b - (g - 0) / 10 * th).toFixed(1)}`; }
    const ticks = [0.2, 0.4, 0.6, 0.8, 1].map(v => `<line x1="${l + v * tw}" y1="${b}" x2="${l + v * tw}" y2="${b + 5}" stroke="${W}"/>${txt(l + v * tw - 8, b + 20, v)}`).join('') + [2, 4, 6, 8, 10].map(g => `<line x1="${l - 5}" y1="${b - g / 10 * th}" x2="${l}" y2="${b - g / 10 * th}" stroke="${W}"/>${txt(l - 26, b - g / 10 * th + 4, g)}`).join('');
    return svg(w, h, `${arrow(l, b, l + tw + 20, b)}${arrow(l, b, l, b - th - 18)}<path d="${d}" fill="none" stroke="#7fd4ff" stroke-width="2.4"/>${ticks}${txt(l - 12, 22, 'γ')}${txt(l + tw - 20, b + 38, 'v / c')}`, 'Gamma factor against v/c');
  },
  cone() {
    const w = 560, h = 270, cx1 = 130, cx2 = 410, o = 150;
    const left = `<g>${arrow(40, o, 230, o)}${arrow(cx1, 235, cx1, 20)}${txt(cx1 + 8, 24, 'ct')}${txt(222, o + 18, 'x')}
      <line x1="${cx1}" y1="${o}" x2="${cx1 - 80}" y2="${o - 120}" stroke="#ffd24a" stroke-width="2"/><line x1="${cx1}" y1="${o}" x2="${cx1 + 80}" y2="${o - 120}" stroke="#ffd24a" stroke-width="2"/>
      <line x1="${cx1}" y1="${o}" x2="${cx1 - 34}" y2="${o - 120}" stroke="#4ade80" stroke-width="2"/><line x1="${cx1}" y1="${o}" x2="${cx1 + 34}" y2="${o - 120}" stroke="#ff6b6b" stroke-width="2"/>
      <line x1="${cx1}" y1="${o}" x2="${cx1 + 112}" y2="${o - 48}" stroke="#38bdf8" stroke-width="2"/>${txt(cx1 - 128, o - 112, 'photon')}${txt(cx1 + 82, o - 112, 'photon')}${txt(cx1 + 60, o - 42, 'impossible', 'font-size="11"')}${txt(cx1 + 60, o - 28, 'worldline', 'font-size="11"')}</g>`;
    const right = `<g>${arrow(300, o, 520, o)}${arrow(cx2, 245, cx2, 18)}${txt(cx2 + 8, 22, 'ct')}${txt(512, o + 18, 'x')}
      <path d="M${cx2} ${o} L${cx2 - 100} ${o - 100} L${cx2 + 100} ${o - 100}Z" fill="#ffe14d" opacity=".9"/><path d="M${cx2} ${o} L${cx2 - 100} ${o + 100} L${cx2 + 100} ${o + 100}Z" fill="#29a8e8" opacity=".9"/><circle cx="${cx2}" cy="${o}" r="4" fill="${W}"/>${txt(cx2 + 8, o + 16, 'E')}</g>`;
    return svg(w, h, left + right, 'Worldlines and light cones');
  },
  axes() {
    const g = 1.25, v = 0.6;
    const dots = `<circle cx="${px(g * 1)}" cy="${py(g * v)}" r="4" fill="#ffd24a"/><circle cx="${px(g * v)}" cy="${py(g)}" r="4" fill="#ffd24a"/>`;
    return svg(440, 300, `${axesBase()}${arrow(px(0), py(0), px(0.92 * 1.9 * v), py(0.92 * 1.9), '#ff6b6b')}${arrow(px(0), py(0), px(0.92 * 1.9), py(0.92 * 1.9 * v), '#ff6b6b')}
      ${lineThrough(0, 0, 1, 1, 0, 2.05, '#ffd24a', 1.4, '5 4')}${dots}
      ${txt(px(g * v) - 62, py(g) - 6, "ct′ = 1", 'fill="#ffd24a"')}${txt(px(g) + 8, py(g * v) + 16, "x′ = 1", 'fill="#ffd24a"')}${txt(px(0.92 * 1.9 * v) - 34, py(0.92 * 1.9) - 4, "ct′", 'fill="#ff6b6b"')}${txt(px(0.92 * 1.9) + 6, py(0.92 * 1.9 * v), "x′", 'fill="#ff6b6b"')}${txt(px(1.55), py(1.62), 'photon', 'fill="#ffd24a" font-size="11"')}`, 'Primed axes on a spacetime diagram');
  },
  length() {
    const g = 1.25, v = 0.6;
    return svg(440, 300, `${axesBase()}${arrow(px(0), py(0), px(0.92 * 1.9 * v), py(0.92 * 1.9), '#ff6b6b')}${arrow(px(0), py(0), px(0.92 * 1.9), py(0.92 * 1.9 * v), '#ff6b6b')}
      ${lineThrough(g, g * v, v, 1, -0.75, 1.0, '#4aa8ff', 2)}<circle cx="${px(g)}" cy="${py(g * v)}" r="4" fill="${W}"/>
      <line x1="${px(0)}" y1="${py(0) - 8}" x2="${px(0.8)}" y2="${py(0) - 8}" stroke="#c084fc" stroke-width="3"/>${txt(px(0.15), py(0) - 14, 'L = 0.8 m', 'fill="#c084fc"')}
      ${txt(px(1.55), py(0.3), 'rod at rest in S′: 1 m', 'font-size="11"')}${txt(px(0.9), py(1.95), "ct′", 'fill="#ff6b6b"')}`, 'Length contraction on a spacetime diagram');
  },
  time() {
    const g = 1.25, v = 0.6;
    return svg(440, 300, `${axesBase()}${arrow(px(0), py(0), px(0.92 * 1.9 * v), py(0.92 * 1.9), '#ff6b6b')}${arrow(px(0), py(0), px(0.92 * 1.9), py(0.92 * 1.9 * v), '#ff6b6b')}
      ${lineThrough(0, 0, v, 1, 0, g, '#4ade80', 2.6)}<circle cx="${px(g * v)}" cy="${py(g)}" r="4.5" fill="${W}"/>${txt(px(g * v) + 8, py(g) - 4, 'P (ct′ = 1)')}
      ${lineThrough(0, g, 1, 0, 0, g * v, '#4ade80', 1.4, '5 4')}<circle cx="${px(0)}" cy="${py(g)}" r="4.5" fill="${W}"/>${txt(px(0) + 10, py(g) + 18, 'Q (ct = 1.25)')}`, 'Time dilation on a spacetime diagram');
  },
};
