"use client";

import { useState, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageType: imageFile ? "poster" : "text-to-image",
          imageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImage(data.imageUrl);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Transform Ideas into <span className="text-indigo-500">Visual Magic</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload a basic image, write a prompt, and let our AI generate a professional social media poster for you in seconds.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Your Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A futuristic cyberpunk city with neon lights..."
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Reference Image (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/50 rounded-xl p-6 text-center cursor-pointer transition-all"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="text-slate-400 py-4">
                      <p>Click to upload an image</p>
                      <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {previewUrl && (
                  <button 
                    onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {isLoaded && isSignedIn ? (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isGenerating || !prompt
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30"
                  }`}
                >
                  {isGenerating ? "Generating Magic..." : "Generate Image 🚀"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30">
                    Sign in to Generate
                  </button>
                </SignInButton>
              )}

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-800/50 border border-slate-700 rounded-xl min-h-[400px] p-4 relative overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-400 font-medium animate-pulse">Creating your masterpiece...</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full flex flex-col items-center space-y-4">
                  <div className="relative w-full h-full min-h-[350px] rounded-lg overflow-hidden shadow-2xl">
                    <Image src={generatedImage} alt="Generated Art" fill className="object-contain" />
                  </div>
                  <a 
                    href={generatedImage} 
                    download="ArtifAI-Result.jpg"
                    target="_blank"
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Download / View Full
                  </a>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <span className="text-4xl mb-2 block">✨</span>
                  <p>Your generated image will appear here</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}