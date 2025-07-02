import React, { useRef } from 'react';

function ImageUpload({ images, setImages }) {
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newImage = {
                        id: Date.now() + Math.random(),
                        file: file,
                        preview: e.target.result,
                        name: file.name
                    };
                    setImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Clear the input
        event.target.value = '';
    };

    const removeImage = (imageId) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = {
                    id: Date.now() + Math.random(),
                    file: file,
                    preview: e.target.result,
                    name: file.name
                };
                setImages(prev => [...prev, newImage]);
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className="p-8 text-center transition-all duration-200 border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-purple-400 hover:bg-purple-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="mb-4 text-gray-400">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <p className="mb-2 font-medium text-gray-600">
                    Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                </p>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {images.map((image) => (
                        <div key={image.id} className="relative group">
                            <div className="w-16 h-16 overflow-hidden bg-gray-100 rounded-lg aspect-square">
                                <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            {/* Remove Button */}
                            <button
                                onClick={() => removeImage(image.id)}
                                className="absolute flex items-center justify-center w-5 h-5 p-1 text-white transition-opacity duration-200 bg-red-500 rounded-full opacity-0 -top-1 -right-1 group-hover:opacity-100 hover:bg-red-600"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {/* Image Name */}
                            <p className="mt-1 text-xs text-gray-500 truncate max-w-16">
                                {image.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Stats */}
            {images.length > 0 && (
                <div className="flex items-center justify-between pt-2 text-sm text-gray-500 border-t border-gray-200">
                    <span>{images.length} image{images.length !== 1 ? 's' : ''} selected</span>
                    <button
                        onClick={() => setImages([])}
                        className="font-medium text-red-400 cursor-pointer hover:text-red-500"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;