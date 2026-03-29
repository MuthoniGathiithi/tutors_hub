import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { addSession, updateSession, getSession, makeId, SUBJECTS, DAYS, BEHAVIOUR } from '../data'
import { Header, Btn, Card, CardHeader, CardBody, FormGroup, Input, Select, Textarea, Grid, Toast } from '../components/UI'
import styles from './NewSession.module.css'

const EXAM_TYPES = ['School Exam', 'Online Test', 'Home Assignment Test', 'Center Exam', 'Mock Exam', 'CAT', 'Other']
const CURRICULUM_TYPES = ['CBC', 'International (IGCSE/IB)', 'Local 8-4-4', 'American', 'Other']

const empty = () => ({
  id: makeId(),
  school: '',
  teacherName: '',
  grade: '',
  curriculum: '',
  subject: '',
  date: new Date().toISOString().split('T')[0],
  day: '',
  time: '',
  topic: '',
  subtopic: '',
  book: '',
  page: '',
  covered: '',
  homework: '',
  homeworkDue: '',
  nextClass: '',
  teacherRemarks: '',
  // Exam fields
  examType: '',
  examDateSet: '',
  examDateGiven: '',
  examTime: '',
  examDateMarked: '',
  examDateRevised: '',
  students: [],
})

export default function NewSession() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')

  const [form, setForm] = useState(empty)
  const [toast, setToast] = useState('')
  const [addName, setAddName] = useState('')
  const [addAdm, setAddAdm] = useState('')
  const nameRef = useRef()

  useEffect(() => {
    if (editId) {
      const s = getSession(editId)
      if (s) setForm(s)
    }
  }, [editId])

  // Auto-fill day from date
  useEffect(() => {
    if (form.date) {
      const d = new Date(form.date + 'T00:00:00')
      setForm(f => ({ ...f, day: DAYS[d.getDay()] }))
    }
  }, [form.date])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const addStudent = () => {
    if (!addName.trim()) return showToast('Enter student name')
    setForm(f => ({
      ...f,
      students: [...f.students, {
        id: makeId(),
        name: addName.trim(),
        admNo: addAdm.trim(),
        marks: '',
        grade: '',
        behaviour: 'Good',
        remarks: '',
        examScore: '',
        examGrade: '',
      }]
    }))
    setAddName('')
    setAddAdm('')
    nameRef.current?.focus()
  }

  const removeStudent = (id) => {
    setForm(f => ({ ...f, students: f.students.filter(s => s.id !== id) }))
  }

  const updateStudent = (id, key, val) => {
    setForm(f => ({
      ...f,
      students: f.students.map(s => s.id === id ? { ...s, [key]: val } : s)
    }))
  }

  const save = () => {
    if (!form.teacherName.trim()) return showToast('Please enter tutor name')
    if (!form.subject) return showToast('Please select a subject')
    if (!form.grade) return showToast('Please enter class/grade')
    if (!form.date) return showToast('Please enter date')
    if (!form.topic.trim()) return showToast('Please enter topic')
    if (form.students.length === 0) return showToast('Add at least one student')

    const session = { ...form, createdAt: editId ? form.createdAt : new Date().toISOString() }
    if (editId) updateSession(session)
    else addSession(session)
    navigate(`/share/${form.id}`)
  }

  return (
    <div>
      <Header right={
        <Btn variant="outline" size="sm" onClick={() => navigate('/')}>Back</Btn>
      } />

      <div className={styles.container}>
        <div className={styles.pageHead}>
          <h1>{editId ? 'Edit' : 'Create'} Class Report</h1>
          <p>Fill in session details below, add students, then save to generate shareable links.</p>
        </div>

        {/* CARD 1: Session Info */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Session Details" sub="Date, time and class information" />
          <CardBody>
            <Grid cols={3}>
              <FormGroup label="Date" required>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </FormGroup>
              <FormGroup label="Day">
                <Input value={form.day} readOnly style={{ background: 'var(--sky)', cursor: 'default' }} />
              </FormGroup>
              <FormGroup label="Time">
                <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
              </FormGroup>

              <FormGroup label="Subject" required>
                <Select
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  options={SUBJECTS.map(s => ({ value: s, label: s || 'Select subject…' }))}
                />
              </FormGroup>
              <FormGroup label="Class / Grade" required>
                <Input
                  value={form.grade}
                  onChange={e => set('grade', e.target.value)}
                  placeholder="e.g. Grade 7, Form 3, Year 10…"
                />
              </FormGroup>
              <FormGroup label="Curriculum">
                <Select
                  value={form.curriculum || ''}
                  onChange={e => set('curriculum', e.target.value)}
                  options={[{ value: '', label: 'Select curriculum…' }, ...CURRICULUM_TYPES.map(c => ({ value: c, label: c }))]}
                />
              </FormGroup>

              <FormGroup label="Tutor's Name" required>
                <Input
                  value={form.teacherName}
                  onChange={e => set('teacherName', e.target.value)}
                  placeholder="Mr. / Ms. …"
                />
              </FormGroup>
              <FormGroup label="School Name" span={2}>
                <Input
                  value={form.school}
                  onChange={e => set('school', e.target.value)}
                  placeholder="e.g. Nairobi Academy"
                />
              </FormGroup>
            </Grid>
          </CardBody>
        </Card>

        {/* CARD 2: Lesson Info */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Lesson Details" sub="What was covered in today's class" />
          <CardBody>
            <Grid cols={2}>
              <FormGroup label="Topic / Unit" required>
                <Input
                  value={form.topic}
                  onChange={e => set('topic', e.target.value)}
                  placeholder="e.g. Fractions"
                />
              </FormGroup>
              <FormGroup label="Sub-topic">
                <Input
                  value={form.subtopic}
                  onChange={e => set('subtopic', e.target.value)}
                  placeholder="e.g. Adding fractions with unlike denominators"
                />
              </FormGroup>
              <FormGroup label="Book / Reference Material">
                <Input
                  value={form.book || ''}
                  onChange={e => set('book', e.target.value)}
                  placeholder="e.g. Oxford Primary Maths Book 4"
                />
              </FormGroup>
              <FormGroup label="Page(s) / Reference">
                <Input
                  value={form.page}
                  onChange={e => set('page', e.target.value)}
                  placeholder="e.g. Pg 34–38  |  Handout 3"
                />
              </FormGroup>
              <FormGroup label="Content Taught / Summary" span={2}>
                <Textarea
                  value={form.covered}
                  onChange={e => set('covered', e.target.value)}
                  placeholder="Describe what was covered in class today…"
                />
              </FormGroup>
              <FormGroup label="Assignment / Homework">
                <Textarea
                  value={form.homework}
                  onChange={e => set('homework', e.target.value)}
                  placeholder="e.g. Exercise 4, Q 1–10; write a composition on…"
                  style={{ minHeight: 70 }}
                />
              </FormGroup>
              <FormGroup label="Assignment Due Date">
                <Input
                  type="date"
                  value={form.homeworkDue || ''}
                  onChange={e => set('homeworkDue', e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Next Class Plan" span={2}>
                <Textarea
                  value={form.nextClass}
                  onChange={e => set('nextClass', e.target.value)}
                  placeholder="What will be covered in the next lesson…"
                  style={{ minHeight: 70 }}
                />
              </FormGroup>
              <FormGroup label="Tutor's Remarks" span={2}>
                <Textarea
                  value={form.teacherRemarks}
                  onChange={e => set('teacherRemarks', e.target.value)}
                  placeholder="General remarks about the class…"
                  style={{ minHeight: 70 }}
                />
              </FormGroup>
            </Grid>
          </CardBody>
        </Card>

        {/* CARD 2b: Examination */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Examination" sub="Fill only if an exam was conducted — all fields optional" />
          <CardBody>
            <Grid cols={3}>
              <FormGroup label="Exam Type">
                <Select
                  value={form.examType || ''}
                  onChange={e => set('examType', e.target.value)}
                  options={[{ value: '', label: 'Select type…' }, ...EXAM_TYPES.map(t => ({ value: t, label: t }))]}
                />
              </FormGroup>
              <FormGroup label="Date Set">
                <Input type="date" value={form.examDateSet || ''} onChange={e => set('examDateSet', e.target.value)} />
              </FormGroup>
              <FormGroup label="Date Given">
                <Input type="date" value={form.examDateGiven || ''} onChange={e => set('examDateGiven', e.target.value)} />
              </FormGroup>
              <FormGroup label="Time">
                <Input type="time" value={form.examTime || ''} onChange={e => set('examTime', e.target.value)} />
              </FormGroup>
              <FormGroup label="Date Marked">
                <Input type="date" value={form.examDateMarked || ''} onChange={e => set('examDateMarked', e.target.value)} />
              </FormGroup>
              <FormGroup label="Date Revised">
                <Input type="date" value={form.examDateRevised || ''} onChange={e => set('examDateRevised', e.target.value)} />
              </FormGroup>
            </Grid>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Individual student scores and grades can be entered in the Students section below.</p>
          </CardBody>
        </Card>

        {/* CARD 3: Students */}
        <Card style={{ marginBottom: 28 }}>
          <CardHeader
            title="Students"
            sub={`${form.students.length} student${form.students.length !== 1 ? 's' : ''} added`}
          />
          <CardBody>
            <div className={styles.addRow}>
              <FormGroup label="Student Name">
                <Input
                  ref={nameRef}
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="Full name"
                  onKeyDown={e => e.key === 'Enter' && addStudent()}
                />
              </FormGroup>
              <FormGroup label="Adm / Roll No.">
                <Input
                  value={addAdm}
                  onChange={e => setAddAdm(e.target.value)}
                  placeholder="Optional"
                  onKeyDown={e => e.key === 'Enter' && addStudent()}
                />
              </FormGroup>
              <div className={styles.addBtnWrap}>
                <Btn variant="navy" onClick={addStudent}>+ Add Student</Btn>
              </div>
            </div>

            {form.students.length === 0 ? (
              <div className={styles.noStudents}>
                No students yet — add them above
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Adm No.</th>
                      <th>Marks / Score</th>
                      <th>Exam Score</th>
                      <th>Exam Grade</th>
                      <th>Grade</th>
                      <th>Behaviour</th>
                      <th>Tutor's Remarks</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.students.map((s, i) => (
                      <tr key={s.id}>
                        <td className={styles.tdNum}>{i + 1}</td>
                        <td className={styles.tdName}>{s.name}</td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.admNo}
                            onChange={e => updateStudent(s.id, 'admNo', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.marks}
                            onChange={e => updateStudent(s.id, 'marks', e.target.value)}
                            placeholder="e.g. 78/100"
                          />
                        </td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.examScore || ''}
                            onChange={e => updateStudent(s.id, 'examScore', e.target.value)}
                            placeholder="Exam score"
                            style={{ width: 80 }}
                          />
                        </td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.examGrade || ''}
                            onChange={e => updateStudent(s.id, 'examGrade', e.target.value)}
                            placeholder="Exam grd"
                            style={{ width: 70 }}
                          />
                        </td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.grade}
                            onChange={e => updateStudent(s.id, 'grade', e.target.value)}
                            placeholder="A / B+"
                            style={{ width: 60 }}
                          />
                        </td>
                        <td>
                          <select
                            className={styles.tableSelect}
                            value={s.behaviour}
                            onChange={e => updateStudent(s.id, 'behaviour', e.target.value)}
                          >
                            {BEHAVIOUR.map(b => <option key={b}>{b}</option>)}
                          </select>
                        </td>
                        <td>
                          <input
                            className={styles.tableInput}
                            value={s.remarks}
                            onChange={e => updateStudent(s.id, 'remarks', e.target.value)}
                            placeholder="Tutor's note…"
                            style={{ minWidth: 160 }}
                          />
                        </td>
                        <td>
                          <button className={styles.removeBtn} onClick={() => removeStudent(s.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Actions */}
        <div className={styles.actions}>
          <Btn variant="outline" onClick={() => navigate('/')}>Cancel</Btn>
          <Btn variant="gold" onClick={save}>
            {editId ? 'Update & Generate Links' : 'Save & Generate Links'}
          </Btn>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  )
}