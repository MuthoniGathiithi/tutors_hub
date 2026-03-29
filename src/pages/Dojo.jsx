import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import styles from './Dojo.module.css'
import { Header, Card, CardHeader, CardBody, FormGroup, Input, Textarea, Btn, Grid, Toast } from '../components/UI'

// ─── Storage ────────────────────────────────────────────────────────────────
const STUDENTS_KEY = 'lh_students'
const LESSONS_KEY  = 'lh_lessons'

const load  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const save  = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

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
const YEAR_GRADE_OPTIONS = {
  'CBC': ['PP1','PP2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9'],
  'International (IGCSE/IB)': ['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7','Year 8','Year 9','Year 10','Year 11','Year 12','Year 13'],
  'Local 8-4-4': ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Form 1','Form 2','Form 3','Form 4'],
  'American': ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'],
  'Other': [],
}
const EXAM_TYPES = ['School Exam','Online Test','Home Assignment Test','Center Exam','Mock Exam','CAT','Other']

// ─── Styled Select ───────────────────────────────────────────────────────────
function StyledSelect({ value, onChange, options, placeholder }) {
  return (
    <div className={styles.selectWrap}>
      <select className={styles.select} value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Parent / Public View ─────────────────────────────────────────────────────
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
            <div className={styles.parentGrade} style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
              {student.curriculum ? `${student.curriculum} · ` : ''}{student.grade}
            </div>
          )}
          <div className={styles.parentCount}>{history.length} lesson{history.length !== 1 ? 's' : ''} recorded</div>
        </div>
        <div className={styles.parentAccent} style={{ background: color.accent }} />
      </div>

      <div className={styles.parentBody}>
        {history.length === 0 ? (
          <div className={styles.emptyNote}>No lessons recorded yet for this student.</div>
        ) : history.map((l) => (
          <div key={l.id} className={styles.lessonCard} style={{ borderTop: `3px solid ${color.accent}` }}>
            <div className={styles.lcHeader}>
              <span className={styles.lcDate}>{fmtDate(l.date)}</span>
              {l.tutor && <span className={styles.lcTutor} style={{ color: color.bg }}>Tutor: {l.tutor}</span>}
            </div>
            <div className={styles.lcSubjectRow}>
              <span className={styles.lcBadge} style={{ background: color.bg }}>{l.subject}</span>
              <span className={styles.lcTopic}>{l.topic}</span>
              {l.subtopic && <span className={styles.lcSubtopic}>/ {l.subtopic}</span>}
            </div>
            {l.book && <LcField label="Book" val={l.book} />}
            {l.page && <LcField label="Page(s)" val={l.page} />}
            {l.workDone && <LcField label="Work Done" val={l.workDone} />}
            {l.assignment && (
              <div className={styles.lcAssignment} style={{ background: color.light, borderLeft: `3px solid ${color.accent}` }}>
                <span className={styles.lcAssignmentLabel} style={{ color: color.bg }}>Assignment</span>
                <span className={styles.lcAssignmentText}>{l.assignment}</span>
                {l.assignmentDue && <span className={styles.lcAssignmentDue}>Due: {fmtDate(l.assignmentDue)}</span>}
              </div>
            )}
            {l.remarks && <LcField label="Tutor's Remarks" val={l.remarks} />}
            {(l.examScore || l.examGrade || l.examType) && (
              <div className={styles.lcExam} style={{ background: color.light }}>
                <div className={styles.lcExamTitle} style={{ color: color.bg }}>Examination</div>
                <div className={styles.lcExamGrid}>
                  {l.examType && <ExamMini label="Type" val={l.examType} />}
                  {l.examDateSet && <ExamMini label="Date Set" val={fmtDate(l.examDateSet)} />}
                  {l.examDateGiven && <ExamMini label="Date Given" val={fmtDate(l.examDateGiven)} />}
                  {l.examTime && <ExamMini label="Time" val={l.examTime} />}
                  {l.examDateMarked && <ExamMini label="Date Marked" val={fmtDate(l.examDateMarked)} />}
                  {l.examDateRevised && <ExamMini label="Date Revised" val={fmtDate(l.examDateRevised)} />}
                  {l.examScore && <ExamMini label="Score" val={l.examScore} bold color={color.bg} />}
                  {l.examGrade && <ExamMini label="Grade" val={l.examGrade} bold color={color.bg} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LcField({ label, val }) {
  return (
    <div className={styles.lcField}>
      <span className={styles.lcFieldLabel}>{label}</span>
      <span className={styles.lcFieldVal}>{val}</span>
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

// ─── Main Teacher View ────────────────────────────────────────────────────────
export default function Dojo() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  if (studentId) return <ParentView studentId={studentId} />

  const [students, setStudents] = useState(() => load(STUDENTS_KEY))
  const [lessons,  setLessons]  = useState(() => load(LESSONS_KEY))
  const [toast, setToast] = useState('')
  const [view, setView] = useState('list')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editLesson, setEditLesson] = useState(null)

  // Create student form
  const [newName, setNewName] = useState('')
  const [newGrade, setNewGrade] = useState('')
  const [newCurriculum, setNewCurriculum] = useState('')
  const [newYearGradeLabel, setNewYearGradeLabel] = useState('Grade')

  // Lesson form
  const defaultLesson = () => ({
    date: new Date().toISOString().slice(0, 10),
    time: '', subject: '', topic: '', subtopic: '',
    book: '', page: '', workDone: '', remarks: '', tutor: '',
    assignment: '', assignmentDue: '',
    examType: '', examDateSet: '', examDateGiven: '', examTime: '',
    examDateMarked: '', examDateRevised: '', examScore: '', examGrade: '',
  })
  const [lf, setLf] = useState(defaultLesson)
  const setL = (k, v) => setLf(f => ({ ...f, [k]: v }))

  useEffect(() => { save(STUDENTS_KEY, students) }, [students])
  useEffect(() => { save(LESSONS_KEY, lessons) }, [lessons])

  useEffect(() => {
    if (studentId) return
    try {
      const qp = new URLSearchParams(location.search)
      if (qp.get('create')) setView('create-student')
    } catch {}
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

  const handleCreateStudent = () => {
    if (!newName.trim()) return showToast('Enter student name')
    const s = { id: makeId(), name: newName.trim(), grade: newGrade.trim(), curriculum: newCurriculum, yearGradeLabel: newYearGradeLabel, createdAt: new Date().toISOString() }
    setStudents(prev => [s, ...prev])
    setNewName(''); setNewGrade(''); setNewCurriculum(''); setNewYearGradeLabel('Grade')
    showToast('Student created! Link copied')
    copyLink(s.id, s.name)
    setView('list')
  }

  const resetLesson = () => { setLf(defaultLesson()); setEditLesson(null) }

  const openAdd = (student) => { setSelectedStudent(student); resetLesson(); setView('add-lesson') }

  const openEdit = (student, lesson) => {
    setSelectedStudent(student); setEditLesson(lesson)
    setLf({
      date: lesson.date, time: lesson.time || '', subject: lesson.subject, topic: lesson.topic,
      subtopic: lesson.subtopic || '', book: lesson.book || '', page: lesson.page || '',
      workDone: lesson.workDone, remarks: lesson.remarks, tutor: lesson.tutor || '',
      assignment: lesson.assignment || '', assignmentDue: lesson.assignmentDue || '',
      examType: lesson.examType || '', examDateSet: lesson.examDateSet || '',
      examDateGiven: lesson.examDateGiven || '', examTime: lesson.examTime || '',
      examDateMarked: lesson.examDateMarked || '', examDateRevised: lesson.examDateRevised || '',
      examScore: lesson.examScore || '', examGrade: lesson.examGrade || '',
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

  const deleteLesson = (id) => {
    if (!confirm('Delete this lesson?')) return
    setLessons(prev => prev.filter(l => l.id !== id)); showToast('Lesson deleted')
  }

  const deleteStudent = (sid) => {
    if (!confirm('Delete this student and all their lessons?')) return
    setStudents(prev => prev.filter(s => s.id !== sid))
    setLessons(prev => prev.filter(l => l.studentId !== sid))
    setView('list'); showToast('Student deleted')
  }

  const studentLessons = (sid) =>
    lessons.filter(l => l.studentId === sid).sort((a, b) => new Date(b.date) - new Date(a.date))

  const yearGradeOpts = newCurriculum ? (YEAR_GRADE_OPTIONS[newCurriculum] || []) : []

  // ── CREATE STUDENT ──────────────────────────────────────────────────────
  if (view === 'create-student') return (
    <div>
      <Header right={<Btn variant="outline" size="sm" onClick={() => setView('list')}>Back</Btn>} />
      <div className={styles.formPage}>
        <div className={styles.formPageHead}>
          <h1>New Student</h1>
          <p>Add a student to start tracking their progress.</p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Student Details</div>
          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Student Name <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" autoFocus />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Curriculum Type</label>
              <StyledSelect
                value={newCurriculum}
                onChange={e => { setNewCurriculum(e.target.value); setNewGrade('') }}
                options={CURRICULUM_TYPES}
                placeholder="Select curriculum…"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{newYearGradeLabel} / Class</label>
              {yearGradeOpts.length > 0 ? (
                <StyledSelect value={newGrade} onChange={e => setNewGrade(e.target.value)} options={yearGradeOpts} placeholder={`Select ${newYearGradeLabel.toLowerCase()}…`} />
              ) : (
                <input className={styles.fieldInput} value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder={`e.g. ${newYearGradeLabel} 10`} />
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Label Preference</label>
              <div className={styles.toggleRow}>
                {['Grade','Year','Class','Form'].map(opt => (
                  <button key={opt} className={`${styles.toggle} ${newYearGradeLabel === opt ? styles.toggleActive : ''}`}
                    onClick={() => setNewYearGradeLabel(opt)}>{opt}</button>
                ))}
              </div>
            </div>
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

  // ── ADD / EDIT LESSON ───────────────────────────────────────────────────
  if (view === 'add-lesson') return (
    <div>
      <Header right={<Btn variant="outline" size="sm" onClick={() => { resetLesson(); setView('student-detail') }}>Back</Btn>} />
      <div className={styles.formPage}>
        <div className={styles.formPageHead}>
          <h1>{editLesson ? 'Edit Lesson' : 'Add Lesson'}</h1>
          <p>For <strong>{selectedStudent?.name}</strong></p>
        </div>

        {/* Session */}
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Session Info</div>
          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} type="date" value={lf.date} onChange={e => setL('date', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Time</label>
              <input className={styles.fieldInput} type="time" value={lf.time} onChange={e => setL('time', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tutor's Name</label>
              <input className={styles.fieldInput} value={lf.tutor} onChange={e => setL('tutor', e.target.value)} placeholder="Mr. / Ms. …" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Subject <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} value={lf.subject} onChange={e => setL('subject', e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Book / Reference Material</label>
              <input className={styles.fieldInput} value={lf.book} onChange={e => setL('book', e.target.value)} placeholder="e.g. Oxford Maths Bk 4" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Page(s)</label>
              <input className={styles.fieldInput} value={lf.page} onChange={e => setL('page', e.target.value)} placeholder="e.g. Pg 34–38" />
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Lesson Content</div>
          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Topic <span className={styles.req}>*</span></label>
              <input className={styles.fieldInput} value={lf.topic} onChange={e => setL('topic', e.target.value)} placeholder="e.g. Fractions" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Sub-topic</label>
              <input className={styles.fieldInput} value={lf.subtopic} onChange={e => setL('subtopic', e.target.value)} placeholder="e.g. Adding unlike fractions" />
            </div>
          </div>
          <div className={styles.fieldGroup} style={{ marginTop: 14 }}>
            <label className={styles.fieldLabel}>Content Taught / Work Done</label>
            <textarea className={styles.fieldTextarea} value={lf.workDone} onChange={e => setL('workDone', e.target.value)} placeholder="What was covered — exercises, activities, tasks…" />
          </div>
          <div className={styles.fieldGroup} style={{ marginTop: 14 }}>
            <label className={styles.fieldLabel}>Tutor's Remarks</label>
            <textarea className={styles.fieldTextarea} style={{ minHeight: 70 }} value={lf.remarks} onChange={e => setL('remarks', e.target.value)} placeholder="Student's participation, behaviour, progress…" />
          </div>
        </div>

        {/* Assignment */}
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Assignment</div>
          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.fieldLabel}>Assignment / Homework</label>
              <textarea className={styles.fieldTextarea} style={{ minHeight: 70 }} value={lf.assignment} onChange={e => setL('assignment', e.target.value)} placeholder="e.g. Exercise 4, Qs 1–10…" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Due Date</label>
              <input className={styles.fieldInput} type="date" value={lf.assignmentDue} onChange={e => setL('assignmentDue', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Examination */}
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Examination <span className={styles.formCardSub}>— leave blank if no exam</span></div>
          <div className={styles.formGrid3}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Exam Type</label>
              <StyledSelect value={lf.examType} onChange={e => setL('examType', e.target.value)} options={EXAM_TYPES} placeholder="Select type…" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date Set</label>
              <input className={styles.fieldInput} type="date" value={lf.examDateSet} onChange={e => setL('examDateSet', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date Given</label>
              <input className={styles.fieldInput} type="date" value={lf.examDateGiven} onChange={e => setL('examDateGiven', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Time</label>
              <input className={styles.fieldInput} type="time" value={lf.examTime} onChange={e => setL('examTime', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date Marked</label>
              <input className={styles.fieldInput} type="date" value={lf.examDateMarked} onChange={e => setL('examDateMarked', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date Revised</label>
              <input className={styles.fieldInput} type="date" value={lf.examDateRevised} onChange={e => setL('examDateRevised', e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Score</label>
              <input className={styles.fieldInput} value={lf.examScore} onChange={e => setL('examScore', e.target.value)} placeholder="e.g. 78/100" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Grade</label>
              <input className={styles.fieldInput} value={lf.examGrade} onChange={e => setL('examGrade', e.target.value)} placeholder="A, B+…" />
            </div>
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

  // ── STUDENT DETAIL ──────────────────────────────────────────────────────
  if (view === 'student-detail' && selectedStudent) {
    const sl = studentLessons(selectedStudent.id)
    const sidx = students.findIndex(s => s.id === selectedStudent.id)
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
              {selectedStudent.grade && <div className={styles.detailGrade}>{selectedStudent.curriculum ? `${selectedStudent.curriculum} · ` : ''}{selectedStudent.grade}</div>}
              <div className={styles.detailCount}>{sl.length} lesson{sl.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className={styles.detailActions}>
            <Btn variant="gold" size="sm" onClick={() => openAdd(selectedStudent)}>+ Add Lesson</Btn>
            <Btn variant="outline" size="sm" onClick={() => copyLink(selectedStudent.id, selectedStudent.name)}>Copy Link</Btn>
            <Btn variant="outline" size="sm" onClick={() => {
              const base = window.location.pathname.split('#')[0]
              const url = `${window.location.origin}${base}#/dojo/${selectedStudent.id}`
              const win = window.open(url, '_blank')
              if (win) win.focus()
            }}>View as Parent</Btn>
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
                  <div className={styles.liDate}>{fmtDate(l.date)}</div>
                  <div className={styles.liSubject}>
                    <span className={styles.liSubjectBadge} style={{ background: color.bg }}>{l.subject}</span>
                    <span className={styles.liTopic}>{l.topic}</span>
                    {l.subtopic && <span className={styles.liSubtopic}>/ {l.subtopic}</span>}
                  </div>
                </div>
                <div className={styles.liActions}>
                  <Btn variant="ghost" size="xs" onClick={() => openEdit(selectedStudent, l)}>Edit</Btn>
                  <Btn variant="danger" size="xs" onClick={() => deleteLesson(l.id)}>Delete</Btn>
                </div>
              </div>
              {l.tutor && <LiField label="Tutor" val={l.tutor} />}
              {l.book && <LiField label="Book" val={l.book} />}
              {l.page && <LiField label="Page(s)" val={l.page} />}
              {l.workDone && <LiField label="Work Done" val={l.workDone} />}
              {l.assignment && <LiField label="Assignment" val={l.assignment} extra={l.assignmentDue ? `Due: ${fmtDate(l.assignmentDue)}` : ''} />}
              {l.remarks && <LiField label="Tutor's Remarks" val={l.remarks} />}
              {(l.examScore || l.examGrade || l.examType) && (
                <div className={styles.liExam} style={{ background: color.light }}>
                  <div className={styles.liExamTitle} style={{ color: color.bg }}>Examination</div>
                  <div className={styles.liExamGrid}>
                    {l.examType && <ExamMini label="Type" val={l.examType} />}
                    {l.examDateSet && <ExamMini label="Date Set" val={fmtDate(l.examDateSet)} />}
                    {l.examDateGiven && <ExamMini label="Date Given" val={fmtDate(l.examDateGiven)} />}
                    {l.examTime && <ExamMini label="Time" val={l.examTime} />}
                    {l.examDateMarked && <ExamMini label="Date Marked" val={fmtDate(l.examDateMarked)} />}
                    {l.examDateRevised && <ExamMini label="Date Revised" val={fmtDate(l.examDateRevised)} />}
                    {l.examScore && <ExamMini label="Score" val={l.examScore} bold color={color.bg} />}
                    {l.examGrade && <ExamMini label="Grade" val={l.examGrade} bold color={color.bg} />}
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

  // ── STUDENT LIST ────────────────────────────────────────────────────────
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
          <div className={styles.statCard}>
            <div className={styles.statNum}>{students.length}</div>
            <div className={styles.statLbl}>Students</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{lessons.length}</div>
            <div className={styles.statLbl}>Lessons Logged</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{students.length}</div>
            <div className={styles.statLbl}>Parent Links</div>
          </div>
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
              const last  = lessons.filter(l => l.studentId === s.id).sort((a,b) => new Date(b.date)-new Date(a.date))[0]
              return (
                <div key={s.id} className={styles.studentCard} style={{ borderLeft: `4px solid ${color.accent}` }}
                  onClick={() => { setSelectedStudent(s); setView('student-detail') }}>
                  <div className={styles.studentAvatar} style={{ background: color.bg, color: color.accent }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentName}>{s.name}</div>
                    <div className={styles.studentMeta}>
                      {s.curriculum && <span className={styles.pill} style={{ background: color.bg + '18', color: color.bg, border: `1px solid ${color.bg}22` }}>{s.curriculum}</span>}
                      {s.grade && <span className={styles.pill} style={{ background: color.accent + '22', color: color.bg, border: `1px solid ${color.accent}44` }}>{s.grade}</span>}
                      <span className={styles.pill}>{count} lesson{count !== 1 ? 's' : ''}</span>
                      {last && <span className={styles.pill}>Last: {fmtDate(last.date)}</span>}
                    </div>
                  </div>
                  <div className={styles.studentActions} onClick={e => e.stopPropagation()}>
                    <Btn variant="gold" size="sm" onClick={() => openAdd(s)}>+ Lesson</Btn>
                    <Btn variant="outline" size="sm" onClick={() => { setSelectedStudent(s); setView('student-detail') }}>View</Btn>
                    <Btn variant="outline" size="sm" onClick={() => copyLink(s.id, s.name)}>Copy Link</Btn>
                    <Btn variant="outline" size="sm" onClick={() => {
                      const base = window.location.pathname.split('#')[0]
                      const url = `${window.location.origin}${base}#/dojo/${s.id}`
                      const win = window.open(url, '_blank')
                      if (win) win.focus()
                    }}>Print</Btn>
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

function LiField({ label, val, extra }) {
  return (
    <div className={styles.liField}>
      <span className={styles.liFieldLabel}>{label}</span>
      <span className={styles.liFieldVal}>{val}{extra && <span className={styles.liFieldExtra}> · {extra}</span>}</span>
    </div>
  )
}