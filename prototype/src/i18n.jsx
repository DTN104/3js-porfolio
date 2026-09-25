// Song ngữ Việt – Anh (OQ-03, FR-066…072).
// Chuỗi nội dung trong content.js viết dạng { vi: '…', en: '…' }; chuỗi thường (string) dùng chung cho cả hai.
// t(x) trả về đúng ngôn ngữ đang chọn; áp dụng đệ quy cho mảng.
// FR-070: thiếu bản dịch -> hiện ngôn ngữ còn lại kèm chỉ dấu [VI] / [EN], không để trống.
// FR-071: ?lang=vi | ?lang=en là địa chỉ riêng của mỗi ngôn ngữ; đổi ngôn ngữ chỉ cập nhật địa chỉ, không tải lại trang (FR-072).
import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'

export const LANGS = ['vi', 'en']
const other = (l) => (l === 'vi' ? 'en' : 'vi')

export function tr(lang, x) {
  if (x == null || typeof x !== 'object') return x
  if (Array.isArray(x)) return x.map(v => tr(lang, v))
  if ('vi' in x || 'en' in x) {
    if (x[lang] != null && x[lang] !== '') return x[lang]
    const o = other(lang)
    return x[o] != null ? `${x[o]} [${o.toUpperCase()}]` : ''
  }
  return x
}

// FR-068: ?lang -> lựa chọn đã lưu -> ngôn ngữ trình duyệt; không xác định được thì tiếng Anh
function initialLang() {
  const q = new URLSearchParams(location.search).get('lang')
  if (LANGS.includes(q)) return q
  try { const s = localStorage.getItem('lang'); if (LANGS.includes(s)) return s } catch {}
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('vi') ? 'vi' : 'en'
}

const LangCtx = createContext({ lang: 'vi', setLang: () => {}, t: (x) => tr('vi', x) })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const setLang = useCallback((l) => {
    if (!LANGS.includes(l)) return
    try { localStorage.setItem('lang', l) } catch {}                       // FR-069
    try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u) } catch {}   // FR-071
    setLangState(l)
  }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const value = useMemo(() => ({ lang, setLang, t: (x) => tr(lang, x) }), [lang, setLang])
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }

// Nút đổi ngôn ngữ dùng chung cho 3D và 2D (FR-067)
export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={'langsw ' + className} role="group" aria-label="Ngôn ngữ / Language">
      {LANGS.map(l => (
        <button key={l} type="button" className={l === lang ? 'on' : ''} onClick={() => setLang(l)} aria-pressed={l === lang}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

// Chuỗi giao diện (không phải nội dung portfolio)
export const UI = {
  kicker:       { vi: 'Portfolio · thế giới 3D', en: 'Portfolio · 3D world' },
  start:        { vi: 'Bắt đầu khám phá', en: 'Start exploring' },
  loading:      { vi: 'Đang tải thế giới…', en: 'Loading the world…' },
  ready:        { vi: 'Sẵn sàng — nhấn Enter hoặc nút bên dưới', en: 'Ready — press Enter or the button below' },
  readyTouch:   { vi: 'Sẵn sàng', en: 'Ready' },
  loadError:    { vi: 'Không tải được một phần tài nguyên. Kiểm tra kết nối rồi thử lại.', en: 'Some assets failed to load. Check your connection and try again.' },
  retry:        { vi: 'Thử lại', en: 'Retry' },
  view2d:       { vi: 'Xem bản 2D', en: 'View 2D version' },
  enter3d:      { vi: 'Vào thế giới 3D', en: 'Enter the 3D world' },
  explore3d:    { vi: 'Khám phá thế giới 3D →', en: 'Explore the 3D world →' },
  see3d:        { vi: 'xem bản 3D', en: 'view 3D version' },
  contact:      { vi: 'Liên hệ', en: 'Contact' },
  downloadCv:   { vi: 'Tải CV', en: 'Download CV' },
  downloadCvPdf:{ vi: 'Tải CV (PDF)', en: 'Download CV (PDF)' },
  available:    { vi: '● Sẵn sàng nhận cơ hội mới', en: '● Open to new opportunities' },
  island:       { vi: 'đảo', en: 'island' },
  open:         { vi: 'mở', en: 'open' },
  hintKeys:     { vi: 'Dùng W A S D để đi. Giữ Shift để chạy. Qua đảo khác bằng cầu dây.', en: 'Use W A S D to walk, hold Shift to run. Cross to other islands over the rope bridges.' },
  hintTouch:    { vi: 'Kéo cần bên trái để đi, đẩy mạnh để chạy. Chạm ✋ để tương tác.', en: 'Drag the left stick to walk, push further to run. Tap ✋ to interact.' },
  closeTouch:   { vi: 'Chạm ra ngoài hoặc ✕ để đóng.', en: 'Tap outside or ✕ to close.' },
  closeKeys:    { vi: 'Đóng bằng nút ✕ hoặc phím Esc.', en: 'Close with ✕ or the Esc key.' },
  close:        { vi: 'Đóng', en: 'Close' },
  noForm:       { vi: 'Không có form gửi trên trang — liên hệ trực tiếp qua các kênh trên.', en: 'There is no contact form — reach out directly through the channels above.' },
  sameContent:  { vi: 'Bản 2D dùng chung nội dung với thế giới 3D', en: 'The 2D version shares its content with the 3D world' },
  noWebgl:      { vi: 'Thiết bị này không hiển thị được thế giới 3D — bạn đang xem bản 2D đầy đủ nội dung.', en: 'This device cannot display the 3D world — you are viewing the full 2D version.' },
  crashed:      { vi: 'Thế giới 3D gặp lỗi khi hiển thị — đây là bản 2D với đầy đủ nội dung.', en: 'The 3D world failed to render — this is the 2D version with all content.' },
  controls:     { vi: 'Điều khiển', en: 'Controls' },
  helpBtn:      { vi: 'Bảng hướng dẫn điều khiển', en: 'Controls help' },
  startHintKeys:{ vi: 'W A S D đi · Shift chạy · E tương tác · Q R xoay góc nhìn', en: 'W A S D walk · Shift run · E interact · Q R rotate view' },
  startHintTouch:{ vi: 'Cần bên trái để đi · ✋ tương tác · véo hai ngón để zoom', en: 'Left stick to walk · ✋ interact · pinch to zoom' },
  stamp:        { vi: 'prototype · đảo trôi trên mây · model và nội dung đều là bản tạm', en: 'prototype · islands above the clouds · models and content are placeholders' },
  demo:         { vi: 'Xem bản chạy', en: 'Live demo' },
  source:       { vi: 'Mã nguồn', en: 'Source code' },
  copy:         { vi: 'Sao chép', en: 'Copy' },
  copied:       { vi: 'Đã sao chép ✓', en: 'Copied ✓' },
  copyEmail:    { vi: 'Sao chép địa chỉ email', en: 'Copy email address' },
  help: {
    move:     [{ vi: 'Di chuyển', en: 'Move' },            { vi: 'hoặc phím mũi tên', en: 'or the arrow keys' }],
    run:      [{ vi: 'Chạy', en: 'Run' },                  { vi: 'giữ', en: 'hold' }],
    interact: [{ vi: 'Tương tác', en: 'Interact' },        { vi: 'hoặc bấm chuột vào vật thể', en: 'or click the object' }],
    closeP:   [{ vi: 'Đóng bảng', en: 'Close panel' },     { vi: '', en: '' }],
    zoom:     [{ vi: 'Phóng to / thu nhỏ', en: 'Zoom' },   { vi: 'con lăn chuột', en: 'mouse wheel' }],
    rotate:   [{ vi: 'Xoay góc nhìn', en: 'Rotate view' }, { vi: 'hoặc nút ↶ ↷ góc trên phải — mỗi lần 90°, hướng đi đổi theo', en: 'or the ↶ ↷ buttons top-right — 90° per step, walking direction follows' }],
    cross:    [{ vi: 'Sang đảo khác', en: 'Other islands' }, { vi: 'đi qua cầu dây — không nhảy, không rơi', en: 'walk across the rope bridges — no jumping, no falling' }],
    lang:     [{ vi: 'Ngôn ngữ', en: 'Language' },         { vi: 'nút VI / EN góc trên trái — giữ nguyên vị trí và bảng đang mở', en: 'VI / EN buttons top-left — keeps your position and open panel' }],
    mode2d:   [{ vi: 'Bản 2D', en: '2D version' },         { vi: 'nút 2D góc trên trái — cùng nội dung, không cần WebGL; thêm ?mode=2d vào địa chỉ để mở thẳng', en: '2D button top-left — same content, no WebGL needed; add ?mode=2d to the address to open it directly' }],
    touch:    [{ vi: 'Màn cảm ứng', en: 'Touch screen' },  { vi: 'cần bên trái để đi (đẩy mạnh = chạy) · ✋ để tương tác · véo hai ngón để phóng to / thu nhỏ', en: 'left stick to walk (push further = run) · ✋ to interact · pinch to zoom' }]
  },
  helpTouch: {
    move:     [{ vi: 'Di chuyển', en: 'Move' },            { vi: 'kéo cần ảo bên trái', en: 'drag the left stick' }],
    run:      [{ vi: 'Chạy', en: 'Run' },                  { vi: 'đẩy cần gần hết biên', en: 'push the stick near the edge' }],
    interact: [{ vi: 'Tương tác', en: 'Interact' },        { vi: 'chạm nút ✋ khi nó sáng, hoặc chạm thẳng vào vật thể', en: 'tap ✋ when it lights up, or tap the object' }],
    closeP:   [{ vi: 'Đóng bảng', en: 'Close panel' },     { vi: 'chạm ✕ hoặc chạm ra ngoài bảng', en: 'tap ✕ or tap outside the panel' }],
    zoom:     [{ vi: 'Phóng to / thu nhỏ', en: 'Zoom' },   { vi: 'véo hai ngón trên cảnh', en: 'pinch with two fingers' }],
    rotate:   [{ vi: 'Xoay góc nhìn', en: 'Rotate view' }, { vi: 'nút ↶ ↷ góc trên phải — mỗi lần 90°, hướng đi đổi theo', en: '↶ ↷ buttons top-right — 90° per step, walking direction follows' }],
    cross:    [{ vi: 'Sang đảo khác', en: 'Other islands' }, { vi: 'đi qua cầu dây — không nhảy, không rơi', en: 'walk across the rope bridges — no jumping, no falling' }],
    lang:     [{ vi: 'Ngôn ngữ', en: 'Language' },         { vi: 'nút VI / EN góc trên trái', en: 'VI / EN buttons top-left' }],
    mode2d:   [{ vi: 'Bản 2D', en: '2D version' },         { vi: 'nút 2D góc trên trái — cùng nội dung, cuộn đọc như trang thường', en: '2D button top-left — same content as a normal scrolling page' }]
  },
  kinds: {
    house:    { vi: 'Căn nhà', en: 'Cottage' },
    workshop: { vi: 'Xưởng làm việc', en: 'Workshop' },
    gallery:  { vi: 'Khu trưng bày', en: 'Gallery' },
    monument: { vi: 'Cột mốc', en: 'Milestones' },
    mailbox:  { vi: 'Hòm thư', en: 'Mailbox' }
  }
}
export const KIND_ICON = { house: '🏠', workshop: '🛠️', gallery: '🖼️', monument: '🏛️', mailbox: '✉️' }
