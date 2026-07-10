export interface FortuneDimension { text: string; tag: string }
export interface FortuneResult { love: FortuneDimension; work: FortuneDimension; wealth: FortuneDimension; mood: FortuneDimension }

import { KNOWLEDGE_TIPS } from './knowledge-tips';

export { KNOWLEDGE_TIPS, getKnowledgeTipForDay } from './knowledge-tips';

const FORTUNES = {
  love: [
    { text: "今天适合主动表达心意，对方会感受到你的真诚。", tag: "缘分萌动" },
    { text: "独处也是充电，给自己一点空间反而让关系更轻松。", tag: "自我滋养" },
    { text: "与伴侣的沟通顺畅，适合一起规划未来。", tag: "默契升级" },
    { text: "今天桃花运不错，多出去走走会有意外惊喜。", tag: "桃花朵朵" },
    { text: "旧事重提的机会来了，适合解开之前的心结。", tag: "和解时机" },
    { text: "感情中保持平常心，过度在意反而容易失望。", tag: "顺其自然" },
    { text: "今天适合给在乎的人发一条温暖的消息。", tag: "温暖传递" },
    { text: "爱情需要仪式感，安排一点小浪漫吧。", tag: "甜蜜升温" },
  ],
  work: [
    { text: "工作效率在线，适合处理积压的任务。", tag: "事半功倍" },
    { text: "团队合作是关键，主动沟通能解决当前卡点。", tag: "协作共赢" },
    { text: "新的机会在向你招手，大胆表达你的想法。", tag: "机遇闪现" },
    { text: "今天不适合做重大决定，先收集信息再行动。", tag: "宜静不宜动" },
    { text: "你的努力正在被看见，继续保持节奏。", tag: "稳中求进" },
    { text: "遇到难题别硬扛，向有经验的人请教会有收获。", tag: "贵人相助" },
    { text: "创意灵感丰富，适合头脑风暴和策划新项目。", tag: "灵感迸发" },
    { text: "注意细节，今天容易在小事上出错。", tag: "细心为上" },
  ],
  wealth: [
    { text: "财运平稳，适合做财务规划和整理。", tag: "平稳致远" },
    { text: "有意外小收入的可能，留意捡漏机会。", tag: "意外之喜" },
    { text: "今天不适合冲动消费，三思而后买。", tag: "理性消费" },
    { text: "之前的投资开始有回响，保持耐心别急着出手。", tag: "守得云开" },
    { text: "人际关系带来财运，多和朋友交流会有收获。", tag: "人脉即财脉" },
    { text: "适合学习理财知识，长期来看是最值的投资。", tag: "知识生财" },
    { text: "今天财运不错，可尝试争取加薪或新的收入渠道。", tag: "财运亨通" },
    { text: "注意检查账单和账户细节，避免小损失。", tag: "谨慎为上" },
  ],
  mood: [
    { text: "整体能量偏高，积极的心态会带来好运气。", tag: "晴空万里" },
    { text: "有点小疲惫，给自己留半小时放空的时间。", tag: "宜休息" },
    { text: "今天容易被小事触动，给自己多一些温柔。", tag: "情绪敏感" },
    { text: "和正能量的人待在一起，心情会好很多。", tag: "向阳而生" },
    { text: "适合运动或出门走走，身体动起来心情也会跟着好。", tag: "活力满满" },
    { text: "内心平静的一天，适合读书、冥想或做喜欢的事。", tag: "岁月静好" },
    { text: "不要和别人比较，你的节奏刚刚好。", tag: "自在前行" },
    { text: "今天会有让你开心的小惊喜，保持期待。", tag: "小确幸" },
  ],
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

export function generateFortune(seed?: number): FortuneResult {
  const s = seed ?? Date.now()
  return {
    love: pick(FORTUNES.love, s + 1),
    work: pick(FORTUNES.work, s + 2),
    wealth: pick(FORTUNES.wealth, s + 3),
    mood: pick(FORTUNES.mood, s + 4),
  }
}

export const TAROT_TIPS = KNOWLEDGE_TIPS.map((tip) => ({
  title: tip.title.zh,
  content: tip.content.zh,
}));
