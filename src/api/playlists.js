import supabase from "../helper/supabaseClient";

export const playlistsApi = {
  async getRecentPlaylists(limit = 6) {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        profiles(username)
      `
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getPopularPlaylists(limit = 6) {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        profiles(username)
      `
      )
      .eq("is_public", true)
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getPlaylistById(id) {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        author_id,
        tags
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserPlaylists(userId) {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        author_id
      `
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getLikedPlaylists(userId) {
    const { data, error } = await supabase
      .from("playlist_likes")
      .select(
        `
        created_at,
        playlists:playlist_id (
          id,
          title,
          description,
          avatar_url,
          likes_count,
          track_count,
          total_duration,
          created_at,
          author_id
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((item) => item.playlists);
  },

  async createPlaylist(playlistData, userId) {
    const { title, description, platform, tracks, cover, tags, originalUrl } =
      playlistData;

    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .insert({
        title,
        description: description || "",
        author_id: userId,
        platform,
        avatar_url: cover || null,
        tags: tags.length > 0 ? tags : null,
        playlist_url: originalUrl,
      })
      .select()
      .single();

    if (playlistError) throw playlistError;

    const trackPromises = tracks.map(async (trackItem, index) => {
      const track = trackItem.track;
      const { data: existingTrack } = await supabase
        .from("tracks")
        .select("id")
        .eq("title", track.title)
        .eq("artist", track.artists[0]?.name || "")
        .maybeSingle();

      let trackId = existingTrack?.id;

      if (!trackId) {
        const albumValue =
          platform === "soundcloud"
            ? track.title
            : track.albums?.[0]?.title || null;

        const { data: insertedTrack, error: trackError } = await supabase
          .from("tracks")
          .insert({
            title: track.title,
            artist: track.artists[0]?.name || "Unknown Artist",
            album: albumValue,
            duration: Math.floor(track.durationMs / 1000),
            artwork_url: track.cover || null,
            platform,
          })
          .select()
          .single();

        if (trackError) throw trackError;
        trackId = insertedTrack.id;
      }

      return supabase.from("playlist_tracks").insert({
        playlist_id: playlist.id,
        track_id: trackId,
        position: index + 1,
      });
    });

    await Promise.all(trackPromises);
    return playlist;
  },
  
  async fetchUserLibrary(userId) {
    const { data: created, error: createdError } = await supabase
      .from("playlists")
      .select(
        `
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        author_id
      `
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (createdError) throw createdError;

    const { data: liked, error: likedError } = await supabase
      .from("playlist_likes")
      .select(
        `
        created_at,
        playlists:playlist_id (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (likedError) throw likedError;

    const allPlaylists = [
      ...(created || []),
      ...(liked?.map((item) => item.playlists).filter(Boolean) || []),
    ];

    const authorIds = [...new Set(allPlaylists.map((p) => p.author_id))];

    const { data: authors } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", authorIds);

    const authorsMap = authors?.reduce((acc, author) => {
      acc[author.id] = author;
      return acc;
    }, {});

    return {
      created:
        created?.map((playlist) => ({
          ...playlist,
          author: authorsMap[playlist.author_id],
        })) || [],
      liked:
        liked?.map((item) => ({
          ...item.playlists,
          author: authorsMap[item.playlists.author_id],
        })) || [],
    };
  },

  async getPlaylistWithTracks(id) {
    const { data: playlistData, error: playlistError } = await supabase
      .from("playlists")
      .select(`
        id,
        title,
        description,
        avatar_url,
        likes_count,
        track_count,
        total_duration,
        created_at,
        author_id,
        tags,
        playlist_url,
        platform
      `)
      .eq("id", id)
      .single();

    if (playlistError) throw playlistError;
    if (!playlistData) throw new Error("Плейлист не найден");

    let authorData = { username: "Неизвестный пользователь", avatar_url: null };

    if (playlistData.author_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", playlistData.author_id)
        .single();

      if (profileData) {
        authorData = profileData;
      }
    }

    const { data: tracksData } = await supabase
      .from("playlist_tracks")
      .select(`position, tracks (*)`)
      .eq("playlist_id", id)
      .order("position");

    return {
      ...playlistData,
      author: authorData,
      tracks:
        tracksData?.map((item) => ({
          track: {
            ...item.tracks,
            cover: item.tracks.artwork_url,
            durationMs: item.tracks.duration * 1000,
            artists: [{ name: item.tracks.artist }],
            albums: item.tracks.album ? [{ title: item.tracks.album }] : [],
          },
        })) || [],
    };
  },

  async deletePlaylist(id) {
    const { error } = await supabase.from("playlists").delete().eq("id", id);

    if (error) throw error;
  },
};
