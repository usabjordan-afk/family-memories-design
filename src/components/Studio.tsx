import { useState } from 'react'
import { motion } from 'framer-motion'
import { StudioCanvas } from '../three/Scenes'
import {
  COLORS,
  PRINTS,
  PRODUCTS,
  type PrintStyle,
  type ProductId,
} from '../lib/products'

export function Studio() {
  const [product, setProduct] = useState<ProductId>('crew')
  const [colorId, setColorId] = useState('aqua')
  const [print, setPrint] = useState<PrintStyle>('crest')
  const [name, setName] = useState('MAYA')
  const [number, setNumber] = useState('7')

  const color = COLORS.find((c) => c.id === colorId) ?? COLORS[0]
  const activePrint =
    (product === 'zip' || product === 'hoodie') && print === 'crest'
      ? 'left'
      : print

  return (
    <section className="section studio" id="studio">
      <div className="section-inner studio-inner">
        <div className="studio-intro">
          <p className="eyebrow">Live booth preview</p>
          <h2 className="display">Spin it. Color it. Make it theirs.</h2>
          <p className="lede">
            Drag the garment. Switch styles. Add a name and number exactly like
            we print at the tournament booth.
          </p>
        </div>

        <div className="studio-layout">
          <div className="studio-viewport">
            <StudioCanvas
              product={product}
              color={color.hex}
              ink={color.ink}
              print={activePrint}
              playerName={name}
              playerNumber={number}
            />
            <p className="studio-hint">Drag to rotate · scroll-friendly</p>
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
                    className={colorId === c.id ? 'swatch active' : 'swatch'}
                    style={{ background: c.hex }}
                    aria-label={c.label}
                    title={c.label}
                    onClick={() => setColorId(c.id)}
                  />
                ))}
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
              <legend>4 · Player</legend>
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

            <motion.a
              className="btn btn-primary studio-cta"
              href="tel:+17203051643"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Print this at your event
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
