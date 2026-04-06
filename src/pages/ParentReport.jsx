import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getSession, formatDate } from '../data'
import styles from './ParentReport.module.css'

const STUDENT_COLORS = [
  { bg: '#1e3a5f', accent: '#3b82f6', light: '#e8f0fb' },
  { bg: '#059669', accent: '#10b981', light: '#ecfdf5' },
  { bg: '#b45309', accent: '#f59e0b', light: '#fef3c7' },
  { bg: '#7c3aed', accent: '#a78bfa', light: '#f5f3ff' },
  { bg: '#0e7490', accent: '#06b6d4', light: '#e0f2fe' },
  { bg: '#be185d', accent: '#f472b6', light: '#fdf2f8' },
]
const getColor = (i) => STUDENT_COLORS[i % STUDENT_COLORS.length]

const behaviourMeta = (b) => {
  if (!b) return { label: '—', cls: 'muted' }
  if (b === 'Excellent') return { label: 'Excellent', cls: 'green' }
  if (b === 'Very Good') return { label: 'Very Good', cls: 'green' }
  if (b === 'Good') return { label: 'Good', cls: 'navy' }
  if (b === 'Needs Improvement') return { label: 'Needs Improvement', cls: 'amber' }
  return { label: b, cls: 'red' }
}

const fmt = (d) => {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ParentReport() {
  const { sessionId, studentId } = useParams()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [student, setStudent] = useState(null)
  const [idx, setIdx] = useState(0)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const s = getSession(sessionId)
    if (!s) { setNotFound(true); return }
    const i = s.students.findIndex(x => x.id === studentId)
    if (i === -1) { setNotFound(true); return }
    setSession(s); setStudent(s.students[i]); setIdx(i)
  }, [sessionId, studentId])

  useEffect(() => {
    if (!session || !student) return
    const params = new URLSearchParams(location.search || location.hash?.split('?')[1] || '')
    if (params.get('print') === '1') {
      const timer = setTimeout(() => window.print(), 600)
      return () => clearTimeout(timer)
    }
  }, [session, student, location])

  if (notFound) return (
    <div className={styles.notFound}>
      <div className={styles.nfCode}>404</div>
      <h2>Report not found</h2>
      <p>This link may be invalid or the report has been removed.</p>
    </div>
  )

  if (!session || !student) return (
    <div className={styles.loading}><div className={styles.spinner} /></div>
  )

  const color = getColor(idx)
  const bm = behaviourMeta(student.behaviour)

  const hasExam = session.examType || session.examDateSet || session.examDateGiven ||
    session.examTime || session.examDateMarked || session.examDateRevised ||
    student.examScore || student.examGrade

  return (
    <div className={styles.page}>

      <div className={styles.header} style={{ background: color.bg }}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>Tutors Hub</div>
          <div className={styles.headerTitle}>Class Report</div>
          <div className={styles.headerSub}>{session.subject} &mdash; {session.grade}</div>
          {session.curriculum && <div className={styles.headerCurriculum}>{session.curriculum}</div>}
          <div className={styles.headerDate}>
            {session.day && `${session.day}, `}{formatDate(session.date)}
            {session.time && <span className={styles.dot}>{session.time}</span>}
          </div>
        </div>
        <div className={styles.headerAccentBar} style={{ background: color.accent }} />
      </div>

      <div className={styles.body}>

        {/* Student Identity Card */}
        <div className={styles.idCard}>
          <div className={styles.idTop} style={{ background: color.bg }}>
            <div className={styles.idAvatar} style={{ background: color.accent, color: color.bg }}>
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.idName}>{student.name}</div>
              {student.admNo && <div className={styles.idAdm}>Adm No. {student.admNo}</div>}
            </div>
          </div>

          <div className={styles.idStats}>
            <div className={styles.idStat}>
              <span className={styles.idStatLabel}>Marks / Score</span>
              <span className={styles.idStatValue} style={{ color: color.bg }}>{student.marks || '—'}</span>
            </div>
            <div className={styles.idStat}>
              <span className={styles.idStatLabel}>Grade</span>
              <span className={styles.idStatValue} style={{ color: color.bg }}>{student.grade || '—'}</span>
            </div>
            <div className={styles.idStat}>
              <span className={styles.idStatLabel}>Behaviour</span>
              <span className={`${styles.idStatValue} ${styles['bh' + bm.cls]}`}>{bm.label}</span>
            </div>
          </div>

          {student.remarks && (
            <div className={styles.idRemarks} style={{ background: color.light, borderTop: `3px solid ${color.accent}` }}>
              <div className={styles.idRemarksLabel} style={{ color: color.bg }}>Tutor's Note</div>
              <blockquote>"{student.remarks}"</blockquote>
            </div>
          )}
        </div>

        {/* Tutor & Session */}
        <Section title="Tutor & Session" color={color}>
          <InfoGrid>
            <InfoCell label="Tutor Name" value={session.teacherName} />
            <InfoCell label="Subject" value={session.subject} />
            <InfoCell label="Class / Grade" value={session.grade} />
            {session.curriculum && <InfoCell label="Curriculum" value={session.curriculum} />}
            <InfoCell label="Date" value={`${session.day ? session.day + ', ' : ''}${formatDate(session.date)}`} />
            {session.time && <InfoCell label="Time" value={session.time} />}
            {session.school && <InfoCell label="School" value={session.school} wide />}
          </InfoGrid>
        </Section>

        {/* Lesson Details */}
        <Section title="Lesson Details" color={color}>
          <InfoGrid>
            <InfoCell label="Topic" value={session.topic} />
            {session.subtopic && <InfoCell label="Sub-topic" value={session.subtopic} />}
            {session.book && <InfoCell label="Book / Reference" value={session.book} />}
            {session.page && <InfoCell label="Page(s)" value={session.page} />}
          </InfoGrid>

          {session.homework && (
            <div className={styles.assignmentBox} style={{ borderLeftColor: color.accent, background: color.light }}>
              <div className={styles.assignmentLabel} style={{ color: color.bg }}>Assignment</div>
              <div className={styles.assignmentText}>{session.homework}</div>
              {session.homeworkDue && (
                <div className={styles.assignmentDue} style={{ color: color.bg }}>
                  Due: {fmt(session.homeworkDue)}
                </div>
              )}
            </div>
          )}
        </Section>

        {session.covered && (
          <Section title="Content Covered" color={color}>
            <p className={styles.prose}>{session.covered}</p>
          </Section>
        )}

        {session.nextClass && (
          <Section title="Next Class" color={color}>
            <p className={styles.prose}>{session.nextClass}</p>
          </Section>
        )}

        {session.teacherRemarks && (
          <Section title="Tutor's General Remarks" color={color}>
            <blockquote className={styles.remarksQuote} style={{ borderLeftColor: color.accent }}>
              "{session.teacherRemarks}"
            </blockquote>
          </Section>
        )}

        {hasExam && (
          <Section title="Examination" color={color}>
            <div className={styles.examGrid}>
              {session.examType && <ExamCell label="Exam Type" val={session.examType} />}
              {session.examDateSet && <ExamCell label="Date Set" val={fmt(session.examDateSet)} />}
              {session.examDateGiven && <ExamCell label="Date Given" val={fmt(session.examDateGiven)} />}
              {session.examTime && <ExamCell label="Time" val={session.examTime} />}
              {session.examDateMarked && <ExamCell label="Date Marked" val={fmt(session.examDateMarked)} />}
              {session.examDateRevised && <ExamCell label="Date Revised" val={fmt(session.examDateRevised)} />}
              {student.examScore && <ExamCell label="Score" val={student.examScore} bold color={color.bg} />}
              {student.examGrade && <ExamCell label="Grade" val={student.examGrade} bold color={color.bg} />}
            </div>
          </Section>
        )}

        {/* Signature */}
        <div className={styles.sig}>
          <div>
            <div className={styles.sigLabel}>Class Tutor</div>
            <div className={styles.sigName} style={{ color: color.bg }}>{session.teacherName}</div>
          </div>
          <div className={styles.sigRight}>
            <div className={styles.sigLabel}>Powered by</div>
            <div className={styles.sigBrand} style={{ color: color.bg }}>Tutors Hub</div>
          </div>
        </div>

        <div className={styles.printRow}>
          <button
            className={styles.printBtn}
            style={{ background: color.bg, color: '#fff' }}
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
        </div>

      </div>
    </div>
  )
}

function Section({ title, color, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionBar} style={{ background: color.accent }} />
        <h3 className={styles.sectionTitle} style={{ color: color.bg }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoGrid({ children }) {
  return <div className={styles.infoGrid}>{children}</div>
}

function InfoCell({ label, value, wide }) {
  if (!value) return null
  return (
    <div className={styles.infoCell} style={wide ? { gridColumn: '1 / -1' } : {}}>
      <div className={styles.infoCellLabel}>{label}</div>
      <div className={styles.infoCellValue}>{value}</div>
    </div>
  )
}

function ExamCell({ label, val, bold, color: col }) {
  return (
    <div className={styles.examCell}>
      <div className={styles.examCellLabel}>{label}</div>
      <div className={styles.examCellValue} style={bold ? { fontWeight: 800, color: col } : {}}>{val}</div>
    </div>
  )
}