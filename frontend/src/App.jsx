import './App.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Heart,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Wifi,
  WifiOff,
  X,
  Trash2,
} from 'lucide-react'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const CATEGORIES = ['All reviews', 'Product', 'Service', 'App', 'Other']
const EMPTY_FORM = { name: '', product: '', category: 'Product', rating: 5, message: '', recommend: true }

async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error(`Can't reach the backend at ${API_BASE}. Make sure the backend terminal is running.`)
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`)
  return payload
}

function Stars({ value = 0, size = 15 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} fill={star <= value ? 'currentColor' : 'none'} strokeWidth={1.8} className={star <= value ? 'star-filled' : 'star-empty'} />
      ))}
    </span>
  )
}

function RatingPicker({ value, onChange }) {
  return (
    <div className="rating-picker" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={`rating-choice ${rating <= value ? 'selected' : ''}`}
          onClick={() => onChange(rating)}
          aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
          aria-checked={rating === value}
          role="radio"
        >
          <Star size={25} fill={rating <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
      <span className="rating-caption">{['', 'Not good', 'Could be better', 'It was okay', 'Really good', 'Excellent!'][value]}</span>
    </div>
  )
}

function Avatar({ name }) {
  const initials = (name || 'Guest').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const palettes = ['avatar-violet', 'avatar-peach', 'avatar-mint', 'avatar-blue', 'avatar-pink']
  const color = palettes[(name || 'Guest').charCodeAt(0) % palettes.length]
  return <div className={`avatar ${color}`}>{initials || 'G'}</div>
}

function formatDate(dateValue) {
  if (!dateValue) return 'Just now'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function ReviewCard({ review, onEdit, onDelete, onHelpful, busyHelpful }) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <div className="reviewer">
          <Avatar name={review.name} />
          <div className="reviewer-info">
            <div className="reviewer-name-row">
              <strong>{review.name}</strong>
              <span className="verified-tag"><BadgeCheck size={13} /> Reviewer</span>
            </div>
            <span className="review-date">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <div className="review-actions">
          <button className="icon-button" onClick={() => onEdit(review)} title="Edit review" aria-label="Edit review"><Pencil size={16} /></button>
          <button className="icon-button danger-hover" onClick={() => onDelete(review)} title="Delete review" aria-label="Delete review"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="review-product-row">
        <span className="category-tag">{review.category}</span>
        <span className="product-name">{review.product}</span>
        <span className="dot-separator">·</span>
        <Stars value={review.rating} />
        <span className="rating-number">{review.rating}.0</span>
      </div>

      <p className="review-message">{review.message}</p>

      <div className="review-card-bottom">
        <span className={`recommendation ${review.recommend ? 'recommend-yes' : 'recommend-no'}`}>
          {review.recommend ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
          {review.recommend ? 'Recommends it' : 'Not recommended'}
        </span>
        <button className={`helpful-button ${busyHelpful ? 'is-busy' : ''}`} onClick={() => onHelpful(review)} disabled={busyHelpful}>
          <ThumbsUp size={15} /> Helpful <span className="helpful-count">{review.helpful || 0}</span>
        </button>
      </div>
    </article>
  )
}

function ReviewModal({ initialReview, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => initialReview ? {
    name: initialReview.name || '', product: initialReview.product || '', category: initialReview.category || 'Product',
    rating: initialReview.rating || 5, message: initialReview.message || '', recommend: initialReview.recommend !== false,
  } : { ...EMPTY_FORM })
  const [formError, setFormError] = useState('')

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })) }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.product.trim() || !form.message.trim()) {
      setFormError('Please fill in your name, product/service and review.')
      return
    }
    if (form.name.trim().length > 80 || form.product.trim().length > 100 || form.message.trim().length > 1200) {
      setFormError('Name/product is too long, or review exceeds 1,200 characters.')
      return
    }
    setFormError('')
    try { await onSave({ ...form, name: form.name.trim(), product: form.product.trim(), message: form.message.trim() }) }
    catch (error) { setFormError(error.message || 'Could not save your review.') }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <span className="eyebrow">YOUR EXPERIENCE MATTERS</span>
            <h2 id="modal-title">{initialReview ? 'Edit your review' : 'Write a review'}</h2>
            <p>Share an honest take. It helps everyone choose better.</p>
          </div>
          <button className="icon-button close-modal" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="field-grid">
            <label className="field-label">Your name<input autoFocus maxLength={80} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Pawan Prajapati" /></label>
            <label className="field-label">Product or service<input maxLength={100} value={form.product} onChange={(e) => update('product', e.target.value)} placeholder="e.g. Wireless headphones" /></label>
          </div>
          <label className="field-label">Review category
            <span className="select-wrap"><select value={form.category} onChange={(e) => update('category', e.target.value)}><option>Product</option><option>Service</option><option>App</option><option>Other</option></select><ChevronDown size={16} /></span>
          </label>
          <div className="field-label">Your rating <RatingPicker value={form.rating} onChange={(value) => update('rating', value)} /></div>
          <label className="field-label">Your review<textarea rows={4} maxLength={1200} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="What did you like? What could be better?" /><span className="character-count">{form.message.length}/1,200</span></label>
          <label className="recommend-toggle"><input type="checkbox" checked={form.recommend} onChange={(e) => update('recommend', e.target.checked)} /><span className="toggle-ui"><Check size={13} /></span><span><strong>I'd recommend this</strong><small>Let others know if it is worth trying.</small></span></label>
          {formError && <div className="form-error"><CircleAlert size={16} />{formError}</div>}
          <div className="modal-footer"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Send size={16} />}{saving ? 'Saving...' : initialReview ? 'Save changes' : 'Publish review'}</button></div>
        </form>
      </section>
    </div>
  )
}

export default function App() {
  const [reviews, setReviews] = useState([])
  const [activeCategory, setActiveCategory] = useState('All reviews')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState('checking')
  const [notice, setNotice] = useState(null)
  const [busyHelpful, setBusyHelpful] = useState(null)

  const showNotice = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    window.clearTimeout(showNotice.timer)
    showNotice.timer = window.setTimeout(() => setNotice(null), 4500)
  }, [])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/api/feedback')
      setReviews(Array.isArray(data.feedback) ? data.feedback : [])
      setApiStatus('connected')
    } catch (error) {
      setApiStatus(error.message.includes('MongoDB') || error.message.includes('database') || error.message.includes('Database') ? 'database-error' : 'offline')
      showNotice(error.message, 'error')
    } finally { setLoading(false) }
  }, [showNotice])

  useEffect(() => { loadReviews() }, [loadReviews])

  const stats = useMemo(() => {
    const count = reviews.length
    const average = count ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count : 0
    const recommendCount = reviews.filter((review) => review.recommend).length
    const recommendPercent = count ? Math.round((recommendCount / count) * 100) : 0
    return { count, average, recommendPercent }
  }, [reviews])

  const filteredReviews = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const result = reviews.filter((review) => {
      const matchesCategory = activeCategory === 'All reviews' || review.category === activeCategory
      const matchesSearch = !needle || [review.name, review.product, review.message, review.category].some((value) => String(value || '').toLowerCase().includes(needle))
      return matchesCategory && matchesSearch
    })
    return result.sort((a, b) => {
      if (sort === 'highest') return Number(b.rating) - Number(a.rating) || new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'lowest') return Number(a.rating) - Number(b.rating) || new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [reviews, activeCategory, search, sort])

  async function saveReview(form) {
    setSaving(true)
    try {
      if (editingReview) {
        const data = await apiRequest(`/api/feedback/${editingReview._id}`, { method: 'PATCH', body: JSON.stringify(form) })
        setReviews((current) => current.map((review) => review._id === editingReview._id ? data.feedback : review))
        showNotice('Your review has been updated.')
      } else {
        const data = await apiRequest('/api/feedback', { method: 'POST', body: JSON.stringify(form) })
        setReviews((current) => [data.feedback, ...current])
        showNotice('Your review has been published. Thanks for sharing!')
      }
      setApiStatus('connected')
      setModalOpen(false)
      setEditingReview(null)
    } finally { setSaving(false) }
  }

  async function deleteReview(review) {
    if (!window.confirm(`Delete the review for “${review.product}” by ${review.name}? This cannot be undone.`)) return
    try {
      await apiRequest(`/api/feedback/${review._id}`, { method: 'DELETE' })
      setReviews((current) => current.filter((item) => item._id !== review._id))
      showNotice('Review deleted.')
    } catch (error) { showNotice(error.message, 'error') }
  }

  async function markHelpful(review) {
    setBusyHelpful(review._id)
    try {
      const data = await apiRequest(`/api/feedback/${review._id}/helpful`, { method: 'PATCH' })
      setReviews((current) => current.map((item) => item._id === review._id ? data.feedback : item))
    } catch (error) { showNotice(error.message, 'error') }
    finally { setBusyHelpful(null) }
  }

  function openCreate() { setEditingReview(null); setModalOpen(true) }
  function openEdit(review) { setEditingReview(review); setModalOpen(true) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Reviewly home"><span className="brand-mark"><MessageSquareText size={21} strokeWidth={2.3} /></span><span>reviewly<span className="brand-period">.</span></span></a>
        <nav className="top-nav"><a className="nav-link active" href="#reviews">Explore reviews</a><a className="nav-link" href="#about">About</a></nav>
        <div className="topbar-actions"><span className={`connection-pill ${apiStatus === 'connected' ? 'connected' : apiStatus === 'checking' ? 'checking' : 'disconnected'}`}><span className="connection-dot" />{apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Connecting' : 'Offline'}</span><button className="button button-primary button-small" onClick={openCreate}><Plus size={17} /> Write a review</button></div>
      </header>

      {apiStatus !== 'connected' && !loading && <div className={`connection-banner ${apiStatus === 'database-error' ? 'banner-database' : ''}`}><span className="banner-icon">{apiStatus === 'checking' ? <LoaderCircle size={18} className="spin" /> : <WifiOff size={18} />}</span><div><strong>{apiStatus === 'database-error' ? 'Database connection needs attention' : 'Can’t connect to the backend yet'}</strong><p>{apiStatus === 'database-error' ? 'Check the MongoDB Atlas credentials in backend/.env, then restart the backend.' : 'Run the backend in a second terminal (port 5000) and confirm MongoDB Atlas is configured.'}</p></div><button className="button button-ghost banner-retry" onClick={loadReviews}><span className="retry-text">Retry</span><ArrowRight size={15} /></button></div>}

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> REAL PEOPLE. REAL EXPERIENCES.</div><h1>Good decisions start<br />with <span>honest reviews.</span></h1><p className="hero-description">Discover what people really think. Share your experience and help the next person make a confident choice.</p><div className="hero-actions"><button className="button button-primary" onClick={openCreate}><Plus size={18} /> Share your experience</button><a href="#reviews" className="text-link">Explore feedback <ArrowRight size={16} /></a></div><div className="hero-trust"><div className="trust-avatars"><Avatar name="Maya" /><Avatar name="Arjun" /><Avatar name="Riya" /><Avatar name="Dev" /></div><span><strong>Every voice counts.</strong><br />Built on shared experiences.</span></div></div>
          <div className="hero-art" aria-label="Reviewly review illustration"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="floating-star float-star-one"><Star size={19} fill="currentColor" /></div><div className="floating-star float-star-two"><Sparkles size={20} /></div><div className="hero-review-card"><div className="mini-card-heading"><span className="mini-logo"><MessageSquareText size={16} /></span><span className="mini-card-title">community review</span><span className="mini-verified"><BadgeCheck size={15} /></span></div><div className="mini-person"><Avatar name="Ananya Sharma" /><div><strong>Ananya Sharma</strong><small>Verified experience</small></div></div><Stars value={5} size={17} /><h3>“Exactly what I was looking for!”</h3><p>Thoughtful design, easy to use, and genuinely worth the money. Would recommend.</p><div className="mini-card-bottom"><span><Heart size={14} fill="currentColor" /> Helpful feedback</span><span className="mini-date">2 days ago</span></div></div><div className="floating-rating"><span className="rating-icon"><Star size={17} fill="currentColor" /></span><div><strong>Honest opinions</strong><small>Make every choice count</small></div></div><div className="floating-bubble"><ShieldCheck size={19} /><span>Community first</span></div></div>
        </section>

        <section className="stats-grid" aria-label="Review statistics">
          <div className="stat-card"><div className="stat-icon stat-purple"><MessageSquareText size={19} /></div><div className="stat-label">Total reviews</div><div className="stat-value">{stats.count.toLocaleString('en-IN')}<span className="stat-sub"> shared</span></div><div className="stat-foot"><span className="stat-foot-dot purple-dot" />Community feedback</div></div>
          <div className="stat-card"><div className="stat-icon stat-yellow"><Star size={19} /></div><div className="stat-label">Average rating</div><div className="stat-value">{stats.count ? stats.average.toFixed(1) : '—'}<span className="stat-outof"> / 5</span></div><div className="stat-foot"><Stars value={Math.round(stats.average)} size={12} /><span>{stats.count ? 'Across all reviews' : 'No ratings yet'}</span></div></div>
          <div className="stat-card"><div className="stat-icon stat-green"><TrendingUp size={19} /></div><div className="stat-label">Would recommend</div><div className="stat-value">{stats.count ? `${stats.recommendPercent}%` : '—'}</div><div className="stat-foot"><span className="stat-foot-dot green-dot" />Based on reviewer feedback</div></div>
          <div className="stat-card stat-note"><div className="stat-note-top"><div className="stat-icon stat-pink"><ShieldCheck size={19} /></div><span className="note-sparkle"><Sparkles size={16} /></span></div><div className="stat-note-title">Your voice matters.</div><p>One review can help someone make a better decision.</p><button className="stat-note-link" onClick={openCreate}>Add your voice <ArrowRight size={15} /></button></div>
        </section>

        <section className="reviews-section" id="reviews">
          <div className="section-heading"><div><span className="eyebrow">THE COMMUNITY SAYS</span><h2>Reviews that help you decide<span>.</span></h2><p>Honest thoughts from people who've been there.</p></div><button className="button button-outline" onClick={openCreate}><Plus size={17} /> Add a review</button></div>

          <div className="review-tools"><div className="category-tabs" role="tablist" aria-label="Filter review category">{CATEGORIES.map((category) => <button key={category} className={`category-tab ${activeCategory === category ? 'tab-active' : ''}`} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}{category === 'All reviews' && <span className="tab-count">{reviews.length}</span>}</button>)}</div><div className="tool-right"><label className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." aria-label="Search reviews" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label><div className="sort-container"><button className={`sort-button ${sortOpen ? 'sort-open' : ''}`} onClick={() => setSortOpen((value) => !value)}><SlidersHorizontal size={16} /><span>{({ newest: 'Newest first', oldest: 'Oldest first', highest: 'Top rated', lowest: 'Lowest rated' })[sort]}</span><ChevronDown size={15} /></button>{sortOpen && <div className="sort-menu">{[['newest', 'Newest first'], ['oldest', 'Oldest first'], ['highest', 'Top rated'], ['lowest', 'Lowest rated']].map(([key, label]) => <button key={key} onClick={() => { setSort(key); setSortOpen(false) }} className={sort === key ? 'sort-selected' : ''}>{label}{sort === key && <Check size={14} />}</button>)}</div>}</div></div></div>

          <div className="reviews-list-header"><span>{loading ? 'Loading reviews...' : `Showing ${filteredReviews.length} ${filteredReviews.length === 1 ? 'review' : 'reviews'}`}</span><span className="live-label"><span /> LIVE COMMUNITY</span></div>
          {loading ? <div className="loading-state"><LoaderCircle className="spin" size={27} /><strong>Gathering community reviews...</strong><span>Connecting to your feedback database</span></div> : filteredReviews.length ? <div className="reviews-grid">{filteredReviews.map((review) => <ReviewCard key={review._id} review={review} onEdit={openEdit} onDelete={deleteReview} onHelpful={markHelpful} busyHelpful={busyHelpful === review._id} />)}</div> : <div className="empty-state"><div className="empty-icon"><MessageSquareText size={26} /></div><h3>{reviews.length ? 'No reviews match your search' : 'Be the first to share.'}</h3><p>{reviews.length ? 'Try a different keyword or category.' : 'Your experience could be the one that helps someone else.'}</p>{reviews.length ? <button className="button button-outline" onClick={() => { setSearch(''); setActiveCategory('All reviews') }}>Clear filters</button> : <button className="button button-primary" onClick={openCreate}><Plus size={17} /> Write the first review</button>}</div>}
        </section>

        <section className="bottom-cta" id="about"><div className="cta-icon"><Sparkles size={22} /></div><div className="cta-copy"><span>BE PART OF THE COMMUNITY</span><h2>Your experience might be someone else's answer.</h2><p>Share what you know. Help someone choose with confidence.</p></div><button className="button button-light" onClick={openCreate}>Write a review <ArrowRight size={17} /></button><div className="cta-decoration cta-decoration-one" /><div className="cta-decoration cta-decoration-two" /></section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><MessageSquareText size={18} /></span><span>reviewly<span className="brand-period">.</span></span></a><span>Made for better decisions, powered by real experiences.</span><span className="footer-status"><span /> MERN stack project</span></footer>

      {notice && <div className={`toast ${notice.type === 'error' ? 'toast-error' : ''}`} role="status">{notice.type === 'error' ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{notice.message}<button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
      {modalOpen && <ReviewModal initialReview={editingReview} onClose={() => { setModalOpen(false); setEditingReview(null) }} onSave={saveReview} saving={saving} />}
    </div>
  )
}
