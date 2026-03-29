import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession, formatDate } from '../data'
import { Header, Btn, Card, CardHeader, CardBody, Toast } from '../components/UI'
import styles from './ShareLinks.module.css'

const STUDENT_COLORS = [
  '#0f2b5b', '#0d4a2f', '#4a0d1a', '#2a0d4a', '#0d3a4a', '#3a2a0d'
]
const getStudentColor = (i) => STUDENT_COLORS[i % STUDENT_COLORS.length]

export default function ShareLinks() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [toast, setToast] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const s = getSession(sessionId)
    if (s) setSession(s)
    else navigate('/')
  }, [sessionId])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const getLink = (studentId) =>
    `${window.location.origin}${window.location.pathname.split('#')[0]}#/report/${sessionId}/${studentId}`

  const copyLink = async (studentId, name) => {
    await navigator.clipboard.writeText(getLink(studentId))
    setCopiedId(studentId)
    showToast(`Link for ${name} copied!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = async () => {
    if (!session) return
    const text = session.students.map(s => `${s.name}: ${getLink(s.id)}`).join('\n')
    await navigator.clipboard.writeText(text)
    showToast('All links copied!')
  }

  const shareWhatsApp = (student) => {
    const link = getLink(student.id)
    const msg = encodeURIComponent(
      `Hello, please find ${student.name}'s class report for *${session.subject} - ${session.topic}* (${formatDate(session.date)}):\n\n${link}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const shareAllWhatsApp = () => {
    if (!session) return
    const lines = session.students.map(s => `• ${s.name}: ${getLink(s.id)}`).join('\n')
    const msg = encodeURIComponent(
      `Class Report — *${session.subject}: ${session.topic}*\n${formatDate(session.date)} | ${session.grade}\n\nStudent report links:\n${lines}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const printReport = (studentId) => {
    const base = window.location.pathname.split('#')[0]
    const url = `${window.location.origin}${base}#/report/${sessionId}/${studentId}?print=1`
    const win = window.open(url, '_blank')
    // Fallback: if the new tab can't auto-print, the user can use the Print button inside the report
    if (win) win.focus()
  }

  const printAll = () => {
    if (!session) return
    session.students.forEach((s, i) => {
      setTimeout(() => printReport(s.id), i * 800)
    })
    showToast(`Opening ${session.students.length} report(s) for printing…`)
  }

  if (!session) return null

  return (
    <div>
      <Header right={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="outline" size="sm" onClick={() => navigate(`/new?edit=${sessionId}`)}>Edit</Btn>
          <Btn variant="outline" size="sm" onClick={() => navigate('/')}>Dashboard</Btn>
        </div>
      } />

      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerTag}>Share Reports</div>
          <h1 className={styles.bannerTitle}>{session.topic}</h1>
          <div className={styles.bannerMeta}>
            <span>{session.subject}</span>
            <span>{session.grade}</span>
            {session.curriculum && <span>{session.curriculum}</span>}
            <span>{session.day}, {formatDate(session.date)}</span>
            {session.time && <span>{session.time}</span>}
            <span>Tutor: {session.teacherName}</span>
            <span>{session.students.length} students</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>

        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Bulk Share" sub="Send all student links at once" />
          <CardBody>
            <div className={styles.bulkRow}>
              <div className={styles.bulkInfo}>
                <strong>{session.students.length}</strong> report links ready
              </div>
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                <Btn variant="outline" onClick={copyAll}>Copy All Links</Btn>
                <Btn variant="outline" onClick={printAll}>Print All Reports</Btn>
                <Btn variant="whatsapp" onClick={shareAllWhatsApp}>Share All via WhatsApp</Btn>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Student Links" sub="Each student has a unique link for their parent" />
          <CardBody style={{ padding: '16px 22px' }}>
            {session.students.map((s, i) => {
              const col = getStudentColor(i)
              return (
                <div key={s.id} className={styles.linkRow}>
                  <div className={styles.linkDot} style={{ background: col }}>{i + 1}</div>

                  <div className={styles.linkStudent}>
                    <div className={styles.linkName} style={{ color: col }}>{s.name}</div>
                    {s.admNo && <div className={styles.linkAdm}>Adm: {s.admNo}</div>}
                  </div>

                  <div className={styles.linkChips}>
                    {s.marks && <span className={styles.chip}>Score: {s.marks}</span>}
                    {s.examScore && <span className={styles.chip}>Exam: {s.examScore}</span>}
                    {s.grade && <span className={styles.chip}>Grade: {s.grade}</span>}
                    {s.behaviour && <span className={styles.chip}>{s.behaviour}</span>}
                  </div>

                  <div className={styles.linkUrl}>{getLink(s.id).replace('https://', '')}</div>

                  <div className={styles.linkActions}>
                    <Btn
                      variant={copiedId === s.id ? 'green' : 'outline'}
                      size="xs"
                      onClick={() => copyLink(s.id, s.name)}
                    >
                      {copiedId === s.id ? 'Copied!' : 'Copy Link'}
                    </Btn>
                    <Btn variant="whatsapp" size="xs" onClick={() => shareWhatsApp(s)}>
                      WhatsApp
                    </Btn>
                    <Btn variant="ghost" size="xs" onClick={() => navigate(`/report/${sessionId}/${s.id}`)}>
                      Preview
                    </Btn>
                    <Btn variant="outline" size="xs" onClick={() => printReport(s.id)}>
                      Print Report
                    </Btn>
                  </div>
                </div>
              )
            })}
          </CardBody>
        </Card>

      </div>

      <Toast message={toast} />
    </div>
  )
}