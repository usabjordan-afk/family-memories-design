import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'

type Booking = {
  name: string
  email: string
  phone: string
  eventName: string
  eventDate: string
  location: string
  attendance: string
  notes: string
}

const empty: Booking = {
  name: '',
  email: '',
  phone: '',
  eventName: '',
  eventDate: '',
  location: '',
  attendance: '',
  notes: '',
}

export function Contact() {
  const [form, setForm] = useState<Booking>(empty)
  const [sentHint, setSentHint] = useState(false)

  function update<K extends keyof Booking>(key: K, value: Booking[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(
      `Booth booking: ${form.eventName || 'Tournament'}`,
    )
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Event: ${form.eventName}`,
        `Date: ${form.eventDate}`,
        `Location: ${form.location}`,
        `Expected attendance: ${form.attendance}`,
        '',
        form.notes ? `Notes:\n${form.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    setSentHint(true)
    window.location.href = `mailto:family.memories.design@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section className="section contact" id="book">
      <div className="section-inner contact-panel">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="eyebrow">Book the booth</p>
          <h2 className="display">Looking forward to making your event a success.</h2>
          <p className="lede">
            Send tournament details — Will will confirm the booth. Or call /
            email directly.
          </p>
        </motion.div>

        <form className="booking-form" onSubmit={onSubmit}>
          <div className="booking-grid">
            <label>
              Your name
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Alex Rivera"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@club.org"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="720-555-0100"
              />
            </label>
            <label>
              Event name
              <input
                required
                value={form.eventName}
                onChange={(e) => update('eventName', e.target.value)}
                placeholder="Spring Cup 2026"
              />
            </label>
            <label>
              Event date
              <input
                required
                type="date"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
              />
            </label>
            <label>
              Location
              <input
                required
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="City, fields / gym"
              />
            </label>
            <label>
              Expected attendance
              <input
                value={form.attendance}
                onChange={(e) => update('attendance', e.target.value)}
                placeholder="e.g. 400 players"
              />
            </label>
            <label className="booking-notes">
              Notes
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Sports, weekend schedule, special branding…"
              />
            </label>
          </div>

          <div className="contact-actions">
            <button className="btn btn-primary" type="submit">
              Send booking request
            </button>
            <a className="btn btn-ghost" href="tel:+17203051643">
              Call 720-305-1643
            </a>
          </div>
          {sentHint ? (
            <p className="booking-hint">
              Opening your email app with the details filled in…
            </p>
          ) : null}
        </form>

        <div className="contact-meta">
          <p>
            <strong>Will</strong> · Family Memories Design LLC
          </p>
          <p>
            <a href="tel:+17203051643">720-305-1643</a>
            <span aria-hidden> · </span>
            <a href="mailto:family.memories.design@gmail.com">
              family.memories.design@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="section-inner footer-inner">
        <p>© {new Date().getFullYear()} Family Memories Design LLC</p>
        <p>On-site tournament apparel · Printed while you wait</p>
        <p className="footer-credit">
          3D garments adapted from Style3D Meta assets on Sketchfab
        </p>
      </div>
    </footer>
  )
}
