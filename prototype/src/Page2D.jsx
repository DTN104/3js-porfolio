import { useEffect, useState } from 'react'
import { islands, profile, zones } from './content'

// Chế độ 2D (OQ-02, FR-073…079): một trang cuộn hiển thị ĐẦY ĐỦ nội dung portfolio, đọc từ cùng nguồn
// content.js với thế giới 3D. Thứ tự section = thứ tự tường thuật của 5 đảo. Không cần WebGL.
// Cũng là phần chữ để máy tìm kiếm và thẻ chia sẻ đọc được.

const KIND = {
  house:    { icon: '🏠', label: 'Căn nhà' },
  workshop: { icon: '🛠️', label: 'Xưởng làm việc' },
  gallery:  { icon: '🖼️', label: 'Khu trưng bày' },
  monument: { icon: '🏛️', label: 'Cột mốc' },
  mailbox:  { icon: '✉️', label: 'Hòm thư' }
}

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase()

function SectionHead({ island, index }) {
  const k = KIND[island.kind]
  return (
    <header className={'sec-head ' + island.kind}>
      <span className="sec-kind"><i>{k.icon}</i>{k.label} · đảo {index + 1}/{islands.length}</span>
      <h2>{island.title}</h2>
    </header>
  )
}

function Intro({ data }) {
  return (
    <>
      {data.intro.map((p, i) => <p key={i} className="lead">{p}</p>)}
      <dl className="facts">
        {data.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </>
  )
}

function Skills({ data }) {
  return (
    <div className="grid-2">
      {data.groups.map(g => (
        <section key={g.name} className="card">
          <h3>{g.name}</h3>
          <ul className="chips">{g.items.map(it => <li key={it}>{it}</li>)}</ul>
        </section>
      ))}
    </div>
  )
}

function Projects({ data }) {
  return (
    <div className="grid-3">
      {data.projects.map(p => (
        <article key={p.title} className="card project">
          <div className="thumb" aria-hidden="true">
            {p.image ? <img src={p.image} alt="" /> : <span>{p.year}</span>}
          </div>
          <h3>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.title}</a> : p.title}</h3>
          <p className="meta">{p.role} · {p.year}</p>
          <p>{p.summary}</p>
          <ul className="chips small">{p.tags.map(t => <li key={t}>{t}</li>)}</ul>
        </article>
      ))}
    </div>
  )
}

function Timeline({ data }) {
  return (
    <ol className="timeline">
      {data.timeline.map(t => (
        <li key={t.from + t.org}>
          <span className="when">{t.from} – {t.to}</span>
          <div>
            <h3>{t.title}</h3>
            <p className="meta">{t.org}</p>
            <ul>{t.bullets.map(b => <li key={b}>{b}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Contact({ data }) {
  return (
    <>
      <p className="lead">{data.note}</p>
      <div className="contact-row">
        <a className="btn primary" href={'mailto:' + profile.email}>{profile.email}</a>
        {profile.socials.map(s => <a key={s.label} className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
        <a className="btn" href={profile.cv} download>Tải CV (PDF)</a>
      </div>
      <p className="fine">Không có form gửi trên trang — liên hệ trực tiếp qua các kênh trên.</p>
    </>
  )
}

const BODY = { house: Intro, workshop: Skills, gallery: Projects, monument: Timeline, mailbox: Contact }

export default function Page2D({ onSwitch3D, canRun3D, notice }) {
  const [active, setActive] = useState(islands[0].id)

  // đánh dấu mục đang xem trên thanh điều hướng
  useEffect(() => {
    const els = islands.map(z => document.getElementById(z.id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-40% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="p2d">
      <nav className="p2d-nav" aria-label="Các khu vực">
        <a className="brand" href="#top">{profile.name}</a>
        <ul>
          {islands.map(z => (
            <li key={z.id}><a href={'#' + z.id} className={active === z.id ? 'on' : ''}>{z.label}</a></li>
          ))}
        </ul>
        {canRun3D && <button className="btn primary small" onClick={onSwitch3D}>Vào thế giới 3D</button>}
      </nav>

      {notice && <div className="p2d-notice">{notice}</div>}

      <header className="hero" id="top">
        <div className="avatar" aria-hidden="true">
          {profile.avatar ? <img src={profile.avatar} alt="" /> : initials(profile.name)}
        </div>
        <div>
          {profile.available && <span className="badge">● Sẵn sàng nhận cơ hội mới</span>}
          <h1>{profile.name}</h1>
          <p className="role">{profile.role}</p>
          <p className="tagline">{profile.tagline}</p>
          <p className="meta">{profile.location}</p>
          <div className="contact-row">
            <a className="btn primary" href={'mailto:' + profile.email}>Liên hệ</a>
            <a className="btn" href={profile.cv} download>Tải CV</a>
            {canRun3D && <button className="btn ghost" onClick={onSwitch3D}>Khám phá thế giới 3D →</button>}
          </div>
        </div>
      </header>

      <main>
        {islands.map((z, i) => {
          const Body = BODY[z.kind]
          return (
            <section key={z.id} id={z.id} className="sec">
              <SectionHead island={z} index={i} />
              <Body data={zones[z.id]} />
            </section>
          )
        })}
      </main>

      <footer className="p2d-foot">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Bản 2D dùng chung nội dung với thế giới 3D{canRun3D ? <> · <button className="linkbtn" onClick={onSwitch3D}>xem bản 3D</button></> : null}</span>
      </footer>
    </div>
  )
}
