import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { Camera, X, Plus } from 'lucide-react';

const ProgressAnalytics = () => {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Upload Form State
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [rearFile, setRearFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const measRes = await api.get('/progress/measurements');
      setMeasurements(measRes.data.history || []);
      const photoRes = await api.get('/photos');
      setPhotos(photoRes.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile && !sideFile && !rearFile) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('date', uploadDate);
    if (frontFile) formData.append('front', frontFile);
    if (sideFile) formData.append('side', sideFile);
    if (rearFile) formData.append('rear', rearFile);

    try {
      await api.post('/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsUploadModalOpen(false);
      setFrontFile(null);
      setSideFile(null);
      setRearFile(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-highlight">Progress Analytics</h2>

      {/* Progress Photo Timeline */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-highlight">Photo Timeline</h3>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Camera size={20} />
            <span>Add Weekly Check-in</span>
          </button>
        </div>
        
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 text-left w-32 sticky left-0 bg-primary z-10 text-highlight">View</th>
                {photos.map((week: any) => (
                  <th key={week._id} className="p-4 text-center min-w-[200px] bg-primary/20 text-highlight border-b border-border">
                    {new Date(week.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Front Row */}
              <tr className="border-t border-border">
                <td className="p-4 font-bold sticky left-0 bg-primary z-10 text-highlight">Front</td>
                {photos.map((week: any) => (
                  <td key={week._id} className="p-4">
                    {week.front ? (
                      <div 
                        className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border shadow-soft"
                        onClick={() => setSelectedPhoto(week.front.url)}
                      >
                        <img src={week.front.url} alt="Front" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-border">
                        No Photo
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Side Row */}
              <tr className="border-t border-border">
                <td className="p-4 font-bold sticky left-0 bg-primary z-10 text-highlight">Side</td>
                {photos.map((week: any) => (
                  <td key={week._id} className="p-4">
                    {week.side ? (
                      <div 
                        className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border shadow-soft"
                        onClick={() => setSelectedPhoto(week.side.url)}
                      >
                        <img src={week.side.url} alt="Side" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-border">
                        No Photo
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rear Row */}
              <tr className="border-t border-border">
                <td className="p-4 font-bold sticky left-0 bg-primary z-10 text-highlight">Rear</td>
                {photos.map((week: any) => (
                  <td key={week._id} className="p-4">
                    {week.rear ? (
                      <div 
                        className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-border shadow-soft"
                        onClick={() => setSelectedPhoto(week.rear.url)}
                      >
                        <img src={week.rear.url} alt="Rear" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-border">
                        No Photo
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          
          {photos.length === 0 && (
            <div className="text-center py-12 text-secondary">
              No progress photos yet. Start your timeline by adding a weekly check-in!
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#292966] rounded-xl p-6 w-full max-w-lg border border-primary shadow-glow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-highlight">Add Weekly Check-in</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-secondary hover:text-highlight">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-secondary">Date</label>
                <input 
                  type="date" 
                  required
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Front Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-center text-secondary">Front</label>
                  <label className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-secondary/50 rounded-lg cursor-pointer hover:border-primary hover:bg-secondary/10 transition-colors">
                    {frontFile ? (
                      <div className="text-xs text-center p-1 break-all text-highlight">{frontFile.name}</div>
                    ) : (
                      <Plus className="text-secondary" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Side Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-center text-secondary">Side</label>
                  <label className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-secondary/50 rounded-lg cursor-pointer hover:border-primary hover:bg-secondary/10 transition-colors">
                    {sideFile ? (
                      <div className="text-xs text-center p-1 break-all text-highlight">{sideFile.name}</div>
                    ) : (
                      <Plus className="text-secondary" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSideFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Rear Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-center text-secondary">Rear</label>
                  <label className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-secondary/50 rounded-lg cursor-pointer hover:border-primary hover:bg-secondary/10 transition-colors">
                    {rearFile ? (
                      <div className="text-xs text-center p-1 break-all text-highlight">{rearFile.name}</div>
                    ) : (
                      <Plus className="text-secondary" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setRearFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploadLoading || (!frontFile && !sideFile && !rearFile)}
                className="w-full btn-primary py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? 'Uploading...' : 'Save Check-in'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enlarge Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <img 
            src={selectedPhoto} 
            alt="Enlarged view" 
            className="max-w-full max-h-screen object-contain rounded-lg shadow-glow"
          />
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalytics;
