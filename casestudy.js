// IB Computer Science 2027 ケーススタディ "Generative AI for image creation — a diffuse vision" の解説データ。
// level: 'both' = SL・HL 共通 / 'hl' = HL のみ。ref はブックレットの行番号。
export const GROUPS = [
  { id: 'big', title: 'The big picture', ja: '全体像' },
  { id: 'gen', title: 'Image generation', ja: '画像生成の種類' },
  { id: 'dif', title: 'Diffusion models', ja: '拡散モデル' },
  { id: 'qual', title: 'Quality & consistency', ja: '品質と一貫性' },
  { id: 'eth', title: 'Ethics & data', ja: '倫理とデータ' },
  { id: 'hl', title: 'HL only: GANs & hybrid models', ja: 'HLのみ: GANとハイブリッドモデル' },
];

export const TERMS = [
  // ---------- The big picture ----------
  { id: 'scenario', group: 'big', level: 'both', term: 'Scenario: Visionary Studios', ref: '1–14',
    en: `Visionary Studios is a creative design company evaluating generative AI to speed up the production of high-quality images for advertising campaigns, concept art and digital media. It compares three families of architecture: diffusion models, generative adversarial networks (GANs) and hybrid models. The case study asks you to understand how each works, what each is good (and bad) at, and what risks the company must manage. Standard level (SL) students study everything except GANs and hybrid models; higher level (HL) students study all of it.`,
    ja: `ビジュアリー・スタジオ（Visionary Studios）は広告・コンセプトアート・デジタルメディア向けの高品質な画像制作を効率化するため、生成AIの導入を検討しているデザイン会社です。比較対象は「拡散モデル」「敵対的生成ネットワーク（GAN）」「ハイブリッドモデル」の3系統。ケーススタディでは、それぞれの仕組み・得意不得意・会社が管理すべきリスクを理解することが求められます。SLはGANとハイブリッドモデル以外のすべて、HLはすべてが範囲です。` },
  { id: 'evaluate', group: 'big', level: 'both', term: 'Evaluating generative AI models', ref: '77–95',
    en: `The company judges a model on five factors. Output quality: resolution, photorealism and stylistic coherence with the project goals. Computational efficiency: can the existing infrastructure train and run the model without long delays? Training stability: some models are hard to stabilise and give repetitive or poor outputs, others train reliably but need more time and compute. Flexibility and scalability: can the model adapt to ads, concept art and branded assets, and grow with future projects? Consistency: uniform characters (character consistency) and outputs that follow the intended style (style adherence), which protects brand identity.`,
    ja: `モデルは5つの観点で評価されます。①出力品質：高解像度・写実性・プロジェクト目標に合った画風。②計算効率：既存の設備で、遅延なく学習・運用できるか。③学習の安定性：安定させにくく、同じような出力や質の低い出力になるモデルもあれば、安定していても時間と計算資源を多く要するモデルもある。④柔軟性と拡張性：広告・コンセプトアート・ブランド素材に適応でき、将来の案件にも拡大できるか。⑤一貫性：繰り返し登場するキャラクターを同じ見た目にする（キャラクターの一貫性）、指定した画風に沿わせる（スタイルの順守）ことで、ブランドの統一感を守ります。` },
  { id: 'ethics-overview', group: 'big', level: 'both', term: 'Ethical and legal considerations', ref: '96–105',
    en: `Using generative AI raises three issues the company cannot ignore. Dataset curation: training data must be carefully chosen so it does not include copyrighted material and complies with intellectual property law. Bias and fairness: datasets must be checked for biases that could produce exclusionary or inaccurate representations. Transparency and AI disclosure: clear guidelines should state when AI-generated content is used in the creative process, to maintain trust with clients and audiences.`,
    ja: `生成AIの利用には、会社が無視できない3つの問題があります。①データセットの選定（キュレーション）：著作物を含めず、知的財産法を守るよう学習データを慎重に選ぶ。②偏見と公平性：排除的・不正確な表現を生むバイアスがないか、データを評価する。③透明性とAIの開示：創作過程でAI生成物を使うときは明確な方針で開示し、顧客や視聴者との信頼を保つ。` },
  { id: 'challenges', group: 'big', level: 'both', term: 'Challenges & what is examined', ref: '106–122',
    en: `SL and HL: (1) manage the iterative denoising process of diffusion models and its heavy computational demands when producing photorealistic images; (2) handle the ethics of training on large datasets, focusing on intellectual property and bias mitigation. HL only: (3) balance the generator and discriminator in GANs to get realistic images; (4) judge how a hybrid model could balance the strengths and weaknesses of VAEs, GANs, flow-based models and diffusion models. Exam focus: SL students are not expected to know GANs or hybrid models. HL students should know diffusion models, GANs and hybrid models in depth, with a broad understanding of VAEs and flow-based models being sufficient.`,
    ja: `SL・HL共通：①拡散モデルの反復的なノイズ除去と、写実的な画像を作る際の大きな計算負荷への対処。②大規模データでの学習に伴う倫理（特に知的財産とバイアスの軽減）。HLのみ：③GANで生成器と識別器の性能のバランスを取り、リアルな画像を得ること。④VAE・GAN・フローベースモデル・拡散モデルの長所短所を、ハイブリッドモデルがどう釣り合わせるかの評価。試験の範囲：SLはGANとハイブリッドモデルを問われません。HLは拡散モデル・GAN・ハイブリッドモデルを深く、VAEとフローベースモデルは大まかな理解で十分です。` },

  // ---------- Image generation ----------
  { id: 'image-generation', group: 'gen', level: 'both', term: 'Image generation', ref: '15–34',
    en: `Image generation means using a generative AI model to create new images instead of only recognising or editing existing ones. The model learns patterns from a training dataset and then produces new images with similar characteristics. Approaches differ in how much control the user has: from a free-text prompt (text-to-image), to specific inputs such as labels or sketches (conditional), to no input at all (unconditional). The right choice depends on the creative and technical requirements.`,
    ja: `画像生成とは、既存の画像を識別・加工するのではなく、生成AIで新しい画像を作ることです。モデルは学習データからパターンを学び、似た特徴を持つ新しい画像を出力します。ユーザーがどれだけ内容を制御できるかによって、自由な文章（テキストから画像）、ラベルやスケッチなど特定の入力（条件付き）、入力なし（無条件）と方式が分かれ、創作上・技術上の要件に応じて選びます。` },
  { id: 'text-to-image', group: 'gen', level: 'both', term: 'Text-to-image generation', ref: '18–22',
    en: `Text-to-image models such as DALL·E and Stable Diffusion turn a written prompt into an image. The text is converted into numerical representations that steer the generator, so creators can translate a detailed description (subject, mood, style) into visuals. It is especially useful for concept art and advertising, where specific themes or styles are required. A challenge is style adherence: the output must match the style or theme in the prompt.`,
    ja: `DALL·E や Stable Diffusion のようなテキストから画像を作るモデルは、文章（プロンプト）を画像に変換します。文章は数値表現に変換されて生成を導くため、被写体・雰囲気・画風といった詳細な説明をそのまま視覚化できます。特定のテーマや画風が求められるコンセプトアートや広告で特に有用です。課題は、プロンプトで指定した画風・テーマに出力を合わせる（スタイルの順守）ことです。` },
  { id: 'conditional', group: 'gen', level: 'both', term: 'Conditional image generation', ref: '23–29',
    en: `Conditional models generate an image based on a specific input (a condition) such as a class label, a sketch or a segmentation map. This keeps the output aligned with predefined objectives or artistic styles. Two examples in the booklet: class-conditional models, which generate a chosen category of image (e.g. animals or landscapes); and image-to-image translation, which transforms one type of image into another.`,
    ja: `条件付きモデルは、クラスラベル・スケッチ・セグメンテーションマップなど特定の入力（条件）に基づいて画像を生成します。これにより、出力を事前に決めた目的や芸術的スタイルに沿わせられます。ブックレットの例は、動物や風景など指定したカテゴリの画像を作る「クラス条件付きモデル」と、ある種類の画像を別の種類に変える「画像から画像への変換」です。` },
  { id: 'i2i', group: 'gen', level: 'both', term: 'Image-to-image translation', ref: '27–29',
    en: `Image-to-image translation converts an input image of one kind into an output image of another kind while keeping its underlying structure. Examples from the case study: turning a sketch into a realistic rendering, and converting a black-and-white image into colour. Other uses include turning a segmentation map into a photo-like scene. It is a type of conditional generation because the input image is the condition.`,
    ja: `画像から画像への変換は、ある種類の入力画像を、基本的な構造を保ったまま別の種類の画像に変換します。ケーススタディの例は、スケッチを写実的な描画にすること、白黒画像をカラーにすること。ほかにセグメンテーションマップを写真のような情景にする使い方もあります。入力画像が「条件」になるため、条件付き生成の一種です。` },
  { id: 'segmentation-map', group: 'gen', level: 'both', term: 'Segmentation map', ref: '24–25',
    en: `A segmentation map is an image in which every pixel (or region) is labelled with the kind of thing it represents, such as sky, tree, road or building, usually shown as flat colour blocks. Used as a condition, it tells the model where each object should be, giving precise control over layout, while the model fills in realistic textures and details.`,
    ja: `セグメンテーションマップは、すべてのピクセル（領域）に「空・木・道路・建物」など何を表すかのラベルを付けた画像で、通常は色の塊で表されます。条件として与えると、どこに何を置くかを正確に指定でき、モデルがリアルな質感や細部を補って画像を作ります。` },
  { id: 'unconditional', group: 'gen', level: 'both', term: 'Unconditional image generation', ref: '30–34',
    en: `Unconditional models create images with no predefined input, relying only on patterns learned from the training data. Because the creator does not steer the result, it suits exploratory creativity, abstract art and generating novel, unexpected visuals. It is also valuable for building synthetic datasets for AI training. The trade-off is less control over what is produced.`,
    ja: `無条件モデルは、事前に決めた入力なしで、学習データから得たパターンだけを頼りに画像を作ります。作り手が結果を誘導しないため、探索的な創作、抽象アート、斬新で予想外のビジュアルの生成に向きます。AI学習用の合成データセット作成にも有用です。その代わり、出力内容の制御は弱くなります。` },

  // ---------- Diffusion ----------
  { id: 'diffusion', group: 'dif', level: 'both', term: 'Diffusion model', ref: '35–45', fig: 'diffusion',
    en: `A diffusion model generates an image by iterative denoising. It starts from pure random noise (noise injection) and, over many steps, a neural denoiser refines it into a coherent image. Because the denoiser learned patterns from the training data, the content depends on that dataset: a model trained on animals might reveal cats and dogs, one trained on city images might produce urban scenes. Diffusion models excel at photorealistic images, but running many steps needs large computational resources, so optimising the process is crucial for practical use in creative industries.`,
    ja: `拡散モデルは「反復的なノイズ除去」で画像を作ります。完全なランダムノイズから出発し（ノイズ注入）、何ステップもかけてニューラルネットワークのデノイザーが整った画像へ磨き上げます。デノイザーは学習データのパターンを学んでいるので、出てくる内容は学習データ次第です（動物画像で学べば猫や犬、都市画像なら街並み）。写実的な画像が得意な一方、多数のステップに大きな計算資源が必要なため、実用上は処理の最適化が重要です。` },
  { id: 'noise-injection', group: 'dif', level: 'both', term: 'Noise injection', ref: '36–37',
    en: `Noise injection is introducing random noise as the starting point for image generation. In generation, the process begins from a noisy image (random values for every pixel). In training, noise is added to real images step by step so the model can learn to undo it. Different random noise gives different final images, which is why the same prompt can produce many variations.`,
    ja: `ノイズ注入とは、画像生成の出発点としてランダムなノイズを与えることです。生成時は全ピクセルがランダム値の「ノイズ画像」から始め、学習時は本物の画像に少しずつノイズを加えて、それを取り除く方法をモデルに覚えさせます。ノイズが違えば完成画像も変わるため、同じプロンプトでも多様な結果が得られます。` },
  { id: 'denoising', group: 'dif', level: 'both', term: 'Denoising', ref: '37–45, Fig. 1',
    en: `Denoising is removing noise from an image to recover clear content. In a diffusion model the denoiser does not remove everything at once; at each step it predicts and removes a little noise, gradually reconstructing features (rough shapes first, then fine detail) learned during training. Figure 1 shows the chain: noise → slightly clearer → … → a lorry or an aeroplane. The number of steps is what makes diffusion powerful but computationally expensive.`,
    ja: `ノイズ除去（デノイジング）は、画像からノイズを取り除いて内容を明瞭に戻すことです。拡散モデルでは一度にすべてを消すのではなく、各ステップで少しずつノイズを予測して取り除き、学習で得た特徴（まず大まかな形、次に細部）を徐々に再構築します。図1は、ノイズ → 少し鮮明 → … → トラックや飛行機、という流れを示します。このステップ数が、拡散モデルの強みであり計算コストの高さの原因でもあります。` },
  { id: 'cnn', group: 'dif', level: 'both', term: 'Convolutional neural network (CNN)', ref: '38–39',
    en: `A CNN is a neural network designed for image data. Small filters (kernels) slide across the image to detect local features such as edges and textures; deeper layers combine them into shapes and objects. Because the same filter is reused across the image, CNNs need fewer parameters than fully connected networks and handle position changes well. In diffusion models the neural denoiser is typically a CNN that looks at a noisy image and estimates the noise to remove.`,
    ja: `CNN（畳み込みニューラルネットワーク）は画像データ向けに設計されたニューラルネットワークです。小さなフィルタ（カーネル）が画像上をスライドして、エッジや質感などの局所的な特徴を検出し、深い層でそれらを組み合わせて形や物体を捉えます。同じフィルタを画像全体で使い回すため、全結合ネットワークよりパラメータが少なく、位置のずれにも強いのが利点です。拡散モデルのデノイザーは通常CNNで、ノイズ入りの画像を見て取り除くべきノイズを推定します。` },
  { id: 'ddpm', group: 'dif', level: 'both', term: 'Denoising diffusion probabilistic model (DDPM)', ref: '47–48',
    en: `DDPM is the formal framework behind modern diffusion models. It has two parts. The forward process gradually adds a small amount of random (Gaussian) noise to a training image over many steps until only noise remains. The reverse process is learned: a neural network is trained to predict and remove the noise at each step. To generate a new image, start with pure noise and apply the learned reverse steps. It formalises "gradually adding and removing noise during training and generation".`,
    ja: `DDPM（ノイズ除去拡散確率モデル）は、現代の拡散モデルの土台となる形式的な枠組みです。2つの過程からなります。順方向過程では、学習画像に少量のランダム（ガウス）ノイズを何ステップもかけて加え、最後にはノイズだけにします。逆方向過程は学習で獲得し、各ステップでノイズを予測して除去するネットワークを訓練します。新しい画像を作るときは、純粋なノイズから学習済みの逆過程を適用します。「学習と生成の際にノイズを徐々に加え、取り除く」過程を数式で扱えるようにしたものです。` },

  // ---------- Quality & consistency ----------
  { id: 'training-stability', group: 'qual', level: 'both', term: 'Training stability', ref: '83–85',
    en: `Training stability is how smoothly and reliably a model's training converges to good results. Unstable training can give repetitive or suboptimal outputs, wasted time and unpredictable quality. Some models are hard to stabilise; others train more reliably but need longer training times and more computational resources. This trade-off between stability, speed and cost is one of the evaluation factors for Visionary Studios.`,
    ja: `学習の安定性とは、モデルの学習が滑らかに、確実に良い結果へ収束するかどうかです。不安定だと、同じような出力や質の低い出力、時間の浪費、品質の予測不能につながります。安定させにくいモデルもあれば、安定して学習できるが学習時間と計算資源が多く必要なモデルもあります。この安定性・速度・コストのトレードオフが、ビジュアリー・スタジオの評価項目の一つです。` },
  { id: 'embedding', group: 'qual', level: 'both', term: 'Embedding-based approach', ref: '92–93',
    en: `An embedding is a list of numbers that represents the meaning or identity of something (a word, a style, a character) so that a model can work with it. In an embedding-based approach, a recurring character or motif is captured as an embedding and supplied to the model every time, so each image shows the same character. This helps achieve character consistency across a campaign.`,
    ja: `埋め込み（エンベディング）は、単語・画風・キャラクターなどの意味や特徴を数値のリストで表したもので、モデルが扱えるようにするものです。埋め込みベースの手法では、繰り返し登場するキャラクターやモチーフを埋め込みとして捉え、毎回モデルに与えることで、どの画像でも同じキャラクターを描かせます。キャンペーン全体での「キャラクターの一貫性」の実現に役立ちます。` },
  { id: 'character-consistency', group: 'qual', level: 'both', term: 'Character consistency', ref: '91–93',
    en: `Character consistency is the ability of a model to generate a uniform appearance for recurring characters or motifs across many images (same face, outfit, proportions, colours). It is critical for brand identity and artistic coherence, e.g. a mascot used throughout an advertising campaign. It is related to style adherence, where text-to-image generators must follow the intended artistic style. Embedding-based approaches can help.`,
    ja: `キャラクターの一貫性とは、繰り返し登場するキャラクターやモチーフを、多数の画像にわたって同じ見た目（顔・服装・プロポーション・色）で生成できる能力です。広告キャンペーン全体で使うマスコットのように、ブランドのアイデンティティと芸術的な統一感に不可欠です。テキストから画像を作るモデルが意図した画風に従う「スタイルの順守」とも関連し、埋め込みベースの手法が助けになります。` },

  // ---------- Ethics & data ----------
  { id: 'dataset-curation', group: 'eth', level: 'both', term: 'Dataset curation', ref: '99–101',
    en: `Dataset curation is the careful selection, cleaning, labelling and documentation of training data. Because a model can only reproduce what it learned, curation controls quality, diversity and legality. Visionary Studios must avoid copyrighted material and ensure compliance with intellectual property laws, and should record where data came from. Good curation also reduces bias and harmful content.`,
    ja: `データセットのキュレーションとは、学習データを慎重に選び、整え、ラベル付けし、記録することです。モデルは学習したものしか再現できないため、キュレーションがデータの品質・多様性・適法性を左右します。ビジュアリー・スタジオは著作物を避け、知的財産法を守る必要があり、データの出所も記録すべきです。適切なキュレーションはバイアスや有害なコンテンツの低減にもつながります。` },
  { id: 'bias-mitigation', group: 'eth', level: 'both', term: 'Bias mitigation', ref: '102–103, 111–112',
    en: `Bias mitigation means reducing unfair bias in training data and in the images a model produces. Biased datasets (for example, under-representing some groups) can lead to exclusionary or inaccurate representations. Methods include auditing datasets, collecting more diverse or balanced data, testing outputs for different groups, and human review. Visionary Studios must assess datasets for potential bias; it is both an ethical duty and a quality issue.`,
    ja: `バイアスの軽減とは、学習データやモデルが出力する画像に含まれる不公平な偏りを減らすことです。偏ったデータ（たとえば特定の集団の過小な表現）は、排除的・不正確な表現を生みます。対策には、データセットの監査、より多様でバランスの取れたデータの収集、集団ごとの出力テスト、人による確認などがあります。ビジュアリー・スタジオはデータの偏りを評価する必要があり、これは倫理上の責務であり品質の問題でもあります。` },

  // ---------- HL only ----------
  { id: 'gan', group: 'hl', level: 'hl', term: 'Generative adversarial network (GAN)', ref: '48–59, Fig. 2', fig: 'gan',
    en: `A GAN creates realistic images through an adversarial process between two neural networks trained together: a generator and a discriminator. The generator turns a D-dimensional noise vector into candidate (fake) images; the discriminator compares them with real images from the training dataset and predicts whether each is real or fake. The generator improves by learning to deceive the discriminator, and the discriminator improves at telling real from fake. GANs produce sharp, high-quality images, but training is sensitive and prone to instability and mode collapse.`,
    ja: `GANは、一緒に訓練される「生成器」と「識別器」という2つのニューラルネットワークの敵対的な過程によって、リアルな画像を作ります。生成器はD次元のノイズベクトルから候補（偽）画像を作り、識別器はそれを学習データの本物の画像と比べて本物か偽物かを予測します。生成器は識別器を欺くことで上達し、識別器は本物と偽物を見分ける力を高めます。シャープで高品質な画像が得られる反面、学習は繊細で、不安定さやモード崩壊が起きやすいのが課題です。` },
  { id: 'generator', group: 'hl', level: 'hl', term: 'Generator', ref: '49–51',
    en: `The generator is the network in a GAN that produces synthetic images. It takes a D-dimensional noise vector as input and transforms it into an image. It never sees real images directly; it learns only from the discriminator's feedback, adjusting its weights so that its fake images are judged "real" more often.`,
    ja: `生成器は、GANで合成画像を作るネットワークです。D次元のノイズベクトルを入力として受け取り、画像に変換します。本物の画像を直接見ることはなく、識別器からのフィードバックだけを頼りに、偽画像がより頻繁に「本物」と判定されるよう重みを調整して学習します。` },
  { id: 'discriminator', group: 'hl', level: 'hl', term: 'Discriminator', ref: '49–53',
    en: `The discriminator is the network in a GAN that evaluates images. It receives both real images from the training dataset and fake images from the generator, and outputs predicted labels (real or fake). It is trained to classify correctly, and its judgement is the training signal for the generator. In Figure 2 it sits between the images and the "predicted labels" box.`,
    ja: `識別器は、GANで画像を評価するネットワークです。学習データの本物の画像と、生成器が作った偽画像の両方を受け取り、予測ラベル（本物か偽物か）を出力します。正しく分類できるよう訓練され、その判断が生成器にとっての学習の手がかりになります。図2では、画像と「Predicted labels」の間に位置します。` },
  { id: 'noise-vector', group: 'hl', level: 'hl', term: 'D-dimensional noise vector', ref: '50, Fig. 2',
    en: `A D-dimensional noise vector is a list of D random numbers (for example sampled from a normal distribution) that is the generator's input. D is a chosen size, such as 100 or 512. Each different vector is a different "seed" and leads to a different image; vectors that are close together tend to give similar images. In Figure 2 it is drawn as a column of dots feeding the generator network.`,
    ja: `D次元ノイズベクトルは、生成器への入力となる、D個のランダムな数値のリスト（たとえば正規分布から抽出）です。Dは設計時に決める大きさ（100や512など）。ベクトルが違えば「種（シード）」が違い、別の画像になります。近いベクトルは似た画像になりやすい傾向があります。図2では、生成器に入る点の縦の列として描かれています。` },
  { id: 'adversarial', group: 'hl', level: 'hl', term: 'Adversarial dynamic', ref: '55–56',
    en: `The adversarial dynamic is the competition between the generator and the discriminator: a better discriminator forces the generator to improve, and a better generator forces the discriminator to improve. This push-and-pull is the key to a GAN's ability to produce sharp, high-quality images. If one side becomes much stronger than the other, learning stalls, which is why the process is highly sensitive and balancing the two networks is a stated challenge.`,
    ja: `敵対的ダイナミクスとは、生成器と識別器の競い合いのことです。識別器が賢くなれば生成器は改善を迫られ、生成器が賢くなれば識別器も改善を迫られます。この引っ張り合いが、GANがシャープで高品質な画像を作れる鍵です。片方が強くなりすぎると学習が進まなくなるため、過程は非常に繊細で、2つのネットワークのバランスを取ることがケーススタディの課題として挙げられています。` },
  { id: 'mode-collapse', group: 'hl', level: 'hl', term: 'Mode collapse', ref: '56–59',
    en: `Mode collapse is a GAN failure in which the generator produces only a limited variety of images (sometimes almost identical) instead of capturing the full diversity of the dataset. It happens when the generator finds a few outputs that reliably fool the discriminator and keeps repeating them. It is a form of poor training stability. Mitigation techniques exist, for example modified loss functions, giving the discriminator several samples at once, or more diverse training data.`,
    ja: `モード崩壊は、GANの失敗の一つで、生成器がデータセット全体の多様性を捉えず、限られた種類（ほぼ同じ）の画像しか作らなくなる現象です。識別器を確実に欺ける少数の出力を見つけ、それを繰り返すことで起こります。学習の不安定さの一形態です。対策として、損失関数の改良、識別器に複数のサンプルを同時に見せる、より多様な学習データを使う、などが提案されています。` },
  { id: 'hybrid', group: 'hl', level: 'hl', term: 'Hybrid model', ref: '60–75',
    en: `A hybrid model combines different types of generative AI to overcome the limitations of any single approach. By blending models, it can produce higher-quality images and offer better control over output attributes and more flexibility for different creative needs. Examples of components: variational autoencoders (VAEs), flow-based models, GANs and diffusion models. Combining their strengths gives more reliable, consistent and high-quality image generation systems, at the cost of extra complexity.`,
    ja: `ハイブリッドモデルは、単一の手法の限界を補うために、異なる種類の生成AIを組み合わせたものです。モデルを組み合わせることで、より高品質な画像を作れ、出力の属性をより細かく制御でき、さまざまな創作ニーズに柔軟に対応できます。構成要素の例は、変分オートエンコーダ（VAE）、フローベースモデル、GAN、拡散モデル。それぞれの長所を合わせて、より信頼でき一貫した高品質な画像生成システムを作れますが、その分複雑さが増します。` },
  { id: 'vae', group: 'hl', level: 'hl', term: 'Variational autoencoder (VAE)', ref: '65–69',
    en: `A VAE has an encoder that compresses an image into a compact representation in a latent space, and a decoder that rebuilds an image from that representation. Because the latent space is organised so similar images sit close together, you can modify an image or generate variations by exploring the latent space. VAEs are useful when flexibility, experimentation or artistic exploration is important. (HL: a broad understanding is sufficient.)`,
    ja: `VAEは、画像を潜在空間のコンパクトな表現に圧縮する「エンコーダ」と、その表現から画像を再構築する「デコーダ」からなります。潜在空間は似た画像が近くに配置されるよう整理されているので、潜在空間を探索することで画像を修正したり、バリエーションを作ったりできます。柔軟性・実験・芸術的な探求が重要な場面で有用です。（HLでは大まかな理解で十分です。）` },
  { id: 'latent-space', group: 'hl', level: 'hl', term: 'Latent space', ref: '65–68',
    en: `A latent space is a compressed, organised version of the original data in which each image is a point. Similar images are placed closer together, so moving smoothly from one point to another gives a smooth change between images (for example from one face to another). Models such as VAEs let users explore this space to modify and generate images in different ways.`,
    ja: `潜在空間は、元のデータを圧縮して整理した表現の空間で、各画像が1つの点になります。似た画像ほど近くに置かれるため、ある点から別の点へ滑らかに動かすと、画像も滑らかに変化します（たとえばある顔から別の顔へ）。VAEなどでは、この空間を探索して、さまざまな方法で画像を修正・生成できます。` },
  { id: 'flow', group: 'hl', level: 'hl', term: 'Flow-based model', ref: '70–73',
    en: `A flow-based model learns an exact mapping between random noise and realistic images, and this mapping can be reversed without loss. So it can generate new images from noise and also trace how each image was formed by running the mapping backwards. Flow-based models are useful when precision, reproducibility or transparency in the generation process is important. (HL: a broad understanding is sufficient.)`,
    ja: `フローベースモデルは、ランダムなノイズとリアルな画像の間の正確な対応づけを学習し、その対応づけは損失なく逆向きにもたどれます。そのためノイズから新しい画像を作れるだけでなく、逆向きに計算して各画像がどう作られたかを追跡できます。生成過程の精密さ・再現性・透明性が重要な場面で有用です。（HLでは大まかな理解で十分です。）` },
];

// ---------- 図(SVG / HTML) ----------
export const FIGS = {
  gan: `<svg class="cs-fig" viewBox="0 0 640 250" role="img" aria-label="GAN image creation process">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fff"/></marker></defs>
    <g fill="none" stroke="#fff" stroke-width="1.6">
      <rect x="40" y="20" width="70" height="56" rx="4"/><path d="M48 66l16-22 12 14 10-8 14 16" stroke-width="1.4"/>
      <rect x="250" y="26" width="120" height="48" rx="8"/><rect x="40" y="150" width="14" height="70" rx="7" stroke-dasharray="2 5"/>
      <rect x="120" y="156" width="130" height="58" rx="8" fill="#fff"/><rect x="330" y="150" width="70" height="56" rx="4"/><path d="M338 196l16-22 12 14 10-8 14 16" stroke-width="1.4"/>
      <rect x="470" y="34" width="130" height="34" rx="8" fill="#fff"/>
      <path d="M115 50H248" marker-end="url(#ah)"/><path d="M372 50H468" marker-end="url(#ah)"/><path d="M60 185H118" marker-end="url(#ah)"/><path d="M252 185H328" marker-end="url(#ah)"/><path d="M365 148V78" marker-end="url(#ah)" transform="translate(-30 0)"/>
    </g>
    <g fill="#fff" font-family="Georgia, serif" font-size="14" text-anchor="middle"><text x="75" y="14">Real images</text><text x="310" y="46">Discriminator</text><text x="310" y="63">network</text><text x="365" y="228">Fake images</text><text x="40" y="238" text-anchor="start">D-dimensional noise vector</text></g>
    <g fill="#08080c" font-family="Georgia, serif" font-size="14" text-anchor="middle"><text x="185" y="180">Generator</text><text x="185" y="198">network</text><text x="535" y="56">Predicted labels</text></g>
  </svg>`,
  diffusion: `<div class="cs-denoise" aria-label="The denoising process used in diffusion models">${Array.from({ length: 9 }, (_, i) => `<span style="--n:${(1 - i / 8).toFixed(2)}"></span>`).join('')}<p>noise → denoise → denoise → … → image</p></div>`,
};
