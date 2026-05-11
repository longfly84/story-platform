import { userVietnameseProseReplacementRules, userVietnameseProseWarningRules } from './vietnameseProseUserRules.js'

export type VietnameseProseRuleCategory =
  | 'output_cleanup'
  | 'ai_metaphor'
  | 'convert_phrase'
  | 'unclear_sentence'
  | 'dialogue_role'
  | 'collocation'
  | 'technical_term'
  | 'slogan'

export type VietnameseProseRuleMode = 'replace' | 'template-replace' | 'warning'

export type VietnameseProseAppliedFix = {
  id: string
  category: VietnameseProseRuleCategory
  before: string
  after: string
  message: string
}

export type VietnameseProseIssue = {
  id: string
  category: VietnameseProseRuleCategory
  severity: 'low' | 'medium' | 'high'
  message: string
  genericSuggestion?: string
  sample?: string
}

type ReplacementFactory = (match: string, captures: string[]) => string

export type VietnameseProseRule = {
  id: string
  category: VietnameseProseRuleCategory
  severity: 'low' | 'medium' | 'high'
  mode: VietnameseProseRuleMode
  pattern: RegExp
  replacement?: string | ReplacementFactory
  message: string
  genericSuggestion?: string
  examples?: Array<{
    bad: string
    good: string
  }>
}

export type VietnameseProseQualityStats = {
  fixedCount: number
  warningCount: number
  allowedCount: number
  fixedSamples: VietnameseProseAppliedFix[]
  warningSamples: VietnameseProseIssue[]
  allowedSamples: string[]
}

export type VietnameseProseQualityResult = {
  text: string
  issues: VietnameseProseIssue[]
  appliedFixes: VietnameseProseAppliedFix[]
  stats: VietnameseProseQualityStats
}

function cleanSnippet(input: string, maxLength = 180) {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function normalizePocketPlace(input: string) {
  const value = String(input || '').trim().toLowerCase()
  if (!value) return 'tay'
  if (value.includes('lòng áo') || value.includes('ngực') || value.includes('trước ngực')) return 'túi áo'
  if (value === 'tay' || value.includes('trong tay')) return 'lòng bàn tay'
  return input.trim()
}

function expandReplacement(replacement: string, captures: string[]) {
  return replacement.replace(/\$(\d+)/g, (_, rawIndex) => {
    const index = Number(rawIndex) - 1
    return captures[index] ?? ''
  })
}

const replacementRules: VietnameseProseRule[] = [
  {
    id: 'cleanup-duplicated-story-title-before-chapter',
    category: 'output_cleanup',
    severity: 'high',
    mode: 'replace',
    pattern: /^\s*#\s*(?!BẢN ĐỌC|Chương)([^\n]{4,140})\n\s*(?:---\s*){1,4}(#\s*Chương\s+\d+\s*[—-])/i,
    replacement: '$2',
    message: 'Xóa title truyện và các dòng --- bị lọt trước tiêu đề chương.',
  },
  {
    id: 'cleanup-double-separator-before-chapter',
    category: 'output_cleanup',
    severity: 'high',
    mode: 'replace',
    pattern: /\n\s*---\s*\n\s*---\s*\n\s*(#\s*Chương\s+\d+\s*[—-])/gi,
    replacement: '\n\n$1',
    message: 'Xóa dấu phân cách --- --- bị lặp trước chương.',
  },
  {
    id: 'convert-little-child-prefix',
    category: 'convert_phrase',
    severity: 'high',
    mode: 'template-replace',
    pattern: /\btiểu\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][^\s,.!?;:"'“”]{0,24}(?:\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][^\s,.!?;:"'“”]{0,24}){0,2})\b/gi,
    replacement: 'bé $1',
    message: '“tiểu + tên trẻ nhỏ” nhiễm convert, đổi thành “bé + tên”.',
  },
  {
    id: 'convert-elder-lao-name',
    category: 'convert_phrase',
    severity: 'high',
    mode: 'template-replace',
    pattern: /\blão\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][^\s,.!?;:"'“”]{0,24}(?:\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][^\s,.!?;:"'“”]{0,24}){0,2})\b/gi,
    replacement: 'ông $1',
    message: '“lão + tên” nhiễm truyện dịch, đổi thành “ông + tên” trong bối cảnh hiện đại.',
  },
  {
    id: 'convert-lao-gia',
    category: 'convert_phrase',
    severity: 'high',
    mode: 'replace',
    pattern: /\blão\s+(?:đại gia|gia)\b/gi,
    replacement: 'ông cụ',
    message: '“lão gia/lão đại gia” nhiễm convert, đổi thành “ông cụ”.',
  },
  {
    id: 'dialogue-mixed-anh-ong',
    category: 'dialogue_role',
    severity: 'high',
    mode: 'template-replace',
    pattern: /"Anh\s+([^,"\n]{1,24}),"\s*([^"\n]{0,90})"ông thấy sao\?"/gi,
    replacement: '"Ông $1," $2"ông thấy nên xử lý thế nào?"',
    message: 'Sửa xưng hô lẫn “anh/ông” trong cùng câu thoại.',
  },
  {
    id: 'ai-smile-frozen',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /(?:khẽ\s+)?nở nụ cười như đóng băng|nụ cười như đóng băng/gi,
    replacement: 'khẽ nhếch môi',
    message: '“nụ cười như đóng băng” là ví von AI/convert, đổi thành cử chỉ cụ thể.',
  },
  {
    id: 'collocation-ngoẹo-dau',
    category: 'collocation',
    severity: 'medium',
    mode: 'replace',
    pattern: /\bngoẹo đầu\b/gi,
    replacement: 'nghiêng đầu',
    message: '“ngoẹo đầu” sai tai trong ngữ cảnh giao tiếp, đổi thành “nghiêng đầu”.',
  },
  {
    id: 'ai-half-truth-silence-gap',
    category: 'ai_metaphor',
    severity: 'high',
    mode: 'replace',
    pattern: /Câu nói đó\s*[—-]\s*chỉ một nửa sự thật\s*[—-]\s*lách qua khe im lặng và đổ lên vai tôi\.?/gi,
    replacement: 'Câu đó chỉ nói một nửa sự thật, nhưng đủ để mọi người nhìn sang tôi.',
    message: 'Đổi ẩn dụ “lách qua khe im lặng/đổ lên vai” thành phản ứng cụ thể.',
  },
  {
    id: 'ai-smooth-fan-voice',
    category: 'ai_metaphor',
    severity: 'high',
    mode: 'replace',
    pattern: /Giọng\s+([^,.\n]{1,24})\s+trơn như cánh quạt lùa qua/gi,
    replacement: '$1 nói rất nhẹ',
    message: '“giọng trơn như cánh quạt” sai tai, đổi thành cách nói cụ thể.',
  },
  {
    id: 'ai-colder-than-verdict',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Người thân bên chồng im lặng\s*[—-]\s*đó lạnh hơn mọi lời kết án\.?/gi,
    replacement: 'Điều khiến tôi khó chịu nhất không phải lời bà ta nói, mà là cả bàn không ai lên tiếng giúp tôi.',
    message: 'Đổi tổng kết cảm xúc trừu tượng thành tình huống cụ thể.',
  },
  {
    id: 'ai-heavy-voice-glass',
    category: 'ai_metaphor',
    severity: 'high',
    mode: 'replace',
    pattern: /tiếng đủ nặng để làm rơi ly rượu gần đó như im lặng/gi,
    replacement: 'giọng đủ nặng để cả bàn im xuống',
    message: 'Câu “làm rơi ly rượu như im lặng” sai nghĩa.',
  },
  {
    id: 'ai-breath-falls-void',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Một tiếng thở như bị bóp nghẹn rơi vào khoảng trống\.?/gi,
    replacement: 'Có người hít vào rất khẽ. Cả bàn lại im.',
    message: 'Đổi ẩn dụ tiếng thở thành phản ứng cụ thể.',
  },
  {
    id: 'unclear-eye-image-thread',
    category: 'unclear_sentence',
    severity: 'high',
    mode: 'replace',
    pattern: /cảm nhận đường chỉ trên khăn qua hình ảnh con mắt mình/gi,
    replacement: 'nhìn lại đường chỉ lệch trên mép khăn',
    message: 'Cụm “qua hình ảnh con mắt mình” sai tiếng Việt tự nhiên.',
  },
  {
    id: 'ai-right-question-waiting',
    category: 'slogan',
    severity: 'medium',
    mode: 'replace',
    pattern: /Nó bắt đầu bằng một câu hỏi đặt đúng chỗ\s*[—-]\s*và chờ đáp\.?/gi,
    replacement: 'Tôi chỉ cần hỏi đúng người, đúng lúc.',
    message: 'Câu kết “đặt đúng chỗ — và chờ đáp” giống slogan AI.',
  },
  {
    id: 'ai-school-gate-beehive',
    category: 'ai_metaphor',
    severity: 'low',
    mode: 'replace',
    pattern: /Cổng trường quốc tế chật như tổ ong buổi tan học\.?/gi,
    replacement: 'Cổng trường quốc tế giờ tan học chật kín phụ huynh.',
    message: '“chật như tổ ong” hơi ví von AI, đổi thành câu đời hơn.',
  },
  {
    id: 'collocation-hand-warm-milk-smell',
    category: 'collocation',
    severity: 'medium',
    mode: 'replace',
    pattern: /tay còn ấm mùi sữa trưa/gi,
    replacement: 'trên người bé vẫn còn thoang thoảng mùi sữa trưa',
    message: '“tay còn ấm mùi” sai kết hợp từ.',
  },
  {
    id: 'ai-words-like-needle-face',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Lời nói như kim châm vào mặt tôi giữa đám đông\.?/gi,
    replacement: 'Câu đó khiến vài phụ huynh quay sang nhìn tôi khó chịu.',
    message: 'Đổi ví von “kim châm” thành phản ứng của đám đông.',
  },
  {
    id: 'collocation-eyes-stuck-short',
    category: 'collocation',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Mắt tôi vẫn dán vào\s+([^.!?\n]{2,80})/gi,
    replacement: 'Tôi vẫn nhìn chằm chằm vào $1',
    message: '“mắt tôi vẫn dán vào” hơi gượng, đổi thành hành động nhìn cụ thể.',
  },
  {
    id: 'ai-public-opinion-hired',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /([^.!?\n]{2,50})\s+trông như đã thuê được cả tiếng nói công luận/gi,
    replacement: '$1 đứng giữa đám đông, vẻ mặt như thể mọi người đã đứng về phía mình',
    message: '“thuê được cả tiếng nói công luận” là câu AI/tổng kết.',
  },
  {
    id: 'ai-object-small-stone-in-clothes',
    category: 'ai_metaphor',
    severity: 'high',
    mode: 'template-replace',
    pattern: /Tôi\s+(?:giữ|cầm|nắm)\s+([^.!?\n]{2,60})\s+như\s+một\s+viên\s+đá\s+nhỏ\s+trong\s+([^.!?\n]{2,50})/gi,
    replacement: (_match: string, captures: string[]) => {
      const objectName = captures[0]?.trim() || 'vật đó'
      const place = normalizePocketPlace(captures[1] || 'túi áo')
      return `Tôi giữ chặt ${objectName} trong ${place}, không để ai chạm vào`
    },
    message: 'Ẩn dụ vật chứng như “viên đá nhỏ” gượng. Đổi thành hành động giữ vật chứng cụ thể.',
    genericSuggestion: 'Tôi giữ chặt [vật chứng] trong [tay/túi áo/túi xách], không để ai chạm vào.',
  },
  {
    id: 'ai-data-clear',
    category: 'unclear_sentence',
    severity: 'high',
    mode: 'replace',
    pattern: /Đó là dữ kiện rõ ràng\.?/gi,
    replacement: 'Câu đó đủ khiến cả phòng im xuống.',
    message: '“Đó là dữ kiện rõ ràng” là giọng phân tích, đổi thành phản ứng trong cảnh.',
  },
  {
    id: 'ai-power-shift',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /quyền lực dịch chuyển/gi,
    replacement: 'tình thế bắt đầu đổi khác',
    message: '“quyền lực dịch chuyển” sân khấu hóa.',
  },
  {
    id: 'ai-room-cold',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Cả phòng lạnh đi vài giây\.?/gi,
    replacement: 'Không ai nói gì trong vài giây.',
    message: 'Đổi “cả phòng lạnh đi” thành phản ứng cụ thể.',
  },
  {
    id: 'ai-eyes-turn-wrong',
    category: 'collocation',
    severity: 'high',
    mode: 'replace',
    pattern: /Mọi ánh mắt quẹo sang tôi/gi,
    replacement: 'Mọi người trong phòng đều quay sang nhìn tôi',
    message: '“ánh mắt quẹo sang” sai collocation.',
  },
  {
    id: 'convert-technical-dat-an',
    category: 'convert_phrase',
    severity: 'medium',
    mode: 'replace',
    pattern: /đặt ấn xuống bàn/gi,
    replacement: 'đặt mạnh xuống bàn',
    message: '“đặt ấn” Hán Việt/gượng.',
  },
  {
    id: 'collocation-thoang-chenh',
    category: 'collocation',
    severity: 'high',
    mode: 'replace',
    pattern: /thoáng chểnh/gi,
    replacement: 'im bớt',
    message: '“thoáng chểnh” sai tai.',
  },
  {
    id: 'wrong-crowd-corner',
    category: 'collocation',
    severity: 'high',
    mode: 'replace',
    pattern: /góc vực đông người/gi,
    replacement: 'phía đám đông',
    message: '“góc vực đông người” là lỗi dùng từ.',
  },
  {
    id: 'ai-machine-voice',
    category: 'convert_phrase',
    severity: 'medium',
    mode: 'replace',
    pattern: /giọng máy móc/gi,
    replacement: 'giọng đều đều',
    message: '“giọng máy móc” thường gượng, đổi thành “giọng đều đều”.',
  },
  {
    id: 'ai-memory-stick',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Cái âm vang ấy dính vào ký ức của tôi/gi,
    replacement: 'Tôi nhớ rất rõ âm thanh đó',
    message: '“dính vào ký ức” gượng.',
  },
  {
    id: 'ai-cold-stone-question',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Câu hỏi rơi vào tôi như một viên đá lạnh/gi,
    replacement: 'Tôi khựng lại khi nghe câu đó',
    message: 'Đổi ví von “viên đá lạnh” thành phản ứng cụ thể.',
  },
  {
    id: 'ai-direction-flash',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /trong tôi đã lóe lên hướng đi/gi,
    replacement: 'tôi biết mình phải bắt đầu từ đâu',
    message: '“lóe lên hướng đi” gượng.',
  },
]

const warningRules: VietnameseProseRule[] = [
  {
    id: 'warning-public-opinion',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'warning',
    pattern: /tiếng nói công luận|công luận/gi,
    message: 'Cụm “công luận/tiếng nói công luận” dễ nghe như bài phân tích.',
    genericSuggestion: 'Đổi thành phản ứng cụ thể: vài người quay sang nhìn, có người giơ điện thoại, tiếng bàn tán tăng lên.',
  },
  {
    id: 'warning-next-step-not-noisy',
    category: 'slogan',
    severity: 'medium',
    mode: 'warning',
    pattern: /Bước đi tiếp theo sẽ không ồn ào/gi,
    message: 'Câu “Bước đi tiếp theo sẽ không ồn ào” giống slogan cuối chương.',
    genericSuggestion: 'Đổi thành hành động cụ thể trước mắt của nhân vật.',
  },
  {
    id: 'warning-abstract-path',
    category: 'slogan',
    severity: 'medium',
    mode: 'warning',
    pattern: /có đường để đi|đường dẫn cần kiểm tra|đường sống đầu tiên/gi,
    message: 'Cụm “đường/đường dẫn/đường sống” dễ thành câu tổng kết AI.',
    genericSuggestion: 'Viết cụ thể nhân vật đang giữ vật chứng nào và sẽ kiểm tra ai/ở đâu.',
  },
  {
    id: 'warning-deadline-slogan',
    category: 'slogan',
    severity: 'medium',
    mode: 'warning',
    pattern: /hạn chót đã có|hạn chót của ngày|không định bỏ lỡ/gi,
    message: 'Cụm “hạn chót/không định bỏ lỡ” dễ thành slogan cuối chương.',
    genericSuggestion: 'Đổi thành thời gian cụ thể hoặc hậu quả cụ thể nếu chậm.',
  },
  {
    id: 'warning-convert-terms',
    category: 'convert_phrase',
    severity: 'high',
    mode: 'warning',
    pattern: /\bnữ tử\b|\bnam nhân\b|\bthanh âm\b|\bdiện mạo\b|\bcực hạn\b|\bthoát ly\b/gi,
    message: 'Từ Hán Việt/convert không hợp truyện đô thị hiện đại.',
    genericSuggestion: 'Dùng từ đời thường: người phụ nữ, người đàn ông, giọng nói, dáng vẻ, giới hạn, rời khỏi.',
  },
]


const viralAllowedPatterns: RegExp[] = [
  /tôi\s+bật\s+cười\s+lạnh/giu,
  /\bđược\s+lắm\b/giu,
  /\bhay\s+thật\b/giu,
  /anh\s+ta\s+tính\s+sai\s+rồi/giu,
  /một\s+cuộc\.\s*hai\s+cuộc\.\s*ba\s+cuộc/giu,
  /tôi\s+đã\s+chết\s+tâm/giu,
  /người\s+dưng\s+nước\s+lã/giu,
  /vỡ\s+phòng\s+ngự/giu,
  /tuyến\s+phòng\s+thủ\s+cuối\s+cùng\s+trong\s+lòng\s+tôi\s+cũng\s+sụp\s+đổ/giu,
  /điện\s+thoại[^.!?\n]{0,50}nổ\s+máy/giu,
  /ví\s+WeChat\s+hết\s+tiền/giu,
]

function findViralAllowedSamples(text: string) {
  const samples: string[] = []

  for (const pattern of viralAllowedPatterns) {
    const freshPattern = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null

    while ((match = freshPattern.exec(text)) && samples.length < 12) {
      samples.push(cleanSnippet(match[0]))
      if (!freshPattern.global) break
    }
  }

  return Array.from(new Set(samples)).slice(0, 12)
}

function applyRule(text: string, rule: VietnameseProseRule, appliedFixes: VietnameseProseAppliedFix[]) {
  const ruleReplacement = rule.replacement
  if (!ruleReplacement) return text

  return text.replace(rule.pattern, (...args: any[]) => {
    const match = String(args[0] || '')
    const captures = args.slice(1, -2).map((value) => String(value || ''))
    const replacement =
      typeof ruleReplacement === 'function'
        ? ruleReplacement(match, captures)
        : expandReplacement(ruleReplacement, captures)

    if (replacement !== match) {
      appliedFixes.push({
        id: rule.id,
        category: rule.category,
        before: cleanSnippet(match),
        after: cleanSnippet(replacement),
        message: rule.message,
      })
    }

    return replacement
  })
}

function findIssues(text: string, appliedFixes: VietnameseProseAppliedFix[]) {
  const issues: VietnameseProseIssue[] = []
  const fixedIds = new Set(appliedFixes.map((fix) => fix.id))

  for (const rule of [...replacementRules, ...userVietnameseProseReplacementRules, ...warningRules, ...userVietnameseProseWarningRules]) {
    if (rule.mode !== 'warning' && fixedIds.has(rule.id)) continue

    const freshPattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    const match = freshPattern.exec(text)
    if (!match) continue

    issues.push({
      id: rule.id,
      category: rule.category,
      severity: rule.severity,
      message: rule.message,
      genericSuggestion: rule.genericSuggestion,
      sample: cleanSnippet(match[0]),
    })
  }

  const unique = new Map<string, VietnameseProseIssue>()
  for (const issue of issues) {
    if (!unique.has(issue.id)) unique.set(issue.id, issue)
  }

  return [...unique.values()].slice(0, 12)
}

export function runVietnameseProseQualityPipeline(input: string): VietnameseProseQualityResult {
  let text = String(input || '')
  const appliedFixes: VietnameseProseAppliedFix[] = []

  for (const rule of [...replacementRules, ...userVietnameseProseReplacementRules]) {
    text = applyRule(text, rule, appliedFixes)
  }

  const issues = findIssues(text, appliedFixes)
  const allowedSamples = findViralAllowedSamples(text)
  const visibleAppliedFixes = appliedFixes.slice(0, 30)
  const visibleIssues = issues.slice(0, 12)

  return {
    text,
    appliedFixes: visibleAppliedFixes,
    issues: visibleIssues,
    stats: {
      fixedCount: appliedFixes.length,
      warningCount: issues.length,
      allowedCount: allowedSamples.length,
      fixedSamples: visibleAppliedFixes.slice(0, 8),
      warningSamples: visibleIssues.slice(0, 8),
      allowedSamples: allowedSamples.slice(0, 8),
    },
  }
}
