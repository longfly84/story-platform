import { useEffect, useMemo, useRef } from 'react'

import { trackAnalyticsEvent } from '@/lib/analytics/index'

type UseChapterAnalyticsParams = {
  storyId?: string | null
  chapterId?: string | null
  storySlug?: string | null
  chapterNumber?: number | null
}

export function useChapterAnalytics(params: UseChapterAnalyticsParams) {
  const startedAtRef = useRef(Date.now())
  const trackedProgressRef = useRef<Set<number>>(new Set())

  const payload = useMemo(
    () => ({
      story_id: params.storyId || null,
      chapter_id: params.chapterId || null,
      story_slug: params.storySlug || null,
      chapter_number: params.chapterNumber || null,
    }),
    [params.storyId, params.chapterId, params.storySlug, params.chapterNumber],
  )

  useEffect(() => {
    if (!payload.story_slug && !payload.story_id) return

    startedAtRef.current = Date.now()
    trackedProgressRef.current = new Set()

    trackAnalyticsEvent({
      event_type: 'chapter_start',
      ...payload,
    })
  }, [payload.story_id, payload.chapter_id, payload.story_slug, payload.chapter_number])

  useEffect(() => {
    function getProgressPercent() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      )

      const maxScroll = Math.max(1, documentHeight - viewportHeight)
      const percent = Math.round((scrollTop / maxScroll) * 100)

      return Math.max(0, Math.min(100, percent))
    }

    function handleScroll() {
      if (!payload.story_slug && !payload.story_id) return

      const percent = getProgressPercent()
      const milestones = [25, 50, 75, 90, 100]

      for (const milestone of milestones) {
        if (percent >= milestone && !trackedProgressRef.current.has(milestone)) {
          trackedProgressRef.current.add(milestone)

          trackAnalyticsEvent({
            event_type: 'chapter_progress',
            ...payload,
            progress_percent: milestone,
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [payload.story_id, payload.chapter_id, payload.story_slug, payload.chapter_number])

  useEffect(() => {
    function sendReadTime() {
      if (!payload.story_slug && !payload.story_id) return

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current) / 1000),
      )

      trackAnalyticsEvent({
        event_type: 'read_time',
        ...payload,
        duration_seconds: durationSeconds,
      })
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sendReadTime()
      }
    }

    window.addEventListener('beforeunload', sendReadTime)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      sendReadTime()
      window.removeEventListener('beforeunload', sendReadTime)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [payload.story_id, payload.chapter_id, payload.story_slug, payload.chapter_number])

  function trackNextChapterClick(input: {
    toChapterId?: string | null
    toChapterNumber?: number | null
  }) {
    trackAnalyticsEvent({
      event_type: 'next_chapter_click',

      story_id: payload.story_id,
      story_slug: payload.story_slug,

      from_chapter_id: payload.chapter_id,
      from_chapter_number: payload.chapter_number,

      to_chapter_id: input.toChapterId || null,
      to_chapter_number: input.toChapterNumber || null,
    })
  }

  return {
    trackNextChapterClick,
  }
}