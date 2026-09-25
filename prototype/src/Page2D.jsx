import { useEffect, useState } from 'react'
import { islands, profile } from './content'
import { useLang, UI, KIND_ICON, LangSwitch } from './i18n'
import { ZoneBody } from './ZoneContent'

// Chế độ 2D (OQ-02, FR-073…079): một trang cuộn hiển thị ĐẦY ĐỦ nội dung portfolio, đọc từ cùng nguồn
// content.js với thế giới 3D, qua cùng bộ component ZoneContent.jsx. Thứ tự section = thứ tự tường thuật của 5 đảo.
// Không cần WebGL. Cũng là phần chữ để máy tìm kiếm và thẻ chia sẻ đọc được.

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase()

function SectionHead({ island, index }) {
  const { t } = useLang()
  return (
    <header className={'sec-head ' + island.kind}>
      <span className="sec-kind"><i>{KIND_ICON[island.kind]}</i>{t(UI.kinds[island.kind])} · {t(UI.island)} {index + 1}/{islands.length}</span>
      <h2>{t(island.title)}</h2>
    </header>
  )
}

export default function Page2D({ onSwitch3D, canRun3D, notice }) {
  const { t } = useLang()
  const [active, setActive] = useState(islands[0].id)
  const name = t(profile.name)

  // đánh dấu mục đang xem trên thanh điều hướng
  useEffect(() => {
    const els = islands.map(z => document.getElementById(z.id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-40% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    // FR-058: #<id đảo> trên địa chỉ -> cuộn tới đúng section (kể cả khi vừa chuyển từ 3D sang, không tải lại trang)
    const h = decodeURIComponent(location.hash.slice(1))
    const target = h && document.getElementById(h)
    if (target) target.scrollIntoView({ block: 'start' })
    return () => io.disconnect()
  }, [])

  return (
    <div className="p2d">
      <nav className="p2d-nav" aria-label="Sections">
        <a className="brand" href="#top">{name}</a>
        <ul>
          {islands.map(z => (
            <li key={z.id}><a href={'#' + z.id} className={active === z.id ? 'on' : ''}>{t(z.label)}</a></li>
          ))}
        </ul>
        <LangSwitch />
        {canRun3D && <button className="btn primary small" onClick={onSwitch3D}>{t(UI.enter3d)}</button>}
      </nav>

      {notice && <div className="p2d-notice">{t(notice)}</div>}

      <header className="hero" id="top">
        <div className="avatar" aria-hidden="true">
          {profile.avatar ? <img src={profile.avatar} alt="" /> : initials(name)}
        </div>
        <div>
          {profile.available && <span className="badge">{t(UI.available)}</span>}
          <h1>{name}</h1>
          <p className="role">{t(profile.role)}</p>
          <p className="tagline">{t(profile.tagline)}</p>
          <p className="meta">{t(profile.location)}</p>
          <div className="contact-row">
            <a className="btn primary" href={'mailto:' + profile.email}>{t(UI.contact)}</a>
            <a className="btn" href={profile.cv} download>{t(UI.downloadCv)}</a>
            {canRun3D && <button className="btn ghost" onClick={onSwitch3D}>{t(UI.explore3d)}</button>}
          </div>
        </div>
      </header>

      <main>
        {islands.map((z, i) => (
          <section key={z.id} id={z.id} className="sec">
            <SectionHead island={z} index={i} />
            <ZoneBody island={z} />
          </section>
        ))}
      </main>

      <footer className="p2d-foot">
        <span>© {new Date().getFullYear()} {name}</span>
        <span>{t(UI.sameContent)}{canRun3D ? <> · <button className="linkbtn" onClick={onSwitch3D}>{t(UI.see3d)}</button></> : null}</span>
      </footer>
    </div>
  )
}
