import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadReview() {
      setError('')
      try {
        const res = await api.get('/reviews/' + id)
        if (cancelled) return
        const review = res.data.review
        setForm({
          courseCode: review.courseCode || '',
          rating: Number(review.rating),
          comment: review.comment || ''
        })
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load review')
        }
      }
    }

    loadReview()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const review = {
      courseCode: form.courseCode,
      rating: form.rating,
      comment: form.comment
    }

    try {
      if (id) {
        await api.patch('/reviews/' + id, review)
      } else {
        await api.post('/reviews', review)
      }
      nav('/reviews')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save review')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Course code</span>
          <input
            className="input w-full"
            name="courseCode"
            value={form.courseCode}
            onChange={onChange}
            placeholder="e.g. CS101"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Rating</span>
          <select className="input w-full" name="rating" value={form.rating} onChange={onChange}>
            {[1, 2, 3, 4, 5].map(rating => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Comment (optional)</span>
          <textarea
            className="input w-full"
            name="comment"
            value={form.comment}
            onChange={onChange}
            rows={4}
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
