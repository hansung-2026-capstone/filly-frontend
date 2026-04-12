import { X, Star, Bookmark, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { Portal } from './Portal';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diary: {
    date: string;
    title: string;
    stars: number;
    content: string;
    image: string;
  } | null;
}

interface Archive {
  id: number;
  name: string;
  color: string;
}

export function DiaryModal({ isOpen, onClose, diary }: DiaryModalProps) {
  const [selectedArchive, setSelectedArchive] = useState<number | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isAddingArchive, setIsAddingArchive] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState('');
  const [archives, setArchives] = useState<Archive[]>([
    { id: 1, name: '여행', color: '#ffb3c1' },
    { id: 2, name: '취미생활 달', color: '#b3e5d4' },
    { id: 3, name: '기억성', color: '#ffe599' },
    { id: 4, name: '역졸시스로', color: '#b3d9ff' },
    { id: 5, name: '성장 거름', color: '#e6b3ff' },
  ]);

  if (!isOpen || !diary) return null;

  const selectedArchiveName = archives.find(a => a.id === selectedArchive)?.name;

  const handleBookmarkClick = () => {
    if (selectedArchive) {
      // If already selected, deselect it
      setSelectedArchive(null);
    } else {
      // Open archive selection modal
      setShowArchiveModal(true);
    }
  };

  const handleArchiveSelect = (archiveId: number) => {
    setSelectedArchive(archiveId);
    setShowArchiveModal(false);
  };

  const handleAddArchive = () => {
    if (newArchiveName.trim()) {
      const colors = ['#ffb3c1', '#b3e5d4', '#ffe599', '#b3d9ff', '#e6b3ff', '#ffd4b3', '#d4b3ff'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newId = Math.max(...archives.map(a => a.id)) + 1;
      
      const newArchive = {
        id: newId,
        name: newArchiveName.trim(),
        color: randomColor
      };
      
      setArchives([...archives, newArchive]);
      setSelectedArchive(newId);
      setNewArchiveName('');
      setIsAddingArchive(false);
      setShowArchiveModal(false);
    }
  };

  const handleCancelAdd = () => {
    setNewArchiveName('');
    setIsAddingArchive(false);
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div 
          className="bg-[#faf6ed] rounded-xl w-[480px] max-h-[85vh] shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
            overflow-hidden font-['Nanum_Myeongjo'] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-[rgba(160,140,120,0.12)] flex-shrink-0">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px]">{diary.title}</div>
              <div className="text-[10px] text-[rgba(120,105,85,0.45)] tracking-[0.5px]">{diary.date}</div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
            >
              <X className="w-4 h-4 text-[rgba(100,80,60,0.5)]" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4 px-5 flex flex-col gap-3 overflow-y-auto flex-1">
            {/* Rating stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < diary.stars 
                      ? 'fill-[rgba(230,190,60,0.85)] stroke-[rgba(200,160,40,0.7)]' 
                      : 'fill-none stroke-[rgba(200,180,120,0.4)]'
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>

            {/* Image */}
            {diary.image && (
              <img
                src={diary.image}
                alt={diary.title}
                className="w-full h-52 rounded-lg object-cover shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                  border border-[rgba(220,210,195,0.5)]"
              />
            )}

            {/* Content */}
            <div className="py-3.5 px-4 bg-[rgba(200,140,130,0.1)] rounded-lg
              text-xs text-[rgba(55,40,25,0.75)] leading-[1.8] min-h-[120px]"
            >
              {diary.content}
            </div>

            {/* Archive info if selected */}
            {selectedArchive && (
              <div className="flex items-center gap-2 py-2 px-3 bg-[rgba(160,140,120,0.08)] rounded-lg">
                <Bookmark className="w-3.5 h-3.5 text-[rgba(80,60,40,0.5)]" />
                <span className="text-[11px] text-[rgba(60,45,30,0.7)]">
                  아카이브: {selectedArchiveName}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center py-3.5 px-5 border-t border-[rgba(160,140,120,0.12)] flex-shrink-0">
            <button
              onClick={handleBookmarkClick}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer
                transition-all duration-200 ${
                  selectedArchive 
                    ? 'bg-[rgba(80,60,40,0.12)] hover:bg-[rgba(80,60,40,0.18)]' 
                    : 'bg-[rgba(160,140,120,0.08)] hover:bg-[rgba(160,140,120,0.15)]'
                }`}
              title={selectedArchive ? '아카이브에서 제거' : '아카이브에 추가'}
            >
              <Bookmark 
                className={`w-5 h-5 transition-all duration-200 ${
                  selectedArchive 
                    ? 'fill-[rgba(80,60,40,0.6)] stroke-[rgba(80,60,40,0.6)]' 
                    : 'fill-none stroke-[rgba(100,80,60,0.5)]'
                }`}
                strokeWidth={1.8}
              />
            </button>

            <div className="flex gap-2">
              <button
                className="py-2 px-4 border border-[rgba(160,140,120,0.2)] bg-transparent rounded-md
                  cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-[rgba(80,60,40,0.6)]
                  transition-all duration-150 hover:bg-[rgba(160,140,120,0.08)]"
              >
                수정
              </button>
              <button
                className="py-2 px-4 border border-[rgba(200,70,60,0.2)] bg-transparent rounded-md
                  cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-[rgba(200,70,60,0.7)]
                  transition-all duration-150 hover:bg-[rgba(200,70,60,0.06)]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Archive selection modal */}
      {showArchiveModal && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[600] flex items-center justify-center backdrop-blur-[2px]"
          onClick={() => setShowArchiveModal(false)}
        >
          <div 
            className="bg-[#faf6ed] rounded-xl w-[360px] shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
              overflow-hidden font-['Nanum_Myeongjo']"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-[rgba(160,140,120,0.12)]">
              <div className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px]">아카이브 선택</div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                  justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
              >
                <X className="w-4 h-4 text-[rgba(100,80,60,0.5)]" />
              </button>
            </div>

            {/* Body */}
            <div className="py-4 px-5 flex flex-col gap-2">
              {/* Add new archive section - at the top */}
              {isAddingArchive ? (
                <div className="w-full py-3 px-4 border rounded-lg
                  font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                  flex items-center gap-2.5 bg-[rgba(160,140,120,0.08)] border-[rgba(160,140,120,0.2)] text-[rgba(60,45,30,0.7)]">
                  <input
                    type="text"
                    value={newArchiveName}
                    onChange={(e) => setNewArchiveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddArchive();
                      if (e.key === 'Escape') handleCancelAdd();
                    }}
                    className="flex-1 bg-transparent outline-none font-['Nanum_Myeongjo'] text-[12px]"
                    placeholder="새 아카이브 이름"
                    autoFocus
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={handleAddArchive}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-[rgba(160,140,120,0.15)] flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-[rgba(80,60,40,0.6)]" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-[rgba(160,140,120,0.15)] flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-[rgba(100,80,60,0.5)]" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingArchive(true)}
                  className="w-full py-3 px-4 border rounded-lg cursor-pointer
                    font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                    flex items-center gap-2.5 bg-transparent border-[rgba(160,140,120,0.2)] text-[rgba(60,45,30,0.7)] hover:bg-[rgba(160,140,120,0.08)]"
                >
                  <Plus className="w-4 h-4 text-[rgba(80,60,40,0.6)]" />
                  새 아카이브 추가
                </button>
              )}
              
              {/* Existing archives */}
              {archives.map((archive) => (
                <button
                  key={archive.id}
                  onClick={() => handleArchiveSelect(archive.id)}
                  className={`w-full py-3 px-4 border rounded-lg cursor-pointer
                    font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                    flex items-center gap-2.5 ${
                      selectedArchive === archive.id 
                        ? 'bg-[rgba(80,60,40,0.12)] border-[rgba(80,60,40,0.3)] text-[rgba(60,45,30,0.8)]' 
                        : 'bg-transparent border-[rgba(160,140,120,0.2)] text-[rgba(60,45,30,0.7)] hover:bg-[rgba(160,140,120,0.08)]'
                    }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: archive.color }}
                  />
                  {archive.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}