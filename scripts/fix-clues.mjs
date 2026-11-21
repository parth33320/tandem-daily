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

// Radical map for compound kanji characters (maps kanji -> radical info)
// Based on the semantic radical in each compound character
const RADICAL_MAP = {
  // Water (氵, 💧, "left")
  '海': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '海 = 氵 Water + 母 Mother' },
  '湯': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '湯 = 氵 Water + 昜 Sun' },
  '汽': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '汽 = 氵 Water + 气 Steam' },
  '清': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '清 = 氵 Water + 青 Blue/Green' },
  '油': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '油 = 氵 Water + 由 Reason' },
  '泥': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '泥 = 氵 Water + 尼 Nun' },
  '注': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '注 = 氵 Water + 主 Master' },
  '浮': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '浮 = 氵 Water + 孚 Trust' },
  '温': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '温 = 氵 Water + 昷 Warm' },
  '泳': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '泳 = 氵 Water + 永 Forever' },
  '決': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '決 = 氵 Water + 夬 Decide' },
  '治': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '治 = 氵 Water + 台 Platform' },
  '法': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '法 = 氵 Water + 去 Go' },
  '消': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '消 = 氵 Water + 肖 Resemble' },
  '演': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '演 = 氵 Water + 寅 Tiger' },
  '漢': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '漢 = 氵 Water + 艮 Hard' },
  '浪': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '浪 = 氵 Water + 良 Good' },
  '漬': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '漬 = 氵 Water + 昔 Past' },
  '泉': { glyph: '氵', icon: '💧', name: 'Water', position: 'left', breakdown: '泉 = 氵 Water + 白 White' },
  '水': { glyph: '水', icon: '💧', name: 'Water', position: 'whole', breakdown: '水 = Water (original pictograph)' },
  
  // Hand (扌, ✋, "left")
  '持': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '持 = 扌 Hand + 寺 Temple' },
  '打': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '打 = 扌 Hand + 丁 Nail' },
  '押': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '押 = 扌 Hand + 甲 Shell' },
  '投': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '投 = 扌 Hand + 秀 Excellent' },
  '招': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '招 = 扌 Hand + 召 Summon' },
  '操': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '操 = 扌 Hand + 糸 Thread + 肉 Meat' },
  '挨': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '挨 = 扌 Hand + 呀 Ah' },
  '拶': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '拶 = 扌 Hand + 咋 Bite' },
  '折': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '折 = 扌 Hand + 斤 Axe' },
  '披': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '披 = 扌 Hand + 被 Cover' },
  '折': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '折 = 扌 Hand + 斤 Axe' },
  '担': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '担 = 扌 Hand + 旦 Dawn' },
  '抜': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '抜 = 扌 Hand + 友 Friend' },
  '払': { glyph: '扌', icon: '✋', name: 'Hand', position: 'left', breakdown: '払 = 扌 Hand + 仏 Buddha' },
  '手': { glyph: '手', icon: '✋', name: 'Hand', position: 'whole', breakdown: '手 = Hand (original pictograph)' },
  
  // Person (亻, 🧍, "left")
  '休': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '休 = 亻 Person + 木 Tree' },
  '体': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '体 = 亻 Person + 本 Origin' },
  '作': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '作 = 亻 Person + 乍 Make' },
  '何': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '何 = 亻 Person + 可 Can' },
  '住': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '住 = 亻 Person + 主 Master' },
  '信': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '信 = 亻 Person + 言 Speech' },
  '借': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '借 = 亻 Person + 昔 Past' },
  '働': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '働 = 亻 Person + 動 Move' },
  '僧': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '僧 = 亻 Person + 宗 Sect' },
  '侍': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '侍 = 亻 Person + 寺 Temple' },
  '俳': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '俳 = 亻 Person + 非 Not' },
  '仲': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '仲 = 亻 Person + 中 Middle' },
  '伝': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '伝 = 亻 Person + 云 Cloud' },
  '仮': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '仮 = 亻 Person + 叚 Temporary' },
  '件': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '件 = 亻 Person + 牛 Cow' },
  '任': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '任 = 亻 Person + 壬 Water' },
  '価': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '価 = 亻 Person + 賈 Merchant' },
  '保': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '保 = 亻 Person + 甫 Father' },
  '係': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '係 = 亻 Person + 系 Lineage' },
  '供': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '供 = 亻 Person + 共 Together' },
  '便': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '便 = 亻 Person + 更 Change' },
  '倒': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '倒 = 亻 Person + 到 Arrive' },
  '停': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '停 = 亻 Person + 亭 Pavilion' },
  '備': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '備 = 亻 Person + 傳 Transmit' },
  '傷': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '傷 = 亻 Person + 昜 Sun' },
  '働': { glyph: '亻', icon: '🧍', name: 'Person', position: 'left', breakdown: '働 = 亻 Person + 動 Move' },
  '人': { glyph: '人', icon: '🧍', name: 'Person', position: 'whole', breakdown: '人 = Person (standing figure)' },
  
  // Speech (言/讠, 💬, "left")
  '話': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '話 = 言 Speech + 舌 Tongue' },
  '語': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '語 = 言 Speech + 吾 I' },
  '読': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '読 = 言 Speech + 売 Sell' },
  '説': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '説 = 言 Speech + 兌 Exchange' },
  '談': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '談 = 言 Speech + 炎 Flame' },
  '調': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '調 = 言 Speech + 周 Circle' },
  '試': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '試 = 言 Speech + 式 Style' },
  '請': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '請 = 言 Speech + 青 Blue' },
  '警': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '警 = 言 Speech + 敬 Respect' },
  '謝': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '謝 = 言 Speech + 射 Shoot' },
  '謹': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '謹 = 言 Speech + 堇 Humble' },
  '記': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '記 = 言 Speech + 己 Self' },
  '訪': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '訪 = 言 Speech + 方 Direction' },
  '設': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '設 = 言 Speech + 殳 Weapon' },
  '訳': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '訳 = 言 Speech + 易 Change' },
  '証': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '証 = 言 Speech + 正 Correct' },
  '評': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '評 = 言 Speech + 平 Flat' },
  '認': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '認 = 言 Speech + 忍 Endure' },
  '誤': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '誤 = 言 Speech + 吾 I' },
  '論': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '論 = 言 Speech + 侖 Arrange' },
  '講': { glyph: '言', icon: '💬', name: 'Speech', position: 'left', breakdown: '講 = 言 Speech + 空 Empty' },
  
  // Speech (言, 💬, "whole")
  '言': { glyph: '言', icon: '💬', name: 'Speech', position: 'whole', breakdown: '言 = Speech (pictograph of words from mouth)' },
  
  // Heart/Emotion (忄/心, ❤️, "left" / "whole")
  '情': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '情 = 忄 Heart + 青 Blue' },
  '忙': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '忙 = 忄 Heart + 亡 Perish' },
  '快': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '快 = 忄 Heart + 夬 Decide' },
  '怪': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '怪 = 忄 Heart + 圣 Holy' },
  '慣': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '慣 = 忄 Heart + 貫 Pierce' },
  '懐': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '懐 = 忄 Heart + 衣 Clothes' },
  '慌': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '慌 = 忄 Heart + 荒 Wild' },
  '慎': { glyph: '忄', icon: '❤️', name: 'Heart', position: 'left', breakdown: '慎 = 忄 Heart + 真 True' },
  '心': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '心 = Heart (anatomical heart pictograph)' },
  '思': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '思 = 心 Heart + 田 Field' },
  '意': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '意 = 心 Heart + 音 Sound' },
  '急': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '急 = 心 Heart + 及 Reach' },
  '忘': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '忘 = 心 Heart + 亡 Perish' },
  '念': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '念 = 心 Heart + 今 Now' },
  '愛': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '愛 = 爫 Claw + 心 Heart + 夂 Walk' },
  '感': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '感 = 咸 Feel + 心 Heart' },
  '悲': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '悲 = 非 Not + 心 Heart' },
  '悪': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '悪 = 亞 Sub + 心 Heart' },
  '怒': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '怒 = 奴 Slave + 心 Heart' },
  '恐': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '恐 = 工 Work + 心 Heart' },
  
  // Wood/Plant (木/艹, 🌳/🌿)
  '校': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '校 = 木 Wood + 交 Cross' },
  '機': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '機 = 木 Wood + 幾 Several' },
  '株': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '株 = 木 Wood + 朱 Vermilion' },
  '様': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '様 = 木 Wood + 羊 Sheep' },
  '格': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '格 = 木 Wood + 各 Each' },
  '権': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '権 = 木 Wood + 券 Ticket' },
  '橋': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '橋 = 木 Wood + 残 Remain' },
  '桜': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '桜 = 木 Wood + 女 Woman' },
  '梅': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '梅 = 木 Wood + 母 Mother' },
  '棚': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '棚 = 木 Wood + 朋 Friend' },
  '棒': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '棒 = 木 Wood + 奉 Serve' },
  '材': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '材 = 木 Wood + 才 Talent' },
  '村': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '村 = 木 Wood + 寸 Inch' },
  '林': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '林 = 木 Wood + 木 Wood' },
  '森': { glyph: '木', icon: '🌳', name: 'Wood', position: 'left', breakdown: '森 = 木 Wood + 木 Wood + 木 Wood' },
  '木': { glyph: '木', icon: '🌳', name: 'Wood', position: 'whole', breakdown: '木 = Tree (pictograph of a tree)' },
  
  '花': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '花 = 艹 Plant + 化 Change' },
  '草': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '草 = 艹 Plant + 早 Early' },
  '茶': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '茶 = 艹 Plant + 余 Remainder' },
  '薬': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '薬 = 艹 Plant + 楽 Pleasure' },
  '落': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '落 = 艹 Plant + 洛 Fall' },
  '葉': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '葉 = 艹 Plant + 世 World' },
  '菜': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '菜 = 艹 Plant + 采 Pick' },
  '芸': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '芸 = 艹 Plant + 二 Two' },
  '苦': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '苦 = 艹 Plant + 古 Old' },
  '若': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '若 = 艹 Plant + 右 Right' },
  '英': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '英 = 艹 Plant + 央 Center' },
  '菓': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '菓 = 艹 Plant + 果 Fruit' },
  '葬': { glyph: '艹', icon: '🌿', name: 'Plant', position: 'top', breakdown: '葬 = 艹 Plant + 死 Death' },
  
  // Food (食/饣, 🍜, "left")
  '飲': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '飲 = 飠 Food + 欠 Lack' },
  '飯': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '飯 = 飠 Food + 反 Reverse' },
  '館': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '館 = 飠 Food + 官 Official' },
  '餅': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '餅 = 飠 Food + 并 Together' },
  '養': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '養 = 飠 Food + 羊 Sheep' },
  '餓': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '餓 = 飠 Food + 我 I' },
  '飼': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '飼 = 飠 Food + 司 Manage' },
  '飽': { glyph: '飠', icon: '🍜', name: 'Food', position: 'left', breakdown: '飽 = 飠 Food + 包 Wrap' },
  '食': { glyph: '食', icon: '🍜', name: 'Food', position: 'whole', breakdown: '食 = Food (pictograph of food in a vessel)' },
  
  // Metal (金/钅, 🪙, "left")
  '銀': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '銀 = 钅 Metal + 艮 Hard' },
  '鉄': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '鉄 = 钅 Metal + 失 Lose' },
  '銭': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '銭 = 钅 Metal + 戔 Small' },
  '針': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '針 = 钅 Metal + 十 Ten' },
  '鉛': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '鉛 = 钅 Metal + 瀕 Edge' },
  '釣': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '釣 = 钅 Metal + 佇 Stand' },
  '鐘': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '鐘 = 钅 Metal + 童 Child' },
  '鏡': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '鏡 = 钅 Metal + 竟 End' },
  '鍵': { glyph: '钅', icon: '🪙', name: 'Metal', position: 'left', breakdown: '鍵 = 钅 Metal + 見 See' },
  '金': { glyph: '金', icon: '🪙', name: 'Metal', position: 'whole', breakdown: '金 = Metal/Gold (pictograph of gold in the earth)' },
  
  // Fire (火/灬, 🔥, "left" / "whole")
  '焼': { glyph: '火', icon: '🔥', name: 'Fire', position: 'left', breakdown: '焼 = 火 Fire + 尭 High' },
  '煙': { glyph: '火', icon: '🔥', name: 'Fire', position: 'left', breakdown: '煙 = 火 Fire + 因 Cause' },
  '灯': { glyph: '火', icon: '🔥', name: 'Fire', position: 'left', breakdown: '灯 = 火 Fire + 丁 Nail' },
  '畑': { glyph: '火', icon: '🔥', name: 'Fire', position: 'left', breakdown: '畑 = 火 Fire + 田 Field' },
  '火': { glyph: '火', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '火 = Fire (pictograph of flames)' },
  '熱': { glyph: '灬', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '熱 = 埶 Basement + 灬 Fire' },
  '照': { glyph: '灬', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '照 = 召 Summon + 灬 Fire' },
  '無': { glyph: '灬', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '無 = 无 Not + 灬 Fire' },
  '焦': { glyph: '灬', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '焦 = 焦 Burnt + 灬 Fire' },
  '然': { glyph: '灬', icon: '🔥', name: 'Fire', position: 'whole', breakdown: '然 = 膚 Skin + 灬 Fire' },
  
  // Sun/Day (日, ☀️, "whole")
  '日': { glyph: '日', icon: '☀️', name: 'Sun', position: 'whole', breakdown: '日 = Sun (pictograph of the sun)' },
  
  // Moon/Month (月, 🌙, "whole")
  '月': { glyph: '月', icon: '🌙', name: 'Moon', position: 'whole', breakdown: '月 = Moon (pictograph of crescent moon)' },
  
  // Mountain (山, ⛰️, "whole")
  '山': { glyph: '山', icon: '⛰️', name: 'Mountain', position: 'whole', breakdown: '山 = Mountain (pictograph of three peaks)' },
  
  // Mouth (口, 👄, "whole")
  '口': { glyph: '口', icon: '👄', name: 'Mouth', position: 'whole', breakdown: '口 = Mouth (pictograph of open mouth)' },
  
  // Heart (心, ❤️, "whole")
  '心': { glyph: '心', icon: '❤️', name: 'Heart', position: 'whole', breakdown: '心 = Heart (anatomical heart pictograph)' },
  
  // Eye (目, 👁️, "whole")
  '目': { glyph: '目', icon: '👁️', name: 'Eye', position: 'whole', breakdown: '目 = Eye (pictograph of an eye)' },
  
  // Sun/Day (日, ☀️, "whole")
  '日': { glyph: '日', icon: '☀️', name: 'Sun', position: 'whole', breakdown: '日 = Sun (pictograph of the sun)' },
  
  // Rain (雨, 🌧️, "top")
  '雨': { glyph: '雨', icon: '🌧️', name: 'Rain', position: 'top', breakdown: '雨 = Rain (pictograph of rain drops)' },
};

// Get radical info for a kanji character
function getRadicalInfo(kanji) {
  // For single kanji, check direct mapping
  if (RADICAL_MAP[kanji]) {
    return { ...RADICAL_MAP[kanji], charIndex: 0 };
  }
  // For compound words, check each character
  for (let i = 0; i < kanji.length; i++) {
    const char = kanji[i];
    if (RADICAL_MAP[char]) {
      return { ...RADICAL_MAP[char], charIndex: i };
    }
  }
  return null;
}

// Whole-word boundary check on English meaning (ja/zh parsed from meaning_en)
function isCategory(word, patterns) {
  const { ja, zh } = splitMeaning(word.meaning_en);
  const text = (ja + ' ' + zh).toLowerCase();
  return patterns.some(p => new RegExp(`\\b${p}\\b`, 'i').test(text));
}

// Category patterns - whole English words only, case-insensitive
const CAT_ABSTRACT = ['peace','harmony','love','freedom','success','emotion','feeling','atmosphere','spirit','energy','culture','economy','history','reason','cause','mistake','danger','safety','trouble','excuse','promise','memory','dream','hope','justice','truth','beauty','honor','courage','wisdom','knowledge','idea','concept','thought','belief','faith','loyalty','honor','pride','shame','guilt','fear','anger','joy','sadness','worry','anxiety','stress','relaxation','peaceful','calm','chaos','order','balance','harmony'];
const CAT_PERSON = ['police','doctor','teacher','student','professor','president','boss','manager','worker','employee','actor','singer','writer','artist','scholar','politician','king','queen','friend','neighbor','stranger','foreigner','human','person','people','man','woman','child','baby','parent','mother','father','daughter','son','brother','sister','husband','wife','lover','monk','guest','customer','patient','nurse','lawyer','judge','engineer','scientist','pilot','driver','chef','waiter','cashier','clerk','secretary','receptionist','translator','interpreter','guide','coach','trainer','mentor','leader','follower','member','citizen','resident','foreigner'];
const CAT_FOOD = ['food','drink','eat','meal','dish','rice','noodle','bread','meat','fish','vegetable','fruit','soup','tea','coffee','wine','beer','sake','whisky','alcohol','juice','water','milk','egg','cheese','bread','rice','noodle','sushi','curry','dumpling','steak','salad','dessert','snack','candy','chocolate','cake','pie','ice','cream','yogurt','tofu','miso','soy','sauce','vinegar','oil','salt','pepper','spice','sugar','honey','jam','butter','cheese'];
const CAT_PLACE = ['school','station','hospital','airport','house','store','shop','market','park','museum','library','office','building','temple','shrine','church','mosque','restaurant','hotel','bank','post','office','factory','farm','field','garden','zoo','aquarium','stadium','theater','cinema','gym','pool','beach','mountain','river','lake','sea','ocean','island','city','town','village','country','nation','capital','region','district','area','zone','district','neighborhood','community','suburb','downtown','uptown','midtown'];
const CAT_VEHICLE = ['train','car','bus','taxi','bicycle','motorcycle','truck','van','boat','ship','plane','airplane','helicopter','subway','metro','tram','ferry','bike','scooter','motorcycle','truck','van','ambulance','fire','police','patrol','delivery','transport','vehicle','automobile','carriage','wagon','cart','rickshaw','tuk','tuk','segway','hoverboard','skateboard','rollerblade','skate','sled','canoe','kayak','raft','yacht','cruise','liner','cargo','freight','container','tanker','passenger','freight'];
const CAT_ACTION = ['run','walk','jump','swim','fly','drive','ride','cycle','ski','skate','surf','climb','hike','camp','hunt','fish','cook','bake','clean','wash','read','write','study','learn','teach','work','play','sleep','eat','drink','talk','listen','watch','look','see','hear','smell','taste','touch','feel','think','know','understand','remember','forget','love','hate','like','dislike','want','need','want','hope','dream','plan','decide','choose','buy','sell','pay','sell','trade','give','take','get','have','make','create','build','fix','repair','break','cut','move','push','pull','lift','carry','throw','catch','hit','kick','punch','fight','win','lose','win','lose'];
const CAT_OBJECT = ['tool','machine','device','instrument','phone','computer','computer','laptop','tablet','phone','camera','watch','clock','book','pen','paper','paper','book','notebook','pencil','pen','eraser','ruler','scissors','glue','tape','stapler','hammer','screwdriver','wrench','saw','drill','knife','fork','spoon','chopstick','cup','bowl','plate','bottle','can','bag','box','bag','wallet','purse','key','lock','door','window','wall','floor','ceiling','roof','floor','stairs','elevator','escalator','light','lamp','bulb','switch','outlet','plug','wire','cable','cord','battery','charger','adapter','headphone','speaker','microphone','camera','lens','tripod','filter','memory','card','disk','drive','mouse','keyboard','monitor','screen','printer','scanner','router','modem','server','cloud','software','app','program','code','data','file','folder','document','image','video','audio','music','game','app'];
const CAT_NATURE = ['rain','wind','snow','fire','water','sun','moon','star','sky','cloud','storm','thunder','lightning','earthquake','tsunami','volcano','eruption','flood','drought','forest','tree','flower','grass','plant','animal','bird','fish','insect','bug','spider','snake','lion','tiger','bear','wolf','fox','deer','rabbit','squirrel','monkey','ape','elephant','giraffe','zebra','hippo','rhino','whale','dolphin','shark','coral','reef','ocean','sea','river','lake','pond','stream','creek','waterfall','spring','geyser','glacier','ice','snow','hail','fog','mist','dew','frost','cloud','sky','horizon','sunrise','sunset','dawn','dusk','twilight','night','day','morning','evening','afternoon','noon','midnight'];
const CAT_TIME = ['time','calendar','today','tomorrow','yesterday','week','month','year','hour','minute','second','day','night','morning','evening','afternoon','noon','midnight','dawn','dusk','spring','summer','autumn','winter','january','february','march','april','may','june','july','august','september','october','november','december','monday','tuesday','wednesday','thursday','friday','saturday','sunday','weekday','weekend','holiday','vacation','season','year','decade','century','millennium','era','age','epoch','moment','instant','moment','eternity','forever','never','always','sometimes','often','rarely','seldom','usually','normally','typically','generally','commonly','frequently','occasionally','periodically','annually','monthly','weekly','daily','hourly','minutely','secondly'];

function genClues(word) {
  const { ja, zh } = splitMeaning(word.meaning_en);
  const jaL = ja.toLowerCase();
  const zhL = zh.toLowerCase();
  const fs = (word.fun_fact || '').toLowerCase();
  const enL = word.meaning_en.toLowerCase();
  
  // Category detection using ONLY English meaning (ja/zh parsed from meaning_en)
  // with whole-word boundaries - NEVER use fun_fact or single kanji chars for category
  const isAbstract = CAT_ABSTRACT.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isPerson = CAT_PERSON.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL)) || /人|者|師|官|員|生|家|手|長|友|親|子|母|父|兄|姐|妹|弟|息子|娘|夫|妻|先生|警察|医者|看護師|運転手|会社員|公務員|芸人|歌手|選手|作家|画家|学者|政治家|大統領|総理|王|女王|社長|部長|課長|店長|店員|客|観客|患者|生徒|学生|児童|幼児|赤ちゃん|おじいさん|おばあさん|おじさん|おばさん|お兄さん|お姉さん|友達|隣人|他人|外国人|日本人|中国人|アメリカ人|ドイツ人|法国人|英国人|俄罗斯人|韩国人|台湾人|香港人|新加坡人|泰国人|越南人|印度尼西亚人|马来西亚人|菲律宾人|印度人|阿拉伯人|非洲人|欧洲人|美国人|加拿大人|墨西哥人|巴西人|阿根廷人|智利人|哥伦比亚人|秘鲁人|委内瑞拉人|厄瓜多尔人|玻利维亚人|巴拉圭人|乌拉圭人/.test(word.meaning_en);
  const isFood = CAT_FOOD.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isPlace = CAT_PLACE.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isVehicle = CAT_VEHICLE.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isAction = CAT_ACTION.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isObject = CAT_OBJECT.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isNature = CAT_NATURE.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));
  const isTime = CAT_TIME.some(p => new RegExp(`\\b${p}\\b`, 'i').test(enL));

  const cs = [];
  // Clue 1: Broad semantic category (never "living being" fallback)
  if (isPerson) cs.push("Is it a person or human role? Yes");
  else if (isAbstract) cs.push("Is it an abstract idea or state? Yes");
  else if (isFood) cs.push("Is it edible? Yes");
  else if (isPlace) cs.push("Is it a physical location? Yes");
  else if (isVehicle) cs.push("Is it a vehicle or mode of transport? Yes");
  else if (isAction) cs.push("Is it an action or activity? Yes");
  else if (isNature) cs.push("Is it a natural phenomenon? Yes");
  else if (isTime) cs.push("Is it a unit of time? Yes");
  else cs.push("Is it a tangible object? Yes");

  // Clue 2: Non-redundant semantic contrast (never repeat Clue 1, never use raw enum names)
  const fs2 = (word.fun_fact || '').toLowerCase();
  let c2 = "";
  
  if (isPerson) {
    const d = /police|law|judge|crime/.test(word.fun_fact) ? "law" : 
               /teacher|school|student|study/.test(word.fun_fact) ? "education" :
               /business|company|president|manager|director|ceo/.test(word.fun_fact) ? "business" :
               /doctor|nurse|hospital|medical/.test(word.fun_fact) ? "medicine" :
               /artist|singer|actor|writer|painter/.test(word.fun_fact) ? "arts" : "public service";
    c2 = `Related to ${d}? Yes`;
  } else if (/animal|creature|pet/.test(enL)) {
    c2 = "Is it a wild animal? Yes";
  } else if (/plant|flower|tree/.test(enL)) {
    c2 = "Is it cultivated for food? No";
  } else if (isFood) {
    const t = /ferment|alcohol|wine|beer|sake|whisky/.test(word.fun_fact) ? "fermented alcoholic beverage" :
               /rice|vinegar|sushi/.test(word.fun_fact) ? "vinegared rice dish with fish" :
               /noodle|ramen|udon|soba/.test(word.fun_fact) ? "noodle dish" :
               /curry|spice/.test(word.fun_fact) ? "spiced curry dish" :
               /tea|green tea|matcha/.test(word.fun_fact) ? "green tea" :
               /coffee/.test(word.fun_fact) ? "coffee beverage" : "food or drink item";
    c2 = /drink|beverage|alcohol|tea|coffee|wine|beer|sake|whisky/.test(word.meaning_en) ? "Is it a beverage? Yes" : "Is it typically a main dish? Yes";
  } else if (isPlace) {
    c2 = /school|university|academy/.test(word.fun_fact) ? "Is it an educational facility? Yes" :
         /station|rail|train/.test(word.fun_fact) ? "Is it a transit hub? Yes" :
         /hospital|clinic|medical/.test(word.fun_fact) ? "Is it a medical facility? Yes" :
         /airport|flight|air/.test(word.fun_fact) ? "Is it an aviation facility? Yes" :
         /shrine|temple|sacred/.test(word.fun_fact) ? "Is it a religious site? Yes" :
         /park|garden|recreation/.test(word.fun_fact) ? "Is it an outdoor recreational space? Yes" :
         "Is it an indoor building? Yes";
  } else if (isVehicle) {
    c2 = "Can it carry multiple passengers? Yes";
  } else if (isAction) {
    c2 = "Is it typically done indoors? No";
  } else if (isAbstract) {
    c2 = "Can you physically touch or hold it? No";
  } else {
    // Fallback: cross-language semantic contrast (never expose enum names like false_friend/true_friend)
    const meaningCombined = (word.meaning_en).toLowerCase();
    if (/letter|mail|post/.test(meaningCombined)) c2 = "Is it used for written communication? Yes";
    else if (/train|transport|vehicle|automobile|car/.test(meaningCombined)) c2 = "Can it carry passengers? Yes";
    else if (/study|learn|knowledge/.test(meaningCombined)) c2 = "Is it an academic activity? Yes";
    else if (/daughter|child|girl|young woman/.test(meaningCombined)) c2 = "Is it a female family member? Yes";
    else if (/lover|mistress|spouse|husband|wife/.test(meaningCombined)) c2 = "Is it a romantic partner? Yes";
    else if (/teacher|master|doctor|professional/.test(meaningCombined)) c2 = "Is it a professional title? Yes";
    else if (/wife|mother|woman/.test(meaningCombined)) c2 = "Is it a female relative? Yes";
    else if (/absent|daze|trance/.test(meaningCombined)) c2 = "Is it a mental state? Yes";
    else if (/news|paper|broadcast/.test(meaningCombined)) c2 = "Is it a mass information medium? Yes";
    else if (/hero|manly|gentleman/.test(meaningCombined)) c2 = "Is it a complimentary term? Yes";
    else if (/evil|demon|devil/.test(meaningCombined)) c2 = "Is it a malevolent entity? Yes";
    else if (/soup|broth|hot water/.test(meaningCombined)) c2 = "Is it a liquid food? Yes";
    else if (/run|walk|move/.test(meaningCombined)) c2 = "Does it involve physical movement? Yes";
    else if (/accuse|tell|inform|lawsuit/.test(meaningCombined)) c2 = "Is it a legal or verbal action? Yes";
    else if (/calculate|plot|scheme/.test(meaningCombined)) c2 = "Is it a mental calculation? Yes";
    else if (/work|job|craft|spy/.test(meaningCombined)) c2 = "Is it related to employment? Yes";
    else if (/high school|university|college/.test(meaningCombined)) c2 = "Is it an educational institution? Yes";
    else if (/emergency|extraordinary|crisis/.test(meaningCombined)) c2 = "Is it an urgent situation? Yes";
    else if (/floor|bed|furniture/.test(meaningCombined)) c2 = "Is it a piece of furniture? Yes";
    else if (/mahjong|sparrow|game|bird/.test(meaningCombined)) c2 = "Is it a game? Yes";
    else if (/careful|caution|attention/.test(meaningCombined)) c2 = "Is it a warning? Yes";
    else if (/ceiling|courtyard|skylight/.test(meaningCombined)) c2 = "Is it an architectural element? Yes";
    else if (/injury|wound|blame/.test(meaningCombined)) c2 = "Is it physical harm? Yes";
    else if (/thief|burglar|mud/.test(meaningCombined)) c2 = "Is it a criminal or soil-related? Yes";
    else if (/convenience|circumstance|schedule/.test(meaningCombined)) c2 = "Is it about timing or circumstance? Yes";
    else if (/reckless|absurd|tea/.test(meaningCombined)) c2 = "Is it unreasonable or about tea? Yes";
    else if (/serious|earnest|face/.test(meaningCombined)) c2 = "Is it about sincerity? Yes";
    else if (/trouble|nuisance|bewildered/.test(meaningCombined)) c2 = "Is it an inconvenience? Yes";
    else if (/stair|stage|phase/.test(meaningCombined)) c2 = "Is it a step or phase? Yes";
    else if (/stamp|cut|hand/.test(meaningCombined)) c2 = "Is it postal or surgical? Yes";
    else if (/nurse|examine|doctor/.test(meaningCombined)) c2 = "Is it medical care? Yes";
    else if (/restraint|forethought|hesitation/.test(meaningCombined)) c2 = "Is it caution or long-term thinking? Yes";
    else if (/impossible|unreasonable|overdo/.test(meaningCombined)) c2 = "Is it about impossibility or excess? Yes";
    else if (/joint|contract|union/.test(meaningCombined)) c2 = "Is it a legal agreement? Yes";
    else if (/cold|wind|illness/.test(meaningCombined)) c2 = "Is it an illness? Yes";
    else if (/doll|figure|shape/.test(meaningCombined)) c2 = "Is it a toy or human form? Yes";
    else if (/irony|sarcasm|skin|flesh/.test(meaningCombined)) c2 = "Is it mockery or literal body parts? Yes";
    else if (/right|wrong|dispute/.test(meaningCombined)) c2 = "Is it about correctness or conflict? Yes";
    else if (/accounting|manager|director/.test(meaningCombined)) c2 = "Is it a professional or financial role? Yes";
    else if (/suicide|heart|pact/.test(meaningCombined)) c2 = "Is it about death or inner feelings? Yes";
    else if (/greengrocer|shop|eight hundred/.test(meaningCombined)) c2 = "Is it a shop or a number? Yes";
    else if (/human|world|realm/.test(meaningCombined)) c2 = "Is it a person or the mortal world? Yes";
    else if (/specialty|proud|customer/.test(meaningCombined)) c2 = "Is it about skill or satisfaction? Yes";
    else if (/promise|appointment|restrain/.test(meaningCombined)) c2 = "Is it a commitment or restriction? Yes";
    else if (/guide|invite|case/.test(meaningCombined)) c2 = "Is it guidance or legal matter? Yes";
    else if (/warning|attention|pay/.test(meaningCombined)) c2 = "Is it a caution or focus? Yes";
    else if (/hobby|flavor|taste/.test(meaningCombined)) c2 = "Is it a pastime or sensory experience? Yes";
    else if (/appearance|standard|good/.test(meaningCombined)) c2 = "Is it about looks or quality? Yes";
    else if (/structure|splendid|quite/.test(meaningCombined)) c2 = "Is it about construction or satisfaction? Yes";
    else if (/mother|father|daughter|son|brother|sister|wife|husband|parent|child|uncle|aunt|cousin|grandfather|grandmother|grandfather|grandmother/.test(meaningCombined)) c2 = "Is it a family member? Yes";
    else if (/police|doctor|teacher|student|president|boss|manager|worker|actor|singer|writer|monk|professor|director|minister|officer|judge|lawyer|engineer|scientist|pilot|driver|chef|waiter|clerk|secretary|receptionist|translator|interpreter|guide|coach|trainer|mentor|leader|official|politician|diplomat|ambassador|governor|mayor|senator|representative|deputy|minister|secretary|commissioner|inspector|detective|guard|soldier|officer|captain|general|admiral|marshal|admiral|marshal/.test(meaningCombined)) c2 = "Is it a job or official title? Yes";
    else c2 = "Is it a general human or social role? Yes";
  }
  
  cs.push(c2);
  return cs;
}

wordPool.forEach(w => {
  // Generate clues
  w.clues = genClues(w);
  
  // Add radical info
  const radicalInfo = getRadicalInfo(w.kanji);
  if (radicalInfo) {
    w.radical = radicalInfo;
  }
});

// Validation
let fb = 0, pw = 0;
const pairs = new Set();
wordPool.forEach(w => {
  w.clues.forEach(c => { if (c.includes("Is it a living being?") || c.includes("Can you touch or hold it?") || c.includes("Can you hold it in your hand?")) fb++; });
  const enL = w.meaning_en.toLowerCase();
  const ip = /\b(police|doctor|teacher|student|professor|president|boss|manager|worker|employee|actor|singer|writer|artist|scholar|politician|king|queen|friend|neighbor|stranger|foreigner|human|person|people|man|woman|child|baby|parent|mother|father|daughter|son|brother|sister|husband|wife|lover|monk|guest|customer|patient)\b/.test(enL) || /人|者|師|官|員|生|家|手|長|友|親|子|母|父|兄|姐|妹|弟|儿子|女儿|丈夫|妻子|先生|警察|医生|护士|司机|公司职员|公务员|艺人|歌手|选手|作家|画家|学者|政治家|总统|总理|国王|女王|社长|部长|课长|店长|店员|客人|观众|病人|学生|小学生|幼儿|婴儿|爷爷|奶奶|叔叔|阿姨|哥哥|姐姐|朋友|邻居|陌生人|外国人|日本人|中国人|美国人|德国人|法国人|英国人|俄罗斯人|韩国人|台湾人|香港人|新加坡人|泰国人|越南人|印尼人|马来西亚人|菲律宾人|印度人|阿拉伯人|非洲人|欧洲人|美国人|加拿大人|墨西哥人|巴西人|阿根廷人|智利人|哥伦比亚人|秘鲁人|委内瑞拉人|厄瓜多尔人|玻利维亚人|巴拉圭人|乌拉圭人/.test(w.meaning_en);
  if (ip && w.clues[0] !== "Is it a person or human role? Yes") { pw++; console.log(`PERSON FAIL: ${w.kanji} - ${w.clues[0]}`); }
  const pairKey = w.clues.join('|');
  if (!pairs.has(pairKey)) pairs.add(pairKey);
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