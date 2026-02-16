const express = require('express');
const auth = require('../middleware/auth');
const { createAIService } = require('../services/ai');
const youtubesearchapi = require('youtube-search-api');

const router = express.Router();

/**
 * Normalize YouTube search result item to { id, title, thumbnail }.
 * @param {object} item - Raw item from GetListByKeyword
 * @returns {{ id: string, title: string, thumbnail: string }}
 */
function toVideoSummary(item) {
  const id = item?.id || item?.videoId || '';
  const title = typeof item?.title === 'string' ? item.title : '';
  let thumbnail = '';
  if (item?.thumbnail) {
    if (typeof item.thumbnail === 'string') thumbnail = item.thumbnail;
    else if (item.thumbnail?.url) thumbnail = item.thumbnail.url;
    else if (item.thumbnail?.thumbnails?.[0]?.url) thumbnail = item.thumbnail.thumbnails[0].url;
    else if (Array.isArray(item.thumbnail) && item.thumbnail[0]?.url) thumbnail = item.thumbnail[0].url;
  }
  return { id, title, thumbnail };
}

/**
 * POST /recommendations/youtube-keyword
 * Body: { courseTitle, lessonName }
 * Returns: { searchString } — single YouTube search query from Claude, or fallback if AI unavailable
 */
router.post('/youtube-keyword', auth, async (req, res) => {
  try {
    const { courseTitle, lessonName } = req.body || {};
    const fallbackSearch = [courseTitle, lessonName].filter(Boolean).join(' ') || 'programming tutorial';
    try {
      const ai = createAIService();
      const searchString = await ai.generateYoutubeSearchKeyword(courseTitle, lessonName);
      return res.json({ searchString });
    } catch (aiErr) {
      // AI/auth errors: use fallback so supplemental videos still work
      const isAuthErr = aiErr?.status === 401 ||
        (typeof aiErr?.message === 'string' && aiErr.message.toLowerCase().includes('invalid x-api-key')) ||
        (aiErr?.error?.type === 'authentication_error');
      if (aiErr?.code === 'ANTHROPIC_API_KEY_MISSING' || isAuthErr || aiErr?.code === 'AI_INPUT_INVALID') {
        return res.json({ searchString: fallbackSearch });
      }
      throw aiErr;
    }
  } catch (err) {
    const { courseTitle, lessonName } = req.body || {};
    const fallbackSearch = [courseTitle, lessonName].filter(Boolean).join(' ') || 'programming tutorial';
    console.error('youtube-keyword error:', err?.message || err);
    return res.json({ searchString: fallbackSearch });
  }
});

/**
 * GET /recommendations/youtube?q=<searchString>
 * Returns: { videos: [{ id, title, thumbnail }, ...] } — top 3 results
 */
router.get('/youtube', auth, async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" (search string) is required.' });
    }

    const result = await youtubesearchapi.GetListByKeyword(q, false, 3, [{ type: 'video' }]);
    const items = Array.isArray(result?.items) ? result.items : [];
    const videos = items.slice(0, 3).map(toVideoSummary).filter((v) => v.id);

    return res.json({ videos });
  } catch (err) {
    console.error('youtube search error:', err);
    return res.status(500).json({ message: err.message || 'Failed to fetch YouTube recommendations.' });
  }
});

module.exports = router;
