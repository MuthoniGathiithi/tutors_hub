import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import './Dojo.css'
import { Header, Btn, Toast } from '../components/UI'

// ─── Storage ─────────────────────────────────────────────────────────────────
const STUDENTS_KEY = 'lh_students'
const LESSONS_KEY  = 'lh_lessons'
const load   = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const save   = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ─── Per-student colour palette ───────────────────────────────────────────────
const STUDENT_COLORS = [
  { bg: '#2563eb', accent: '#3b82f6', light: '#eff6ff' },
  { bg: '#059669', accent: '#10b981', light: '#f0fdf4' },
  { bg: '#dc2626', accent: '#ef4444', light: '#fef2f2' },
  { bg: '#7c3aed', accent: '#a78bfa', light: '#faf5ff' },
  { bg: '#0891b2', accent: '#06b6d4', light: '#f0f9ff' },
  { bg: '#ea580c', accent: '#fb923c', light: '#fff7ed' },
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
    <div className="dojo-select-wrap">
      <select className="dojo-select" value={value} onChange={onChange}>
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
    <div className="dojo-field-group" style={span ? { gridColumn: span } : {}}>
      <label className="dojo-field-label">{label}{req && <span className="dojo-req"> *</span>}</label>
      {children}
    </div>
  )
}

function ExamMini({ label, val, bold, color: col }) {
  return (
    <div className="dojo-exam-mini">
      <span className="dojo-exam-mini-label">{label}</span>
      <span className="dojo-exam-mini-val" style={bold ? { fontWeight: 800, color: col } : {}}>{val}</span>
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
    <div className="dojo-not-found">
      <div className="dojo-nf-code">404</div>
      <h2>Student not found</h2>
      <p>This link may be invalid or the student has been removed.</p>
    </div>
  )

  const color = getColor(sidx)

  return (
    <div className="dojo-parent-page">
      <div className="dojo-parent-header" style={{ background: color.bg }}>
        <div className="dojo-parent-header-inner">
          <div className="dojo-parent-brand">Learning Hub</div>
          <div className="dojo-parent-avatar" style={{ background: color.accent, color: '#fff' }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="dojo-parent-name">{student.name}</div>
          {student.grade && (
            <div className="dojo-parent-grade" style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)' }}>
              {student.curriculum ? `${student.curriculum} · ` : ''}{student.grade}
            </div>
          )}
          <div className="dojo-parent-count">{history.length} lesson{history.length !== 1 ? 's' : ''} recorded</div>
          <button className="dojo-parent-print-btn" style={{ background: color.accent, color: '#fff' }} onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
        <div className="dojo-parent-accent" style={{ background: color.accent }} />
      </div>

      <div className="dojo-parent-body">
        {history.length === 0 ? (
          <div className="dojo-empty-note">No lessons recorded yet for this student.</div>
        ) : history.map((l) => (
          <div key={l.id} className="dojo-lesson-card" style={{ borderTop: `3px solid ${color.accent}` }}>

            {/* Date + Tutor strip */}
            <div className="dojo-lc-top-strip" style={{ background: color.bg + '0a' }}>
              <div className="dojo-lc-top-left">
                <div className="dojo-lc-date-box" style={{ background: color.bg }}>
                  <div className="dojo-lc-date-day">{new Date((l.date || '') + 'T00:00:00').getDate() || '?'}</div>
                  <div className="dojo-lc-date-mon">{new Date((l.date || '') + 'T00:00:00').toLocaleString('en-GB',{month:'short'})}</div>
                </div>
                <div>
                  <div className="dojo-lc-date">{fmtDate(l.date)}</div>
                  {l.time && <div className="dojo-lc-time">{l.time}</div>}
                </div>
              </div>
              {l.tutor && (
                <div className="dojo-lc-tutor-chip" style={{ background: color.bg, color: '#fff' }}>
                  Tutor: {l.tutor}
                </div>
              )}
            </div>

            {/* Subject + Topic */}
            <div className="dojo-lc-subject-row">
              <span className="dojo-lc-subject-badge" style={{ background: color.bg }}>{l.subject}</span>
              <span className="dojo-lc-topic" style={{ color: color.bg }}>{l.topic}</span>
              {l.subtopic && <span className="dojo-lc-subtopic">/ {l.subtopic}</span>}
            </div>

            {/* Info fields */}
            {l.book     && <LcRow label="Book / Reference" val={l.book}  />}
            {l.page     && <LcRow label="Page(s)"          val={l.page}  />}
            {l.workDone && <LcRow label="Content Taught"   val={l.workDone} />}
            {l.remarks  && <LcRow label="Tutor's Remarks"  val={l.remarks}  />}

            {/* Assignment */}
            {l.assignment && (
              <div className="dojo-lc-assignment" style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                <div className="dojo-lc-assignment-label" style={{ color: color.bg }}>Assignment</div>
                <div className="dojo-lc-assignment-text">{l.assignment}</div>
                {l.assignmentDue && <div className="dojo-lc-assignment-due" style={{ color: color.bg }}>Due: {fmtDate(l.assignmentDue)}</div>}
              </div>
            )}

            {/* Exam */}
            {(l.examType || l.examScore || l.examGrade || l.examDateSet || l.examDateGiven) && (
              <div className="dojo-lc-exam" style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                <div className="dojo-lc-exam-title" style={{ color: color.bg }}>Examination</div>
                <div className="dojo-lc-exam-grid">
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

      <div className="dojo-parent-print-row">
        <button className="dojo-print-btn-bottom" style={{ background: color.bg, color: '#fff' }} onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
    </div>
  )
}

function LcRow({ label, val }) {
  return (
    <div className="dojo-lc-field">
      <span className="dojo-lc-field-label">{label}</span>
      <span className="dojo-lc-field-val">{val}</span>
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
      <div className="dojo-form-page">
        <div className="dojo-form-page-head">
          <div className="dojo-form-page-tag">New Student</div>
          <h1>Add a Student</h1>
          <p>Create a student profile to start logging their lessons and sharing progress with parents.</p>
        </div>
        <div className="dojo-form-card">
          <div className="dojo-form-card-title">Student Details</div>
          <div className="dojo-form-grid-2">
            <Field label="Student Name" req>
              <input className="dojo-field-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Amira Omondi" autoFocus />
            </Field>
            <Field label="Curriculum Type">
              <StyledSelect value={newCurriculum} onChange={e => { setNewCurriculum(e.target.value); setNewGrade('') }} options={CURRICULUM_TYPES} placeholder="Select curriculum…" />
            </Field>
            <Field label={`${newYearGradeLabel} / Class`}>
              <input className="dojo-field-input" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder={`e.g. ${newYearGradeLabel} 7, Form 3, Year 10…`} />
            </Field>
            <Field label="Label Preference">
              <div className="dojo-toggle-row">
                {['Grade','Year','Class','Form'].map(opt => (
                  <button key={opt} className={`dojo-toggle ${newYearGradeLabel === opt ? 'dojo-toggle-active' : ''}`} onClick={() => setNewYearGradeLabel(opt)}>{opt}</button>
                ))}
              </div>
            </Field>
          </div>
        </div>
        <div className="dojo-form-actions">
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
        <div className="dojo-form-page">

          <div className="dojo-lesson-form-head" style={{ borderLeft: `5px solid ${color.accent}` }}>
            <div className="dojo-lesson-form-avatar" style={{ background: color.bg, color: color.accent }}>
              {selectedStudent?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="dojo-lesson-form-tag" style={{ color: color.bg }}>{editLesson ? 'Edit Lesson' : 'New Lesson'}</div>
              <div className="dojo-lesson-form-student" style={{ color: color.bg }}>{selectedStudent?.name}</div>
            </div>
          </div>

          {/* SESSION INFO */}
          <div className="dojo-form-card">
            <div className="dojo-form-card-title">Session Info</div>
            <div className="dojo-form-grid-3">
              <Field label="Student Name">
                <input className="dojo-field-input" value={selectedStudent?.name || ''} readOnly
                  style={{ background: '#f8f9fa', cursor: 'default', fontWeight: 700, color: color.bg }} />
              </Field>
              <Field label="Date" req>
                <input className="dojo-field-input" type="date" value={lf.date} onChange={e => setL('date', e.target.value)} />
              </Field>
              <Field label="Time">
                <input className="dojo-field-input" type="time" value={lf.time} onChange={e => setL('time', e.target.value)} />
              </Field>
              <Field label="Tutor's Name">
                <input className="dojo-field-input" value={lf.tutor} onChange={e => setL('tutor', e.target.value)} placeholder="Mr. / Ms. Linda…" />
              </Field>
              <Field label="Subject" req>
                <input className="dojo-field-input" value={lf.subject} onChange={e => setL('subject', e.target.value)} placeholder="e.g. Mathematics" />
              </Field>
              <Field label="Page(s)">
                <input className="dojo-field-input" value={lf.page} onChange={e => setL('page', e.target.value)} placeholder="e.g. Pg 34–38" />
              </Field>
            </div>
          </div>

          {/* LESSON CONTENT */}
          <div className="dojo-form-card">
            <div className="dojo-form-card-title">Lesson Content</div>
            <div className="dojo-form-grid-2">
              <Field label="Topic" req>
                <input className="dojo-field-input" value={lf.topic} onChange={e => setL('topic', e.target.value)} placeholder="e.g. Fractions" />
              </Field>
              <Field label="Sub-topic">
                <input className="dojo-field-input" value={lf.subtopic} onChange={e => setL('subtopic', e.target.value)} placeholder="e.g. Adding unlike fractions" />
              </Field>
              <Field label="Book / Reference Material" span="1 / -1">
                <input className="dojo-field-input" value={lf.book} onChange={e => setL('book', e.target.value)} placeholder="e.g. Oxford Maths Book 4" />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Content Taught / Work Done">
                <textarea className="dojo-field-textarea" value={lf.workDone} onChange={e => setL('workDone', e.target.value)} placeholder="What was covered — exercises, activities, tasks completed…" />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Tutor's Remarks">
                <textarea className="dojo-field-textarea" style={{ minHeight: 72 }} value={lf.remarks} onChange={e => setL('remarks', e.target.value)} placeholder="Any notes, feedback, or observations…" />
              </Field>
            </div>
          </div>

          {/* ASSIGNMENT */}
          <div className="dojo-form-card">
            <div className="dojo-form-card-title">Assignment</div>
            <div className="dojo-form-grid-2">
              <Field label="Assignment" span="1 / -1">
                <textarea className="dojo-field-textarea" value={lf.assignment} onChange={e => setL('assignment', e.target.value)} placeholder="What should the student do?" style={{ minHeight: 68 }} />
              </Field>
              <Field label="Due Date">
                <input className="dojo-field-input" type="date" value={lf.assignmentDue} onChange={e => setL('assignmentDue', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* EXAMINATION */}
          <div className="dojo-form-card">
            <div className="dojo-form-card-title">Examination</div>
            <div className="dojo-form-grid-3">
              <Field label="Exam Type">
                <StyledSelect value={lf.examType} onChange={e => setL('examType', e.target.value)} options={EXAM_TYPES} placeholder="Select type…" />
              </Field>
              <Field label="Date Set">
                <input className="dojo-field-input" type="date" value={lf.examDateSet} onChange={e => setL('examDateSet', e.target.value)} />
              </Field>
              <Field label="Date Given">
                <input className="dojo-field-input" type="date" value={lf.examDateGiven} onChange={e => setL('examDateGiven', e.target.value)} />
              </Field>
              <Field label="Time">
                <input className="dojo-field-input" type="time" value={lf.examTime} onChange={e => setL('examTime', e.target.value)} />
              </Field>
              <Field label="Date Marked">
                <input className="dojo-field-input" type="date" value={lf.examDateMarked} onChange={e => setL('examDateMarked', e.target.value)} />
              </Field>
              <Field label="Date Revised">
                <input className="dojo-field-input" type="date" value={lf.examDateRevised} onChange={e => setL('examDateRevised', e.target.value)} />
              </Field>
              <Field label="Score">
                <input className="dojo-field-input" value={lf.examScore} onChange={e => setL('examScore', e.target.value)} placeholder="e.g. 78/100" />
              </Field>
              <Field label="Grade">
                <input className="dojo-field-input" value={lf.examGrade} onChange={e => setL('examGrade', e.target.value)} placeholder="e.g. A, B+, 1" />
              </Field>
            </div>
          </div>

          <div className="dojo-form-actions">
            <Btn variant="outline" onClick={() => { resetLesson(); setView('student-detail') }}>Cancel</Btn>
            <Btn variant="gold" onClick={handleSaveLesson}>{editLesson ? 'Update' : 'Save'} Lesson</Btn>
          </div>
        </div>
        <Toast message={toast} />
      </div>
    )
  }

  // ── STUDENT DETAIL ────────────────────────────────────────────────────────
  if (view === 'student-detail') {
    const sidx  = students.findIndex(s => s.id === selectedStudent?.id)
    const color = getColor(sidx)
    const sLessons = studentLessons(selectedStudent?.id)

    return (
      <div>
        <Header right={<Btn variant="outline" size="sm" onClick={() => setView('list')}>Back</Btn>} />
        <div className="dojo-detail-banner" style={{ background: color.bg }}>
          <div className="dojo-detail-banner-left">
            <div className="dojo-detail-avatar" style={{ background: color.accent, color: '#fff' }}>
              {selectedStudent?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="dojo-detail-name">{selectedStudent?.name}</div>
              {selectedStudent?.grade && <div className="dojo-detail-grade">{selectedStudent?.curriculum ? `${selectedStudent.curriculum} · ` : ''}{selectedStudent.grade}</div>}
              <div className="dojo-detail-count">{sLessons.length} lesson{sLessons.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="dojo-detail-actions">
            <Btn size="sm" onClick={() => openAdd(selectedStudent)}>+ New Lesson</Btn>
            <Btn size="sm" variant="outline" onClick={() => copyLink(selectedStudent?.id, selectedStudent?.name)}>Copy Link</Btn>
            <Btn size="sm" variant="outline" onClick={() => whatsapp(selectedStudent)}>WhatsApp</Btn>
            <Btn size="sm" variant="outline" onClick={() => openParentView(selectedStudent?.id)}>View Public</Btn>
            <Btn size="sm" variant="outline" onClick={() => deleteStudent(selectedStudent?.id)}>Delete</Btn>
          </div>
          <div className="dojo-detail-accent" style={{ background: color.accent }} />
        </div>

        <div className="dojo-detail-body">
          {sLessons.length === 0 ? (
            <div className="dojo-empty-card">
              <p>No lessons recorded yet. Start adding lessons for this student.</p>
              <Btn onClick={() => openAdd(selectedStudent)}>+ New Lesson</Btn>
            </div>
          ) : (
            sLessons.map((l) => (
              <div key={l.id} className="dojo-lesson-item" style={{ borderLeft: `4px solid ${color.accent}` }}>
                <div className="dojo-li-header">
                  <div>
                    <div className="dojo-li-date">{fmtDate(l.date)} {l.time && `at ${l.time}`}</div>
                    {l.tutor && <div className="dojo-li-tutor">Tutor: {l.tutor}</div>}
                  </div>
                  <div className="dojo-li-actions">
                    <Btn size="sm" variant="outline" onClick={() => openEdit(selectedStudent, l)}>Edit</Btn>
                    <Btn size="sm" variant="outline" onClick={() => deleteLesson(l.id)}>Delete</Btn>
                  </div>
                </div>

                <div className="dojo-li-subject-row">
                  <span className="dojo-li-subject-badge" style={{ background: color.accent, color: '#fff' }}>{l.subject}</span>
                  <span className="dojo-li-topic">{l.topic}</span>
                  {l.subtopic && <span className="dojo-li-subtopic">/ {l.subtopic}</span>}
                </div>

                {l.book && <LiRow label="Book" val={l.book} />}
                {l.page && <LiRow label="Pages" val={l.page} />}
                {l.workDone && <LiRow label="Content Taught" val={l.workDone} />}
                {l.remarks && <LiRow label="Remarks" val={l.remarks} />}

                {l.assignment && (
                  <div className="dojo-li-assignment" style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                    <div className="dojo-li-assignment-label" style={{ color: color.bg }}>Assignment</div>
                    <div className="dojo-li-assignment-text">{l.assignment}</div>
                    {l.assignmentDue && <div className="dojo-li-assignment-due" style={{ color: color.bg }}>Due: {fmtDate(l.assignmentDue)}</div>}
                  </div>
                )}

                {(l.examType || l.examScore || l.examGrade) && (
                  <div className="dojo-li-exam" style={{ background: color.light, borderLeft: `4px solid ${color.accent}` }}>
                    <div className="dojo-li-exam-title" style={{ color: color.bg }}>Exam</div>
                    <div className="dojo-li-exam-grid">
                      {l.examType && <ExamMini label="Type" val={l.examType} />}
                      {l.examDateSet && <ExamMini label="Date Set" val={fmtDate(l.examDateSet)} />}
                      {l.examScore && <ExamMini label="Score" val={l.examScore} bold color={color.bg} />}
                      {l.examGrade && <ExamMini label="Grade" val={l.examGrade} bold color={color.bg} />}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <Toast message={toast} />
      </div>
    )
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      <Header right={<Btn onClick={() => setView('create-student')}>+ New Student</Btn>} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Learning Hub</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Manage your students and track their progress</p>
        </div>

        {students.length === 0 ? (
          <div className="dojo-empty-card">
            <p style={{ marginBottom: '16px' }}>No students yet. Create your first student to get started.</p>
            <Btn onClick={() => setView('create-student')}>+ New Student</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students.map((s, idx) => {
              const color = getColor(idx)
              const lessons = studentLessons(s.id)
              return (
                <div
                  key={s.id}
                  className="dojo-student-card"
                  onClick={() => { setSelectedStudent(s); setView('student-detail') }}
                  style={{ borderLeftColor: color.accent }}
                >
                  <div className="dojo-student-avatar" style={{ background: color.accent, color: '#fff' }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="dojo-student-info">
                    <div className="dojo-student-name">{s.name}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {s.curriculum && <div className="dojo-pill">{s.curriculum}</div>}
                      {s.grade && <div className="dojo-pill">{s.grade}</div>}
                      <div className="dojo-pill">{lessons.length} lessons</div>
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

function LiRow({ label, val }) {
  return (
    <div className="dojo-li-field">
      <span className="dojo-li-field-label">{label}</span>
      <span className="dojo-li-field-val">{val}</span>
    </div>
  )
}
