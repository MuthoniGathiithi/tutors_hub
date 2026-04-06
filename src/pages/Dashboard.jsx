import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Btn, Card, CardBody, Badge, Empty, Toast } from '../components/UI'
import styles from './Dashboard.module.css'

const STUDENTS_KEY = 'lh_students'
const LESSONS_KEY = 'lh_lessons'
const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const PALETTES = [
  { bg: '#1e3a5f' },
  { bg: '#059669' },
  { bg: '#d97706' },
  { bg: '#7c3aed' },
  { bg: '#0e7490' },
  { bg: '#be185d' },
]
const getP = (i) => PALETTES[i % PALETTES.length]

export default function Dashboard() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  const students = load(STUDENTS_KEY)
  const lessons = load(LESSONS_KEY)

  const countByStudent = lessons.reduce((a, l) => {
    if (l?.studentId) a[l.studentId] = (a[l.studentId] || 0) + 1
    return a
  }, {})

  const lastTs = lessons.reduce((m, l) => {
    if (!l?.date) return m
    const t = new Date(l.date + 'T00:00:00').getTime()
    return Number.isFinite(t) && t > m ? t : m
  }, 0)

  const getLink = (sid) =>
    window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid

  const copyLink = (sid, name) => {
    try { navigator.clipboard.writeText(getLink(sid)) } catch {}
    setToast(`Link for ${name} copied!`)
    setTimeout(() => setToast(''), 2300)
  }

  const openParentView = (sid) => {
    const url = window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid
    const win = window.open(url, '_blank')
    if (win) win.focus()
  }

  return (
    <div>
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.brandName}>Tutors Hub</span>
        <div className={styles.headerRight}>
          <button className={styles.navLink} onClick={() => navigate('/')}>Dashboard</button>
          <button className={styles.navLink} onClick={() => navigate('/lessons')}>Lessons</button>
          <button className={styles.navLink} onClick={() => navigate('/reports')}>Reports</button>
          <button className={styles.btnCreate} onClick={() => navigate('/dojo?create=1')}>+ Create Student</button>
        </div>
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome back, <span>Tutor</span></h1>
        <p className={styles.heroSub}>
          Track lessons, share progress reports, and keep parents in the loop — all in one place.
        </p>
        <div className={styles.heroNav}>
          <button className={`${styles.heroNavLink} ${styles.primary}`} onClick={() => navigate('/dojo?create=1')}>
            + Create Student
          </button>
          <button className={styles.heroNavLink} onClick={() => navigate('/dojo')}>Open Dojo</button>
          <button className={styles.heroNavLink} onClick={() => navigate('/lessons')}>View Lessons</button>
          <button className={styles.heroNavLink} onClick={() => navigate('/reports')}>Reports</button>
        </div>
      </div>

      {/* MAIN */}
      <div className={styles.main}>

        {/* STATS */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{students.length}</div>
            <div className={styles.statLbl}>Students</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{lessons.length}</div>
            <div className={styles.statLbl}>Lessons Logged</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{lastTs ? new Date(lastTs).getDate() : '—'}</div>
            <div className={styles.statLbl}>Last Activity</div>
          </div>
        </div>

        {/* SECTION HEAD */}
        <div className={styles.sectionHead}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={styles.sectionTitle}>Your Students</span>
            {students.length > 0 && (
              <span className={styles.sectionMeta}> · {students.length} enrolled</span>
            )}
          </div>
          <button className={styles.btnOutline} onClick={() => navigate('/dojo')}>Open Dojo</button>
        </div>

        {/* STUDENTS */}
        {students.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyTitle}>No students yet</div>
            <div className={styles.emptySub}>
              Create a student to start tracking lessons<br />and sharing progress with parents.
            </div>
            <button className={styles.btnCreate} onClick={() => navigate('/dojo?create=1')}>
              + Create Student
            </button>
          </div>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((s, idx) => {
              const p = getP(idx)
              const count = countByStudent[s.id] || 0
              const init = s.name?.charAt(0)?.toUpperCase() || '?'
              return (
                <div key={s.id} className={styles.studentCard}>
                  <div className={styles.studentCardAccent} style={{ background: p.bg }} />
                  <div className={styles.studentTop}>
                    <div className={styles.avatar} style={{ background: p.bg }}>{init}</div>
                    <div className={styles.studentMeta}>
                      <div className={styles.studentName}>{s.name || 'Unnamed'}</div>
                      <div className={styles.badges}>
                        {s.curriculum && <span className={`${styles.badge} ${styles.badgeGray}`}>{s.curriculum}</span>}
                        {s.grade && <span className={`${styles.badge} ${styles.badgeNavy}`}>{(s.yearGradeLabel || 'Grade')} {s.grade}</span>}
                        {!s.curriculum && !s.grade && <span className={styles.muted}>No class set</span>}
                      </div>
                    </div>
                  </div>
                  <div className={styles.studentBottom}>
                    <div className={styles.lessonCount}>
                      <span className={`${styles.lessonDot} ${count > 0 ? styles.active : ''}`} />
                      <span className={styles.muted}>{count} lesson{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={styles.studentActions}>
                      <button className={styles.btnXs} onClick={() => copyLink(s.id, s.name)}>Copy link</button>
                      <button className={styles.btnXsFilled} onClick={() => openParentView(s.id)}>Preview</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}