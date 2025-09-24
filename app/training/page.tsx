'use client';
import MainLayout from '@/components/layout/MainLayout';
import { Zap, Play } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import ReactPlayer from 'react-player/youtube';

export default function TrainingPage() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const trainingCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Essential basics to set up and start using your POS system',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      videos: [
        {
          title: 'Complete Setup Guide',
          duration: '15:30',
          description: 'Step-by-step setup from account creation to first sale',
          thumbnail: '/images/training/setup-guide.png',
          youtubeId: 'dQw4w9WgXcQ',
          difficulty: 'Beginner',
        },
        {
          title: 'Dashboard Overview',
          duration: '8:45',
          description: 'Navigate your dashboard and understand key metrics',
          thumbnail: '/images/training/dashboard-overview.png',
          youtubeId: 'dQw4w9WgXcQ',
          difficulty: 'Beginner',
        },
        {
          title: 'Product & Inventory Management',
          duration: '12:20',
          description: 'Learn to add products and track your stock in real time',
          thumbnail: '/images/training/inventory.png',
          youtubeId: 'dQw4w9WgXcQ',
          difficulty: 'Beginner',
        },
      ],
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      description: 'Unlock powerful features to grow your business faster',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      videos: [
        {
          title: 'Multi-Store Management',
          duration: '10:10',
          description: 'Manage multiple outlets and track their performance',
          thumbnail: '/images/training/multistore.png',
          youtubeId: 'dQw4w9WgXcQ',
          difficulty: 'Intermediate',
        },
        {
          title: 'Customer Loyalty Programs',
          duration: '9:15',
          description: 'Set up rewards and loyalty for repeat customers',
          thumbnail: '/images/training/loyalty.png',
          youtubeId: 'dQw4w9WgXcQ',
          difficulty: 'Intermediate',
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero / Intro */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              How Our POS Runs
            </h1>
            <p className="text-xl text-gray-600">
              Watch easy-to-follow tutorials and learn how to maximize your
              AndGatePOS system for your business success.
            </p>
          </div>
        </section>

        {/* Tutorials Section */}
        <section id="all-tutorials" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {trainingCategories.map((category) => (
              <div key={category.id} className="mb-20">
                {/* Category Header */}
                <div className={`mb-8 rounded-2xl ${category.bgColor} p-8`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-2xl bg-gradient-to-r ${category.color} p-4 text-white shadow-lg`}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {category.title}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {category.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        {category.videos.length} tutorials available
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.videos.map((video, videoIndex) => (
                    <div
                      key={videoIndex}
                      className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      {playingVideo === video.youtubeId ? (
                        <ReactPlayer
                          url={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                          controls
                          playing
                          width="100%"
                          height="225px"
                        />
                      ) : (
                        <div
                          className="relative cursor-pointer"
                          onClick={() => setPlayingVideo(video.youtubeId)}
                        >
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            width={400}
                            height={225}
                            className="h-48 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="rounded-full bg-white bg-opacity-90 p-4">
                              <Play className={`h-8 w-8 ${category.textColor}`} />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 rounded bg-black bg-opacity-80 px-2 py-1 text-xs font-medium text-white">
                            {video.duration}
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <h4 className="mb-3 text-lg font-bold text-gray-900">
                          {video.title}
                        </h4>
                        <p className="mb-4 text-gray-600">{video.description}</p>
                        <span className="text-sm font-medium text-gray-500">
                          Difficulty: {video.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
