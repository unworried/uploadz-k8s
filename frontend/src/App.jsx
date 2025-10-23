import { useState, useEffect } from 'react'
import { Search, X, Upload } from 'lucide-react'

import Gallery from './components/Gallery';
import UploadPage from './components/UploadPage';
import OpenImage from './components/OpenImage';
import { API } from './config';

function App() {
  const urlParams = new URLSearchParams(window.location.search);

  const [mainState, setMainState] = useState(() => {
    return urlParams.get("image") ? "open" : "catalogue"
  });
  const [query, setQuery] = useState(urlParams.get('q') || "");
  const [sort, setSort] = useState(urlParams.get("sort") || "newest");

  const [images, setImages] = useState([]);
  const [curSelection, setCurSelection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const imageId = urlParams.get("image");
    if (imageId) {
      openImage(imageId);
    }
  }, []);

  useEffect(() => {
    if (mainState == "catalogue") {
      fetchCatalogue();
    }
  }, [mainState, sort]);

  useEffect(() => {
    const params = new URLSearchParams
    if (query) params.set('q', query);
    if (sort !== "newest") params.set("sort", sort);
    if (mainState == "open" && curSelection) {
      params.set("image", curSelection.id);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [query, sort, mainState, curSelection]);

  const fetchCatalogue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API.catalogue}?sort=${sort}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error("catalogue fetch error:", err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchCatalogue();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API.catalogue}/search?q=${query}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error("catalogue search error:", err);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setMainState("catalogue");
    setQuery("");
    setSort("newest")
    setCurSelection(null);
    window.history.replaceState({}, "", window.location.pathname);
    fetchCatalogue();
  };

  const openImage = async (imageId) => {
    setLoading(true);

    try {
      const res = await fetch(`${API.images}/${imageId}`)
      const data = await res.json();
      setCurSelection(data.image);
      setMainState("open")
    } catch (err) {
      console.error("image fetch error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-400 transition"
            onClick={handleReset}
          >
            Uploadz
          </h1>

          {mainState === "catalogue" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
              <select value={sort} onChange={(event) => setSort(event.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          )}

          <button onClick={() => setMainState(mainState === "upload" ? "catalogue" : "upload")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            {mainState === "upload" ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {mainState === "upload" ? "Cancel" : "Upload"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {mainState === "catalogue" && <Gallery images={images} loading={loading} onImageClick={openImage} />}
        {mainState === "upload" && <UploadPage onSuccess={() => {setMainState("catalogue");fetchCatalogue();}} />}
        {mainState === "open" && curSelection && (
          <OpenImage image={curSelection} onClose={() => setMainState("catalogue")}
            onDelete={() => {setMainState("catalogue");fetchCatalogue();}}
          />
        )}
      </main>
    </div>
  );
}

export default App
