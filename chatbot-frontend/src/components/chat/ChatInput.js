"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, X } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // { base64, mimeType, previewUrl }
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage({
        base64: e.target.result,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        processFile(file);
        break;
      }
    }
  };

  const removeImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || disabled) return;

    onSend(
      input.trim() || "What is in this image?",
      selectedImage ? selectedImage.base64 : null,
      selectedImage ? selectedImage.mimeType : null
    );

    setInput("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-[#f0f4f9] dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700/80 rounded-2xl p-2 focus-within:border-blue-500 dark:focus-within:border-neutral-500 shadow-xs transition-colors"
      >
        {/* Selected Image Thumbnail */}
        {selectedImage && (
          <div className="relative inline-block m-2 w-20 h-20 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 group shadow-xs">
            <img
              src={selectedImage.previewUrl}
              alt="attachment preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-end w-full">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => processFile(e.target.files?.[0])}
          />

          {/* Attachment Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Attach image or paste screenshot"
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/50 rounded-xl transition-colors shrink-0 mb-0.5"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              selectedImage
                ? "Ask something about this image..."
                : "Ask Chatbot or paste screenshot..."
            }
            disabled={disabled}
            className="w-full bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 px-3 py-1.5 focus:outline-none resize-none max-h-48 overflow-y-auto"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || disabled}
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 disabled:opacity-30 disabled:hover:bg-blue-600 dark:disabled:hover:bg-neutral-100 transition-opacity shrink-0 mb-0.5 shadow-2xs"
          >
            <ArrowUp className="w-4 h-4 font-bold" />
          </button>
        </div>
      </form>

      <div className="text-[11px] text-center text-neutral-500 dark:text-neutral-400 mt-2">
        Chatbot can make mistakes. Consider checking important information.
      </div>
    </div>
  );
}