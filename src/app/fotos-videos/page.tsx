'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, Permissions } from '@/lib/authorization';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import { FixedBackgroundLayout } from '@/components/layout/FixedBackgroundLayout';
import { useDivineParsing } from '@/components/language/useDivineLanguage';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/dashboard-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  RotateCcw,
  Crop,
  AlertTriangle,
} from 'lucide-react';

type Video = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

type Photo = {
  id: string;
  title?: string;
  description?: string;
  url: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

export default function FotosVideosPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const { t } = useDivineParsing(['common']);
  const [videos, setVideos] = useState<Video[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [urlEditModal, setUrlEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [photoEditModal, setPhotoEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUploadModal, setVideoUploadModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [videosResponse, photosResponse] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/photos'),
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }

      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setPhotos(photosData.photos || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Video editing logic
  const handleVideoUrlEdit = (video: Video) => {
    setEditingVideo(video);
    setUrlEditModal(true);
  };

  const handleVideoUrlSave = async () => {
    if (editingVideo) {
      try {
        const response = await fetch(`/api/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editingVideo.title,
            url: editingVideo.url,
          }),
        });

        if (response.ok) {
          const updatedVideo = await response.json();
          setVideos(
            videos.map(v => (v.id === editingVideo.id ? updatedVideo.video : v))
          );
          setUrlEditModal(false);
          setEditingVideo(null);
        }
      } catch (error) {
        console.error('Error updating video:', error);
      }
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    try {
      // First upload files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();

        // Then create photo records
        for (const file of uploadResult.files) {
          const photoResponse = await fetch('/api/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: file.originalName,
              url: file.url,
            }),
          });

          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            setPhotos(prev => [photoData.photo, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
  };

  const handlePhotoEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setPhotoEditModal(true);
  };

  const handlePhotoEditSave = async () => {
    if (editingPhoto) {
      try {
        const response = await fetch(`/api/photos/${editingPhoto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editingPhoto.title,
            description: editingPhoto.description,
          }),
        });

        if (response.ok) {
          const updatedPhoto = await response.json();
          setPhotos(
            photos.map(p => (p.id === editingPhoto.id ? updatedPhoto.photo : p))
          );
          setPhotoEditModal(false);
          setEditingPhoto(null);
        }
      } catch (error) {
        console.error('Error updating photo:', error);
      }
    }
  };

  const handlePhotoRemove = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo.id !== photoId));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleVideoUpload = async (title: string, url: string) => {
    setIsUploadingVideo(true);
    try {
      console.log('Sending video upload request:', { title, url });

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          url,
        }),
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const videoData = await response.json();
        console.log('Video upload response:', videoData);
        setVideos(prev => [videoData.video, ...prev]);
        alert(t('photos.video_upload_success', 'common'));
      } else {
        const errorData = await response.json();
        console.error('Video upload failed:', errorData);
        alert(
          `Error uploading video: ${errorData.error?.message || errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error uploading video:', error);
        alert(t('photos.video_upload_error', 'common'));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg8.jpg"
      overlayType="gradient"
      responsivePositioning="default"
      pageTransitionProps={{
        skeletonType: 'fotos-videos',
        duration: 700,
        enableProgressiveAnimation: true,
      }}
    >
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-4xl font-bold text-white mb-6 drop-shadow-lg transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }"
        >
          {t('photos.title', 'common')}
        </h1>

        {loading ? (
          <SkeletonLoader variant="list" lines={8} />
        ) : (
          <>
            {/* Admin Controls */}
            {isAdmin ? (
              <div
                className="flex gap-4 mb-8 transition-all duration-700 ease-out delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default">
                      {t('buttons.new_component', 'common')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-sm border-white/20 shadow-lg rounded-lg">
                    <DropdownMenuItem
                      onClick={() => {
                        setUploadType('photo');
                        setUploadOpen(true);
                      }}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('photos.add_photo', 'common')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setVideoUploadModal(true)}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('photos.add_video', 'common')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectionMode(!selectionMode)}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('photos.multiple_selection', 'common')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : session?.user ? (
              <div className="mb-8 p-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-100 font-medium">
                    {t('photos.admin_only', 'common')}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Selection Toolbar */}
            {isAdmin && selectionMode && (
              <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">
                      {t('photos.selection_mode', 'common')}:{' '}
                      {selectedVideos.length + selectedPhotos.length}{' '}
                      {t('photos.items_selected', 'common')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVideos([]);
                        setSelectedPhotos([]);
                      }}
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      {t('photos.clear_selection', 'common')}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          // Delete selected videos
                          for (const videoId of selectedVideos) {
                            await fetch(`/api/videos/${videoId}`, {
                              method: 'DELETE',
                            });
                          }

                          // Delete selected photos
                          for (const photoId of selectedPhotos) {
                            await fetch(`/api/photos/${photoId}`, {
                              method: 'DELETE',
                            });
                          }

                          // Update local state
                          setVideos(
                            videos.filter(v => !selectedVideos.includes(v.id))
                          );
                          setPhotos(
                            photos.filter(p => !selectedPhotos.includes(p.id))
                          );
                          setSelectedVideos([]);
                          setSelectedPhotos([]);
                        } catch (error) {
                          console.error('Error deleting items:', error);
                        }
                      }}
                      disabled={
                        selectedVideos.length === 0 &&
                        selectedPhotos.length === 0
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('photos.delete_selected', 'common')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectionMode(false)}
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      {t('photos.exit_selection', 'common')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Videos Grid */}
            <div
              className="mb-10 transition-all duration-700 ease-out delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }"
            >
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">
                {t('photos.featured_videos', 'common')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div key={video.id} className="group relative flex flex-col">
                    <div className="aspect-video rounded-lg overflow-hidden mb-2 shadow-lg relative">
                      {selectionMode && isAdmin && (
                        <div className="absolute top-2 left-2 z-10">
                          <label
                            htmlFor={`video-${video.id}`}
                            className="sr-only"
                          >
                            Seleccionar video: {video.title}
                          </label>
                          <input
                            id={`video-${video.id}`}
                            type="checkbox"
                            checked={selectedVideos.includes(video.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedVideos([
                                  ...selectedVideos,
                                  video.id,
                                ]);
                              } else {
                                setSelectedVideos(
                                  selectedVideos.filter(id => id !== video.id)
                                );
                              }
                            }}
                            className="w-5 h-5 rounded border-2 border-white/50 bg-white/20 checked:bg-blue-500 checked:border-blue-500 transition-all duration-150"
                          />
                        </div>
                      )}
                      <iframe
                        src={video.url}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full rounded-lg transition-transform duration-150 group-hover:scale-[1.02] video-iframe"
                      ></iframe>
                      {isAdmin && !selectionMode && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                aria-label={t(
                                  'buttons.video_options',
                                  'common'
                                )}
                                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-150 hover:scale-110"
                              >
                                <MoreVertical className="h-4 w-4 text-white" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-sm border-white/20 shadow-lg rounded-lg">
                              <DropdownMenuItem
                                onClick={() => handleVideoUrlEdit(video)}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t('photos.edit_url', 'common')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `/api/videos/${video.id}`,
                                      {
                                        method: 'DELETE',
                                      }
                                    );
                                    if (response.ok) {
                                      setVideos(
                                        videos.filter(v => v.id !== video.id)
                                      );
                                    }
                                  } catch (error) {
                                    console.error(
                                      'Error deleting video:',
                                      error
                                    );
                                  }
                                }}
                                className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('photos.remove', 'common')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-base font-medium text-white drop-shadow-sm">
                      {video.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Grid */}
            <div
              className="transition-all duration-700 ease-out delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }"
            >
              <p className="text-xl text-white/90 mb-8 drop-shadow-sm">
                {t('photos.community_moments', 'common')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.length === 0
                  ? [1, 2, 3, 4, 5, 6].map(item => (
                      <div key={item} className="group relative flex flex-col">
                        <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-lg mb-2 shadow-lg overflow-hidden border border-white/20 relative">
                          {selectionMode && isAdmin && (
                            <div className="absolute top-2 left-2 z-10">
                              <label
                                htmlFor={`placeholder-${item}`}
                                className="sr-only"
                              >
                                {t('photos.select_activity', 'common')} {item}
                              </label>
                              <input
                                id={`placeholder-${item}`}
                                type="checkbox"
                                checked={selectedPhotos.includes(
                                  `placeholder-${item}`
                                )}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedPhotos([
                                      ...selectedPhotos,
                                      `placeholder-${item}`,
                                    ]);
                                  } else {
                                    setSelectedPhotos(
                                      selectedPhotos.filter(
                                        id => id !== `placeholder-${item}`
                                      )
                                    );
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-white/50 bg-white/20 checked:bg-blue-500 checked:border-blue-500 transition-all duration-150"
                              />
                            </div>
                          )}
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📸</div>
                              <span className="text-white/80 text-sm">
                                {t('photos.photo_title', 'common')} {item}
                              </span>
                            </div>
                          </div>
                          {isAdmin && !selectionMode && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    aria-label={t(
                                      'buttons.upload_photo',
                                      'common'
                                    )}
                                    className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-150 hover:scale-110"
                                  >
                                    <MoreVertical className="h-4 w-4 text-white" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-sm border-white/20 shadow-lg rounded-lg">
                                  <DropdownMenuItem
                                    onClick={() => setUploadOpen(true)}
                                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {t('photos.upload', 'common')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1 drop-shadow-sm">
                          {t('photos.activity_title', 'common')} {item}
                        </h3>
                        <p className="text-sm text-white/80">
                          {t('photos.activity_description', 'common')}
                        </p>
                      </div>
                    ))
                  : photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="group relative flex flex-col"
                      >
                        <div className="aspect-video rounded-lg mb-2 shadow-lg overflow-hidden relative">
                          {selectionMode && isAdmin && (
                            <div className="absolute top-2 left-2 z-10">
                              <label
                                htmlFor={`photo-${photo.id}`}
                                className="sr-only"
                              >
                                {t('photos.select_photo', 'common')}{' '}
                                {photo.title ||
                                  `${t('photos.photo_title', 'common')} ${idx + 1}`}
                              </label>
                              <input
                                id={`photo-${photo.id}`}
                                type="checkbox"
                                checked={selectedPhotos.includes(photo.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedPhotos([
                                      ...selectedPhotos,
                                      photo.id,
                                    ]);
                                  } else {
                                    setSelectedPhotos(
                                      selectedPhotos.filter(
                                        id => id !== photo.id
                                      )
                                    );
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-white/50 bg-white/20 checked:bg-blue-500 checked:border-blue-500 transition-all duration-150"
                              />
                            </div>
                          )}
                          <Image
                            src={photo.url}
                            alt={photo.title || `Foto ${idx + 1}`}
                            fill
                            className="object-cover rounded-lg transition-transform duration-150 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {isAdmin && !selectionMode && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    aria-label={t(
                                      'buttons.photo_options',
                                      'common'
                                    )}
                                    className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-150 hover:scale-110"
                                  >
                                    <MoreVertical className="h-4 w-4 text-white" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-sm border-white/20 shadow-lg rounded-lg">
                                  <DropdownMenuItem
                                    onClick={() => handlePhotoEdit(photo)}
                                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t('common.edit', 'common')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handlePhotoRemove(photo.id)}
                                    className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('photos.remove', 'common')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1 drop-shadow-sm">
                          {photo.title || `Foto ${idx + 1}`}
                        </h3>
                        <p className="text-sm text-white/80">
                          {photo.description ||
                            'Descripción de la actividad y fecha correspondiente.'}
                        </p>
                      </div>
                    ))}
              </div>
            </div>
          </>
        )}

        {/* Vercel-style URL Edit Modal */}
        <Dialog open={urlEditModal} onOpenChange={setUrlEditModal}>
          <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl border-0 p-0 overflow-hidden">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {t('photos.edit_url', 'common')}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.video_title', 'common')}
                  </label>
                  <Input
                    value={editingVideo?.title || ''}
                    onChange={e =>
                      setEditingVideo(
                        editingVideo
                          ? { ...editingVideo, title: e.target.value }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    placeholder={t('forms.title_video.placeholder', 'common')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.youtube_vimeo_url', 'common')}
                  </label>
                  <Input
                    value={editingVideo?.url || ''}
                    onChange={e =>
                      setEditingVideo(
                        editingVideo
                          ? { ...editingVideo, url: e.target.value }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    placeholder="{t('forms.video_url.placeholder', 'common')}"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setUrlEditModal(false);
                      setEditingVideo(null);
                    }}
                    variant="outline"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
                  >
                    {t('common.cancel', 'common')}
                  </Button>
                  <Button
                    onClick={handleVideoUrlSave}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150"
                  >
                    {t('photos.save_changes', 'common')}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Photos Dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('buttons.upload_photo', 'common')}s</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload
                onFilesChange={async files => {
                  await handlePhotoUpload(files);
                  setUploadOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Upload Dialog */}
        <Dialog open={videoUploadModal} onOpenChange={setVideoUploadModal}>
          <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl border-0 p-0 overflow-hidden">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {t('photos.add_video', 'common')}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.video_title_label', 'common')}
                  </label>
                  <Input
                    value={newVideoTitle}
                    onChange={e => setNewVideoTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    placeholder={t('forms.title_video.placeholder', 'common')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.video_url_label', 'common')}
                  </label>
                  <Input
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    placeholder="{t('forms.video_url.placeholder', 'common')}"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setVideoUploadModal(false);
                      setNewVideoTitle('');
                      setNewVideoUrl('');
                    }}
                    variant="outline"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
                  >
                    {t('common.cancel', 'common')}
                  </Button>
                  <Button
                    onClick={async () => {
                      console.log('Video upload button clicked');
                      console.log('Form data:', {
                        title: newVideoTitle,
                        url: newVideoUrl,
                      });

                      if (newVideoTitle && newVideoUrl) {
                        console.log('Attempting to upload video:', {
                          title: newVideoTitle,
                          url: newVideoUrl,
                        });
                        await handleVideoUpload(newVideoTitle, newVideoUrl);
                        setVideoUploadModal(false);
                        setNewVideoTitle('');
                        setNewVideoUrl('');
                      } else {
                        console.log('Form validation failed:', {
                          title: newVideoTitle,
                          url: newVideoUrl,
                        });
                        alert(t('photos.form_validation_error', 'common'));
                      }
                    }}
                    disabled={
                      !newVideoTitle || !newVideoUrl || isUploadingVideo
                    }
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150"
                  >
                    {isUploadingVideo ? t('photos.uploading', 'common') : t('photos.add_video', 'common')}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Photo Edit Modal */}
        <Dialog open={photoEditModal} onOpenChange={setPhotoEditModal}>
          <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl border-0 p-0 overflow-hidden">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {t('photos.edit_photo', 'common')}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.photo_title', 'common')}
                  </label>
                  <Input
                    value={editingPhoto?.title || ''}
                    onChange={e =>
                      setEditingPhoto(
                        editingPhoto
                          ? { ...editingPhoto, title: e.target.value }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    placeholder={t('forms.title_photo.placeholder', 'common')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('photos.photo_description', 'common')}
                  </label>
                  <textarea
                    value={editingPhoto?.description || ''}
                    onChange={e =>
                      setEditingPhoto(
                        editingPhoto
                          ? { ...editingPhoto, description: e.target.value }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 resize-none"
                    placeholder={t('forms.description_photo.placeholder', 'common')}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setPhotoEditModal(false);
                      setEditingPhoto(null);
                    }}
                    variant="outline"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-150"
                  >
                    {t('common.cancel', 'common')}
                  </Button>
                  <Button
                    onClick={handlePhotoEditSave}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150"
                  >
                    {t('photos.save_changes', 'common')}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FixedBackgroundLayout>
  );
}
