export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        error: 'Digite uma música, artista ou banda.'
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'A chave da YouTube API não foi configurada na Vercel.'
      });
    }

    const url =
      'https://www.googleapis.com/youtube/v3/search' +
      '?part=snippet' +
      '&type=video' +
      '&videoCategoryId=10' +
      '&maxResults=15' +
      `&q=${encodeURIComponent(q.trim())}` +
      `&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error:
          data.error?.message ||
          'Erro ao consultar a YouTube API.'
      });
    }

    const results = (data.items || [])
      .filter(item => item.id?.videoId)
      .map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumb: item.snippet.thumbnails?.medium?.url || ''
      }));

    return res.status(200).json(results);

  } catch (error) {
    console.error('YouTube API Error:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar músicas.'
    });
  }
}
