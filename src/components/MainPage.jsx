import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const MainPage = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "settings", "main"); // Adjust if needed
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBackgroundImage(data.backgroundImageURL || "");
          setSongs(data.songs || []);
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
      className="min-h-screen w-full flex flex-col items-center justify-center bg-fixed relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Optional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />

      {/* Main content container */}
      <div className="relative z-10 max-w-4xl w-full px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-center text-white drop-shadow-lg">
        Ma Musique
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : songs.length > 0 ? (
          <div className="grid gap-6">
            {songs.map((song, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {song.title}
                    </h2>
                    {/* If you have other properties like artist or duration */}
                    {song.artist && (
                      <p className="text-sm text-gray-200">
                        Artist: {song.artist}
                      </p>
                    )}
                    {song.duration && (
                      <p className="text-sm text-gray-200">
                        Duration: {song.duration}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <audio controls className="w-full">
                      <source src={song.songURL} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-8">
            <p className="text-xl text-white">No songs available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
