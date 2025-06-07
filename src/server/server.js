import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import swaggerUi from 'swagger-ui-express';

import { getSoundCloudToken } from './soundcloud/auth.js';
import { getSpotifyToken } from './spotify/auth.js';
import { fetchAllTracks } from './spotify/fetchAllTracks.js';
import { mapSpotifyTracks } from './spotify/mapSpotifyTracks.js';

import { swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const formatImageUrl = (url, service) => {
  if (!url) return null;
  
  switch (service) {
    case 'spotify':
      return url.replace(/\/\w+\.jpg/, '/200x200.jpg');
    
    case 'soundcloud':
      return url.replace(/-\w+\.jpg/, '-t200x200.jpg');
    
    case 'yandex':
      return 'https://' + url.replace('%%', '200x200');
      
    default:
      return url;
  }
};

/**
 * @swagger
 * /api/yandex/resolve:
 *   get:
 *     summary: Получить плейлист Яндекс.Музыки
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL плейлиста Яндекс.Музыки
 *     responses:
 *       200:
 *         description: Успешное получение плейлиста
 *       400:
 *         description: Неверная ссылка
 *       404:
 *         description: Плейлист не найден
 *       500:
 *         description: Ошибка сервера
 */
app.get('/api/yandex/resolve', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing ?url parameter' });

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const pathMatch = parsedUrl.pathname.match(/\/users\/([^\/]+)\/playlists\/(\d+)/);
    if (!pathMatch) {
      return res.status(400).json({ error: 'URL does not match Yandex.Music playlist pattern' });
    }

    const username = pathMatch[1];
    const kind = pathMatch[2];
    
    const token = process.env.YANDEX_MUSIC_TOKEN;
    if (!token) return res.status(500).json({ error: 'Server configuration error' });

    const response = await fetch(
      `https://api.music.yandex.net/users/${username}/playlists/${kind}`,
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

    const formattedData = {
      result: {
        title: data.result.title,
        description: data.result.description,
        trackCount: data.result.trackCount,
        cover: formatImageUrl(data.result.cover?.itemsUri?.[0] || data.result.ogImage, 'yandex'),
        tracks: (data.result.tracks || []).map(item => ({
          track: {
            id: item.id,
            title: item.track.title,
            cover: formatImageUrl(item.track.coverUri, 'yandex'),
            artists: item.track.artists,
            durationMs: item.track.durationMs,
            albums: item.track.albums
          }
        }))
      }
    };
    
    res.json(formattedData);
    
  } catch (error) {
    console.error('Yandex resolve error:', error);
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

/**
 * @swagger
 * /api/soundcloud/resolve:
 *   get:
 *     summary: Получить плейлист SoundCloud
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL плейлиста SoundCloud
 *     responses:
 *       200:
 *         description: Успешное получение плейлиста
 *       400:
 *         description: Неверная ссылка
 *       404:
 *         description: Плейлист не найден
 *       500:
 *         description: Ошибка сервера
 */
app.get('/api/soundcloud/resolve', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing ?url parameter' });

    const access_token = await getSoundCloudToken();

    const resolveRes = await fetch(
      `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'Authorization': `OAuth ${access_token}`
        }
      }
    );


    if (!resolveRes.ok) {
      const errorText = await resolveRes.text();
      console.error('Resolve error:', errorText);
      return res.status(resolveRes.status).json({ error: 'Ошибка при resolve запроса' });
    }

    const playlist = await resolveRes.json();

    if (playlist.kind !== 'playlist') {
      return res.status(400).json({ error: 'Ссылка не ведёт на плейлист' });
    }

    const formattedData = {
      result: {
        title: playlist.title,
        description: playlist.description || '',
        trackCount: playlist.tracks.length,
        cover: formatImageUrl(playlist.artwork_url, 'soundcloud'),
        tracks: playlist.tracks.map(track => ({
          track: {
            id: track.id,
            title: track.title,
            cover: formatImageUrl(track.artwork_url, 'soundcloud'),
            artists: [{ name: track.user.username }],
            durationMs: track.duration,
            albums: [{ title: track.user.username }]
          }
        }))
      }
    };

    res.json(formattedData);
  } catch (err) {
    console.error('SoundCloud resolve error:', err);
    res.status(500).json({ error: 'Ошибка при обработке запроса SoundCloud' });
  }
});

/**
 * @swagger
 * /api/spotify/resolve:
 *   get:
 *     summary: Получить плейлист Spotify
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL плейлиста Spotify
 *     responses:
 *       200:
 *         description: Успешное получение плейлиста
 *       400:
 *         description: Неверная ссылка
 *       404:
 *         description: Плейлист не найден
 *       500:
 *         description: Ошибка сервера
 */
app.get('/api/spotify/resolve', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing ?url parameter' });

    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!match || !match[1]) {
      return res.status(400).json({ error: 'Invalid Spotify playlist URL' });
    }

    const playlistId = match[1];
    const accessToken = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return res.status(response.status).json({
        error: { message: 'Ошибка при получении данных' }
      });
    }

    const data = await response.json();
    
    const allTrackItems = await fetchAllTracks(playlistId, accessToken, data.tracks.total);
    const { tracks: mappedTracks, actualCount } = mapSpotifyTracks(allTrackItems);

    const formattedData = {
      result: {
        title: data.name,
        description: data.description || '',
        trackCount: actualCount,
        cover: formatImageUrl(data.images[0]?.url, 'spotify'),
        tracks: mappedTracks
      }
    };
    
    res.json(formattedData);
    
  } catch (error) {
    console.error('Spotify resolve error:', error);
    res.status(500).json({ 
      error: { message: 'Ошибка при обработке ссылки Spotify' }
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