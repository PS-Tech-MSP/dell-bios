import logo from '../assets/logo.png'

/**
 * PS Tech logo. Shown directly on white. On the black POST screen the near-black "Tech"
 * block would vanish, so the splash passes `badge` to sit it on a light rounded plate.
 */
export function Logo({ height = 32, badge = false }: { height?: number; badge?: boolean }) {
  const img = <img src={logo} alt="PS Tech" height={height} style={{ height, width: 'auto', display: 'block' }} />
  if (!badge) return img
  return (
    <span style={{ display: 'inline-flex', background: '#f4f5f7', borderRadius: 10, padding: Math.round(height * 0.18) }}>
      {img}
    </span>
  )
}
