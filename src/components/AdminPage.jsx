import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

const AdminPage = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [pageTitle, setPageTitle] = useState("Ma Musique");

  // Each song: { title: string, songURL: string, tempFile?: File }
  const [songs, setSongs] = useState([{ title: "", songURL: "" }]);

  // Fetch Firestore data on mount
  const handleFetchData = async () => {
    try {
      const docRef = doc(db, "settings", "main");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBackgroundImage(data.backgroundImageURL || "");
        setPageTitle(data.pageTitle || "Ma Musique");
        // Make sure each song has "title" and "songURL".
        // We won't load any "tempFile" from Firestore, since that's only local.
        if (data.songs) {
          setSongs(
            data.songs.map((song) => ({
              title: song.title || "",
              songURL: song.songURL || "",
              tempFile: null, // no file loaded from Firestore
            }))
          );
        } else {
          setSongs([{ title: "", songURL: "", tempFile: null }]);
        }
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  // Here, we just store the File in state (tempFile) but do NOT upload yet.
  const handleSongFileChange = (file, index) => {
    const updatedSongs = [...songs];
    // Store the file in the "tempFile" key, so we know we need to upload it later
    updatedSongs[index].tempFile = file;
    setSongs(updatedSongs);
  };

  // ================ SAVE CHANGES ================
  // Upload only when the admin hits "Save All Changes".
  const handleSave = async () => {
    try {
      // 1. Upload background image if there's a new file
      let updatedBackgroundURL = backgroundImage; // default to existing
      if (backgroundFile) {
        const imageRef = ref(storage, `background/${backgroundFile.name}`);
        await uploadBytes(imageRef, backgroundFile);
        updatedBackgroundURL = await getDownloadURL(imageRef);
      }

      // 2. Upload new audio files for songs (if tempFile exists)
      const updatedSongs = await Promise.all(
        songs.map(async (song) => {
          // If there's a new file, upload it; otherwise keep old URL
          if (song.tempFile) {
            const songRef = ref(storage, `songs/${song.tempFile.name}`);
            await uploadBytes(songRef, song.tempFile);
            const newSongURL = await getDownloadURL(songRef);
            return {
              title: song.title,
              songURL: newSongURL,
            };
          } else {
            // No new file -> keep existing URL
            return {
              title: song.title,
              songURL: song.songURL,
            };
          }
        })
      );

      // 3. Update Firestore
      const docRef = doc(db, "settings", "main");
      await updateDoc(docRef, {
        backgroundImageURL: updatedBackgroundURL,
        songs: updatedSongs,
        pageTitle: pageTitle,
      });

      // 4. Update local states after successful upload
      setBackgroundImage(updatedBackgroundURL);
      setSongs(
        updatedSongs.map((s) => ({
          ...s,
          tempFile: null, // Clear out temp files
        }))
      );
      setBackgroundFile(null);

      alert("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleAddSong = () => {
    if (songs.length < 5) {
      setSongs([...songs, { title: "", songURL: "", tempFile: null }]);
    } else {
      alert("Maximum 5 songs allowed");
    }
  };

  const handleRemoveSong = (index) => {
    const updatedSongs = [...songs];
    updatedSongs.splice(index, 1);
    setSongs(updatedSongs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Content Management
          </h1>
          <p className="text-gray-600 mt-1">
            Customize your website's media content
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Add Page Title Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Page Title</h2>
            <p className="text-gray-500 text-sm">Set your page's main title</p>
          </div>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter page title"
          />
        </div>

        {/* Background Image Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Background Image
              </h2>
              <p className="text-gray-500 text-sm">
                Recommended: 1920x1080px, max 5MB
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBackgroundFile(e.target.files[0] || null)}
                className="hidden"
                id="background-upload"
              />
              <label
                htmlFor="background-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Choose Image
              </label>
            </div>
          </div>

          {backgroundImage && (
            <div className="relative rounded-lg overflow-hidden border bg-gray-50">
              <img
                src={backgroundImage}
                alt="Background Preview"
                className="w-full h-64 object-cover"
              />
              {backgroundFile && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 text-sm">
                  New image selected: {backgroundFile.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Songs Management Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Music Library
              </h2>
              <p className="text-gray-500 text-sm">
                Manage your playlist (max 5 songs)
              </p>
            </div>
            {songs.length < 5 && (
              <button
                onClick={handleAddSong}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Song
              </button>
            )}
          </div>

          <div className="space-y-4">
            {songs.map((song, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 transition-all hover:shadow-md relative group"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRemoveSong(index)}
                    className="p-2 hover:bg-red-50 rounded-full text-red-500"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Song Title
                      <input
                        type="text"
                        value={song.title}
                        onChange={(e) => {
                          const updatedSongs = [...songs];
                          updatedSongs[index].title = e.target.value;
                          setSongs(updatedSongs);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter song title"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Audio File
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          handleSongFileChange(e.target.files[0], index)
                        }
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                    </label>
                  </div>
                </div>

                {/* Audio Preview */}
                {(song.songURL || song.tempFile) && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    {song.songURL && !song.tempFile && (
                      <audio className="w-full" controls src={song.songURL}>
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {song.tempFile && (
                      <div className="flex items-center text-sm text-indigo-600">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        New file selected: {song.tempFile.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
