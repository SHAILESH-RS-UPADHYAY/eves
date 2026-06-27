import { useMemo } from 'react'
import { GlassCard } from '../glass/GlassCard'

interface WordCloudProps {
  wordFrequency: Record<string, number>
  maxWords?: number
}

const colorPalette = ['#7C3AED', '#06B6D4', '#A78BFA', '#67E8F9', '#F43F5E', '#F59E0B', '#14B8A6']

const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'so', 'if', 'because', 'about', 'what', 'which', 'who', 'when', 'where', 'how', 'just', 'like', 'know', 'think', 'really', 'actually', 'going', 'want', 'need', 'got', 'get', 'yeah', 'okay', 'right', 'there', 'here', 'all', 'not', 'no', 'yes', 'um', 'uh', 'well', 'now'])

export function WordCloud({ wordFrequency, maxWords = 30 }: WordCloudProps) {
  const words = useMemo(() => {
    return Object.entries(wordFrequency)
      .filter(([word]) => !stopWords.has(word.toLowerCase()) && word.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([word, count], i) => ({
        word,
        count,
        size: 12 + Math.min(count * 2, 28),
        color: colorPalette[i % colorPalette.length]
      }))
  }, [wordFrequency, maxWords])

  if (words.length === 0) return null

  const maxCount = words[0].count

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Word Cloud</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              fontSize: `${w.size}px`,
              color: w.color,
              fontWeight: w.count > maxCount / 2 ? 700 : 500,
              opacity: 0.4 + (w.count / maxCount) * 0.6,
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {w.word}
          </span>
        ))}
      </div>
    </GlassCard>
  )
}
