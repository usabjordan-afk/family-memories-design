import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { StudioCanvas, type ViewSide } from '../three/Scenes'
import {
  COLORS,
  PRINTS,
  PRODUCTS,
  type PrintStyle,
  type ProductId,
} from '../lib/products'

function inkForHex(hex: string) {
  const c = Number.parseInt(hex.replace('#', ''), 16)
  const r = (c >> 16) & 255
  const g = (c >> 8) & 255
  const b = c & 255
  const light = 0.299 * r + 0.587 * g + 0.114 * b > 140
  return light ? '#1a2430' : '#f4f7fa'
}

export function Studio() {
  const [product, setProduct] = useState<ProductId>('crew')
  const [colorId, setColorId] = useState('aqua')
  const [customHex, setCustomHex] = useState<string | null>(null)
  const [print, setPrint] = useState<PrintStyle>('crest')
  const [name, setName] = useState('MAYA')
  const [number, setNumber] = useState('7')
  const [viewSide, setViewSide] = useState<ViewSide>('front')
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)
  const [logoName, setLogoName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const preset = COLORS.find((c) => c.id === colorId) ?? COLORS[0]
  const colorHex = customHex || preset.hex
  const colorInk = customHex ? inkForHex(customHex) : preset.ink
  const activePrint =
    (product === 'zip' || product === 'hoodie') && print === 'crest'
      ? 'left'
      : print

  const summary = useMemo(() => {
    const productLabel = PRODUCTS.find((p) => p.id === product)?.label
    const printLabel = PRINTS.find((p) => p.id === activePrint)?.label
    return `${productLabel} · ${printLabel} · ${name || 'NAME'} #${number || '00'}`
  }, [product, activePrint, name, number])

  function onLogoFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setCustomLogoUrl(String(reader.result))
      setLogoName(file.name)
      if (print === 'blank') setPrint('crest')
    }
    reader.readAsDataURL(file)
  }

  function downloadPreview() {
    const canvas = viewportRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `fmd-${product}-${name || 'preview'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <section className="section studio" id="studio">
      <div className="section-inner studio-inner">
        <div className="studio-intro">
          <p className="eyebrow">Live booth preview</p>
          <h2 className="display">Spin it. Color it. Make it theirs.</h2>
          <p className="lede">
            Drag the garment, flip front/back, upload a tournament logo, and add
            a player name — exactly like we print at the booth.
          </p>
        </div>

        <div className="studio-layout">
          <div className="studio-viewport" ref={viewportRef}>
            <StudioCanvas
              product={product}
              color={colorHex}
              ink={colorInk}
              print={activePrint}
              playerName={name}
              playerNumber={number}
              viewSide={viewSide}
              customLogoUrl={customLogoUrl}
            />
            <div className="studio-view-toggle" role="group" aria-label="View side">
              <button
                type="button"
                className={viewSide === 'front' ? 'pill active' : 'pill'}
                onClick={() => setViewSide('front')}
              >
                Front
              </button>
              <button
                type="button"
                className={viewSide === 'back' ? 'pill active' : 'pill'}
                onClick={() => setViewSide('back')}
              >
                Back
              </button>
            </div>
            <p className="studio-hint">Drag to rotate</p>
          </div>

          <div className="studio-panel">
            <fieldset>
              <legend>1 · Product</legend>
              <div className="chip-grid">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={product === p.id ? 'chip active' : 'chip'}
                    onClick={() => setProduct(p.id)}
                  >
                    <strong>{p.label}</strong>
                    <span>{p.blurb}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>2 · Color</legend>
              <div className="swatches">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      !customHex && colorId === c.id ? 'swatch active' : 'swatch'
                    }
                    style={{ background: c.hex }}
                    aria-label={c.label}
                    title={c.label}
                    onClick={() => {
                      setCustomHex(null)
                      setColorId(c.id)
                    }}
                  />
                ))}
                <label className="swatch-custom" title="Custom color">
                  <input
                    type="color"
                    value={customHex || colorHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    aria-label="Custom color"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>3 · Front print</legend>
              <div className="chip-row">
                {PRINTS.map((p) => {
                  const disabled =
                    (product === 'zip' || product === 'hoodie') && p.id === 'crest'
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={disabled}
                      className={print === p.id ? 'pill active' : 'pill'}
                      title={
                        disabled
                          ? 'Full-chest print is not available on zip hoodies'
                          : undefined
                      }
                      onClick={() => {
                        if (!disabled) setPrint(p.id)
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend>4 · Tournament logo</legend>
              <div className="logo-upload">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  hidden
                  onChange={(e) => onLogoFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="btn btn-ghost upload-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload logo
                </button>
                {customLogoUrl ? (
                  <button
                    type="button"
                    className="pill"
                    onClick={() => {
                      setCustomLogoUrl(null)
                      setLogoName(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                  >
                    Use FMD crest
                  </button>
                ) : null}
              </div>
              <p className="upload-meta">
                {logoName
                  ? `Using: ${logoName}`
                  : 'PNG / JPG / WebP · defaults to Family Memories crest'}
              </p>
            </fieldset>

            <fieldset>
              <legend>5 · Player</legend>
              <div className="player-fields">
                <label>
                  Name
                  <input
                    value={name}
                    maxLength={12}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    placeholder="NAME"
                  />
                </label>
                <label>
                  Number
                  <input
                    value={number}
                    maxLength={2}
                    onChange={(e) =>
                      setNumber(e.target.value.replace(/[^\d]/g, ''))
                    }
                    placeholder="#"
                  />
                </label>
              </div>
            </fieldset>

            <p className="studio-summary">{summary}</p>

            <div className="studio-actions">
              <motion.button
                type="button"
                className="btn btn-ghost"
                onClick={downloadPreview}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save preview
              </motion.button>
              <motion.a
                className="btn btn-primary studio-cta"
                href="#book"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book this look
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
