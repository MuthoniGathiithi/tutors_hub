import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../components/UI'
import styles from './Dashboard.module.css'

const STUDENTS_KEY = 'lh_students'
const LESSONS_KEY = 'lh_lessons'
const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

const COLORS = [
  '#1a2e4a', '#16a34a', '#b45309', '#7c3aed', '#0e7490', '#be185d',
]
const getColor = (i) => COLORS[i % COLORS.length]

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

  const lastDate = lastTs
    ? new Date(lastTs).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '—'

  const getLink = (sid) =>
    window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid

  const copyLink = (sid, name) => {
    try { navigator.clipboard.writeText(getLink(sid)) } catch {}
    setToast(`Link copied for ${name}`)
    setTimeout(() => setToast(''), 2300)
  }

  const openParentView = (sid) => {
    const url = window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid
    const win = window.open(url, '_blank')
    if (win) win.focus()
  }

  return (
    <div className={styles.root}>

      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.brand}>Tutors Hub</span>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => navigate('/')}>Dashboard</button>
          <button className={styles.navLink} onClick={() => navigate('/lessons')}>Lessons</button>
          <button className={styles.navLink} onClick={() => navigate('/reports')}>Reports</button>
          <button className={styles.navCta} onClick={() => navigate('/dojo?create=1')}>New Student</button>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <h1 className={styles.pageTitle}>Good morning, Tutor</h1>
          <p className={styles.pageSub}>Here's what's happening across your students.</p>
          <div className={styles.pageActions}>
            <button className={styles.actionPrimary} onClick={() => navigate('/dojo?create=1')}>
              + New Student
            </button>
            <button className={styles.actionSecondary} onClick={() => navigate('/lessons')}>
              Log a Lesson
            </button>
            <button className={styles.actionSecondary} onClick={() => navigate('/reports')}>
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className={styles.main}>

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{students.length}</div>
            <div className={styles.statLabel}>Students</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <div className={styles.statValue}>{lessons.length}</div>
            <div className={styles.statLabel}>Lessons Logged</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <div className={styles.statValue}>{lastDate}</div>
            <div className={styles.statLabel}>Last Session</div>
          </div>
        </div>

        {/* SECTION HEAD */}
        <div className={styles.sectionRow}>
          <div>
            <span className={styles.sectionTitle}>Students</span>
            {students.length > 0 && (
              <span className={styles.sectionCount}>{students.length}</span>
            )}
          </div>
          <button className={styles.sectionLink} onClick={() => navigate('/dojo')}>
            View Students →
          </button>
        </div>

        {/* STUDENTS */}
        {students.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>No students yet</div>
            <div className={styles.emptySub}>
              Create your first student profile to start tracking lessons and sharing progress with parents.
            </div>
            <button className={styles.actionPrimary} onClick={() => navigate('/dojo?create=1')}>
              + New Student
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {students.map((s, idx) => {
              const color = getColor(idx)
              const count = countByStudent[s.id] || 0
              const init = s.name?.charAt(0)?.toUpperCase() || '?'
              return (
                <div key={s.id} className={styles.card}>
                  <div className={styles.cardStripe} style={{ background: color }} />
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div className={styles.avatar} style={{ background: color }}>
                        {init}
                      </div>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>{s.name || 'Unnamed'}</div>
                        <div className={styles.studentTags}>
                          {s.curriculum && (
                            <span className={styles.tag}>{s.curriculum}</span>
                          )}
                          {s.grade && (
                            <span className={styles.tag}>
                              {(s.yearGradeLabel || 'Grade')} {s.grade}
                            </span>
                          )}
                          {!s.curriculum && !s.grade && (
                            <span className={styles.tagMuted}>No class set</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.lessonCount}>
                        <span className={`${styles.dot} ${count > 0 ? styles.dotActive : ''}`} />
                        {count} lesson{count !== 1 ? 's' : ''}
                      </span>
                      <div className={styles.cardActions}>
                        <button className={styles.btnSm} onClick={() => copyLink(s.id, s.name)}>
                          Copy link
                        </button>
                        <button
                          className={styles.btnSmFilled}
                          style={{ background: color }}
                          onClick={() => openParentView(s.id)}
                        >
                          Preview
                        </button>
                      </div>
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