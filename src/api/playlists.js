import supabase from "../helper/supabaseClient";

export const playlistsApi = {
  async getRecentPlaylists(limit = 5) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    return this.enrichPlaylistsWithLikes(data, user?.id);
  },

  async getPopularPlaylists(limit = 5) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    return this.enrichPlaylistsWithLikes(data, user?.id);
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

  async getUserPlaylists(userId, limit = null) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const query = supabase
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

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return this.enrichPlaylistsWithLikes(data, user?.id);
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

  async updatePlaylist(playlistId, playlistData) {
    const { title, description, cover, tags, tracks } = playlistData;

    const { data: updatedPlaylist, error: playlistError } = await supabase
      .from("playlists")
      .update({
        title,
        description: description || "",
        avatar_url: cover || null,
        tags: tags.length > 0 ? tags : null,
        updated_at: new Date().toISOString(),
        track_count: tracks.length,
      })
      .eq("id", playlistId)
      .select()
      .single();

    if (playlistError) throw playlistError;

    await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", playlistId);

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
          track.platform === "soundcloud"
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
            platform: track.platform,
          })
          .select()
          .single();

        if (trackError) throw trackError;
        trackId = insertedTrack.id;
      }

      return supabase.from("playlist_tracks").insert({
        playlist_id: playlistId,
        track_id: trackId,
        position: index + 1,
      });
    });

    await Promise.all(trackPromises);
    return updatedPlaylist;
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
    const enrichedCreated = await this.enrichPlaylistsWithLikes(
      created || [],
      userId
    );

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
    const likedPlaylists =
      liked?.map((item) => ({
        ...item.playlists,
        is_liked: true,
      })) || [];

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
      created: enrichedCreated.map((playlist) => ({
        ...playlist,
        author: authorsMap[playlist.author_id],
      })),
      liked: likedPlaylists.map((playlist) => ({
        ...playlist,
        author: authorsMap[playlist.author_id],
      })),
    };
  },

  async getPlaylistWithTracks(id) {
    const { data: playlistData, error: playlistError } = await supabase
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
        tags,
        playlist_url,
        platform
      `
      )
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

 async togglePlaylistLike(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Используем RPC функцию для атомарной операции
  const { data, error } = await supabase.rpc('toggle_playlist_like_atomic', {
    p_playlist_id: id
  });

  if (error) {
    console.error('Toggle like error:', error);
    throw error;
  }

  return {
    likes_count: data[0].likes_count,
    is_liked: data[0].is_liked,
  };
},

  async enrichPlaylistsWithLikes(playlists, userId) {
    if (!userId || !playlists.length) return playlists;

    const { data: likes } = await supabase
      .from("playlist_likes")
      .select("playlist_id")
      .eq("user_id", userId)
      .in(
        "playlist_id",
        playlists.map((p) => p.id)
      );

    const likedPlaylistIds = new Set(
      likes?.map((like) => like.playlist_id) || []
    );

    return playlists.map((playlist) => ({
      ...playlist,
      is_liked: likedPlaylistIds.has(playlist.id),
    }));
  },
};
