import { motion } from 'framer-motion'

export function Contact() {
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
            Tell Will the tournament date and location — we will bring Family
            Memories Design to the field.
          </p>
        </motion.div>

        <div className="contact-actions">
          <a className="btn btn-primary" href="tel:+17203051643">
            Call 720-305-1643
          </a>
          <a
            className="btn btn-ghost"
            href="mailto:family.memories.design@gmail.com"
          >
            Email Will
          </a>
        </div>

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
      </div>
    </footer>
  )
}
