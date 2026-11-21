import fs from 'fs';
import path from 'path';

const wordPoolPath = path.resolve('src/shared/wordPool.ts');
const content = fs.readFileSync(wordPoolPath, 'utf-8');
const arrayMatch = content.match(/export const wordPool: PoolWord\[\] = (\[[\s\S]*?\]);/);
if (!arrayMatch) throw new Error('Could not find wordPool array');
const wordPool = eval(arrayMatch[1]);

// Parse meaning_en to extract ja/zh meanings
function splitMeaning(m) {
  const hit = /JP:\s*(.+?)\s*;\s*ZH:\s*(.+)$/i.exec(m.trim());
  if (hit) {
    return { ja: hit[1].trim(), zh: hit[2].trim().replace(/[.;]+$/, "") };
  }
  const same = m.trim().replace(/[.;]+$/, "");
  return { ja: same, zh: same };
}

function genClues(word) {
  const { ja, zh } = splitMeaning(word.meaning_en);
  const jaL = ja.toLowerCase();
  const zhL = zh.toLowerCase();
  const fs = (word.fun_fact || '').toLowerCase();
  const enL = word.meaning_en.toLowerCase();
  const m = jaL + ' ' + zhL + ' ' + fs + ' ' + enL;

  // Use word boundaries for English terms to avoid partial matches like "trainer" matching "train"
  const isPerson = /人|者|師|官|員|生|家|手|長|友|親|子|母|父|兄|姐|妹|弟|息子|娘|夫|妻|先生|警察|医者|看護師|運転手|会社員|公務員|芸人|歌手|選手|作家|画家|学者|政治家|大統領|総理|王|女王|社長|部長|課長|店長|店員|客|観客|患者|生徒|学生|児童|幼児|赤ちゃん|おじいさん|おばあさん|おじさん|おばさん|お兄さん|お姉さん|友達|隣人|他人|外国人|日本人|中国人|アメリカ人|ドイツ人|フランス人|イギリス人|ロシア人|韓国人|台湾人|香港人|シンガポール人|タイ人|ベトナム人|インドネシア人|マレーシア人|フィリピン人|インド人|アラブ人|アフリカ人|ヨーロッパ人|アメリカ人|カナダ人|メキシコ人|ブラジル人|アルゼンチン人|チリ人|コロンビア人|ペルー人|ベネズエラ人|エクアドル人|ボリビア人|パラグアイ人|ウルグアイ人/.test(jaL + ' ' + zhL) || /\b(person|profession|teacher|doctor|police|student|master|artist|singer|player|writer|scholar|politician|president|prime minister|king|queen|chairman|director|manager|section chief|shopkeeper|clerk|customer|audience|patient|pupil|child|infant|baby|grandfather|grandmother|uncle|aunt|older brother|older sister|friend|neighbor|stranger|foreigner|japanese|chinese|american|german|french|british|russian|korean|taiwanese|hong kong|singaporean|thai|vietnamese|indonesian|malaysian|filipino|indian|arab|african|european)\b/.test(enL);
  const isAnimal = /dog|cat|bird|fish|animal|creature|pet|馬|牛|羊|豚|鶏|魚|鳥|動物|昆虫/.test(m);
  const isPlant = /plant|flower|tree|草|花|木|桜|梅|竹|松|菊|蘭|薔薇|ひまわり|チューリップ/.test(m);
  const isFood = /food|drink|eat|drink|寿司|酒|茶|パン|ラーメン|カレー|肉|魚|野菜|果物|米|麺|餅|豆腐|味噌|醤油|塩|砂糖|油|酢|みりん|ビール|ワイン|ウィスキー|焼酎|日本酒|泡盛|紹興酒|マッコリ|ソジュ/.test(m);
  const isPlace = /place|building|location|学校|駅|病院|空港|家|店|市|町|村|郵便局|銀行|図書館|美術館|博物館|公園|神社|寺|教会|モスク|シナゴーグ|寺院/.test(m);
  const isAbstract = /love|peace|freedom|success|failure|happiness|sadness|anger|fear|joy|hope|despair|愛|平和|自由|成功|失敗|幸福|悲しみ|怒り|恐れ|喜び|希望|絶望|勇気|忍耐|努力|挑戦|夢|目標|理想|現実|真実|嘘|善|悪|正義|不正|美|醜|強さ|弱さ|大きさ|小ささ|長さ|短さ|高さ|低さ|深さ|浅さ|広さ|狭さ|厚さ|薄さ|重さ|軽さ|速さ|遅さ|早さ|遅さ|新しさ|古さ|若さ|老い|生|死|命|魂|心|精神/.test(m);
  const isTool = /tool|object|machine|device|instrument|車|時計|電話|鉛筆|ペン|本|紙|カメラ|パソコン|スマホ|テレビ|ラジオ|冷蔵庫|洗濯機|エアコン|電子レンジ|掃除機|ドライヤー|アイロン|包丁|鍋|フライパン|お皿|コップ|箸|スプーン|フォーク|ナイフ|お椀|お茶碗|湯呑|急須|茶筒|花瓶|置物|絵画|彫刻|工芸品|陶器|磁器|漆器|木工品|竹細工|籠|風呂敷|手ぬぐい|扇子|団扇|提灯|ちょうちん/.test(m);
  const isAction = /action|event|travel|exercise|meeting|party|旅行|運動|会議|パーティー|散歩|ハイキング|キャンプ|ピクニック|バーベキュー|花見|紅葉狩り|海水浴|プール|スキー|スノボ|スケート|水泳|ジョギング|マラソン|トライアスロン|ヨガ|ピラティス|ダンス|バレエ|ヒップホップ|ジャズダンス|社交ダンス|フラメンコ|タンゴ|サルサ|ベリーダンス|フラダンス|ポリネシアン|ハワイアン|タヒチアン|マオリ|サモア|トンガ|フィジー/.test(m);
  const isBodyPart = /body|part|手|足|目|耳|口|鼻|髪|頭|首|肩|腕|肘|手首|指|爪|胸|背中|腹|腰|尻|太もも|膝|ふくらはぎ|足首|つま先|心|肺|肝臓|腎臓|胃|腸|脳|血|骨|筋肉|皮膚|神経|ホルモン|酵素|ビタミン|ミネラル|アミノ酸|タンパク質|糖質|脂質|食物繊維|水分|電解質|酸素|二酸化炭素|窒素|水素|炭素/.test(m);
  const isNature = /rain|wind|snow|fire|water|雨|風|雪|火|水|雷|稲妻|雹|霰|霧|霞|雲|太陽|月|星|惑星|衛星|彗星|流星|オーロラ|虹|霧|霞|露|霜|雪|氷|雹|霰|雷|稲妻|竜巻|台風|ハリケーン|サイクロン|地震|津波|火山|噴火|マグマ|溶岩|灰|煙|蒸気|ガス|液体|固体|プラズマ/.test(m);
  const isTime = /time|calendar|today|tomorrow|yesterday|week|month|year|hour|minute|second|時間|今日|明日|昨日|週|月|年|時|分|秒|朝|昼|夜|深夜|早朝|午前|午後|夕方|夜中|明け方/.test(m);

  const cs = [];
  if (isPerson) cs.push("Is it a person or profession? Yes");
  else if (isAnimal || isPlant) cs.push("Is it a living organism? Yes");
  else if (isFood) cs.push("Is it edible? Yes");
  else if (isPlace) cs.push("Is it a physical location? Yes");
  else if (isAbstract) cs.push("Is it a tangible object? No");
  else if (isTool) cs.push("Is it a man-made tool or object? Yes");
  else if (isAction) cs.push("Is it an action or event? Yes");
  else if (isBodyPart) cs.push("Is it a body part? Yes");
  else if (isNature) cs.push("Is it a natural phenomenon? Yes");
  else if (isTime) cs.push("Is it a unit of time? Yes");
  else cs.push("Is it a tangible object? No");

  const fs2 = word.fun_fact || '';
  let c2 = "";
  
  // Generate semantic contrast questions based on actual meaning, never raw enum names
  if (isPerson) {
    const d = /police|law|judge|crime/.test(fs2) ? "law" : /teacher|school|student|study/.test(fs2) ? "education" : /business|company|president|manager|director|ceo/.test(fs2) ? "business" : /doctor|nurse|hospital|medical/.test(fs2) ? "medicine" : /artist|singer|actor|writer|painter/.test(fs2) ? "arts" : "public service";
    c2 = `Related to ${d}? Yes`;
  } else if (isAnimal) c2 = "Is it an animal? Yes";
  else if (isPlant) c2 = "Is it a plant? Yes";
  else if (isFood) {
    const t = /ferment|alcohol|wine|beer|sake|whisky/.test(fs2) ? "fermented alcoholic beverage" : /rice|vinegar|sushi/.test(fs2) ? "vinegared rice dish with fish" : /noodle|ramen|udon|soba/.test(fs2) ? "noodle dish" : /curry|spice/.test(fs2) ? "spiced curry dish" : /tea|green tea|matcha/.test(fs2) ? "green tea" : /coffee/.test(fs2) ? "coffee beverage" : "food or drink item";
    c2 = `Is it a ${t}? Yes`;
  } else if (isPlace) {
    const t = /school|university|academy/.test(fs2) ? "school or educational facility" : /station|rail|train/.test(fs2) ? "train station" : /hospital|clinic|medical/.test(fs2) ? "hospital or medical facility" : /airport|flight|air/.test(fs2) ? "airport" : /shrine|temple|sacred/.test(fs2) ? "shrine or temple" : /park|garden|recreation/.test(fs2) ? "park or garden" : "building or facility";
    c2 = `Is it a ${t}? Yes`;
  } else if (isAbstract) c2 = "Is it an abstract concept or feeling? Yes";
  else if (isTool) {
    const h = /pen|pencil|chopstick|knife|fork|spoon|cup|bowl|phone|book|paper|umbrella|fan|watch|glasses|key|wallet|bag|scissors|hammer|screwdriver|wrench|pliers|saw|drill|brush|comb|mirror|remote|controller|mouse|keyboard|headphone|earphone|camera|binoculars|telescope|microscope|thermometer|scale|ruler|compass|map|globe|calendar|clock|timer|alarm|stopwatch/.test(word.fun_fact) ? "Yes" : "No";
    c2 = `Can you hold it in your hand? ${h}`;
  } else if (isAction) c2 = "Does it involve movement or activity? Yes";
  else if (isBodyPart) c2 = "Located on the human body? Yes";
  else if (isNature) c2 = "Related to weather or natural elements? Yes";
  else if (isTime) c2 = "Related to scheduling or calendar? Yes";
  else {
    // Semantic contrast question based on meaning, never enum names
    const { ja: jaMeaning, zh: zhMeaning } = splitMeaning(word.meaning_en);
    const meaningCombined = (jaMeaning + ' ' + zhMeaning).toLowerCase();
    
    // Semantic contrast questions based on actual meaning
    if (/letter|mail|post/.test(meaningCombined)) {
      c2 = "Is it made of paper? Yes";
    } else if (/train|transport|vehicle|automobile|car/.test(meaningCombined)) {
      c2 = "Is it a mode of transportation? Yes";
    } else if (/study|learn|knowledge/.test(meaningCombined)) {
      c2 = "Is it related to learning or knowledge? Yes";
    } else if (/daughter|child|girl|young woman/.test(meaningCombined)) {
      c2 = "Is it a female family member? Yes";
    } else if (/lover|mistress|spouse|husband|wife/.test(meaningCombined)) {
      c2 = "Is it a romantic partner? Yes";
    } else if (/teacher|master|doctor|professional/.test(meaningCombined)) {
      c2 = "Is it a professional title? Yes";
    } else if (/wife|mother|woman/.test(meaningCombined)) {
      c2 = "Is it a female relative? Yes";
    } else if (/absent|daze|trance/.test(meaningCombined)) {
      c2 = "Is it a state of mind? Yes";
    } else if (/news|paper|broadcast/.test(meaningCombined)) {
      c2 = "Is it a medium of information? Yes";
    } else if (/hero|manly|gentleman/.test(meaningCombined)) {
      c2 = "Is it a complimentary description of a man? Yes";
    } else if (/evil|demon|devil/.test(meaningCombined)) {
      c2 = "Is it a malevolent entity? Yes";
    } else if (/soup|broth|hot water/.test(meaningCombined)) {
      c2 = "Is it a liquid food? Yes";
    } else if (/run|walk|move/.test(meaningCombined)) {
      c2 = "Is it a physical movement? Yes";
    } else if (/accuse|tell|inform|lawsuit/.test(meaningCombined)) {
      c2 = "Is it a legal or verbal action? Yes";
    } else if (/calculate|plot|scheme/.test(meaningCombined)) {
      c2 = "Is it a mental calculation or plot? Yes";
    } else if (/work|job|craft|spy/.test(meaningCombined)) {
      c2 = "Is it related to labor or covert work? Yes";
    } else if (/high school|university|college/.test(meaningCombined)) {
      c2 = "Is it an educational institution? Yes";
    } else if (/emergency|extraordinary|crisis/.test(meaningCombined)) {
      c2 = "Is it an unusual or urgent situation? Yes";
    } else if (/floor|bed|furniture/.test(meaningCombined)) {
      c2 = "Is it a piece of furniture or flooring? Yes";
    } else if (/mahjong|sparrow|game|bird/.test(meaningCombined)) {
      c2 = "Is it a game or a bird? Yes";
    } else if (/careful|caution|attention/.test(meaningCombined)) {
      c2 = "Is it a state of caution? Yes";
    } else if (/ceiling|courtyard|skylight/.test(meaningCombined)) {
      c2 = "Is it an architectural feature? Yes";
    } else if (/injury|wound|blame/.test(meaningCombined)) {
      c2 = "Is it physical harm or accusation? Yes";
    } else if (/thief|burglar|mud/.test(meaningCombined)) {
      c2 = "Is it a criminal or soil-related? Yes";
    } else if (/convenience|circumstance|schedule/.test(meaningCombined)) {
      c2 = "Is it about timing or circumstance? Yes";
    } else if (/reckless|absurd|tea/.test(meaningCombined)) {
      c2 = "Is it unreasonable or about tea? Yes";
    } else if (/serious|earnest|face/.test(meaningCombined)) {
      c2 = "Is it about sincerity or appearance? Yes";
    } else if (/trouble|nuisance|bewildered/.test(meaningCombined)) {
      c2 = "Is it an inconvenience or confusion? Yes";
    } else if (/stair|stage|phase/.test(meaningCombined)) {
      c2 = "Is it a step or phase? Yes";
    } else if (/stamp|cut|hand/.test(meaningCombined)) {
      c2 = "Is it postal or surgical? Yes";
    } else if (/nurse|examine|doctor/.test(meaningCombined)) {
      c2 = "Is it medical care or examination? Yes";
    } else if (/restraint|forethought|hesitation/.test(meaningCombined)) {
      c2 = "Is it caution or long-term thinking? Yes";
    } else if (/impossible|unreasonable|overdo/.test(meaningCombined)) {
      c2 = "Is it about impossibility or excess? Yes";
    } else if (/joint|contract|union/.test(meaningCombined)) {
      c2 = "Is it a legal agreement or combination? Yes";
    } else if (/cold|wind|illness/.test(meaningCombined)) {
      c2 = "Is it an illness or weather? Yes";
    } else if (/doll|figure|shape/.test(meaningCombined)) {
      c2 = "Is it a toy or human form? Yes";
    } else if (/irony|sarcasm|skin|flesh/.test(meaningCombined)) {
      c2 = "Is it mockery or literal body parts? Yes";
    } else if (/right|wrong|dispute/.test(meaningCombined)) {
      c2 = "Is it about correctness or conflict? Yes";
    } else if (/accounting|manager|director/.test(meaningCombined)) {
      c2 = "Is it a professional or financial role? Yes";
    } else if (/suicide|heart|pact/.test(meaningCombined)) {
      c2 = "Is it about death or inner feelings? Yes";
    } else if (/greengrocer|shop|eight hundred/.test(meaningCombined)) {
      c2 = "Is it a shop or a number? Yes";
    } else if (/human|world|realm/.test(meaningCombined)) {
      c2 = "Is it a person or the mortal world? Yes";
    } else if (/specialty|proud|customer/.test(meaningCombined)) {
      c2 = "Is it about skill or satisfaction? Yes";
    } else if (/promise|appointment|restrain/.test(meaningCombined)) {
      c2 = "Is it a commitment or restriction? Yes";
    } else if (/guide|invite|case/.test(meaningCombined)) {
      c2 = "Is it guidance or legal matter? Yes";
    } else if (/warning|attention|pay/.test(meaningCombined)) {
      c2 = "Is it a caution or focus? Yes";
    } else if (/hobby|flavor|taste/.test(meaningCombined)) {
      c2 = "Is it a pastime or sensory experience? Yes";
    } else if (/appearance|standard|good/.test(meaningCombined)) {
      c2 = "Is it about looks or quality? Yes";
    } else if (/structure|splendid|quite/.test(meaningCombined)) {
      c2 = "Is it about construction or satisfaction? Yes";
    } else {
      c2 = `Related to: ${word.relation || 'word'}?`;
    }
  }
  
  cs.push(c2);
  return cs;
}

wordPool.forEach(w => w.clues = genClues(w));

let fb = 0, pw = 0;
const pairs = new Set();
wordPool.forEach(w => {
  w.clues.forEach(c => { if (c.includes("Is it a living being?") || c.includes("Can you touch or hold it?") || c.includes("Can you hold it in your hand?")) fb++; });
  const j = (w.ja || '').toLowerCase();
  const z = (w.zh || '').toLowerCase();
  // Note: w.ja/zh might not exist, use meaning_en
  const { ja: ja2, zh: zh2 } = splitMeaning(w.meaning_en);
  const jp = ja2.toLowerCase();
  const zhp = zh2.toLowerCase();
  const ip = /人|者|師|官|員|生|家|手|長|友|親|子|母|父|兄|姉|妹|弟|息子|娘|夫|妻|先生|警察|医者|看護師|運転手|会社員|公務員|芸人|歌手|選手|作家|画家|学者|政治家|大統領|総理|王|女王|社長|部長|課長|店長|店員|客|観客|患者|生徒|学生|児童|幼児|赤ちゃん|おじいさん|おばあさん|おじさん|おばさん|お兄さん|お姉さん|友達|隣人|他人|外国人|日本人|中国人|アメリカ人|ドイツ人|フランス人|イギリス人|ロシア人|韓国人|台湾人|香港人|シンガポール人|タイ人|ベトナム人|インドネシア人|マレーシア人|フィリピン人|インド人|アラブ人|アラブ人|アフリカ人|ヨーロッパ人|アメリカ人|カナダ人|メキシコ人|ブラジル人|アルゼンチン人|チリ人|コロンビア人|ペルー人|ベネズエラ人|エクアドル人|ボリビア人|パラグアイ人|ウルグアイ人/.test(jp + ' ' + zhp);
  if (ip && w.clues[0] !== "Is it a person or profession? Yes") { pw++; console.log(`PERSON FAIL: ${w.kanji} - ${w.clues[0]}`); }
  pairs.add(w.clues.join('|'));
});

console.log(`Words: ${wordPool.length}, Fallbacks: ${fb}, PersonWrong: ${pw}, Unique pairs: ${pairs.size}/${wordPool.length} (${Math.round(pairs.size/wordPool.length*100)}%)`);
if (fb > 0 || pw > 0) process.exit(1);

const out = `export type PoolRelation = "true_friend" | "false_friend" | "half_friend";

export interface PoolWord {
  id: number;
  kanji: string;
  jp_reading: string;
  zh_pinyin: string;
  meaning_en: string;
  relation: PoolRelation;
  fun_fact: string;
  clues: [string, string];
  radical?: { charIndex: number; glyph: string; icon: string; name: string; position: "left" | "top" | "whole"; breakdown: string; };
}

export const wordPool: PoolWord[] = ${JSON.stringify(wordPool, null, 2)};
`;
fs.writeFileSync(path.resolve('src/shared/wordPool.ts'), out);
console.log('Updated src/shared/wordPool.ts');