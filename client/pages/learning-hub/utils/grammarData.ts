export interface GrammarExample {
  zh: string;
  py: string;
  en: string;
}

export interface GrammarPoint {
  id: string;
  title: string;
  chinese: string;
  description: string;
  examples: GrammarExample[];
}

export const grammarData: Record<number, GrammarPoint[]> = {
  1: [
    {
      id: "hsk1-1",
      title: "Ability and possibility with 能",
      chinese: "能 (néng)",
      description: "Used to express ability or possibility, often translated as 'can' or 'be able to'.",
      examples: [
        { zh: "我能说汉语。", py: "Wǒ néng shuō Hànyǔ.", en: "I can speak Chinese." },
        { zh: "明天你能来吗？", py: "Míngtiān nǐ néng lái ma?", en: "Can you come tomorrow?" }
      ]
    },
    {
      id: "hsk1-2",
      title: "Classifiers",
      chinese: "量词 (liàngcí)",
      description: "Measure words used between a number/demonstrative and a noun.",
      examples: [
        { zh: "一个人", py: "yī gè rén", en: "one person" },
        { zh: "三本书", py: "sān běn shū", en: "three books" }
      ]
    },
    {
      id: "hsk1-3",
      title: "Common question words",
      chinese: "疑问代词 (yíwèn dàicí)",
      description: "Words like 谁 (shéi - who), 什么 (shénme - what), 哪儿 (nǎr - where), 怎么 (zěnme - how).",
      examples: [
        { zh: "你是谁？", py: "Nǐ shì shéi?", en: "Who are you?" },
        { zh: "这是什么？", py: "Zhè shì shénme?", en: "What is this?" }
      ]
    },
    {
      id: "hsk1-4",
      title: "Completed actions with 了",
      chinese: "了 (le)",
      description: "Indicates that an action has been completed or a change of state has occurred.",
      examples: [
        { zh: "我吃饭了。", py: "Wǒ chīfàn le.", en: "I have eaten." },
        { zh: "他去了北京。", py: "Tā qùle Běijīng.", en: "He went to Beijing." }
      ]
    },
    {
      id: "hsk1-5",
      title: "Emphasizing with 太…(了)",
      chinese: "太…了 (tài…le)",
      description: "Used to express 'too' or 'extremely'.",
      examples: [
        { zh: "太好了！", py: "Tài hǎo le!", en: "Great!" },
        { zh: "这个太贵了。", py: "Zhège tài guì le.", en: "This is too expensive." }
      ]
    },
    {
      id: "hsk1-6",
      title: "Expressing a learned skill with 会",
      chinese: "会 (huì)",
      description: "Used to express a skill that has been learned, like speaking a language or driving.",
      examples: [
        { zh: "我会开车。", py: "Wǒ huì kāichē.", en: "I can drive." },
        { zh: "你会说英语吗？", py: "Nǐ huì shuō Yīngyǔ ma?", en: "Can you speak English?" }
      ]
    },
    {
      id: "hsk1-7",
      title: "Negation with 不",
      chinese: "不 (bù)",
      description: "The most common way to negate verbs and adjectives in the present and future.",
      examples: [
        { zh: "我不去。", py: "Wǒ bù qù.", en: "I am not going." },
        { zh: "他不高兴。", py: "Tā bù gāoxìng.", en: "He is not happy." }
      ]
    },
    {
      id: "hsk1-8",
      title: "Negation with 没(有)",
      chinese: "没(有) (méiyǒu)",
      description: "Used to negate past actions or the verb 'to have' (有).",
      examples: [
        { zh: "我没有钱。", py: "Wǒ méiyǒu qián.", en: "I don't have money." },
        { zh: "他没去学校。", py: "Tā méi qù xuéxiào.", en: "He didn't go to school." }
      ]
    },
    {
      id: "hsk1-9",
      title: "Possessive 的",
      chinese: "的 (de)",
      description: "A particle used to indicate possession or to link an adjective to a noun.",
      examples: [
        { zh: "我的书", py: "wǒ de shū", en: "my book" },
        { zh: "漂亮的衣服", py: "piàoliang de yīfu", en: "beautiful clothes" }
      ]
    },
    {
      id: "hsk1-10",
      title: "Questions with 吗",
      chinese: "吗 (ma)",
      description: "A particle added to the end of a statement to turn it into a yes/no question.",
      examples: [
        { zh: "你好吗？", py: "Nǐ hǎo ma?", en: "How are you?" },
        { zh: "他是老师吗？", py: "Tā shì lǎoshī ma?", en: "Is he a teacher?" }
      ]
    },
    {
      id: "hsk1-11",
      title: "Questions with 呢",
      chinese: "呢 (ne)",
      description: "Used for 'and you?' type questions or to ask about the location of something.",
      examples: [
        { zh: "我很好，你呢？", py: "Wǒ hěn hǎo, nǐ ne?", en: "I'm fine, and you?" },
        { zh: "我的书呢？", py: "Wǒ de shū ne?", en: "Where is my book?" }
      ]
    },
    {
      id: "hsk1-12",
      title: "Questions with 哪",
      chinese: "哪 (nǎ)",
      description: "Means 'which'. Often used with a measure word.",
      examples: [
        { zh: "你是哪国人？", py: "Nǐ shì nǎ guó rén?", en: "Which country are you from?" },
        { zh: "哪本书是你的？", py: "Nǎ běn shū shì nǐ de?", en: "Which book is yours?" }
      ]
    },
    {
      id: "hsk1-13",
      title: "“All” with 都",
      chinese: "都 (dōu)",
      description: "Used to mean 'all' or 'both'. It always comes after the subject it refers to.",
      examples: [
        { zh: "我们都是学生。", py: "Wǒmen dōu shì xuésheng.", en: "We are all students." },
        { zh: "他们都去了。", py: "Tāmen dōu qùle.", en: "They all went." }
      ]
    },
    {
      id: "hsk1-14",
      title: "“Also” with 也",
      chinese: "也 (yě)",
      description: "Means 'also' or 'too'. It comes after the subject and before the verb/adjective.",
      examples: [
        { zh: "我也是老师。", py: "Wǒ yě shì lǎoshī.", en: "I am also a teacher." },
        { zh: "他也喜欢看书。", py: "Tā yě xǐhuan kànshū.", en: "He also likes reading." }
      ]
    },
    {
      id: "hsk1-15",
      title: "“How many” with 几",
      chinese: "几 (jǐ)",
      description: "Used to ask about small numbers (usually less than 10). Needs a measure word.",
      examples: [
        { zh: "你家有几口人？", py: "Nǐ jiā yǒu jǐ kǒu rén?", en: "How many people are in your family?" },
        { zh: "现在几点？", py: "Xiànzài jǐ diǎn?", en: "What time is it?" }
      ]
    },
    {
      id: "hsk1-16",
      title: "“How many” with 多少",
      chinese: "多少 (duōshǎo)",
      description: "Used to ask about any quantity. Doesn't strictly require a measure word.",
      examples: [
        { zh: "你们学校有多少学生？", py: "Nǐmen xuéxiào yǒu duōshǎo xuésheng?", en: "How many students are in your school?" },
        { zh: "这个多少钱？", py: "Zhège duōshǎo qián?", en: "How much is this?" }
      ]
    },
    {
      id: "hsk1-17",
      title: "“Many” with 多",
      chinese: "多 (duō)",
      description: "Means 'many' or 'much'. Also used in questions about degree (how old, how far).",
      examples: [
        { zh: "这里有很多人。", py: "Zhèlǐ yǒu hěn duō rén.", en: "There are many people here." },
        { zh: "你多大？", py: "Nǐ duō dà?", en: "How old are you?" }
      ]
    }
  ],
  2: [
    {
      id: "hsk2-1",
      title: "Actions in progress with 在 / 正在",
      chinese: "在 / 正在 (zài / zhèngzài)",
      description: "Indicates that an action is currently happening.",
      examples: [
        { zh: "我在看书。", py: "Wǒ zài kànshū.", en: "I am reading." },
        { zh: "他正在打电话。", py: "Tā zhèngzài dǎ diànhuà.", en: "He is making a phone call." }
      ]
    },
    {
      id: "hsk2-2",
      title: "Adjective reduplication (AA)",
      chinese: "形容词重叠 (AA)",
      description: "Reduplicating a single-syllable adjective to add a feeling of 'lightness' or 'affection'.",
      examples: [
        { zh: "红红的脸", py: "hónghóng de liǎn", en: "rosy cheeks" },
        { zh: "慢慢走", py: "mànmàn zǒu", en: "walk slowly" }
      ]
    },
    {
      id: "hsk2-3",
      title: "Adjective reduplication (AABB)",
      chinese: "形容词重叠 (AABB)",
      description: "Reduplicating a two-syllable adjective (AB -> AABB) to intensify it.",
      examples: [
        { zh: "高高兴兴", py: "gāogāo-xìngxìng", en: "very happy" },
        { zh: "干干净净", py: "gāngān-jìngjìng", en: "very clean" }
      ]
    },
    {
      id: "hsk2-4",
      title: "Brief actions with 下 (xià)",
      chinese: "一下 (yīxià)",
      description: "Used after a verb to indicate a brief or try-out action.",
      examples: [
        { zh: "看一下", py: "kàn yīxià", en: "take a look" },
        { zh: "等一下", py: "děng yīxià", en: "wait a moment" }
      ]
    },
    {
      id: "hsk2-5",
      title: "Cause and effect with 因为…所以",
      chinese: "因为…所以 (yīnwèi…suǒyǐ)",
      description: "Used to express 'because... therefore...'.",
      examples: [
        { zh: "因为下雨，所以我不去。", py: "Yīnwèi xiàyǔ, suǒyǐ wǒ bù qù.", en: "Because it's raining, I'm not going." }
      ]
    },
    {
      id: "hsk2-6",
      title: "Change with 了",
      chinese: "了 (le)",
      description: "Indicates a new situation or a change of state.",
      examples: [
        { zh: "下雨了。", py: "Xiàyǔ le.", en: "It's started raining." },
        { zh: "他有女朋友了。", py: "Tā yǒu nǚpéngyou le.", en: "He has a girlfriend now." }
      ]
    },
    {
      id: "hsk2-7",
      title: "Comparison with 比 or 没有",
      chinese: "比 / 没有 (bǐ / méiyǒu)",
      description: "Used for comparison. A 比 B + Adj means A is more Adj than B.",
      examples: [
        { zh: "我比他高。", py: "Wǒ bǐ tā gāo.", en: "I am taller than him." },
        { zh: "他没有我高。", py: "Tā méiyǒu wǒ gāo.", en: "He is not as tall as me." }
      ]
    },
    {
      id: "hsk2-8",
      title: "Continuous action or state with 着",
      chinese: "着 (zhe)",
      description: "Indicates a continuous state or the manner in which an action is performed.",
      examples: [
        { zh: "门开着。", py: "Mén kāizhe.", en: "The door is open." },
        { zh: "他笑着说。", py: "Tā xiàozhe shuō.", en: "He said with a smile." }
      ]
    },
    {
      id: "hsk2-9",
      title: "Describing actions with 得",
      chinese: "得 (de)",
      description: "Used after a verb to introduce a complement that describes the degree or result.",
      examples: [
        { zh: "他说得很好。", py: "Tā shuō de hěn hǎo.", en: "He speaks very well." },
        { zh: "跑得快", py: "pǎo de kuài", en: "run fast" }
      ]
    },
    {
      id: "hsk2-10",
      title: "Distance with 离",
      chinese: "离 (lí)",
      description: "Used to indicate the distance between two places.",
      examples: [
        { zh: "我家离学校很远。", py: "Wǒ jiā lí xuéxiào hěn yuǎn.", en: "My house is far from school." }
      ]
    },
    {
      id: "hsk2-11",
      title: "Emphasizing with 是…的",
      chinese: "是…的 (shì…de)",
      description: "Used to emphasize a specific detail of a past event (time, place, manner).",
      examples: [
        { zh: "我是昨天来的。", py: "Wǒ shì zuótiān lái de.", en: "I came yesterday (emphasis on yesterday)." }
      ]
    },
    {
      id: "hsk2-12",
      title: "Frequency with 次",
      chinese: "次 (cì)",
      description: "Measure word for frequency (times).",
      examples: [
        { zh: "我去过三次北京。", py: "Wǒ qùguo sān cì Běijīng.", en: "I've been to Beijing three times." }
      ]
    },
    {
      id: "hsk2-13",
      title: "Modifying with 的",
      chinese: "的 (de)",
      description: "Linking an adjective or a phrase to a noun.",
      examples: [
        { zh: "我的朋友", py: "wǒ de péngyou", en: "my friend" },
        { zh: "买的菜", py: "mǎi de cài", en: "the food that was bought" }
      ]
    },
    {
      id: "hsk2-14",
      title: "Numbers",
      chinese: "数字 (shùzì)",
      description: "Expressing larger numbers and specific structures.",
      examples: [
        { zh: "一百二十", py: "yī bǎi èr shí", en: "120" }
      ]
    },
    {
      id: "hsk2-15",
      title: "Ordinal numbers",
      chinese: "序数词 (xùshùcí)",
      description: "Using 第 (dì) before a number to make it ordinal.",
      examples: [
        { zh: "第一", py: "dì yī", en: "first" },
        { zh: "第二次", py: "dì èr cì", en: "second time" }
      ]
    },
    {
      id: "hsk2-16",
      title: "Past experience with 过",
      chinese: "过 (guò)",
      description: "Indicates that someone has had the experience of doing something.",
      examples: [
        { zh: "我看过那个电影。", py: "Wǒ kànguo nàge diànyǐng.", en: "I have seen that movie." }
      ]
    },
    {
      id: "hsk2-17",
      title: "Permission and actions with 让",
      chinese: "让 (ràng)",
      description: "Means 'let' or 'make' (causative verb).",
      examples: [
        { zh: "他不让我去。", py: "Tā bù ràng wǒ qù.", en: "He doesn't let me go." }
      ]
    },
    {
      id: "hsk2-18",
      title: "Permission and possibility with 可以",
      chinese: "可以 (kěyǐ)",
      description: "Expressing permission or a suggestion.",
      examples: [
        { zh: "我可以进来吗？", py: "Wǒ kěyǐ jìnlái ma?", en: "May I come in?" }
      ]
    },
    {
      id: "hsk2-19",
      title: "Positive or affirmative tone with 的",
      chinese: "的 (de)",
      description: "Used at the end of a sentence to confirm a fact or add certainty.",
      examples: [
        { zh: "我会给你的。", py: "Wǒ huì gěi nǐ de.", en: "I will give it to you (for sure)." }
      ]
    },
    {
      id: "hsk2-20",
      title: "Requests with 请",
      chinese: "请 (qǐng)",
      description: "Used to make a polite request or invitation.",
      examples: [
        { zh: "请坐。", py: "Qǐng zuò.", en: "Please sit down." }
      ]
    },
    {
      id: "hsk2-21",
      title: "Suggestion or acknowledgment with 吧",
      chinese: "吧 (ba)",
      description: "A particle used for suggestions or to confirm a suspicion.",
      examples: [
        { zh: "我们走吧。", py: "Wǒmen zǒu ba.", en: "Let's go." },
        { zh: "你是学生吧？", py: "Nǐ shì xuésheng ba?", en: "You are a student, right?" }
      ]
    },
    {
      id: "hsk2-22",
      title: "Verb reduplication",
      chinese: "动词重叠",
      description: "Reduplicating a verb (AA or ABAB) to indicate a brief action or a relaxed manner.",
      examples: [
        { zh: "看看", py: "kànkan", en: "have a look" },
        { zh: "休息休息", py: "xiūxi xiūxi", en: "take a rest" }
      ]
    },
    {
      id: "hsk2-23",
      title: "“Giving” with 给",
      chinese: "给 (gěi)",
      description: "Means 'to give' or used to indicate the recipient of an action.",
      examples: [
        { zh: "他给我一本书。", py: "Tā gěi wǒ yī běn shū.", en: "He gave me a book." },
        { zh: "给我打电话。", py: "Gěi wǒ dǎ diànhuà.", en: "Give me a call." }
      ]
    },
    {
      id: "hsk2-24",
      title: "“Towards” with 往",
      chinese: "往 (wǎng)",
      description: "Used to indicate direction.",
      examples: [
        { zh: "往前走。", py: "Wǎng qián zǒu.", en: "Go forward." }
      ]
    },
    {
      id: "hsk2-25",
      title: "“Two” with 二 and 两",
      chinese: "二 (èr) / 两 (liǎng)",
      description: "二 is for counting and numbers; 两 is for quantities with measure words.",
      examples: [
        { zh: "十二", py: "shí èr", en: "12" },
        { zh: "两个", py: "liǎng gè", en: "two (items)" }
      ]
    },
    {
      id: "hsk2-26",
      title: "“Want” with 要",
      chinese: "要 (yào)",
      description: "Means 'want' or 'be going to'.",
      examples: [
        { zh: "我要买苹果。", py: "Wǒ yào mǎi píngguǒ.", en: "I want to buy apples." }
      ]
    }
  ],
  3: [
    {
      id: "hsk3-1",
      title: "Classifier reduplication",
      chinese: "量词重叠",
      description: "Reduplicating a measure word to mean 'every' or 'each'.",
      examples: [
        { zh: "个个都很漂亮。", py: "Gègè dōu hěn piàoliang.", en: "Every one is very beautiful." }
      ]
    },
    {
      id: "hsk3-2",
      title: "Comparison with 一样",
      chinese: "一样 (yīyàng)",
      description: "Used to express that two things are the same.",
      examples: [
        { zh: "我和你一样高。", py: "Wǒ hé nǐ yīyàng gāo.", en: "I am as tall as you." }
      ]
    },
    {
      id: "hsk3-3",
      title: "Comparison with 不如",
      chinese: "不如 (bùrú)",
      description: "Used to say 'not as good as' or 'A is not as... as B'.",
      examples: [
        { zh: "我不如他快。", py: "Wǒ bùrú tā kuài.", en: "I am not as fast as him." }
      ]
    },
    {
      id: "hsk3-4",
      title: "Comparison with 不比",
      chinese: "不比 (bùbǐ)",
      description: "Used to negate a comparison; means 'not more than'.",
      examples: [
        { zh: "我不比他矮。", py: "Wǒ bùbǐ tā ǎi.", en: "I am not shorter than him." }
      ]
    },
    {
      id: "hsk3-5",
      title: "Consecutive actions with 了",
      chinese: "了 (le)",
      description: "Using 了 between two verbs to show one action happens immediately after another.",
      examples: [
        { zh: "我下了课就回家。", py: "Wǒ xiàle kè jiù huíjiā.", en: "I'll go home as soon as class is over." }
      ]
    },
    {
      id: "hsk3-6",
      title: "Earliness or promptness with 就",
      chinese: "就 (jiù)",
      description: "Indicates that something happened earlier than expected or very quickly.",
      examples: [
        { zh: "他五点就起床了。", py: "Tā wǔ diǎn jiù qǐchuáng le.", en: "He got up as early as 5 AM." }
      ]
    },
    {
      id: "hsk3-7",
      title: "Emphasis with 就",
      chinese: "就 (jiù)",
      description: "Used to add emphasis to a fact, often meaning 'exactly' or 'precisely'.",
      examples: [
        { zh: "就是他！", py: "Jiù shì tā!", en: "It's exactly him!" }
      ]
    },
    {
      id: "hsk3-8",
      title: "False assumptions with 以为",
      chinese: "以为 (yǐwéi)",
      description: "Means 'to (mistakenly) think/believe'.",
      examples: [
        { zh: "我以为他是老师。", py: "Wǒ yǐwéi tā shì lǎoshī.", en: "I thought he was a teacher (but he isn't)." }
      ]
    },
    {
      id: "hsk3-9",
      title: "Judgments or opinions with 认为",
      chinese: "认为 (rènwéi)",
      description: "Means 'to think' or 'to consider' (a formal way to express an opinion).",
      examples: [
        { zh: "我认为这个主意不错。", py: "Wǒ rènwéi zhège zhǔyi bùcuò.", en: "I think this idea is not bad." }
      ]
    },
    {
      id: "hsk3-10",
      title: "Lateness with 才",
      chinese: "才 (cái)",
      description: "Indicates that something happened later than expected or with difficulty.",
      examples: [
        { zh: "他九点才来。", py: "Tā jiǔ diǎn cái lái.", en: "He didn't come until 9." }
      ]
    },
    {
      id: "hsk3-11",
      title: "Passive voice with 被",
      chinese: "被 (bèi)",
      description: "Used to form passive sentences (Receiver + 被 + Doer + Verb).",
      examples: [
        { zh: "苹果被他吃了。", py: "Píngguǒ bèi tā chī le.", en: "The apple was eaten by him." }
      ]
    },
    {
      id: "hsk3-12",
      title: "Reason or purpose with 为了 / 为",
      chinese: "为了 / 为 (wèile / wèi)",
      description: "Means 'for the sake of' or 'in order to'.",
      examples: [
        { zh: "为了学好汉语，他去了中国。", py: "Wèile xuéhǎo Hànyǔ, tā qùle Zhōngguó.", en: "In order to learn Chinese well, he went to China." }
      ]
    },
    {
      id: "hsk3-13",
      title: "Result complements",
      chinese: "结果补语",
      description: "Verbs like 好, 完, 到 added after a main verb to show the result of an action.",
      examples: [
        { zh: "做好了", py: "zuò hǎo le", en: "finished (and done well)" },
        { zh: "买到了", py: "mǎi dào le", en: "successfully bought" }
      ]
    },
    {
      id: "hsk3-14",
      title: "Simultaneous actions with 一边…一边…",
      chinese: "一边…一边… (yībiān…yībiān…)",
      description: "Used to express two actions happening at the same time.",
      examples: [
        { zh: "我一边吃饭一边看电视。", py: "Wǒ yībiān chīfàn yībiān kàn diànshì.", en: "I eat while watching TV." }
      ]
    },
    {
      id: "hsk3-15",
      title: "Talking about the future with 会",
      chinese: "会 (huì)",
      description: "Used to indicate that something will happen in the future.",
      examples: [
        { zh: "明天会下雨。", py: "Míngtiān huì xiàyǔ.", en: "It will rain tomorrow." }
      ]
    },
    {
      id: "hsk3-16",
      title: "Two possibilities with 不是…就是",
      chinese: "不是…就是 (bùshì…jiùshì)",
      description: "Means 'if it's not A, it's B' or 'either A or B'.",
      examples: [
        { zh: "他不是在办公室，就是在大厅。", py: "Tā bùshì zài bàngōngshì, jiùshì zài dàtīng.", en: "He is either in the office or in the hall." }
      ]
    },
    {
      id: "hsk3-17",
      title: "“Although” with 虽然",
      chinese: "虽然 (suīrán)",
      description: "Means 'although'. Often used with 但是 (dànshì) or 可是 (kěshì).",
      examples: [
        { zh: "虽然很累，但是他很高兴。", py: "Suīrán hěn lèi, dànshì tā hěn gāoxìng.", en: "Although he is tired, he is happy." }
      ]
    },
    {
      id: "hsk3-18",
      title: "“As soon as” with 一… 就",
      chinese: "一… 就 (yī… jiù)",
      description: "Means 'as soon as A happens, B happens'.",
      examples: [
        { zh: "他一回家就做作业。", py: "Tā yī huíjiā jiù zuò zuòyè.", en: "He does homework as soon as he gets home." }
      ]
    },
    {
      id: "hsk3-19",
      title: "“Besides” or “except” with 除了",
      chinese: "除了 (chúle)",
      description: "Used with 以外 (yǐwài) to mean 'except for' or 'besides'.",
      examples: [
        { zh: "除了他，大家都来了。", py: "Chúle tā, dàjiā dōu lái le.", en: "Everyone came except him." }
      ]
    },
    {
      id: "hsk3-20",
      title: "“If … then …” with 如果 / 要是…就",
      chinese: "如果 / 要是…就 (rúguǒ / yàoshi…jiù)",
      description: "Used to form conditional sentences.",
      examples: [
        { zh: "如果你有钱，你就买吧。", py: "Rúguǒ nǐ yǒu qián, nǐ jiù mǎi ba.", en: "If you have money, then buy it." }
      ]
    },
    {
      id: "hsk3-21",
      title: "“More and more” with 越来越…",
      chinese: "越来越… (yuèláiyuè…)",
      description: "Indicates a gradual increase over time.",
      examples: [
        { zh: "天气越来越热了。", py: "Tiānqì yuèláiyuè rè le.", en: "The weather is getting hotter and hotter." }
      ]
    },
    {
      id: "hsk3-22",
      title: "“On behalf of” with 为",
      chinese: "为 (wèi)",
      description: "Used to mean 'for' or 'on behalf of someone'.",
      examples: [
        { zh: "我为你感到高兴。", py: "Wǒ wèi nǐ gǎndào gāoxìng.", en: "I am happy for you." }
      ]
    },
    {
      id: "hsk3-23",
      title: "“The more…the more…” with 越…越…",
      chinese: "越…越… (yuè…yuè…)",
      description: "Used to express that the degree of one thing changes with another.",
      examples: [
        { zh: "汉语越学越有意思。", py: "Hànyǔ yuè xué yuè yǒuyìsi.", en: "The more I study Chinese, the more interesting it gets." }
      ]
    },
    {
      id: "hsk3-24",
      title: "为 (wèi) overview",
      chinese: "为 (wèi)",
      description: "A summary of the various uses of the particle 为.",
      examples: [
        { zh: "这是为你买的。", py: "Zhè shì wèi nǐ mǎi de.", en: "This was bought for you." }
      ]
    },
    {
      id: "hsk3-25",
      title: "把 (bǎ) sentences",
      chinese: "把 (bǎ)",
      description: "Used to shift the object to before the verb to emphasize what happened to it.",
      examples: [
        { zh: "我把作业做完了。", py: "Wǒ bǎ zuòyè zuò wán le.", en: "I finished my homework." }
      ]
    }
  ],
  4: [
    {
      id: "hsk4-1",
      title: "Compound directional complements",
      chinese: "复合趋向补语",
      description: "Combining a verb with two direction indicators (e.g., 进来, 跑过去).",
      examples: [
        { zh: "他跑进教室来了。", py: "Tā pǎo jìn jiàoshì lái le.", en: "He came running into the classroom." }
      ]
    },
    {
      id: "hsk4-2",
      title: "Describing actions with 得 (with an object)",
      chinese: "得 (de)",
      description: "Using the 得 complement structure when the verb has an object.",
      examples: [
        { zh: "他写汉字写得很漂亮。", py: "Tā xiě Hànzì xiě de hěn piàoliang.", en: "He writes Chinese characters very beautifully." }
      ]
    },
    {
      id: "hsk4-3",
      title: "Potential complements with 得 and 不",
      chinese: "可能补语",
      description: "Used to indicate whether an action can or cannot reach a certain result.",
      examples: [
        { zh: "听得懂", py: "tīng de dǒng", en: "can understand (by listening)" },
        { zh: "听不懂", py: "tīng bù dǒng", en: "cannot understand" }
      ]
    },
    {
      id: "hsk4-4",
      title: "Question word reduplication",
      chinese: "疑问代词重叠",
      description: "Reduplicating question words to mean 'any' or 'every'.",
      examples: [
        { zh: "谁都喜欢他。", py: "Shéi dōu xǐhuan tā.", en: "Everyone likes him." }
      ]
    },
    {
      id: "hsk4-5",
      title: "Separable Verbs",
      chinese: "离合词 (líhécí)",
      description: "Verbs that can be split to insert other words (e.g., 吃饭 -> 吃过饭).",
      examples: [
        { zh: "我们要见个面。", py: "Wǒmen yào jiàn gè miàn.", en: "We need to meet up." }
      ]
    },
    {
      id: "hsk4-6",
      title: "Simple directional complements",
      chinese: "简单趋向补语",
      description: "Using verbs like 来 and 去 after a main verb to show direction.",
      examples: [
        { zh: "他进来了。", py: "Tā jìnlái le.", en: "He came in." }
      ]
    },
    {
      id: "hsk4-7",
      title: "“As long as” with 只要",
      chinese: "只要 (zhǐyào)",
      description: "Means 'as long as' or 'provided that'.",
      examples: [
        { zh: "只要努力，你就能成功。", py: "Zhǐyào nǔlì, nǐ jiù néng chénggōng.", en: "As long as you work hard, you can succeed." }
      ]
    },
    {
      id: "hsk4-8",
      title: "“Even if” with 即使 / 就算",
      chinese: "即使 / 就算 (jíshǐ / jiùsuàn)",
      description: "Means 'even if' or 'even though'.",
      examples: [
        { zh: "即使下雨，我也要去。", py: "Jíshǐ xiàyǔ, wǒ yě yào qù.", en: "Even if it rains, I'm going." }
      ]
    },
    {
      id: "hsk4-9",
      title: "“Even” with 连…也 / 都",
      chinese: "连…也 / 都 (lián…yě / dōu)",
      description: "Used for emphasis, meaning 'even...'.",
      examples: [
        { zh: "他连我也没告诉。", py: "Tā lián wǒ yě méi gàosu.", en: "He didn't even tell me." }
      ]
    },
    {
      id: "hsk4-10",
      title: "“Every-” or “any-” with question words",
      chinese: "疑问代词活用",
      description: "Using question words as indefinite pronouns.",
      examples: [
        { zh: "你想去哪儿就去哪儿。", py: "Nǐ xiǎng qù nǎr jiù qù nǎr.", en: "Go wherever you want to go." }
      ]
    },
    {
      id: "hsk4-11",
      title: "“Only” with 只有…，才",
      chinese: "只有…，才 (zhǐyǒu…, cái)",
      description: "Means 'only if... then...'.",
      examples: [
        { zh: "只有努力，才能学好。", py: "Zhǐyǒu nǔlì, cáinéng xuéhǎo.", en: "Only by working hard can you learn well." }
      ]
    },
    {
      id: "hsk4-12",
      title: "“Regardless” with 无论 / 不管",
      chinese: "无论 / 不管 (wúlùn / bùguǎn)",
      description: "Means 'no matter' or 'regardless of'.",
      examples: [
        { zh: "不管他怎么说，我都不信。", py: "Bùguǎn tā zěnme shuō, wǒ dōu bù xìn.", en: "No matter what he says, I don't believe it." }
      ]
    },
    {
      id: "hsk4-13",
      title: "“Since” with 既然",
      chinese: "既然 (jìrán)",
      description: "Means 'since' or 'now that'.",
      examples: [
        { zh: "既然你来了，就坐下吧。", py: "Jìrán nǐ lái le, jiù zuòxià ba.", en: "Since you're here, sit down." }
      ]
    },
    {
      id: "hsk4-14",
      title: "“Some-” with question words",
      chinese: "疑问代词表示虚指",
      description: "Using question words to mean 'someone', 'something', 'somewhere'.",
      examples: [
        { zh: "我想买点什么。", py: "Wǒ xiǎng mǎi diǎn shénme.", en: "I want to buy something." }
      ]
    }
  ],
  5: [
    {
      id: "hsk5-1",
      title: "“Act as” or “regard as” with 为",
      chinese: "为 (wéi)",
      description: "Used to mean 'act as' or 'to be'. Often used in fixed expressions.",
      examples: [
        { zh: "以此为准。", py: "Yǐ cǐ wéi zhǔn.", en: "Use this as the standard." }
      ]
    }
  ],
  6: [
    {
      id: "hsk6-1",
      title: "Passive voice with 所",
      chinese: "所 (suǒ)",
      description: "A formal particle used before a verb in a passive structure.",
      examples: [
        { zh: "为人所知", py: "wéi rén suǒ zhī", en: "known by people" }
      ]
    }
  ]
};
