import { useEffect, useRef, useState } from 'react'
import { profile, zones } from './content'
import { useLang, UI } from './i18n'

// Phần thân nội dung của 5 khu vực — DÙNG CHUNG cho bảng nội dung trong thế giới 3D (App.jsx)
// và các section của trang 2D (Page2D.jsx). Một nguồn content.js, một bộ component (FR-078).
// Bố cục theo loại vật thể: nhà = giới thiệu, xưởng = kỹ năng, khu trưng bày = dự án, cột mốc = kinh nghiệm, hòm thư = liên hệ.
// context = 'drawer' (bảng trong 3D) | 'page' (trang 2D): bảng 3D không có hero nên phần giới thiệu tự thêm tên + vai trò (FR-023).

export function Intro({ data, context }) {
  const { t } = useLang()
  return (
    <>
      {context === 'drawer' && (
        <p className="who"><b>{t(profile.name)}</b><span>{t(profile.role)}</span></p>
      )}
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

export function Projects({ data, context }) {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)
  const root = useRef(null)
  const heading = useRef(null)
  useEffect(() => {
    if (selected === null) return
    const drawerBody = root.current?.closest('.dbody')
    if (drawerBody) drawerBody.scrollTop = 0
    else root.current?.scrollIntoView({ block: 'start' })
    heading.current?.focus()
  }, [selected])
  const project = data.projects[selected]
  return (
    <div className={'projects' + (context === 'drawer' ? ' drawer-projects' : '')} ref={root}>
      {project ? (
        <article className="project-detail">
          <button type="button" className="project-back" onClick={() => { setSelected(null); requestAnimationFrame(() => root.current?.querySelectorAll('.project-tile')[selected]?.focus()) }}>
            ← {t(UI.allProjects)}
          </button>
          <div className="project-detail-head">
            <div>
              <p className="project-eyebrow">{String(selected + 1).padStart(2, '0')} / {String(data.projects.length).padStart(2, '0')} · {project.year}</p>
              <h3 ref={heading} tabIndex={-1}>{t(project.title)}</h3>
              <p className="project-role">{t(project.role)}</p>
            </div>
            <div className="project-detail-art" aria-hidden="true">{project.image ? <img src={project.image} alt="" /> : <span>{t(project.title).split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span>}</div>
          </div>
          <p className="project-intro">{t(project.summary)}</p>
          <ul className="chips small">{project.tags.map((tag, i) => <li key={i}>{t(tag)}</li>)}</ul>
          <dl className="project-story">
            {project.problem && <><dt>{t(UI.problem)}</dt><dd>{t(project.problem)}</dd></>}
            {project.contribution && <><dt>{t(UI.contribution)}</dt><dd>{t(project.contribution)}</dd></>}
            {project.result && <><dt>{t(UI.result)}</dt><dd>{t(project.result)}</dd></>}
          </dl>
          {(project.url || project.source) && <p className="project-links">
            {project.url && <a className="btn primary" href={project.url} target="_blank" rel="noreferrer">{t(UI.demo)} ↗</a>}
            {project.source && <a className="btn" href={project.source} target="_blank" rel="noreferrer">{t(UI.source)} ↗</a>}
          </p>}
        </article>
      ) : <>
        <p className="project-count">{data.projects.length} {t(UI.projectCount)}</p>
        <div className="project-grid">
          {data.projects.map((p, i) => (
            <button key={i} type="button" className="project-tile" onClick={() => setSelected(i)}>
              <span className="project-art" aria-hidden="true">{p.image ? <img src={p.image} alt="" loading="lazy" /> : <span>{t(p.title).split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span>}</span>
              <span className="project-tile-body">
                <span className="project-tile-meta">{t(p.role)} · {p.year}</span>
                <strong>{t(p.title)}</strong>
                <span className="project-tile-summary">{t(p.summary)}</span>
                <span className="project-tile-tags">{p.tags.slice(0, 3).join(' · ')}</span>
                <span className="project-tile-action">{t(UI.viewProject)} <span aria-hidden="true">→</span></span>
              </span>
            </button>
          ))}
        </div>
      </>}
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

// FR-036: sao chép nhanh địa chỉ email, có xác nhận
function CopyEmail() {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (!copied) return; const tm = setTimeout(() => setCopied(false), 1800); return () => clearTimeout(tm) }, [copied])
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email) }
    catch {
      const ta = document.createElement('textarea'); ta.value = profile.email; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch {}
      ta.remove()
    }
    setCopied(true)
  }
  return (
    <button type="button" className={'btn copy' + (copied ? ' done' : '')} onClick={copy} aria-label={t(UI.copyEmail)} aria-live="polite">
      {copied ? t(UI.copied) : t(UI.copy)}
    </button>
  )
}

export function Contact({ data }) {
  const { t } = useLang()
  return (
    <>
      {profile.available && <span className="badge">{t(UI.available)}</span>}
      <p className="lead">{t(data.note)}</p>
      <div className="contact-row">
        {profile.email && <><a className="btn primary" href={'mailto:' + profile.email}>{profile.email}</a><CopyEmail /></>}
        {profile.socials.map(s => <a key={s.label} className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
        {profile.cv && <a className="btn" href={profile.cv} download>{t(UI.downloadCvPdf)}</a>}
      </div>
      <p className="fine">{t(profile.email || profile.socials.length || profile.cv ? UI.noForm : UI.contactPending)}</p>
    </>
  )
}

const BODY = { house: Intro, workshop: Skills, gallery: Projects, monument: Timeline, mailbox: Contact }

// Chọn bố cục theo loại vật thể của đảo; dữ liệu lấy theo id đảo. Thiếu dữ liệu thì không hiện gì, không lỗi (FR-061).
export function ZoneBody({ island, context = 'page' }) {
  const Body = BODY[island.kind]
  const data = zones[island.id]
  if (!Body || !data) return null
  return <Body data={data} context={context} />
}
