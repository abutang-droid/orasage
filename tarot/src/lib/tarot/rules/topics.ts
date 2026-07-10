/** 用户问题主题分类（规则层） */
export type ReadingTopic =
  | 'love'
  | 'career'
  | 'wealth'
  | 'study'
  | 'family'
  | 'relationship'
  | 'growth'
  | 'decision'
  | 'general';

export const READING_TOPICS: ReadingTopic[] = [
  'love',
  'career',
  'wealth',
  'study',
  'family',
  'relationship',
  'growth',
  'decision',
  'general',
];

export const TOPIC_LABELS: Record<ReadingTopic, { zh: string; en: string }> = {
  love: { zh: '爱情', en: 'Love' },
  career: { zh: '事业', en: 'Career' },
  wealth: { zh: '财富', en: 'Wealth' },
  study: { zh: '学业', en: 'Study' },
  family: { zh: '家庭', en: 'Family' },
  relationship: { zh: '人际', en: 'Relationships' },
  growth: { zh: '成长', en: 'Growth' },
  decision: { zh: '决策', en: 'Decision' },
  general: { zh: '整体', en: 'General' },
};

/** 关键词 → 主题映射（中英葡常见词） */
export const TOPIC_KEYWORDS: Record<ReadingTopic, string[]> = {
  love: [
    '爱情', '恋爱', '感情', '喜欢', '暗恋', '表白', '分手', '复合', '婚姻', '伴侣', '男友', '女友', '老公', '老婆', '桃花',
    'love', 'dating', 'relationship', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'crush', 'breakup',
    'amor', 'namoro', 'relacionamento', 'parceiro',
  ],
  career: [
    '事业', '工作', '职场', '升职', '跳槽', '面试', '老板', '同事', '项目', '创业', '公司', '职业',
    'career', 'job', 'work', 'promotion', 'interview', 'boss', 'startup', 'business',
    'carreira', 'trabalho', 'emprego',
  ],
  wealth: [
    '财富', '财运', '金钱', '收入', '投资', '理财', '债务', '贷款', '赚钱', '破财', '偏财',
    'wealth', 'money', 'finance', 'investment', 'income', 'debt', 'salary',
    'dinheiro', 'finanças', 'riqueza',
  ],
  study: [
    '学业', '考试', '学习', '升学', '考研', '留学', '成绩', '学校', '论文', '毕业',
    'study', 'exam', 'school', 'university', 'grade', 'education',
    'estudo', 'exame', 'escola',
  ],
  family: [
    '家庭', '父母', '孩子', '子女', '家人', '亲戚', '婆媳', '育儿',
    'family', 'parent', 'child', 'children', 'mother', 'father', 'home',
    'família', 'pais', 'filho',
  ],
  relationship: [
    '人际', '朋友', '社交', '人缘', '合作', '团队', '沟通', '矛盾', '冲突', '信任',
    'friend', 'social', 'team', 'conflict', 'communication', 'trust', 'people',
    'amizade', 'social', 'equipe',
  ],
  growth: [
    '成长', '自我', '内心', '疗愈', '情绪', '自信', '迷茫', '方向', '人生', '觉醒', '修行',
    'growth', 'self', 'healing', 'emotion', 'confidence', 'purpose', 'spiritual',
    'crescimento', 'autoconhecimento',
  ],
  decision: [
    '决策', '选择', '要不要', '该不该', '怎么办', '取舍', '犹豫', '纠结', '方向',
    'decision', 'choice', 'should i', 'whether', 'dilemma', 'option',
    'decisão', 'escolha',
  ],
  general: [],
};

/** 问答选项 → 主题（抽牌前引导题） */
export const ANSWER_TOPIC_HINTS: Record<string, ReadingTopic> = {
  '事情的走向': 'decision',
  '我该怎么选': 'decision',
  '对方的心意': 'love',
  '时机是否成熟': 'decision',
  '我内心的阻碍': 'growth',
  '工作': 'career',
  '感情': 'love',
  '事业': 'career',
  '财运': 'wealth',
  '整体': 'general',
};
