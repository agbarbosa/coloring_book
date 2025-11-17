import React, { useState, useCallback } from 'react';
import { generateColoringPage } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import { ChatWidget } from './components/ChatWidget';
import './types';
import { ImageIcon, DownloadIcon } from './components/icons';

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center p-8 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-blue-800">{message}</p>
        <p className="text-sm text-blue-600">Please wait, magic is happening...</p>
    </div>
);

const App: React.FC = () => {
    const [theme, setTheme] = useState('');
    const [childName, setChildName] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!theme || !childName) {
            setError('Please provide both a theme and a name!');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setCoverImage(null);

        try {
            setLoadingMessage('Crafting a magical cover page...');
            const coverPrompt = `A delightful coloring book cover page with the title 'Coloring Fun for ${childName}'. The theme is '${theme}'. The style should be simple, with thick black lines, no color, perfect for a child to color.`;
            const cover = await generateColoringPage(coverPrompt);
            setCoverImage(cover);

            const pages: string[] = [];
            for (let i = 0; i < 5; i++) {
                setLoadingMessage(`Drawing page ${i + 1} of 5...`);
                const pagePrompt = `A simple coloring book page for a child. The theme is '${theme}'. The style is clean with very thick black outlines, no color, and lots of space to color in. Page ${i + 1}.`;
                const pageImage = await generateColoringPage(pagePrompt);
                pages.push(pageImage);
                setGeneratedImages([...pages]);
            }
            setLoadingMessage('Your coloring book is ready!');
        } catch (err) {
            console.error(err);
            setError('Oh no! Something went wrong while creating the images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [theme, childName]);

    const handleDownload = () => {
        if (coverImage && generatedImages.length === 5) {
            generatePdf(coverImage, generatedImages, childName, theme);
        } else {
            setError("Cannot download PDF. Not all images have been generated.");
        }
    };
    
    return (
        <div className="bg-amber-50 min-h-screen font-sans text-gray-800">
            <main className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-rose-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                        My Coloring Book Creator
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Create a personalized coloring book for your little one!
                    </p>
                </header>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="theme" className="block text-lg font-medium text-gray-700 mb-2">
                                What's the theme?
                            </label>
                            <input
                                id="theme"
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="e.g., Space Dinosaurs"
                                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-400"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="childName" className="block text-lg font-medium text-gray-700 mb-2">
                                What's the child's name?
                            </label>
                            <input
                                id="childName"
                                type="text"
                                value={childName}
                                onChange={(e) => setChildName(e.target.value)}
                                placeholder="e.g., Lily"
                                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-400"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-rose-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-rose-600 disabled:bg-gray-400 transition-transform transform hover:scale-105 flex items-center justify-center text-xl"
                        >
                            <ImageIcon className="w-6 h-6 mr-3" />
                            {isLoading ? 'Creating...' : 'Generate My Book!'}
                        </button>
                    </div>

                    {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                </div>
                
                <div className="mt-12 max-w-5xl mx-auto">
                    {isLoading && <LoadingState message={loadingMessage} />}
                    
                    {(coverImage || generatedImages.length > 0) && (
                        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
                            <h2 className="text-3xl font-bold text-center mb-6 text-rose-500">Your Coloring Pages</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {coverImage && (
                                    <div className="border-4 border-rose-200 rounded-lg p-2 bg-rose-50 shadow-md">
                                        <img src={`data:image/jpeg;base64,${coverImage}`} alt="Coloring book cover" className="w-full h-auto rounded"/>
                                        <p className="text-center font-semibold mt-2">Cover Page</p>
                                    </div>
                                )}
                                {generatedImages.map((img, index) => (
                                    <div key={index} className="border-4 border-blue-200 rounded-lg p-2 bg-blue-50 shadow-md">
                                        <img src={`data:image/jpeg;base64,${img}`} alt={`Coloring page ${index + 1}`} className="w-full h-auto rounded"/>
                                        <p className="text-center font-semibold mt-2">Page {index + 1}</p>
                                    </div>
                                ))}
                            </div>

                             {!isLoading && generatedImages.length === 5 && (
                                <div className="text-center mt-10">
                                    <button
                                        onClick={handleDownload}
                                        className="bg-green-500 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 flex items-center justify-center text-xl mx-auto"
                                    >
                                        <DownloadIcon className="w-6 h-6 mr-3" />
                                        Download PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <ChatWidget />
        </div>
    );
};

export default App;