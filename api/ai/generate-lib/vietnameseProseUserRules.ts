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
  },,

  // Từ chương “Lịch hẹn khám bị đổi tên người nhận ở dòng cuối”
  {
    id: 'user-clinic-heavy-atmosphere',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Cả\s+phòng\s+quay\s+lại,\s*không\s+khí\s+nặng\.?/giu,
    replacement: 'Cả phòng quay lại. Mấy cô y tá đang dọn ghế cũng dừng tay.',
    message: 'Cụm “không khí nặng” là tổng kết trạng thái kiểu AI; đổi thành phản ứng cụ thể trong phòng.',
    genericSuggestion: 'Đổi “không khí nặng” thành hành động: mọi người dừng tay, quay lại, im xuống.',
    examples: [
      {
        bad: 'Cả phòng quay lại, không khí nặng.',
        good: 'Cả phòng quay lại. Mấy cô y tá đang dọn ghế cũng dừng tay.',
      },
    ],
  },
  {
    id: 'user-heavy-atmosphere-phrase',
    category: 'ai_metaphor',
    severity: 'low',
    mode: 'replace',
    pattern: /không\s+khí\s+nặng/giu,
    replacement: 'mọi người im xuống',
    message: 'Cụm “không khí nặng” hơi AI; đổi thành phản ứng cụ thể của người trong cảnh.',
    genericSuggestion: 'Mọi người im xuống / vài người dừng tay / tiếng nói nhỏ hẳn đi.',
  },
  {
    id: 'user-voice-cut',
    category: 'collocation',
    severity: 'medium',
    mode: 'replace',
    pattern: /giọng\s+cắt/giu,
    replacement: 'giọng lạnh đi',
    message: 'Cụm “giọng cắt” nghe dịch máy/gượng; đổi thành “giọng lạnh đi” hoặc “giọng gằn xuống”.',
    genericSuggestion: '[Nhân vật] nói bằng giọng lạnh đi / giọng gằn xuống.',
  },
  {
    id: 'user-dry-voice',
    category: 'collocation',
    severity: 'low',
    mode: 'replace',
    pattern: /giọng\s+anh\s+khô/giu,
    replacement: 'giọng anh lạnh đi',
    message: 'Cụm “giọng anh khô” hơi gượng trong văn Việt; đổi thành “giọng anh lạnh đi”.',
  },
  {
    id: 'user-paper-sound-wrong-word',
    category: 'collocation',
    severity: 'high',
    mode: 'replace',
    pattern: /tiếng\s+giấy\s+xạo/giu,
    replacement: 'tiếng giấy xào xạc',
    message: '“Tiếng giấy xạo” sai từ; phải là “tiếng giấy xào xạc”.',
    genericSuggestion: 'Dùng “tiếng giấy xào xạc”, “tiếng máy in chạy”, hoặc “tiếng giấy trượt khỏi máy in”.',
  },
  {
    id: 'user-room-goes-still',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Câu\s+đó\s+làm\s+phòng\s+tĩnh\s+đi\.?/giu,
    replacement: 'Câu đó khiến cả phòng im hẳn.',
    message: 'Cụm “làm phòng tĩnh đi” sai tai; đổi thành “khiến cả phòng im hẳn”.',
    genericSuggestion: 'Câu đó khiến cả phòng im hẳn / mọi người khựng lại / vài người quay sang nhìn nhau.',
  },
  {
    id: 'user-smile-kept-eyes-serious',
    category: 'collocation',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /([^.!?\n]{2,40})\s+nụ\s+cười\s+vẫn\s+giữ\s+nhưng\s+mắt\s+nghiêm/giu,
    replacement: '$1 vẫn cố cười, nhưng ánh mắt đã lạnh hơn',
    message: 'Cụm “nụ cười vẫn giữ nhưng mắt nghiêm” không tự nhiên; đổi thành cử chỉ rõ hơn.',
    genericSuggestion: '[Nhân vật] vẫn cố cười, nhưng ánh mắt đã lạnh hơn.',
  },
  {
    id: 'user-milk-smell-on-hand',
    category: 'collocation',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /mùi\s+([^,.!?\n]{2,30})\s+còn\s+vương\s+trên\s+tay/giu,
    replacement: 'trên áo bé vẫn còn thoang thoảng mùi $1',
    message: 'Cụm “mùi ... còn vương trên tay” sai cảm giác; mùi thường vương trên áo/người/khăn.',
    genericSuggestion: 'Trên áo/người bé vẫn còn thoang thoảng mùi [mùi cụ thể].',
    examples: [
      {
        bad: 'mùi sữa còn vương trên tay',
        good: 'trên áo bé vẫn còn thoang thoảng mùi sữa',
      },
    ],
  },
  {
    id: 'user-clinic-staff-cleaning-sentence',
    category: 'collocation',
    severity: 'low',
    mode: 'replace',
    pattern: /mấy\s+cô\s+y\s+tá\s+đã\s+xếp\s+ghế\s+gọn,\s*tiếng\s+nói\s+hạ\s+thấp\s+thành\s+thì\s+thầm/giu,
    replacement: 'mấy cô y tá đã xếp gọn ghế, nói chuyện nhỏ hơn hẳn',
    message: 'Câu “tiếng nói hạ thấp thành thì thầm” hơi làm văn; đổi thành cách nói đời hơn.',
  },
  {
    id: 'user-enter-like-owning-stage',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'replace',
    pattern: /Người\s+đàn\s+ông\s+bước\s+vào\s+như\s+muốn\s+chiếm\s+sân/giu,
    replacement: 'Người đàn ông bước vào rất nhanh, như đã chuẩn bị sẵn mọi thứ',
    message: 'Cụm “như muốn chiếm sân” không hợp bối cảnh đời thường/bệnh viện; đổi thành hành động cụ thể.',
  },
  {
    id: 'user-dreamy-receptionist-voice',
    category: 'collocation',
    severity: 'low',
    mode: 'replace',
    pattern: /cô\s+lễ\s+tân\s+gọi,\s*giọng\s+mơ\s+màng/giu,
    replacement: 'cô lễ tân gọi, giọng hơi mệt',
    message: '“Giọng mơ màng” trong bối cảnh lễ tân gọi tên hơi gượng; đổi thành “giọng hơi mệt” nếu muốn tả cuối giờ.',
  },
  {
    id: 'user-eyes-seal-doubt',
    category: 'ai_metaphor',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /nhấn\s+từ\s+"?([^".!?\n]{1,40})"?\s+bằng\s+ánh\s+mắt\s+như\s+muốn\s+niêm\s+phong\s+mọi\s+nghi\s+vấn/giu,
    replacement: 'nhấn mạnh từng chữ như muốn chặn mọi câu hỏi',
    message: 'Ẩn dụ “ánh mắt niêm phong nghi vấn” gượng; đổi thành hành động nói rõ hơn.',
    genericSuggestion: '[Nhân vật] nhấn mạnh từng chữ như muốn chặn mọi câu hỏi.',
  },
  {
    id: 'user-situation-changed-summary-warning-replace',
    category: 'slogan',
    severity: 'medium',
    mode: 'template-replace',
    pattern: /Tình\s+thế\s+thay\s+đổi:\s*công\s+khai\s+tôi\s+bị\s+đặt\s+vào\s+thế\s+yếu\s+trước\s+([^,.!?\n]{2,80}),\s*nhưng\s+tôi\s+vẫn\s+giữ\s+([^.!?\n]{2,160})/giu,
    replacement: 'Tôi vẫn là người bị chất vấn trước mặt $1. Nhưng tôi vẫn giữ $2',
    message: 'Câu “Tình thế thay đổi:” là tổng kết AI; đổi thành tình huống cụ thể đang xảy ra.',
    genericSuggestion: 'Không viết “Tình thế thay đổi: ...”. Hãy viết ai đang chất vấn, ai còn giữ chứng cứ, ai bị mất thế.',
  },
  {
    id: 'user-before-record-transferred-reporting',
    category: 'unclear_sentence',
    severity: 'low',
    mode: 'template-replace',
    pattern: /giờ\s+tôi\s+biết\s+phải\s+đi\s+tìm\s+([^.!?\n]{2,120})\s+trước\s+khi\s+([^.!?\n]{2,80})/giu,
    replacement: 'Tôi phải tìm được $1 trước khi $2',
    message: 'Cụm “giờ tôi biết phải đi tìm...” hơi báo cáo; đổi thành hành động cần làm ngay.',
    genericSuggestion: 'Tôi phải tìm được [người/vật chứng] trước khi [hậu quả xảy ra].',
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
  },,

  {
    id: 'user-warning-situation-changed-summary',
    category: 'slogan',
    severity: 'medium',
    mode: 'warning',
    pattern: /Tình\s+thế\s+thay\s+đổi|công\s+khai\s+tôi\s+bị\s+đặt\s+vào\s+thế\s+yếu/giu,
    message: 'Câu tổng kết “Tình thế thay đổi / bị đặt vào thế yếu” còn giọng AI phân tích.',
    genericSuggestion: 'Đổi thành cảnh cụ thể: ai đang chất vấn, ai im lặng, nhân vật còn giữ chứng cứ gì.',
  },
  {
    id: 'user-warning-abstract-atmosphere',
    category: 'ai_metaphor',
    severity: 'low',
    mode: 'warning',
    pattern: /không\s+khí\s+nặng|căn\s+phòng\s+chùng\s+xuống|cả\s+phòng\s+lạnh\s+đi/giu,
    message: 'Mô tả không khí bằng trạng thái trừu tượng dễ có mùi AI.',
    genericSuggestion: 'Viết phản ứng cụ thể: mọi người dừng tay, tiếng nói nhỏ lại, vài người quay sang nhìn nhau.',
  },

]
