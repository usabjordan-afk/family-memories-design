import { motion } from 'framer-motion'

const links = [
  { href: '#studio', label: 'Gear' },
  { href: '#story', label: 'About' },
  { href: '#directors', label: 'Directors' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav() {
  return (
    <motion.header
      className="nav"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="nav-brand" href="#top" aria-label="Family Memories Design home">
        <span className="nav-mark">FMD</span>
        <span className="nav-name">
          Family Memories
          <em>Design</em>
        </span>
      </a>
      <nav className="nav-links" aria-label="Primary">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="btn btn-primary nav-cta" href="tel:+17203051643">
        Call Will
      </a>
    </motion.header>
  )
}
