import { useState } from 'react'
import styles from './UI.module.css'

/* ── Header ─────────────────────────────────── */
export function Header({ right }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon} />
        <div>
          <div className={styles.logoName}>Tutors Hub</div>
          <div className={styles.logoSub}>Tutor Portal</div>
        </div>
      </div>
      {right && <div>{right}</div>}
    </header>
  )
}

/* ── Button ──────────────────────────────────── */
export function Btn({ children, variant = 'primary', size = '', onClick, type = 'button', disabled, style }) {
  const cls = [styles.btn, styles[`btn-${variant}`], size && styles[`btn-${size}`]].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}

/* ── Card ────────────────────────────────────── */
export function Card({ children, style }) {
  return <div className={styles.card} style={style}>{children}</div>
}
export function CardHeader({ icon, iconBg, title, sub }) {
  return (
    <div className={styles.cardHeader}>
      {icon && <div className={styles.cardIcon} style={{ background: iconBg || 'var(--sky)' }}>{icon}</div>}
      <div><div className={styles.cardTitle}>{title}</div>{sub && <div className={styles.cardSub}>{sub}</div>}</div>
    </div>
  )
}
export function CardBody({ children, style }) {
  return <div className={styles.cardBody} style={style}>{children}</div>
}

/* ── Form helpers ────────────────────────────── */
export function FormGroup({ label, required, children, span }) {
  return (
    <div className={styles.formGroup} style={span ? { gridColumn: `span ${span}` } : {}}>
      {label && <label className={styles.label}>{label}{required && <span className={styles.req}> *</span>}</label>}
      {children}
    </div>
  )
}
export function Input({ ...props }) {
  return <input className={styles.input} {...props} />
}
export function Select({ options, ...props }) {
  return (
    <select className={styles.select} {...props}>
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  )
}
export function Textarea({ ...props }) {
  return <textarea className={styles.textarea} {...props} />
}

/* ── Grid ────────────────────────────────────── */
export function Grid({ cols = 2, children, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, ...style }}>
      {children}
    </div>
  )
}

/* ── Badge ───────────────────────────────────── */
export function Badge({ children, color = 'navy' }) {
  return <span className={`${styles.badge} ${styles[`badge-${color}`]}`}>{children}</span>
}

/* ── Toast ───────────────────────────────────── */
export function Toast({ message }) {
  if (!message) return null
  return <div className={styles.toast}>{message}</div>
}

/* ── Empty State ─────────────────────────────── */
export function Empty({ icon, title, message, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}

/* ── Spinner ─────────────────────────────────── */
export function Spinner() {
  return <div className={styles.spinner} />
}
