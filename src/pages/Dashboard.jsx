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

const STUDENT_COLORS = [
  { bg: '#2563eb', accent: '#3b82f6', light: '#eff6ff' },
  { bg: '#059669', accent: '#10b981', light: '#f0fdf4' },
  { bg: '#dc2626', accent: '#ef4444', light: '#fef2f2' },
  { bg: '#7c3aed', accent: '#a78bfa', light: '#faf5ff' },
  { bg: '#0891b2', accent: '#06b6d4', light: '#f0f9ff' },
  { bg: '#ea580c', accent: '#fb923c', light: '#fff7ed' },
]
const getColor = (i) => STUDENT_COLORS[i % STUDENT_COLORS.length]

export default function Dashboard() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  const students = load(STUDENTS_KEY)
  const lessons = load(LESSONS_KEY)

  const lessonCountByStudent = lessons.reduce((acc, l) => {
    if (!l?.studentId) return acc
    acc[l.studentId] = (acc[l.studentId] || 0) + 1
    return acc
  }, {})

  const lastLessonDate = lessons.reduce((max, l) => {
    if (!l?.date) return max
    const t = new Date(l.date + 'T00:00:00').getTime()
    return Number.isFinite(t) && t > max ? t : max
  }, 0)

  const getLink = (sid) =>
    window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid

  const copyLink = (sid, name) => {
    try { navigator.clipboard.writeText(getLink(sid)) } catch {}
    setToast(`Link for ${name} copied!`)
    setTimeout(() => setToast(''), 2200)
  }

  const openParentView = (sid) => {
    const base = window.location.pathname.split('#')[0]
    const url = `${window.location.origin}${base}#/dojo/${sid}`
    const win = window.open(url, '_blank')
    if (win) win.focus()
  }

  return (
    <div>
      <Header right={
        <Btn variant="gold" size="sm" onClick={() => navigate('/dojo?create=1')}>+ Create Student</Btn>
      } />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTag}>Tutors hub</div>
          <h1 className={styles.heroTitle}>Welcome, Tutor</h1>
          <p className={styles.heroSub}>Create a student to start tracking lessons and sharing progress with parents.</p>
          <Btn variant="gold" onClick={() => navigate('/dojo?create=1')}>+ Create Student</Btn>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.statsRow}>
          <Card>
            <CardBody style={{ padding: 22, textAlign: 'center' }}>
              <div className={styles.statNum}>{students.length}</div>
              <div className={styles.statLbl}>Students</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody style={{ padding: 22, textAlign: 'center' }}>
              <div className={styles.statNum}>{lessons.length}</div>
              <div className={styles.statLbl}>Lessons Logged</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody style={{ padding: 22, textAlign: 'center' }}>
              <div className={styles.statNum}>{lastLessonDate ? new Date(lastLessonDate).getDate() : '—'}</div>
              <div className={styles.statLbl}>Last Activity</div>
            </CardBody>
          </Card>
        </div>

        <div className={styles.sectionHead}>
          <h2>Your Students</h2>
          <div className={styles.sectionActions}>
            <Btn variant="outline" size="sm" onClick={() => navigate('/dojo')}>Open Dojo</Btn>
          </div>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardBody style={{ padding: 34 }}>
              <Empty
                icon="👩‍🎓"
                title="No students yet"
                message="Create a student to start tracking lessons and sharing progress with parents."
                action={<Btn variant="gold" onClick={() => navigate('/dojo?create=1')}>+ Create Student</Btn>}
              />
            </CardBody>
          </Card>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((s, idx) => {
              const c = getColor(idx)
              const count = lessonCountByStudent[s.id] || 0
              return (
                <div key={s.id} className={styles.studentCard} style={{ borderColor: c.accent }}>
                  <div className={styles.studentTop} style={{ background: c.light }}>
                    <div className={styles.avatar} style={{ background: c.bg }}>{s.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div className={styles.studentMeta}>
                      <div className={styles.studentName}>{s.name}</div>
                      <div className={styles.studentSub}>
                        {(s.curriculum || s.grade) ? (
                          <>
                            {s.curriculum && <Badge color="muted">{s.curriculum}</Badge>}
                            {s.grade && <Badge color="navy">{(s.yearGradeLabel || 'Grade') + ' ' + s.grade}</Badge>}
                          </>
                        ) : (
                          <span className={styles.muted}>No class/grade set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.studentBottom}>
                    <div className={styles.studentFoot}>
                      <span className={styles.muted}>{count} lesson{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={styles.studentActions}>
                      <Btn size="xs" variant="outline" onClick={() => copyLink(s.id, s.name)}>Copy Link</Btn>
                      <Btn size="xs" variant="white" onClick={() => openParentView(s.id)}>Preview</Btn>
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
