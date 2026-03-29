const KEY = 'edutrack_sessions'

export const getSessions = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export const saveSessions = (sessions) => {
  localStorage.setItem(KEY, JSON.stringify(sessions))
}

export const getSession = (id) => getSessions().find(s => s.id === id)

export const addSession = (session) => {
  const all = getSessions()
  all.unshift(session)
  saveSessions(all)
}

export const updateSession = (session) => {
  const all = getSessions().map(s => s.id === session.id ? session : s)
  saveSessions(all)
}

export const deleteSession = (id) => {
  saveSessions(getSessions().filter(s => s.id !== id))
}

export const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const SUBJECTS = [
  '', 'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
  'CRE / IRE', 'Art & Craft', 'Music', 'Physical Education', 'French',
  'German', 'Computer Studies', 'History', 'Geography', 'Chemistry',
  'Physics', 'Biology', 'Business Studies', 'Other'
]

export const GRADES = [
  '', 'Playgroup', 'PP1', 'PP2',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9',
  'Form 1', 'Form 2', 'Form 3', 'Form 4',
  'JSS 1', 'JSS 2', 'JSS 3'
]

export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export const BEHAVIOUR = ['Excellent','Very Good','Good','Needs Improvement','Poor']

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
}
