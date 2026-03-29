import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import styles from './Dojo.module.css'
import { Header, Btn, Toast } from '../components/UI'

// ─── Storage ─────────────────────────────────────────────────────────────────
const STUDENTS_KEY = 'lh_students'
const LESSONS_KEY  = 'lh_lessons'
const load   = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const save   = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ─── Per-student colour palette ───────────────────────────────────────────────
const STUDENT_COLORS = [
  { bg: '#0f2b5b', accent: '#e8a000', light: '#fffbf0' },
  { bg: '#0d4a2f', accent: '#1aaa6b', light: '#f0faf5' },
  { bg: '#4a0d1a', accent: '#d94f4f', light: '#fff5f5' },
  { bg: '#2a0d4a', accent: '#8b5cf6', light: '#f8f5ff' },
  { bg: '#0d3a4a', accent: '#0ea5d4', light: '#f0faff' },
  { bg: '#3a2a0d', accent: '#d97706', light: '#fffbf0' },
]
const getColor = (i) => STUDENT_COLORS[i % STUDENT_COLORS.length]

const fmtDate = (d) => {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const CURRICULUM_TYPES = ['CBC', 'International (IGCSE/IB)', 'Local 8-4-4', 'American', 'Other']
const EXAM_TYPES = ['School Exam', 'Online Test', 'Home Assignment Test', 'Center Exam', 'Mock Exam', 'CAT', 'Other']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StyledSelect({ value, onChange, options, placeholder }) {
  return (
    <div className={styles.selectWrap}>
      <select className={styles.select} value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  )
}

function Field({ label, req, children, span }) {
  return (
    <div className={styles.fieldGroup} style={span ? { gridColumn: span } : {}}>
      <label className={styles.fieldLabel}>{label}{req && <span className={styles.req}> *</span>}</label>
      {children}
    </div>
  )
}

function ExamMini({ label, val, bold, color: col }) {
  return (
    <div className={styles.examMini}>
      <span className={styles.examMiniLabel}>{label}</span>
      <span className={styles.examMiniVal} style={bold ? { fontWeight: 800, color: col } : {}}>{val}</span>
    </div>
  )
}

// ─── PARENT / PUBLIC VIEW ─────────────────────────────────────────────────────
function ParentView({ studentId }) {
  const students = load(STUDENTS_KEY)
  const lessons  = load(LESSONS_KEY)
  const sidx     = students.findIndex(s => s.id === studentId)
  const student  = students[sidx]
  const history  = lessons
    .filter(l => l.studentId === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (!student) return (
    <div className={styles.notFound}>
      <div className={styles.nfCode}>404</div>
      <h2>Student not found</h2>
      <p>This link may be invalid or the student has been removed.</p>
    </div>
  )

  const color = getColor(sidx)

  return (
    <div className={styles.parentPage}>
      <div className={styles.parentHeader} style={{ background: color.bg }}>
        <div className={styles.parentHeaderInner}>
          <div className={styles.parentBrand}>Learning Hub</div>
          <div className={styles.parentAvatar} style={{ background: color.accent, color: color.bg }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.parentName}>{student.name}</div>
          {student.grade && (
            <div className={styles.parentGrade} style={{ background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.22)' }}>
              {student.curriculum ? `${student.curriculum} · ` : ''}{student.grade}
            </div>
          )}
          <div className={styles.parentCount}>{history.length} lesson{history.length !== 1 ? 's' : ''} recorded</div>
          <button className={styles.parentPrintBtn} style={{ background: color.accent, color: color.bg }} onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
        <div className={styles.parentAccent} style={{ background: color.accent }} />
      </div>

      <div className={styles.parentBody}>
        {history.length === 0 ? (
          <div className={styles.emptyNote}>No lessons recorded yet for this student.</div>
        ) : history.map((l) => (
          <div key={l.id} className={styles.lessonCard} style={{ borderTop: `3px solid ${color.accent}` }}>

            {/* Date + Tutor strip */}
            <div className={styles.lcTopStrip} style={{ background: color.bg + '0c' }}>
              <div className={styles.lcTopLeft}>
                <div className={styles.lcDateBox} style={{ background: color.bg }}>
                  <div className={styles.lcDateDay}>{new Date((l.date || '') + 'T00:00:00').getDate() || '?'}</div>
                  <div className={styles.lcDateMon}>{new Date((l.date || '') + 'T00:00:00').toLocaleString('en-GB',{month:'short'})}</div>
                </div>
                <div>
                  <div className={styles.lcDate}>{fmtDate(l.date)}</div>
                  {l.time && <div className={styles.lcTime}>{l.time}</div>}
                </div>
              </div>
              {l.tutor && (
                <div className={styles.lcTutorChip} style={{ background: color.bg, color: '#fff' }}>
                  Tutor: {l.tutor}
                </div>
              )}
            </div>

            {/* Subject + Topic */}
            <div className={styles.lcSubjectRow}>
              <span className={styles.lcSubjectBadge} style={{ background: color.bg }}>{l.subject}</span>
              <span className={styles.lcTopic} style={{ color: color.bg }}>{l.topic}</span>
              {l.subtopic && <span className={styles.lcSubtopic}>/ {l.subtopic}</span>}
            </div>

            {/* Info fields */}
            {l.book     && <LcRow label="Book / Reference" val={l.book}  />}
            {l.page     && <LcRow label="Page(s)"          val={l.page}  />}
            {l.workDone && <LcRow label="Content Taught"   val={l.workDone} />}
            {l.remarks  && <LcRow label="Tutor's Remarks"  val={l.remarks}  />}

            {/* Assignment */}
            {l.assignment && (
              <div className={styles.lcAssignment} style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                <div className={styles.lcAssignmentLabel} style={{ color: color.bg }}>Assignment</div>
                <div className={styles.lcAssignmentText}>{l.assignment}</div>
                {l.assignmentDue && <div className={styles.lcAssignmentDue} style={{ color: color.bg }}>Due: {fmtDate(l.assignmentDue)}</div>}
              </div>
            )}

            {/* Exam */}
            {(l.examType || l.examScore || l.examGrade || l.examDateSet || l.examDateGiven) && (
              <div className={styles.lcExam} style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                <div className={styles.lcExamTitle} style={{ color: color.bg }}>Examination</div>
                <div className={styles.lcExamGrid}>
                  {l.examType        && <ExamMini label="Type"         val={l.examType} />}
                  {l.examDateSet     && <ExamMini label="Date Set"     val={fmtDate(l.examDateSet)} />}
                  {l.examDateGiven   && <ExamMini label="Date Given"   val={fmtDate(l.examDateGiven)} />}
                  {l.examTime        && <ExamMini label="Time"         val={l.examTime} />}
                  {l.examDateMarked  && <ExamMini label="Date Marked"  val={fmtDate(l.examDateMarked)} />}
                  {l.examDateRevised && <ExamMini label="Date Revised" val={fmtDate(l.examDateRevised)} />}
                  {l.examScore       && <ExamMini label="Score"        val={l.examScore} bold color={color.bg} />}
                  {l.examGrade       && <ExamMini label="Grade"        val={l.examGrade} bold color={color.bg} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.parentPrintRow}>
        <button className={styles.printBtnBottom} style={{ background: color.bg, color: '#fff' }} onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
    </div>
  )
}

function LcRow({ label, val }) {
  return (
    <div className={styles.lcField}>
      <span className={styles.lcFieldLabel}>{label}</span>
      <span className={styles.lcFieldVal}>{val}</span>
    </div>
  )
}

// ─── MAIN TUTOR VIEW ──────────────────────────────────────────────────────────
export default function Dojo() {
  const { studentId } = useParams()
  const location      = useLocation()

  if (studentId) return <ParentView studentId={studentId} />

  const [students, setStudents] = useState(() => load(STUDENTS_KEY))
  const [lessons,  setLessons]  = useState(() => load(LESSONS_KEY))
  const [toast,    setToast]    = useState('')
  const [view,     setView]     = useState('list')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editLesson,      setEditLesson]      = useState(null)

  const [newName,           setNewName]           = useState('')
  const [newGrade,          setNewGrade]          = useState('')
  const [newCurriculum,     setNewCurriculum]     = useState('')
  const [newYearGradeLabel, setNewYearGradeLabel] = useState('Grade')

  const defaultLesson = () => ({
    date: new Date().toISOString().slice(0, 10),
    time: '', tutor: '', subject: '', topic: '', subtopic: '',
    book: '', page: '', workDone: '', remarks: '',
    assignment: '', assignmentDue: '',
    examType: '', examDateSet: '', examDateGiven: '', examTime: '',
    examDateMarked: '', examDateRevised: '', examScore: '', examGrade: '',
  })
  const [lf, setLf] = useState(defaultLesson)
  const setL = (k, v) => setLf(f => ({ ...f, [k]: v }))

  useEffect(() => { save(STUDENTS_KEY, students) }, [students])
  useEffect(() => { save(LESSONS_KEY,  lessons)  }, [lessons])
  useEffect(() => {
    if (studentId) return
    try { const qp = new URLSearchParams(location.search); if (qp.get('create')) setView('create-student') } catch {}
  }, [location.search, studentId])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const getLink = (sid) =>
    window.location.origin + window.location.pathname.split('#')[0] + '#/dojo/' + sid

  const copyLink = (sid, name) => {
    try { navigator.clipboard.writeText(getLink(sid)) } catch {}
    showToast(`Link for ${name} copied!`)
  }

  const whatsapp = (student) => {
    const url = getLink(student.id)
    const msg = encodeURIComponent(`Hi! Here is ${student.name}'s learning history on Learning Hub:\n${url}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const openParentView = (sid) => {
    const base = window.location.pathname.split('#')[0]
    const url  = `${window.location.origin}${base}#/dojo/${sid}`
    const win  = window.open(url, '_blank')
    if (win) win.focus()
  }

  const handleCreateStudent = () => {
    if (!newName.trim()) return showToast('Enter student name')
    const s = { id: makeId(), name: newName.trim(), grade: newGrade.trim(), curriculum: newCurriculum, yearGradeLabel: newYearGradeLabel, createdAt: new Date().toISOString() }
    setStudents(prev => [s, ...prev])
    setNewName(''); setNewGrade(''); setNewCurriculum(''); setNewYearGradeLabel('Grade')
    showToast('Student created!')
    setView('list')
  }

  const resetLesson = () => { setLf(defaultLesson()); setEditLesson(null) }
  const openAdd  = (s) => { setSelectedStudent(s); resetLesson(); setView('add-lesson') }
  const openEdit = (s, l) => {
    setSelectedStudent(s); setEditLesson(l)
    setLf({
      date: l.date, time: l.time||'', tutor: l.tutor||'',
      subject: l.subject, topic: l.topic, subtopic: l.subtopic||'',
      book: l.book||'', page: l.page||'', workDone: l.workDone||'', remarks: l.remarks||'',
      assignment: l.assignment||'', assignmentDue: l.assignmentDue||'',
      examType: l.examType||'', examDateSet: l.examDateSet||'',
      examDateGiven: l.examDateGiven||'', examTime: l.examTime||'',
      examDateMarked: l.examDateMarked||'', examDateRevised: l.examDateRevised||'',
      examScore: l.examScore||'', examGrade: l.examGrade||'',
    })
    setView('add-lesson')
  }

  const handleSaveLesson = () => {
    if (!lf.subject.trim()) return showToast('Enter subject')
    if (!lf.topic.trim())   return showToast('Enter topic')
    if (editLesson) {
      setLessons(prev => prev.map(l => l.id === editLesson.id ? { ...l, ...lf } : l))
      showToast('Lesson updated!')
    } else {
      setLessons(prev => [{ id: makeId(), studentId: selectedStudent.id, ...lf, createdAt: new Date().toISOString() }, ...prev])
      showToast('Lesson saved!')
    }
    resetLesson(); setView('student-detail')
  }

  const deleteLesson  = (id)  => { if (!confirm('Delete this lesson?')) return; setLessons(p => p.filter(l => l.id !== id)); showToast('Deleted') }
  const deleteStudent = (sid) => {
    if (!confirm('Delete this student and all their lessons?')) return
    setStudents(p => p.filter(s => s.id !== sid))
    setLessons(p => p.filter(l => l.studentId !== sid))
    setView('list'); showToast('Student deleted')
  }
  const studentLessons = (sid) => lessons.filter(l => l.studentId === sid).sort((a, b) => new Date(b.date) - new Date(a.date))

  // ── CREATE STUDENT ────────────────────────────────────────────────────────
  if (view === 'create-student') return (
    <div>
      <Header right={<Btn variant="outline" size="sm" onClick={() => setView('list')}>Back</Btn>} />
      <div className={styles.formPage}>
        <div className={styles.formPageHead}>
          <div className={styles.formPageTag}>New Student</div>
          <h1>Add a Student</h1>
          <p>Create a student profile to start logging their lessons and sharing progress with parents.</p>
        </div>
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Student Details</div>
          <div className={styles.formGrid2}>
            <Field label="Student Name" req>
              <input className={styles.fieldInput} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Amira Omondi" autoFocus />
            </Field>
            <Field label="Curriculum Type">
              <StyledSelect value={newCurriculum} onChange={e => { setNewCurriculum(e.target.value); setNewGrade('') }} options={CURRICULUM_TYPES} placeholder="Select curriculum…" />
            </Field>
            <Field label={`${newYearGradeLabel} / Class`}>
              <input className={styles.fieldInput} value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder={`e.g. ${newYearGradeLabel} 7, Form 3, Year 10…`} />
            </Field>
            <Field label="Label Preference">
              <div className={styles.toggleRow}>
                {['Grade','Year','Class','Form'].map(opt => (
                  <button key={opt} className={`${styles.toggle} ${newYearGradeLabel === opt ? styles.toggleActive : ''}`} onClick={() => setNewYearGradeLabel(opt)}>{opt}</button>
                ))}
              </div>
            </Field>
          </div>
        </div>
        <div className={styles.formActions}>
          <Btn variant="outline" onClick={() => setView('list')}>Cancel</Btn>
          <Btn variant="gold" onClick={handleCreateStudent}>Create Student</Btn>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  )

  // ── ADD / EDIT LESSON ─────────────────────────────────────────────────────
  if (view === 'add-lesson') {
    const sidx  = students.findIndex(s => s.id === selectedStudent?.id)
    const color = getColor(sidx)
    return (
      <div>
        <Header right={<Btn variant="outline" size="sm" onClick={() => { resetLesson(); setView('student-detail') }}>Back</Btn>} />
        <div className={styles.formPage}>

          <div className={styles.lessonFormHead} style={{ borderLeft: `5px solid ${color.accent}` }}>
            <div className={styles.lessonFormAvatar} style={{ background: color.bg, color: color.accent }}>
              {selectedStudent?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.lessonFormTag} style={{ color: color.bg }}>{editLesson ? 'Edit Lesson' : 'New Lesson'}</div>
              <div className={styles.lessonFormStudent} style={{ color: color.bg }}>{selectedStudent?.name}</div>
            </div>
          </div>

          {/* SESSION INFO */}
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>Session Info</div>
            <div className={styles.formGrid3}>
              <Field label="Student Name">
                <input className={styles.fieldInput} value={selectedStudent?.name || ''} readOnly
                  style={{ background: '#f0f4ff', cursor: 'default', fontWeight: 700, color: color.bg }} />
              </Field>
              <Field label="Date" req>
                <input className={styles.fieldInput} type="date" value={lf.date} onChange={e => setL('date', e.target.value)} />
              </Field>
              <Field label="Time">
                <input className={styles.fieldInput} type="time" value={lf.time} onChange={e => setL('time', e.target.value)} />
              </Field>
              <Field label="Tutor's Name">
                <input className={styles.fieldInput} value={lf.tutor} onChange={e => setL('tutor', e.target.value)} placeholder="Mr. / Ms. Linda…" />
              </Field>
              <Field label="Subject" req>
                <input className={styles.fieldInput} value={lf.subject} onChange={e => setL('subject', e.target.value)} placeholder="e.g. Mathematics" />
              </Field>
              <Field label="Page(s)">
                <input className={styles.fieldInput} value={lf.page} onChange={e => setL('page', e.target.value)} placeholder="e.g. Pg 34–38" />
              </Field>
            </div>
          </div>

          {/* LESSON CONTENT */}
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>Lesson Content</div>
            <div className={styles.formGrid2}>
              <Field label="Topic" req>
                <input className={styles.fieldInput} value={lf.topic} onChange={e => setL('topic', e.target.value)} placeholder="e.g. Fractions" />
              </Field>
              <Field label="Sub-topic">
                <input className={styles.fieldInput} value={lf.subtopic} onChange={e => setL('subtopic', e.target.value)} placeholder="e.g. Adding unlike fractions" />
              </Field>
              <Field label="Book / Reference Material" span="1 / -1">
                <input className={styles.fieldInput} value={lf.book} onChange={e => setL('book', e.target.value)} placeholder="e.g. Oxford Maths Book 4" />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Content Taught / Work Done">
                <textarea className={styles.fieldTextarea} value={lf.workDone} onChange={e => setL('workDone', e.target.value)} placeholder="What was covered — exercises, activities, tasks completed…" />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Tutor's Remarks">
                <textarea className={styles.fieldTextarea} style={{ minHeight: 72 }} value={lf.remarks} onChange={e => setL('remarks', e.target.value)} placeholder="Student's participation, behaviour, progress, attitude…" />
              </Field>
            </div>
          </div>

          {/* ASSIGNMENT */}
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>Assignment</div>
            <Field label="Assignment / Homework">
              <textarea className={styles.fieldTextarea} style={{ minHeight: 72 }} value={lf.assignment} onChange={e => setL('assignment', e.target.value)} placeholder="e.g. Exercise 4, Questions 1–10 on page 56…" />
            </Field>
            <div style={{ marginTop: 14 }}>
              <Field label="Due Date">
                <input className={styles.fieldInput} type="date" value={lf.assignmentDue} onChange={e => setL('assignmentDue', e.target.value)} style={{ maxWidth: 220 }} />
              </Field>
            </div>
          </div>

          {/* EXAMINATION */}
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>Examination <span className={styles.formCardSub}>— leave blank if no exam</span></div>
            <div className={styles.formGrid3}>
              <Field label="Exam Type">
                <StyledSelect value={lf.examType} onChange={e => setL('examType', e.target.value)} options={EXAM_TYPES} placeholder="Select type…" />
              </Field>
              <Field label="Date Set">
                <input className={styles.fieldInput} type="date" value={lf.examDateSet} onChange={e => setL('examDateSet', e.target.value)} />
              </Field>
              <Field label="Date Given">
                <input className={styles.fieldInput} type="date" value={lf.examDateGiven} onChange={e => setL('examDateGiven', e.target.value)} />
              </Field>
              <Field label="Exam Time">
                <input className={styles.fieldInput} type="time" value={lf.examTime} onChange={e => setL('examTime', e.target.value)} />
              </Field>
              <Field label="Date Marked">
                <input className={styles.fieldInput} type="date" value={lf.examDateMarked} onChange={e => setL('examDateMarked', e.target.value)} />
              </Field>
              <Field label="Date Revised">
                <input className={styles.fieldInput} type="date" value={lf.examDateRevised} onChange={e => setL('examDateRevised', e.target.value)} />
              </Field>
              <Field label="Score">
                <input className={styles.fieldInput} value={lf.examScore} onChange={e => setL('examScore', e.target.value)} placeholder="e.g. 78/100" />
              </Field>
              <Field label="Grade">
                <input className={styles.fieldInput} value={lf.examGrade} onChange={e => setL('examGrade', e.target.value)} placeholder="A, B+, C…" />
              </Field>
            </div>
          </div>

          <div className={styles.formActions}>
            <Btn variant="outline" onClick={() => { resetLesson(); setView('student-detail') }}>Cancel</Btn>
            <Btn variant="gold" onClick={handleSaveLesson}>{editLesson ? 'Update Lesson' : 'Save Lesson'}</Btn>
          </div>
        </div>
        <Toast message={toast} />
      </div>
    )
  }

  // ── STUDENT DETAIL ────────────────────────────────────────────────────────
  if (view === 'student-detail' && selectedStudent) {
    const sl    = studentLessons(selectedStudent.id)
    const sidx  = students.findIndex(s => s.id === selectedStudent.id)
    const color = getColor(sidx)
    return (
      <div>
        <Header right={<Btn variant="outline" size="sm" onClick={() => setView('list')}>All Students</Btn>} />
        <div className={styles.detailBanner} style={{ background: color.bg }}>
          <div className={styles.detailBannerLeft}>
            <div className={styles.detailAvatar} style={{ background: color.accent, color: color.bg }}>
              {selectedStudent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.detailName}>{selectedStudent.name}</div>
              {selectedStudent.grade && (
                <div className={styles.detailGrade}>{selectedStudent.curriculum ? `${selectedStudent.curriculum} · ` : ''}{selectedStudent.grade}</div>
              )}
              <div className={styles.detailCount}>{sl.length} lesson{sl.length !== 1 ? 's' : ''} recorded</div>
            </div>
          </div>
          <div className={styles.detailActions}>
            <Btn variant="gold"     size="sm" onClick={() => openAdd(selectedStudent)}>+ Add Lesson</Btn>
            <Btn variant="outline"  size="sm" onClick={() => copyLink(selectedStudent.id, selectedStudent.name)}>Copy Link</Btn>
            <Btn variant="outline"  size="sm" onClick={() => openParentView(selectedStudent.id)}>Parent View</Btn>
            <Btn variant="outline"  size="sm" onClick={() => window.print()}>Print</Btn>
            <Btn variant="whatsapp" size="sm" onClick={() => whatsapp(selectedStudent)}>WhatsApp</Btn>
          </div>
          <div className={styles.detailAccent} style={{ background: color.accent }} />
        </div>

        <div className={styles.detailBody}>
          {sl.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No lessons yet for this student.</p>
              <Btn variant="gold" onClick={() => openAdd(selectedStudent)}>+ Add First Lesson</Btn>
            </div>
          ) : sl.map(l => (
            <div key={l.id} className={styles.lessonItem} style={{ borderLeft: `4px solid ${color.accent}` }}>
              <div className={styles.liHeader}>
                <div>
                  <div className={styles.liDate}>{fmtDate(l.date)}{l.time && <span className={styles.liTime}> · {l.time}</span>}</div>
                  <div className={styles.liSubjectRow}>
                    <span className={styles.liSubjectBadge} style={{ background: color.bg }}>{l.subject}</span>
                    <span className={styles.liTopic} style={{ color: color.bg }}>{l.topic}</span>
                    {l.subtopic && <span className={styles.liSubtopic}>/ {l.subtopic}</span>}
                  </div>
                </div>
                <div className={styles.liActions}>
                  <Btn variant="ghost"  size="xs" onClick={() => openEdit(selectedStudent, l)}>Edit</Btn>
                  <Btn variant="danger" size="xs" onClick={() => deleteLesson(l.id)}>Delete</Btn>
                </div>
              </div>
              {l.tutor    && <LiRow label="Tutor"            val={l.tutor} />}
              {l.book     && <LiRow label="Book / Reference" val={l.book} />}
              {l.page     && <LiRow label="Page(s)"          val={l.page} />}
              {l.workDone && <LiRow label="Content Taught"   val={l.workDone} />}
              {l.remarks  && <LiRow label="Tutor's Remarks"  val={l.remarks} />}
              {l.assignment && (
                <div className={styles.liAssignment} style={{ background: color.light, borderLeft: `3px solid ${color.accent}` }}>
                  <span className={styles.liAssignmentLabel} style={{ color: color.bg }}>Assignment</span>
                  <span className={styles.liAssignmentText}>{l.assignment}</span>
                  {l.assignmentDue && <span className={styles.liAssignmentDue} style={{ color: color.bg }}>Due: {fmtDate(l.assignmentDue)}</span>}
                </div>
              )}
              {(l.examType || l.examScore || l.examGrade || l.examDateSet || l.examDateGiven) && (
                <div className={styles.liExam} style={{ background: color.light }}>
                  <div className={styles.liExamTitle} style={{ color: color.bg }}>Examination</div>
                  <div className={styles.liExamGrid}>
                    {l.examType        && <ExamMini label="Type"         val={l.examType} />}
                    {l.examDateSet     && <ExamMini label="Date Set"     val={fmtDate(l.examDateSet)} />}
                    {l.examDateGiven   && <ExamMini label="Date Given"   val={fmtDate(l.examDateGiven)} />}
                    {l.examTime        && <ExamMini label="Time"         val={l.examTime} />}
                    {l.examDateMarked  && <ExamMini label="Date Marked"  val={fmtDate(l.examDateMarked)} />}
                    {l.examDateRevised && <ExamMini label="Date Revised" val={fmtDate(l.examDateRevised)} />}
                    {l.examScore       && <ExamMini label="Score"        val={l.examScore} bold color={color.bg} />}
                    {l.examGrade       && <ExamMini label="Grade"        val={l.examGrade} bold color={color.bg} />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.dangerZone}>
          <Btn variant="danger" size="sm" onClick={() => deleteStudent(selectedStudent.id)}>Delete Student</Btn>
        </div>
        <Toast message={toast} />
      </div>
    )
  }

  // ── STUDENT LIST ──────────────────────────────────────────────────────────
  return (
    <div>
      <Header right={<Btn variant="gold" size="sm" onClick={() => setView('create-student')}>+ New Student</Btn>} />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTag}>Learning Hub</div>
          <h1 className={styles.heroTitle}>Welcome, Tutor</h1>
          <p className={styles.heroSub}>Create students, log lessons, and share progress with parents in seconds.</p>
          <Btn variant="navy" onClick={() => setView('create-student')}>+ Create Student</Btn>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.statsRow}>
          <div className={styles.statCard}><div className={styles.statNum}>{students.length}</div><div className={styles.statLbl}>Students</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{lessons.length}</div><div className={styles.statLbl}>Lessons Logged</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{students.length}</div><div className={styles.statLbl}>Parent Links</div></div>
        </div>

        <div className={styles.sectionHead}>
          <h2>My Students</h2>
          {students.length > 0 && <Btn variant="outline" size="sm" onClick={() => setView('create-student')}>+ New</Btn>}
        </div>

        {students.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>No students yet — create your first student to get started.</p>
            <Btn variant="gold" onClick={() => setView('create-student')}>+ Create First Student</Btn>
          </div>
        ) : (
          <div className={styles.studentList}>
            {students.map((s, i) => {
              const color = getColor(i)
              const count = lessons.filter(l => l.studentId === s.id).length
              const last  = lessons.filter(l => l.studentId === s.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
              return (
                <div key={s.id} className={styles.studentCard} style={{ borderLeft: `5px solid ${color.accent}` }}
                  onClick={() => { setSelectedStudent(s); setView('student-detail') }}>
                  <div className={styles.studentAvatar} style={{ background: color.bg, color: color.accent }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentName} style={{ color: color.bg }}>{s.name}</div>
                    <div className={styles.studentMeta}>
                      {s.curriculum && <span className={styles.pill} style={{ background: color.bg+'15', color: color.bg, border: `1px solid ${color.bg}25` }}>{s.curriculum}</span>}
                      {s.grade      && <span className={styles.pill} style={{ background: color.accent+'20', color: color.bg, border: `1px solid ${color.accent}40` }}>{s.grade}</span>}
                      <span className={styles.pill}>{count} lesson{count!==1?'s':''}</span>
                      {last && <span className={styles.pill}>Last: {fmtDate(last.date)}</span>}
                    </div>
                  </div>
                  <div className={styles.studentActions} onClick={e => e.stopPropagation()}>
                    <Btn variant="gold"     size="sm" onClick={() => openAdd(s)}>+ Lesson</Btn>
                    <Btn variant="outline"  size="sm" onClick={() => { setSelectedStudent(s); setView('student-detail') }}>View</Btn>
                    <Btn variant="outline"  size="sm" onClick={() => copyLink(s.id, s.name)}>Copy Link</Btn>
                    <Btn variant="outline"  size="sm" onClick={() => openParentView(s.id)}>Print</Btn>
                    <Btn variant="whatsapp" size="sm" onClick={() => whatsapp(s)}>Share</Btn>
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

function LiRow({ label, val, extra }) {
  return (
    <div className={styles.liField}>
      <span className={styles.liFieldLabel}>{label}</span>
      <span className={styles.liFieldVal}>{val}{extra && <span className={styles.liFieldExtra}> · {extra}</span>}</span>
    </div>
  )
}