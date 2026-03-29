import { useNavigate } from 'react-router-dom'
import { Header, Btn } from '../components/UI'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <Header right={
        <Btn variant="gold" size="sm" onClick={() => navigate('/dojo?create=1')}>+ Create Student</Btn>
      } />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTag}>Learning Hub</div>
          <h1 className={styles.heroTitle}>Welcome, Tutor</h1>
          <p className={styles.heroSub}>Create a student to start tracking lessons and sharing progress with parents.</p>
          <Btn variant="gold" onClick={() => navigate('/dojo?create=1')}>+ Create Student</Btn>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <h2>Your Students</h2>
        </div>
        <div className={styles.emptyCard}>
          <p>Use the Create Student button to add students and log lessons.</p>
        </div>
      </div>
    </div>
  )
}