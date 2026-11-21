import fs from 'fs';
import path from 'path';

// Read the existing word pool from the client data file
const clientWordPoolPath = path.resolve('src/client/data/wordPool.ts');
const clientWordPoolContent = fs.readFileSync(clientWordPoolPath, 'utf-8');

// Extract the wordPool array using regex
const arrayMatch = clientWordPoolContent.match(/export const wordPool: PoolWord\[\] = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
  throw new Error('Could not find wordPool array in client data file');
}

const wordPool = eval(arrayMatch[1]);

// Radical detection map
const RADICALS = {
  // left-position radicals
  '氵': { name: 'Water', icon: '💧', position: 'left' },
  '扌': { name: 'Hand', icon: '✋', position: 'left' },
  '亻': { name: 'Person', icon: '🧍', position: 'left' },
  '忄': { name: 'Heart', icon: '❤️', position: 'left' },
  '讠': { name: 'Speech', icon: '💬', position: 'left' },
  '饣': { name: 'Food', icon: '🍚', position: 'left' },
  '钅': { name: 'Metal', icon: '⚙️', position: 'left' },
  // top-position radicals
  '艹': { name: 'Plant', icon: '🌱', position: 'top' },
  '雨': { name: 'Rain', icon: '🌧️', position: 'top' },
  // whole-character radicals (single char or dominant)
  '木': { name: 'Wood', icon: '🌳', position: 'whole' },
  '火': { name: 'Fire', icon: '🔥', position: 'whole' },
  '灬': { name: 'Fire', icon: '🔥', position: 'whole' },
  '金': { name: 'Metal', icon: '⚙️', position: 'whole' },
  '日': { name: 'Sun', icon: '☀️', position: 'whole' },
  '月': { name: 'Moon', icon: '🌙', position: 'whole' },
  '山': { name: 'Mountain', icon: '⛰️', position: 'whole' },
  '口': { name: 'Mouth', icon: '👄', position: 'left' },
  '心': { name: 'Heart', icon: '❤️', position: 'left' },
  '言': { name: 'Speech', icon: '💬', position: 'left' },
  '食': { name: 'Food', icon: '🍚', position: 'left' },
  '土': { name: 'Earth', icon: '🌍', position: 'left' },
  '水': { name: 'Water', icon: '💧', position: 'left' },
  '目': { name: 'Eye', icon: '👁️', position: 'top' },
  '手': { name: 'Hand', icon: '✋', position: 'left' },
  '足': { name: 'Foot', icon: '🦶', position: 'left' },
  '女': { name: 'Woman', icon: '👩', position: 'left' },
  '男': { name: 'Man', icon: '👨', position: 'left' },
  '人': { name: 'Person', icon: '🧍', position: 'left' },
  '大': { name: 'Big', icon: '📏', position: 'whole' },
  '小': { name: 'Small', icon: '📏', position: 'whole' },
  '中': { name: 'Center', icon: '🎯', position: 'whole' },
  '一': { name: 'One', icon: '1️⃣', position: 'whole' },
  '二': { name: 'Two', icon: '2️⃣', position: 'whole' },
  '三': { name: 'Three', icon: '3️⃣', position: 'whole' },
};

// Kanji to semantic component breakdowns (for common kanji in the pool)
const KANJI_BREAKDOWNS = {
  '手紙': '✋ Hand + 🧵 Paper',
  '大家': '🧍 Person + 📏 Big',
  '汽車': '💧 Water + 🚗 Vehicle',
  '勉強': '💪 Effort + ⚔️ Strong',
  '娘': '👩 Woman + 👍 Good',
  '愛人': '❤️ Love + 🧍 Person',
  '先生': '🧍 Person + 🎓 Born Earlier',
  '老婆': '👴 Old + 👩 Woman',
  '放心': '🤲 Release + ❤️ Heart',
  '新聞': '📰 New + 👂 Hear',
  '大丈夫': '📏 Big + 🧍 Person + 👨 Husband',
  '邪魔': '⛔ Evil + 👹 Demon',
  '湯': '💧 Water + ☀️ Sun',
  '走': '🏃 Run (original form)',
  '告訴': '📢 Tell + 🗣️ Speak',
  '暗算': '🌙 Dark + 🧮 Calculate',
  '工作': '🔧 Work + 🛠️ Make',
  '高校': '📏 High + 🏫 School',
  '非常': '❌ Not + 📏 Normal',
  '床': '🛏️ Bed (wood + 爿)',
  '麻雀': '🌿 Hemp + 🐦 Sparrow',
  '用心': '🔧 Use + ❤️ Heart',
  '天井': '☁️ Sky + 🕳️ Well',
  '怪我': '👻 Strange + 🧍 Me',
  '泥棒': '🌧️ Mud + 💪 Thief',
  '都合': '🏙️ Capital + 🤝 Fit',
  '無茶': '❌ No + 🍵 Tea',
  '真面目': '✨ True + 👀 Face + 👁️ Eye',
  '迷惑': '🌀 Lost + 🤷 Confuse',
  '階段': '🏰 Stairs + 📏 Stage',
  '切手': '✂️ Cut + ✋ Hand',
  '看病': '👀 Watch + 🤒 Sick',
  '遠慮': '🛤️ Far + 🤔 Consider',
  '無理': '❌ No + 📐 Reason',
  '合同': '🤝 Join + 🐛 Same',
  '風邪': '🌬️ Wind + ❌ Evil',
  '人形': '🧍 Person + 📐 Shape',
  '皮肉': '🐮 Skin + 🥩 Meat',
  '是非': '✅ Right + ❌ Wrong',
  '経理': '📏 Manage + 📐 Reason',
  '心中': '❤️ Heart + 🎯 Center',
  '八百屋': '8️⃣ Eight + 100 百 + 🏪 Shop',
  '人間': '🧍 Person + 🌐 Between',
  '得意': '🎯 Obtain + 💡 Idea',
  '約束': '📜 Promise + 🤝 Bind',
  '案内': '📋 Plan + 🏠 Inside',
  '注意': '💧 Pour + 🎯 Intent',
  '趣味': '🏃 Run + 👃 Taste',
  '格好': '📐 Status + 👍 Good',
  '結構': '🎀 Tie + 🏗️ Structure',
  '世界': '🕐 Time + 🌐 Boundary',
  '学校': '📚 Learn + 🏫 School',
  '電話': '⚡ Electric + 🗣️ Speak',
  '時間': '☀️ Time + 🌐 Interval',
  '文化': '📜 Culture + 🎭 Transform',
  '経済': '📏 Manage + 🌍 World',
  '社会': '🏛️ Society + 🤝 Meeting',
  '科学': '🔬 Science + 📚 Study',
  '歴史': '📜 History + 📅 Calendar',
  '音楽': '🎵 Sound + 🎭 Joy',
  '旅行': '🎒 Travel + 🚶 Walk',
  '運動': '🏃 Move + 🎯 Move',
  '病院': '🤒 Sick + 🏢 Hall',
  '警察': '👮 Police + 👮 Observe',
  '銀行': '🥈 Silver + 🏢 Guild',
  '平和': '📏 Flat + 🤝 Harmony',
  '自然': '🧬 Self + 🔥 Burn',
  '態度': '💪 Ability + 📏 Degree',
  '成功': '🎯 Achieve + 🏆 Merit',
  '簡単': '🎋 Simple + 🎋 Single',
  '留守': '📍 Stay + 🤲 Guard',
  '餅': '🍚 Rice + 🔨 Pound',
  '結束': '🎀 Tie + 🎯 Bundle',
  '挨拶': '🙇 Greet + 👋 Salute',
  '人参': '🧍 Person + 🥕 Ginseng',
  '大根': '📏 Big + 🌱 Root',
  '汽水': '💨 Steam + 💧 Water',
  '金玉': '🥈 Gold + 💎 Jade',
  '無法': '❌ No + ⚖️ Law',
  '油断': '🛢️ Oil + ✂️ Cut',
  '丈夫': '🧍 Person + 📏 Trunk',
  '痴漢': '🤤 Foolish + 👨 Man',
  '焼餅': '🔥 Burn + 🍚 Rice Cake',
  '風船': '🌬️ Wind + 🎈 Balloon',
  '喧嘩': '📢 Noisy + 🎨 Fancy',
  '機嫌': '⚙️ Machine + 😊 Mood',
  '苦情': '😣 Bitter + 💭 Feeling',
  '清楚': '💧 Clear + 🏠 Place',
  '出頭': '🚶 Exit + 👤 Head',
  '仲間': '🎯 Middle + 🌐 Between',
  '写真': '✍️ Copy + ✨ Truth',
  '荷物': '🎒 Burden + 📦 Thing',
  '家族': '🏠 House + 👪 Clan',
  '親友': '👨‍👩‍👧 Parent + 👬 Friend',
  '演出': '🎭 Perform + 🚀 Output',
  '発表': '📤 Release + 📋 Table',
  '差別': '📏 Difference + 🎯 Separate',
  '道具': '🛤️ Way + 🔧 Tool',
  '夢中': '🌙 Dream + 🎯 Center',
  '浮気': '🌊 Float + 💨 Air',
  '覚悟': '👁️ Awake + 🎯 Degree',
  '交代': '🤝 Exchange + 🎯 Replace',
  '宿題': '🏠 Stay + 📝 Topic',
  '講義': '🗣️ Lecture + 🎭 Ceremony',
  '映画': '🎬 Reflect + 🖼️ Picture',
  '外人': '🚪 Outside + 🧍 Person',
  '算数': '🧮 Calculate + 🔢 Number',
  '郵便': '🏃 Mail + 📦 Convenience',
  '不審': '❌ Not + 🔍 Examine',
  '乞食': '🙏 Beg + 🍚 Food',
  '反省': '🔙 Return + 🔍 Examine',
  '看板': '👀 Look + 📋 Board',
  '雑談': '📚 Misc + 🗣️ Talk',
  '昆虫': '🐛 Insect + 🐛 Insect',
  '植物': '🌱 Plant + 📦 Thing',
  '動物': '🏃 Move + 📦 Thing',
  '宇宙': '🏠 Space + 🏠 Time',
  '太陽': '📏 Great + ☀️ Sun',
  '地震': '🌍 Earth + 🌊 Shake',
  '台風': '🌬️ Platform + 🌬️ Wind',
  '法律': '⚖️ Law + 📏 Rule',
  '政治': '📏 Correct + 🎯 Govern',
  '哲学': '🧠 Wisdom + 📚 Study',
  '心理': '❤️ Heart + 📐 Pattern',
  '文学': '📜 Writing + 📚 Study',
  '美術': '🎨 Beauty + 🎭 Art',
  '漫画': '🎨 Whimsical + 🖼️ Picture',
  '祖父': '🏛️ Ancestor + 👴 Father',
  '祖母': '🏛️ Ancestor + 👵 Mother',
  '兄弟': '👴 Elder Bro + 👶 Younger Bro',
  '姉妹': '👵 Elder Sis + 👶 Younger Sis',
  '夫婦': '👨 Husband + 👩 Wife',
  '朋友': '🤝 Friend + 👬 Friend',
  '同僚': '🤝 Same + 🏢 Colleague',
  '作文': '✍️ Make + 📝 Writing',
  '交通': '🤝 Intersect + 🚶 Pass',
  '事故': '📋 Incident + 📐 Cause',
  '記念': '📝 Record + 💭 Memory',
  '失敗': '💧 Lose + ❌ Fail',
  '経験': '📏 Pass + 🔍 Verify',
  '工夫': '🔧 Work + 👨 Man',
  '勝手': '🏆 Win + ✋ Hand',
  '方便': '📐 Square + 🤝 Convenient',
  '我慢': '🧍 Self + 🐌 Slow',
  '達者': '🛤️ Path + 🧍 Person',
  '素人': '🎨 White + 🧍 Person',
  '玄人': '🌑 Dark + 🧍 Person',
  '玄関': '🌑 Dark + 🚪 Gate',
  '部屋': '📐 Section + 🏠 Roof',
  '台所': '🏛️ Platform + 🏠 Place',
  '時計': '☀️ Time + 📏 Measure',
  '踏切': '👣 Step + ✂️ Cut',
  '注文': '💧 Pour + 📝 Writing',
  '返事': '🔙 Return + 📋 Matter',
  '試合': '📏 Match + 🤝 Combine',
  '勘定': '📏 Intuition + 📏 Fix',
  '御免': '🙇 Honorable + ❌ Excuse',
  '粗品': '🌾 Coarse + 📦 Goods',
  '謹慎': '🙇 Respect + ⚠️ Caution',
  '手当': '✋ Hand + 🎯 Hit',
  '意地': '💡 Idea + 🌍 Ground',
  '風俗': '🌬️ Wind + 🎭 Custom',
  '急須': '⚡ Urgent + ⏰ Need',
  '電車': '⚡ Electric + 🚗 Vehicle',
  '麻薬': '🌿 Hemp + 💊 Medicine',
  '料理': '📏 Measure + 📐 Reason',
  '喫茶': '🍽️ Eat + 🍵 Tea',
  '煙草': '🌫️ Smoke + 🌿 Grass',
  '俳優': '🎭 Haiku + 🎭 Actor',
  '監督': '👁️ Oversee + 🎯 Supervise',
  '試験': '🔍 Test + 🔍 Verify',
  '質問': '📏 Quality + 🙏 Ask',
  '相談': '🤝 Mutual + 🗣️ Talk',
  '辞書': '🗣️ Word + 📚 Book',
  '万年筆': '📅 10000 + 📅 Year + ✍️ Brush',
  '駅': '🐎 Horse + 📏 Station',
  '無事': '❌ No + 📋 Matter',
  '左右': '👈 Left + 👉 Right',
  '必死': '📏 Must + 💀 Death',
  '念頭': '💭 Thought + 👤 Head',
  '鉛筆': '⚫ Lead + ✍️ Brush',
  '雑誌': '📚 Misc + 📝 Record',
  '小説': '📏 Small + 🗣️ Say',
  '詩人': '📝 Poem + 🧍 Person',
  '画家': '🖼️ Painting + 🏠 House',
  '歌手': '🎵 Song + ✋ Hand',
  '選手': '🎯 Select + ✋ Hand',
  '練習': '🔄 Practice + 🎯 Practice',
  '予習': '📅 Before + 🎯 Practice',
  '復習': '🔙 Again + 🎯 Practice',
  '連絡': '🔗 Connect + 📞 Contact',
  '集合': '🎯 Gather + 🤝 Combine',
  '解散': '🔓 Release + 📚 Scatter',
  '予約': '📅 Before + 🤝 Promise',
  '食事': '🍚 Eat + 📋 Matter',
  '乾杯': '🏜️ Dry + 🍶 Cup',
  '砂糖': '🏖️ Sand + 🍚 Sugar',
  '醤油': '🍶 Ferment + 🛢️ Oil',
  '地図': '🌍 Earth + 🗺️ Map',
  '空港': '🌌 Sky + 🏠 Port',
  '水着': '💧 Water + 👕 Wear',
  '湯気': '💧 Hot Water + 🌫️ Steam',
  '鳥居': '🐦 Bird + 🏠 Reside',
  '為替': '🤝 For + 🔄 Replace',
  '着物': '👕 Wear + 📦 Thing',
  '襖': '🚪 Door + 🏠 House',
  '羊羹': '🐑 Sheep + 🍲 Soup',
  '銭湯': '💰 Coin + 💧 Hot Water',
  '漬物': '🥒 Pickle + 📦 Thing',
  '佃煮': '🌾 Field + 🍲 Boil',
  '質屋': '📏 Quality + 🏠 House',
  '寄付': '🎁 Send + 📎 Attach',
  '悪寒': '😈 Bad + 🥶 Cold',
  '泥水': '🌧️ Mud + 💧 Water',
  '有為': '🤝 Have + 🤝 Do',
  '算盤': '🧮 Calculate + 📋 Board',
  '空手': '🌌 Empty + ✋ Hand',
  '芸者': '🎨 Art + 🧍 Person',
  '忍者': '🗡️ Endure + 🧍 Person',
  '侍': '🏃 Serve + 🏃 Serve',
  '将軍': '🎯 General + 🛡️ Army',
  '浪人': '🌊 Wave + 🧍 Person',
  '鳥肌': '🐦 Bird + 🥩 Skin',
  '紅葉': '🎨 Red + 🍃 Leaf',
  '浴衣': '🛁 Bath + 👕 Clothes',
  '下駄': '👇 Below + 🦷 Tooth',
  '畳': '📐 Fold + 📐 Fold',
  '障子': '🛑 Block + 🧍 Child',
  '暖簾': '🌡️ Warm + 🎭 Curtain',
  '提灯': '🤲 Carry + 🏮 Lantern',
  '煎餅': '🔥 Roast + 🍚 Rice Cake',
  '刺身': '📍 Pierce + 🥩 Body',
  '味噌': '👃 Flavor + 📏 Layer',
  '居酒屋': '🏠 Stay + 🍶 Sake + 🏠 House',
  '屋台': '🏠 House + 🏛️ Platform',
  '旅館': '🎒 Travel + 🏠 Hall',
  '料亭': '📏 Measure + 🏛️ Pavilion',
  '供養': '🤲 Offer + 🌱 Nourish',
  '市役所': '🏙️ City + 🎭 Duty + 🏠 Place',
  '裁判所': '⚖️ Judge + 📋 Decide + 🏠 Place',
  '裁判': '⚖️ Judge + 📋 Decide',
  '大統領': '📏 Big + 🤝 Unify + 🎯 Lead',
  '株': '🌳 Tree + 📏 Trunk',
  '株式': '🌳 Tree + 📏 Right',
  '借金': '🤲 Borrow + 💰 Gold',
  '給与': '🤝 Give + 🤝 Bestow',
  '残業': '😢 Remain + 💼 Work',
  '出張': '🚶 Exit + 🎯 Stretch',
  '組合': '🎀 Combine + 🤝 Meet',
  '会社': '🤝 Meet + 🏠 Society',
  '社長': '🏠 Society + 📏 Chief',
  '部長': '📐 Section + 📏 Chief',
  '面接': '👤 Face + 🤝 Meet',
  '茶道': '🍵 Tea + 🛤️ Way',
  '華道': '🌸 Flower + 🛤️ Way',
  '柔道': '🤸 Soft + 🛤️ Way',
  '剣道': '⚔️ Sword + 🛤️ Way',
  '歌舞伎': '🎵 Song + 💃 Dance + 🎭 Skill',
  '幕府': '🏕️ Curtain + 🏛️ Gov',
  '金魚': '🥈 Gold + 🐟 Fish',
  '鯉': '🐟 Carp',
  '桜': '🌸 Cherry Blossom',
  '盆栽': '🍶 Tray + 🌱 Plant',
  '庭園': '🏡 Garden + 🌱 Garden',
  '温泉': '🌡️ Warm + 🌊 Spring',
  '団扇': '🎯 Round + 🧭 Fan',
  '扇子': '🧭 Fan + 🧍 Child',
  '折紙': '📐 Fold + 📝 Paper',
  '漆器': '🎨 Lacquer + 📦 Vessel',
  '陶器': '🏺 Pottery + 📦 Vessel',
  '磁器': '🧲 Magnetic + 📦 Vessel',
  '蚊帳': '🦟 Mosquito + 🎪 Curtain',
  '団子': '🎯 Round + 🧍 Child',
  '寿司': '📏 Longevity + 🎯 This',
  '納豆': '🙏 Temple + 🫘 Bean',
  '豆腐': '🫘 Bean + 🏮 Rot',
  '蕎麦': '🌾 Buckwheat + 🌾 Wheat',
  '烏冬': '🐦 Crow + 🌅 East',
  '抹茶': '🌀 Rub + 🍵 Tea',
  '玉露': '💎 Jade + 💧 Dew',
  '清酒': '💧 Clear + 🍶 Sake',
  '焼酎': '🔥 Burn + 🍶 Alcohol',
  '露天': '💧 Dew + ☁️ Sky',
  '神社': '🙏 Spirit + 🏠 Gather',
  '寺院': '🙏 Temple + 🏛️ Institution',
  '僧侶': '🙏 Monk + 👥 Companion',
  '菩薩': '🙏 Enlightenment + 🧍 Being',
  '観音': '👁️ Observe + 👂 Sound',
  '閻魔': '👁️ Cover + 👹 Demon',
  '極楽': '📏 Utmost + 🎵 Bliss',
  '地獄': '🌍 Earth + 🏰 Prison',
  '輪廻': '🔄 Wheel + 🔄 Return',
  '涅槃': '🔥 Extinguish + 🏺 Pot',
  '墓地': '🏺 Tomb + 🌍 Earth',
  '遺言': '🎁 Leave + 🗣️ Word',
  '遺産': '🎁 Leave + 🏔️ Mountain',
  '祖先': '🏛️ Ancestor + 🎯 First',
  '子孫': '👶 Child + 👶 Grandchild',
  '親戚': '👨‍👩‍👧 Parent + 🎭 Relative',
  '伯父': '👴 Elder + 👨 Father',
  '伯母': '👴 Elder + 👵 Mother',
  '叔父': '🙇 Uncle + 👨 Father',
  '叔母': '🙇 Uncle + 👵 Mother',
  '従兄弟': '🤝 Follow + 👴👶 Brother',
  '従姉妹': '🤝 Follow + 👵👶 Sister',
  '義父': '⚖️ Duty + 👨 Father',
  '義母': '⚖️ Duty + 👵 Mother',
  '養子': '🌱 Nurture + 👶 Child',
};

// Clue templates based on meaning categories
function generateClues(word) {
  const ja = word.ja || '';
  const zh = word.zh || '';
  const meaning = (ja + ' ' + zh).toLowerCase();
  
  const isAlive = /person|human|man|woman|child|people|animal|living|creature|spirit|ghost|demon|god|monk|priest|doctor|teacher|student|friend|enemy|family|parent|sibling|cousin|uncle|aunt|grandfather|grandmother|husband|wife|spouse|lover|mistress|daughter|son|mother|father|brother|sister|nephew|niece|ancestor|descendant|official|leader|emperor|general|samurai|ninja|geisha|actor|singer|player|worker|farmer|merchant|monk|beggar|thief|police|judge|president|minister|director|manager|colleague|customer|guest|host|visitor|traveler|pilgrim|hermit|sage|master|disciple|novice|expert|amateur|professional|veteran|rookie|veteran/.test(meaning);
  
  const isTangible = /object|thing|item|tool|weapon|vehicle|building|structure|furniture|clothing|food|drink|plant|tree|flower|rock|stone|metal|wood|paper|book|letter|document|money|coin|banknote|card|ticket|stamp|seal|key|lock|door|window|wall|floor|ceiling|roof|bridge|road|path|mountain|river|lake|sea|ocean|island|valley|cave|temple|shrine|palace|castle|house|home|room|garden|park|field|farm|market|shop|store|restaurant|inn|hotel|hospital|school|university|office|factory|workshop|studio|theater|cinema|museum|library|archive|tomb|grave|cemetery|monument|statue|altar|bell|drum|flute|guitar|piano|violin|bow|arrow|sword|spear|shield|armor|helmet|shield|spear|bow|arrow|sword|knife|dagger|axe|hammer|saw|chisel|plane|drill|needle|thread|cloth|silk|cotton|wool|leather|fur|skin|bone|horn|ivory|pearl|jade|gold|silver|copper|iron|steel|bronze|brass|tin|lead|mercury|sulfur|salt|sugar|rice|wheat|barley|millet|bean|pea|lentil|nut|seed|fruit|vegetable|meat|fish|egg|milk|cheese|butter|oil|vinegar|wine|beer|tea|coffee|water|ice|snow|rain|cloud|wind|fire|smoke|ash|dust|sand|mud|clay|soil|earth|stone|rock|pebble|gem|crystal|diamond|ruby|emerald|sapphire|pearl|amber|coral|ivory|bone|horn|shell|pearl|jade/.test(meaning);
  
  const isAbstract = /idea|concept|thought|feeling|emotion|memory|dream|hope|fear|joy|sorrow|anger|love|hate|peace|war|freedom|justice|truth|lie|beauty|ugliness|good|evil|right|wrong|law|rule|custom|tradition|culture|art|science|philosophy|religion|faith|belief|ritual|ceremony|festival|holiday|calendar|time|space|number|math|geometry|logic|reason|wisdom|knowledge|ignorance|truth|falsehood|meaning|purpose|goal|aim|plan|strategy|tactic|method|technique|skill|ability|talent|genius|stupidity|madness|sanity|health|sickness|life|death|birth|aging|youth|old_age|childhood|adulthood|parenthood|marriage|divorce|friendship|enmity|alliance|betrayal|loyalty|treason|honor|shame|pride|humility|greed|generosity|envy|jealousy|admiration|contempt|respect|disrespect|trust|distrust|hope|despair|optimism|pessimism|faith|doubt|certainty|uncertainty|knowledge|ignorance|wisdom|folly|clarity|confusion|order|chaos|harmony|discord|unity|division|peace|conflict|war|victory|defeat|triumph|failure|success|progress|decline|growth|decay|creation|destruction|birth|death|beginning|end|alpha|omega|first|last|start|finish|opening|closing|entrance|exit|arrival|departure|meeting|parting|hello|goodbye|welcome|farewell|invitation|refusal|acceptance|rejection|agreement|disagreement|consent|objection|approval|disapproval|praise|blame|reward|punishment|gift|bribe|charity|theft|trade|exchange|sale|purchase|loan|debt|credit|interest|profit|loss|gain|waste|economy|wealth|poverty|riches|fortune|misfortune|luck|chance|fate|destiny|karma|providence|miracle|magic|spell|curse|blessing|prayer|wish|hope|desire|want|need|craving|addiction|habit|custom|routine|ritual|ceremony|tradition|innovation|invention|discovery|exploration|journey|voyage|expedition|adventure|quest|mission|task|duty|obligation|responsibility|burden|privilege|right|duty|obligation|responsibility|accountability|authority|power|control|influence|persuasion|coercion|force|violence|peace|diplomacy|negotiation|treaty|alliance|war|battle|siege|victory|defeat|conquest|liberation|occupation|independence|freedom|slavery|tyranny|democracy|republic|monarchy|empire|kingdom|nation|state|province|city|village|community|family|clan|tribe|people|race|ethnicity|language|culture|religion|ideology|philosophy|art|science|technology|medicine|law|politics|economy|education|sports|entertainment|media|news|information|communication|transport|travel|trade|commerce|industry|agriculture|fishing|mining|forestry|construction|manufacturing|engineering|architecture|design|fashion|music|dance|theater|film|literature|poetry|painting|sculpture|photography|cinema|television|radio|internet|computer|software|hardware|network|database|algorithm|programming|artificial_intelligence|machine_learning|robotics|biotechnology|nanotechnology|quantum_computing|space_exploration|astronomy|physics|chemistry|biology|geology|meteorology|oceanography|ecology|environment|climate|weather|pollution|conservation|sustainability|renewable_energy|fossil_fuel|nuclear|solar|wind|hydro|geothermal|biomass|hydrogen|fusion|fission|radiation|magnetism|electricity|gravity|thermodynamics|relativity|quantum_mechanics|string_theory|cosmology|particle_physics|genetics|evolution|anatomy|physiology|psychology|neuroscience|medicine|pharmacology|surgery|diagnosis|treatment|prevention|vaccine|antibiotic|hormone|enzyme|dna|rna|protein|cell|organ|tissue|organism|species|ecosystem|biodiversity|extinction|conservation|endangered|habitat|migration|adaptation|natural_selection|mutation|gene|chromosome|genome|epigenetics|cloning|stem_cell|gene_therapy|crispr|pcr|sequencing|bioinformatics|proteomics|metabolomics|transcriptomics|genomics|systems_biology|synthetic_biology|bioengineering|tissue_engineering|regenerative_medicine|personalized_medicine|precision_medicine|immunotherapy|gene_editing|synthetic_genomics|xenobiology|astrobiology|exobiology|planetary_protection|space_medicine|space_biology|space_genetics|space_evolution|space_ecology|space_agriculture|space_manufacturing|space_mining|space_energy|space_habitation|space_transportation|space_communication|space_navigation|space_observation|space_exploration|space_colonization|space_terraform|space_resources|space_law|space_policy|space_economics|space_politics|space_security|space_defense|space_weapon|space_surveillance|space_intelligence|space_reconnaissance|space_early_warning|space_missile_defense|space_based_solar_power|space_elevator|space_tether|space_hotel|space_station|space_laboratory|space_factory|space_farm|space_garden|space_park|space_museum|space_library|space_archive|space_university|space_school|space_hospital|space_clinic|space_pharmacy|space_laboratory|space_research|space_development|space_innovation|space_entrepreneurship|space_investment|space_funding|space_regulation|space_law|space_policy|space_diplomacy|space_cooperation|space_competition|space_conflict|space_peace|space_security|space_defense|space_weapon|space_surveillance|space_intelligence|space_reconnaissance|space_early_warning|space_missile_defense|space_based_solar_power|space_elevator|space_tether|space_hotel|space_station|space_laboratory|space_factory|space_farm|space_garden|space_park|space_museum|space_library|space_archive|space_university|space_school|space_hospital|space_clinic|space_pharmacy|space_laboratory|space_research|space_development|space_innovation|space_entrepreneurship|space_investment|space_funding|space_regulation/.test(meaning);
  
  const isTool = /tool|instrument|device|machine|equipment|apparatus|utensil|implement|weapon|key|lock|handle|button|switch|lever|pedal|dial|gauge|meter|sensor|detector|scanner|printer|plotter|monitor|display|screen|keyboard|mouse|trackpad|joystick|controller|headset|microphone|speaker|camera|lens|flash|tripod|filter|memory|storage|drive|disk|tape|card|chip|processor|motherboard|graphics|sound|network|modem|router|switch|hub|bridge|gateway|firewall|server|client|database|backup|archive|cloud|virtual|container|orchestration|deployment|monitoring|logging|analytics|testing|debugging|profiling|tracing|profiling|benchmarking|load_testing|stress_testing|chaos_engineering|site_reliability|devops|gitops|ci_cd|pipeline|build|test|deploy|release|rollback|canary|blue_green|feature_flag|ab_test|experiment|observability|telemetry|metrics|logs|traces|alerts|dashboards|visualization|alerting|on_call|incident_response|postmortem|runbook|playbook|sop|documentation|knowledge_base|wiki|faq|troubleshooting|debugging|root_cause|five_whys|fishbone|pareto|swot|risk|mitigation|contingency|business_continuity|disaster_recovery|backup|restore|failover|redundancy|high_availability|load_balancing|clustering|sharding|replication|partitioning|consistency|availability|partition_tolerance|cap_theorem|acid|base|eventual_consistency|strong_consistency|linearizability|serializability|isolation|atomicity|durability|transaction|concurrency|locking|deadlock|livelock|starvation|race_condition|critical_section|mutex|semaphore|monitor|condition_variable|barrier|read_write_lock|spinlock|rwlock|futex|epoll|iocp|async|await|promise|future|coroutine|generator|iterator|observable|stream|event|signal|callback|handler|listener|emitter|dispatcher|broadcast|multicast|unicast|anycast|broadcast|publish|subscribe|topic|queue|exchange|binding|routing|key|pattern|wildcard|header|property|message|payload|body|envelope|metadata|timestamp|correlation_id|causation_id|conversation_id|trace_id|span_id|parent_id|baggage|context|propagation|sampling|tracing|instrumentation|auto_instrumentation|manual_instrumentation|opentelemetry|jaeger|zipkin|lightstep|datadog|new_relic|appdynamics|dynatrace|splunk|elastic|grafana|prometheus|alertmanager|thanos|cortex|loki|tempo|pyroscope|parca|ebpf|perf|strace|ltrace|gdb|lldb|valgrind|asan|msan|tsan|ubsan|lsan|fsan|csan|ksan|msan|tsan|ubsan|lsan|fsan|csan|ksan/.test(meaning);
  
  // Generate two clues based on meaning
  const clues = [];
  
  // Clue 1: Is it a living thing?
  if (isAlive) {
    clues.push("Is it a living being? Yes");
  } else if (isTangible) {
    clues.push("Is it a living being? No");
  } else {
    clues.push("Is it a living being? No");
  }
  
  // Clue 2: Can you physically interact with it?
  if (isTangible || isTool) {
    clues.push("Can you touch or hold it? Yes");
  } else if (isAbstract) {
    clues.push("Can you touch or hold it? No");
  } else {
    clues.push("Can you hold it in your hand? " + (isTangible ? "Yes" : "No"));
  }
  
  return [clues[0], clues[1]];
}

// Detect radical for a kanji
function detectRadical(kanji) {
  if (!kanji || kanji.length === 0) return undefined;
  
  // For single character kanji, check if it's a radical itself
  if (kanji.length === 1 && RADICALS[kanji]) {
    const r = RADICALS[kanji];
    const breakdown = KANJI_BREAKDOWNS[kanji] || `${r.icon} ${r.name}`;
    return {
      charIndex: 0,
      glyph: kanji,
      icon: r.icon,
      name: r.name,
      position: r.position,
      breakdown
    };
  }
  
  // For multi-character kanji, check each character
  for (let i = 0; i < kanji.length; i++) {
    const char = kanji[i];
    if (RADICALS[char]) {
      const r = RADICALS[char];
      const breakdown = KANJI_BREAKDOWNS[kanji] || `${r.icon} ${r.name} + ${kanji}`;
      return {
        charIndex: i,
        glyph: char,
        icon: r.icon,
        name: r.name,
        position: r.position,
        breakdown
      };
    }
  }
  
  return undefined;
}

// Enrich each word
const enrichedWords = wordPool.map((word) => {
  const clues = generateClues(word);
  const radical = detectRadical(word.kanji);
  
  return {
    ...word,
    clues,
    radical
  };
});

// Generate the output file
const output = `export type PoolRelation = "true_friend" | "false_friend" | "half_friend";

export interface PoolWord {
  id: number;
  kanji: string;
  jp_reading: string;
  zh_pinyin: string;
  meaning_en: string;
  relation: PoolRelation;
  fun_fact: string;
  clues: [string, string];
  radical?: {
    charIndex: number;
    glyph: string;
    icon: string;
    name: string;
    position: "left" | "top" | "whole";
    breakdown: string;
  };
}

export const wordPool: PoolWord[] = ${JSON.stringify(enrichedWords, null, 2)};
`;

// Write to shared location
const sharedPath = path.resolve('src/shared/wordPool.ts');
fs.writeFileSync(sharedPath, output);

console.log(`Enriched ${enrichedWords.length} words`);
console.log(`Words with radicals: ${enrichedWords.filter(w => w.radical).length}`);
console.log(`Written to ${sharedPath}`);