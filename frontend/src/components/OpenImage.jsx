import { useState, useEffect } from "react";
import { Eye, Heart, MessageSquare, X } from "lucide-react";

import { API } from "../config";

export default function OpenImage({ image, onClose }) {
    const [comments, setComments] = useState([]);
    const [userComment, setUserComment] = useState('');
    const [username, setUsername] = useState('');
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(image.like_count || 0);

    useEffect(() => {
        fetchComments();
    }, [image.id]);

    const fetchComments = async () => {
        try {
            const res = await fetch (`${API.stats}/${image.id}/comments`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (err) {
            console.error("comments fetch error:", err);
        }
    };

    const handleLike = async () => {
        try {
            const method = liked ? "DELETE" : "POST"
            const res = await fetch(`${API.stats}/${image.id}/like`, { method })
            const data = await res.json();

            if (data.success) {
                setLikeCount(data.likeCount);
            }
            setLiked(!liked);
        } catch (err) {
            console.error("like/unlike error:", err);
        }
    };

    const handleAddComment = async () => {
        if (!userComment.trim()) return;

        try {
            const res = await fetch(`${API.stats}/${image.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: username,
                    content: userComment
                })
            });

            if (res.ok) {
                setUserComment("");
                fetchComments();
            }
        } catch (err) {
            console.error("add comment error:", err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={onClose} className="mb-4 text-gray-400 hover:text-white flex items.center gap-2 cursor-pointer">
                <X className="w-4 h-4" /> Back to Catalogue
            </button>

            <div className="grid md:grid-cols2 gap-6">
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <img src={`data:${image.mime_type};base64,${image.image_data}`} alt={image.title}
                        className="w-full"
                    />
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
                            <p className="text-gray-400 text-sm">
                                {new Date(image.uploaded_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {image.description && (
                        <p className="text-gray-300 mb-6">{image.description}</p>
                    )}

                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
                        <button onClick={handleLike} className={`flex items-center gap-2
                            ${liked ? "text-red-500" : "text-gray-400 hover:text-red-500"} transition`}
                        >
                            <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
                            <span>{likeCount}</span>
                        </button>
                        <span className="flex items-center gap-2 text-gray-400">
                            <MessageSquare className="w-5 h-5" />
                            <span>{comments.length}</span>
                        </span>
                        <span className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-5 h-5" />
                            <span>{image.views}</span>
                        </span>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Comments</h3>

                        <form onSubmit={handleAddComment} className="mb-4 space-y-2">
                            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)}
                                placeholder="Username (Optional)" className="w-full bg-gray-700 border border-gray-600
                                    rounded px-3 py-2 text-sm"
                            />
                            <textarea value={userComment} onChange={(event) => setUserComment(event.target.value)}
                                placeholder="Add comment..." rows={2} className="w-full bg-gray-700 border border-gray-600
                                    rounded px-3 py-2 text-sm resize-none" required
                            />
                            <button type="submit" disabled={!userComment.trim()} className="bg-blue-600 hover:bg-blue-700
                                disabled:bg-gray-600 px-4 py-2 rounded text-sm transition"
                            >
                                Post Comment
                            </button>
                        </form>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-sm">No Comments :(</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-700 rounded p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{comment.commenter_name}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}