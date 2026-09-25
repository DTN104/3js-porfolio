import { useEffect } from 'react'
import { profile } from './content'
import { useLang, UI, LangSwitch } from './i18n'
import { useLoading } from './loading'

// Màn hình khởi động (FR-001…FR-004, Figma trang 01): tên + vai trò, thanh tiến trình tải,
// nút "Bắt đầu khám phá" chỉ bấm được khi tài nguyên bắt buộc đã sẵn sàng (Enter / Space cũng được),
// lỗi tải -> thông báo + Thử lại. Thế giới 3D nạp phía sau lớp này; vào thế giới thì lớp mờ dần rồi gỡ.
// leaving = true: đang mờ dần (App gỡ component sau 450 ms).

export default function StartScreen({ onStart, onSwitch2D, isTouch, leaving }) {
  const { t } = useLang()
  const L = useLoading()
  const ready = L.done && !L.error
  const pct = L.done ? 100 : L.total ? Math.min(96, Math.round(L.loaded / L.total * 100)) : 0

  useEffect(() => {
    if (!ready || leaving) return
    const onKey = (e) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') { e.preventDefault(); onStart() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, leaving, onStart])

  return (
    <div className={'start' + (leaving ? ' leave' : '')} role="dialog" aria-modal="true" aria-label={t(UI.kicker)}>
      <i className="cloud c1" /><i className="cloud c2" /><i className="cloud c3" />
      <LangSwitch className="start-lang" />
      <div className="start-card">
        <span className="start-kicker">{t(UI.kicker)}</span>
        <h1>{t(profile.name)}</h1>
        <p className="start-role">{t(profile.role)}</p>
        <p className="start-tag">{t(profile.tagline)}</p>

        <div className="start-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <i style={{ width: pct + '%' }} />
        </div>
        <p className={'start-status' + (L.error ? ' err' : '')} aria-live="polite">
          {L.error ? t(UI.loadError) : ready ? t(isTouch ? UI.readyTouch : UI.ready) : `${t(UI.loading)} ${pct}%`}
        </p>

        {L.error
          ? <button className="btn primary big" onClick={() => location.reload()}>{t(UI.retry)}</button>
          : <button className="btn primary big" disabled={!ready} onClick={onStart} autoFocus>{t(UI.start)}</button>}

        <p className="start-hint">{isTouch ? t(UI.startHintTouch) : t(UI.startHintKeys)}</p>
        {onSwitch2D && <button className="linkbtn" onClick={onSwitch2D}>{t(UI.view2d)}</button>}
      </div>
    </div>
  )
}
