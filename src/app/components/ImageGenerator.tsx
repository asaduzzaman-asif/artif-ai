"use client";

import { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageType, setImageType] = useState("text-to-image");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setGeneratedImage(null);

    try {
      let imageBase64 = null;

      // যদি ইউজার ছবি সিলেক্ট করে থাকে, তবে সেটিকে Base64-এ কনভার্ট করব
      if (selectedFile && imageType === "poster") {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, imageType, imageBase64 }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 mt-8 mb-16">
      <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex space-x-4 mb-6 border-b border-slate-700 pb-4">
          <button
            type="button"
            onClick={() => {
              setImageType("text-to-image");
              setSelectedFile(null); // ট্যাব চেঞ্জ করলে ফাইল ক্লিয়ার হবে
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              imageType === "text-to-image"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white bg-slate-800"
            }`}
          >
            ✨ Text to Image
          </button>
          <button
            type="button"
            onClick={() => setImageType("poster")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              imageType === "poster"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white bg-slate-800"
            }`}
          >
            🖼️ Social Media Poster
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enter your prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={imageType === "poster" ? "e.g., A promotional poster for a luxury coffee brand..." : "e.g., A futuristic cyberpunk city at night..."}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {imageType === "poster" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload Sample / Reference Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Generating Magic (AI is working)..." : "Generate AI Image 🚀"}
          </button>
        </form>
      </div>

      {(loading || generatedImage) && (
        <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl text-center">
          <h3 className="text-xl font-bold mb-4 text-slate-200">
            {loading ? "Creating your masterpiece..." : "Generated Output ✨"}
          </h3>

          {loading ? (
            <div className="w-full h-80 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-slate-400 text-sm">Please wait while Artif AI renders your image...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-xl border border-slate-700 shadow-2xl">
                <img
                  src={generatedImage!}
                  alt="Generated AI Art"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex justify-center gap-4 pt-2">
                <a
                  href={generatedImage!}
                  download="artif-ai-image.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
                >
                  Download Image 📥
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}