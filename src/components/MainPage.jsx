import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const MainPage = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [songs, setSongs] = useState([]);
  const [pageTitle, setPageTitle] = useState("Ma Musique");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "settings", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBackgroundImage(data.backgroundImageURL || "");
          setSongs(data.songs || []);
          setPageTitle(data.pageTitle || "Ma Musique");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(backgroundImage);
  }, [backgroundImage]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-fixed relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />

      {/* Main content container - made narrower and more compact */}
      <div className="relative z-10 max-w-3xl w-full px-4 py-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-white drop-shadow-lg tracking-wider">
          {pageTitle}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : songs.length > 0 ? (
          <div className="grid gap-4">
            {songs.map((song, index) => (
              <div
                key={index}
                className="bg-black/30 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-black/40 hover:scale-[1.01] border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-medium text-white mb-1 truncate">
                      {song.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      {song.artist && <span>{song.artist}</span>}
                      {song.artist && song.duration && <span>•</span>}
                      {song.duration && <span>{song.duration}</span>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <audio
                      controls
                      className="w-full h-8 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <source src={song.songURL} type="audio/mpeg" />
                    </audio>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <p className="text-lg text-white/80">No songs available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
