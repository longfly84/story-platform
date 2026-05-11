import type { VietnameseProseRule } from './vietnameseProseQuality.js'

function normalizeEvidencePlace(input: string) {
  const value = String(input || '').trim().toLowerCase()
  if (!value) return 'túi áo'
  if (value.includes('lòng áo') || value.includes('ngực') || value.includes('trước ngực')) return 'túi áo'
  if (value.includes('tay áo')) return 'tay áo'
  if (value === 'tay' || value.includes('trong tay')) return 'lòng bàn tay'
  return input.trim()
}

export const userVietnameseProseReplacementRules: VietnameseProseRule[] = [
  {
    id: 'user-object-small-stone-template',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /(Tôi\s+(?:giữ|cầm|nắm))\s+([^.!?\n]{2,60})\s+như\s+một\s+viên\s+đá\s+nhỏ\s+trong\s+([^.!?\n]{2,50})/giu,
    replacement: (_match, captures) => {
      const object = captures[1]?.trim() || 'vật chứng đó'
      const place = normalizeEvidencePlace(captures[2] || '')
      return `Tôi giữ chặt ${object} trong ${place}, không để ai chạm vào`
    },
    message: 'Ẩn dụ vật chứng như “viên đá nhỏ” gượng; đổi thành hành động giữ vật chứng cụ thể.',
    genericSuggestion: 'Tôi giữ chặt [vật chứng] trong [túi áo/lòng bàn tay/túi xách], không để ai chạm vào.',
    examples: [
      {
        bad: 'Tôi giữ mẩu giấy như một viên đá nhỏ trong lòng áo.',
        good: 'Tôi giữ chặt mẩu giấy trong túi áo, không để ai chạm vào.',
      },
    ],
  },
  {
    id: 'user-speech-like-needle',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Lời\s+(?:nói|đó|ấy)\s+như\s+kim\s+châm\s+vào\s+([^.!?\n]{2,80})/giu,
    replacement: (_match, captures) => {
      const target = captures[0]?.trim() || 'tôi'
      return `Câu đó khiến vài người quay sang nhìn ${target}`
    },
    message: 'Ẩn dụ “lời nói như kim châm” sáo; đổi thành phản ứng cụ thể của người xung quanh.',
    genericSuggestion: 'Câu đó khiến [người xung quanh] quay sang nhìn [nhân vật] với thái độ cụ thể.',
    examples: [
      {
        bad: 'Lời nói như kim châm vào mặt tôi giữa đám đông.',
        good: 'Câu đó khiến vài phụ huynh quay sang nhìn tôi khó chịu.',
      },
    ],
  },
  {
    id: 'user-eyes-stuck-short-form',
    category: 'collocation',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Mắt\s+tôi\s+vẫn\s+dán\s+vào\s+([^.!?\n]{2,80})/giu,
    replacement: 'Tôi vẫn nhìn chằm chằm vào $1',
    message: 'Cụm “mắt tôi vẫn dán vào...” còn giọng AI/convert; đổi thành hành động nhìn cụ thể.',
    genericSuggestion: 'Tôi vẫn nhìn chằm chằm vào [vật/điểm cần chú ý].',
  },
  {
    id: 'user-crowded-like-beehive',
    category: 'ai_metaphor',
    severity: 'low',
    mode: 'template-replace',
    pattern: /([^.!?\n]{2,60})\s+chật\s+như\s+tổ\s+ong\s+([^.!?\n]{0,50})/giu,
    replacement: (_match, captures) => {
      const place = captures[0]?.trim() || 'Nơi đó'
      const tail = captures[1]?.trim()
      return `${place} ${tail ? `${tail} ` : ''}chật kín người`.replace(/\s+/g, ' ').trim()
    },
    message: 'So sánh “chật như tổ ong” hơi AI; đổi thành mô tả trực tiếp.',
    genericSuggestion: '[Địa điểm] chật kín [người/khách/phụ huynh].',
    examples: [
      {
        bad: 'Cổng trường quốc tế chật như tổ ong buổi tan học.',
        good: 'Cổng trường quốc tế giờ tan học chật kín phụ huynh.',
      },
    ],
  },
  {
    id: 'user-warm-smell-collocation',
    category: 'collocation',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /tay\s+còn\s+ấm\s+mùi\s+([^,.!?\n]{2,40})/giu,
    replacement: 'trên người vẫn còn thoang thoảng mùi $1',
    message: 'Cụm “tay còn ấm mùi...” sai collocation; đổi thành mùi còn vương trên người/áo.',
    genericSuggestion: 'Trên áo/người [nhân vật] vẫn còn thoang thoảng mùi [mùi cụ thể].',
  },
  {
    id: 'user-public-opinion-hired',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /([^.!?\n]{2,80})\s+trông\s+như\s+đã\s+thuê\s+được\s+cả\s+tiếng\s+nói\s+công\s+luận/giu,
    replacement: '$1 đứng giữa đám đông, vẻ mặt như thể mọi người đã đứng về phía mình',
    message: 'Cụm “thuê được cả tiếng nói công luận” nghe như bài phân tích; đổi thành phản ứng đám đông.',
    genericSuggestion: '[Nhân vật] đứng giữa đám đông, vẻ mặt như thể mọi người đã đứng về phía mình.',
  },
  {
    id: 'user-next-step-not-noisy-replace',
    category: 'slogan',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Bước\s+đi\s+tiếp\s+theo\s+sẽ\s+không\s+ồn\s+ào:\s*([^.!?\n]{2,160})/giu,
    replacement: 'Tôi không nói thêm. Trước mắt, tôi phải $1',
    message: 'Câu “Bước đi tiếp theo sẽ không ồn ào” giống slogan; đổi thành hành động trước mắt.',
    genericSuggestion: 'Tôi không nói thêm. Trước mắt, tôi phải [hành động cụ thể].',
  },
  {
    id: 'user-voice-wants-investigation',
    category: 'unclear_sentence',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Giọng\s+([^,.!?\n]{2,40})\s+muốn\s+lôi\s+kéo\s+một\s+cuộc\s+([^.!?\n]{2,80})/giu,
    replacement: '$1 nói lớn, rõ ràng muốn mọi người ép bên liên quan kiểm tra ngay tại chỗ',
    message: 'Câu “giọng muốn lôi kéo...” là diễn giải AI; đổi thành hành động nói lớn và tác động cụ thể.',
    genericSuggestion: '[Nhân vật] nói lớn, rõ ràng muốn mọi người ép [bên liên quan] kiểm tra ngay tại chỗ.',
  },
]

export const userVietnameseProseWarningRules: VietnameseProseRule[] = [
  {
    id: 'user-warning-too-many-toi-openings',
    category: 'unclear_sentence',
    severity: 'low',
    mode: 'warning',
    pattern: /(?:^|\n)(?:Tôi\s+[^.!?\n]+[.!?]\s*){3,}/g,
    message: 'Nhiều câu liên tiếp bắt đầu bằng “Tôi”, dễ làm nhịp văn đều và máy.',
    genericSuggestion: 'Đổi một vài câu sang mở đầu bằng hành động, bối cảnh, hoặc phản ứng của người khác.',
  },
  {
    id: 'user-warning-administrative-dialogue',
    category: 'dialogue_role',
    severity: 'low',
    mode: 'warning',
    pattern: /triệu tập họp phụ huynh khẩn|ở lại để làm rõ|xử lý nghiêm/gi,
    message: 'Một số câu thoại hơi hành chính/sạch quá, nên làm đời hơn theo vai nói.',
    genericSuggestion: 'Thêm vai xưng hô cụ thể: “Mọi người bình tĩnh”, “phiền cô ở lại để đối chiếu...”, “nhà trường sẽ kiểm tra ngay”.',
  },
  {
    id: 'user-warning-evidence-as-heavy-object',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'warning',
    pattern: /như\s+một\s+(?:viên\s+đá|hòn\s+đá|khối\s+đá)/gi,
    message: 'So sánh vật chứng/cảm xúc với đá thường làm câu nặng và AI.',
    genericSuggestion: 'Đổi thành hành động cụ thể: giữ chặt, cất vào túi, đặt lên bàn, không để ai chạm vào.',
  },
]
