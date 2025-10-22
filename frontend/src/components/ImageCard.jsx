import { Eye, Heart, MessageSquare } from 'lucide-react'

export default function ImageCard({ image, onClick}) {
    return (
        <div onClick={onClick}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2
                ring-blue-500 transition group"
        >
            <div className="aspect-square bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                    src={`data:${image.mime_type};base64,${image.thumbnail_data}`}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                />
            </div>
            <div className="p-3">
                <h3 className="font-semibold truncate">{image.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {image.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {image.comment_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {image.views || 0}
                    </span>
                </div>
            </div>
        </div>
    )
}