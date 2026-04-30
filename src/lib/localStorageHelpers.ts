type ReadingHistoryItem = {
  storySlug: string
  storyTitle: string
  chapterSlug: string
  chapterNumber?: number
  chapterTitle: string
  lastRead: number
}

type FollowedStories = string[]

// Key names in localStorage
const READING_HISTORY_KEY = "readingHistory"
const FOLLOWED_STORIES_KEY = "followedStories"

// Reading History Helpers
export function getReadingHistory(): ReadingHistoryItem[] {
  const data = localStorage.getItem(READING_HISTORY_KEY)
  if (!data) return []
  try {
    return JSON.parse(data) as ReadingHistoryItem[]
  } catch {
    return []
  }
}

export function saveReadingHistory(item: ReadingHistoryItem) {
  const history = getReadingHistory()
  // Remove existing entries for the same story (keep only one per story)
  const filtered = history.filter((h) => h.storySlug !== item.storySlug)
  // Add new item at front
  filtered.unshift(item)
  // Limit to 10 items
  const limited = filtered.slice(0, 10)
  localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(limited))
}

// Followed Stories Helpers
export function getFollowedStories(): FollowedStories {
  const data = localStorage.getItem(FOLLOWED_STORIES_KEY)
  if (!data) return []
  try {
    return JSON.parse(data) as FollowedStories
  } catch {
    return []
  }
}

export function followStory(slug: string) {
  const followed = getFollowedStories()
  if (!followed.includes(slug)) {
    followed.push(slug)
    localStorage.setItem(FOLLOWED_STORIES_KEY, JSON.stringify(followed))
  }
}

export function unfollowStory(slug: string) {
  const followed = getFollowedStories()
  const filtered = followed.filter((s) => s !== slug)
  localStorage.setItem(FOLLOWED_STORIES_KEY, JSON.stringify(filtered))
}

export function isStoryFollowed(slug: string): boolean {
  const followed = getFollowedStories()
  return followed.includes(slug)
}