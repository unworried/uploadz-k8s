import { useState } from 'react'

import { API } from '../config';

export default function UploadPage({ onSuccess }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (event) => {
        const selected = event.target.files[0];
        if (!selected) return;

        setFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selected);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file || !title.trim()) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("image", file);

        try {
            const res = await fetch(`${API.images}/upload`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert("Upload failed");
            }

        } catch (err) {
            console.error("upload error:", err);
            alert("upload failed");
        }

        setIsUploading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Upload Image</h2>

                <form onSubmit={handleUpload}>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Select Image</label>
                        <input type="file" accept="image/*" onChange={handleFileSelect} required
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded
                                file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        />

                        {preview && (
                            <div className="mb-6">
                                <img src={preview} alt="Preview"
                                    className="w-full rounded-lg max-h-96 object-contain bg-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Title</label>
                        <input type="text" value={title} onChange={(event => setTitle(event.target.value))}
                            placeholder="Title (Required)" required className="w-full bg-gray-700 border border-gray=600
                                rounded-lg px-4 py-2 focus:ring-2 ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <textarea value={description} onChange={(event) => setDescription(event.target.value)}
                            placeholder="Description (Optional)" rows={3} className="w-full bg-gray-700 border
                                border-gray-600 rounded-lg px-4 py-2 focus:ring-2 ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-700
                        disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition"
                    >
                        {isUploading ? "Uploading..." : "Upload Image"}
                    </button>
                </form>
            </div>
        </div>
    );
}