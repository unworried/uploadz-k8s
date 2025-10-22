import ImageCard from "./ImageCard";

export default function Gallery({ images, loading, onImageClick }) {
    if (loading) {
        return <div className="text-center py-20 text-gray-400">Loading...</div>
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No images exist, it's lonely here :(</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
                <ImageCard key={image.id} image={image} onClick={() => onImageClick(image.id)} />
            ))}
        </div>
    );
}