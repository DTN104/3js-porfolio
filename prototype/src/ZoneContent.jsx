import { profile, zones } from './content'
import { useLang, UI } from './i18n'

// Phần thân nội dung của 5 khu vực — DÙNG CHUNG cho bảng nội dung trong thế giới 3D (App.jsx)
// và các section của trang 2D (Page2D.jsx). Một nguồn content.js, một bộ component (FR-078).
// Bố cục theo loại vật thể: nhà = giới thiệu, xưởng = kỹ năng, khu trưng bày = dự án, cột mốc = kinh nghiệm, hòm thư = liên hệ.

export function Intro({ data }) {
  const { t } = useLang()
  return (
    <>
      {data.intro.map((p, i) => <p key={i} className="lead">{t(p)}</p>)}
      <dl className="facts">
        {data.facts.map(([k, v], i) => <div key={i}><dt>{t(k)}</dt><dd>{t(v)}</dd></div>)}
      </dl>
    </>
  )
}

export function Skills({ data }) {
  const { t } = useLang()
  return (
    <div className="grid-2">
      {data.groups.map((g, i) => (
        <section key={i} className="card">
          <h3>{t(g.name)}</h3>
          <ul className="chips">{g.items.map((it, j) => <li key={j}>{t(it)}</li>)}</ul>
        </section>
      ))}
    </div>
  )
}

export function Projects({ data }) {
  const { t } = useLang()
  return (
    <div className="grid-3">
      {data.projects.map((p, i) => (
        <article key={i} className="card project">
          <div className="thumb" aria-hidden="true">
            {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span>{p.year}</span>}
          </div>
          <h3>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{t(p.title)}</a> : t(p.title)}</h3>
          <p className="meta">{t(p.role)} · {p.year}</p>
          <p>{t(p.summary)}</p>
          <ul className="chips small">{p.tags.map((tag, j) => <li key={j}>{t(tag)}</li>)}</ul>
        </article>
      ))}
    </div>
  )
}

export function Timeline({ data }) {
  const { t } = useLang()
  return (
    <ol className="timeline">
      {data.timeline.map((it, i) => (
        <li key={i}>
          <span className="when">{it.from} – {t(it.to)}</span>
          <div>
            <h3>{t(it.title)}</h3>
            <p className="meta">{t(it.org)}</p>
            <ul>{it.bullets.map((b, j) => <li key={j}>{t(b)}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Contact({ data }) {
  const { t } = useLang()
  return (
    <>
      <p className="lead">{t(data.note)}</p>
      <div className="contact-row">
        <a className="btn primary" href={'mailto:' + profile.email}>{profile.email}</a>
        {profile.socials.map(s => <a key={s.label} className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
        <a className="btn" href={profile.cv} download>{t(UI.downloadCvPdf)}</a>
      </div>
      <p className="fine">{t(UI.noForm)}</p>
    </>
  )
}

const BODY = { house: Intro, workshop: Skills, gallery: Projects, monument: Timeline, mailbox: Contact }

// Chọn bố cục theo loại vật thể của đảo; dữ liệu lấy theo id đảo.
export function ZoneBody({ island }) {
  const Body = BODY[island.kind]
  const data = zones[island.id]
  if (!Body || !data) return null
  return <Body data={data} />
}
