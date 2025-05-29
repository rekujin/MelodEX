import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Config Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: 'GET',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Yandex Music Endpoint
app.get('/api/users/:username/playlists/:kind', async (req, res) => {
  try {
    const token = process.env.YANDEX_MUSIC_TOKEN;
    if (!token) return res.status(500).json({ error: 'Server configuration error' });

    const { username, kind } = req.params;
    
    // Validation
    if (!username || !kind || isNaN(Number(kind))) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const response = await fetch(
      `https://api.music.yandex.net/users/${username}/playlists/${kind}`, //тестовая ссылка - https://music.yandex.ru/users/music-blog/playlists/2379
      {
        headers: {
          'Authorization': `OAuth ${token}`,
          'Accept-Language': 'ru',
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Yandex API error:', response.status, errorData);
      return res.status(response.status).json({
        error: { message: 'Ошибка при получении данных' }
      });
    }

    const data = await response.json();
    if (!data.result) return res.status(404).json({ error: 'Плейлист не найден' });

    // Data transformation
    const formattedData = {
      result: {
        title: data.result.title,
        trackCount: data.result.trackCount,
        tracks: (data.result.tracks || []).map(item => ({
          track: {
            id: item.id,
            title: item.track.title,
            artists: item.track.artists,
            durationMs: item.track.durationMs,
            albums: item.track.albums
          }
        }))
      }
    };
    
    res.json(formattedData);
    
  } catch (error) {
    console.error('Endpoint error:', error);
    const status = error.type === 'system' ? 503 : 500;
    res.status(status).json({ 
      error: { 
        message: status === 503 
          ? 'Сервис временно недоступен' 
          : 'Внутренняя ошибка сервера' 
      }
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен http://localhost:${PORT}`);
});