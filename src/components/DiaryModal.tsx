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
    { id: 1, name: '여행', color: 'var(--archive-pink)' },
    { id: 2, name: '취미생활 달', color: 'var(--archive-mint)' },
    { id: 3, name: '기억성', color: 'var(--archive-yellow)' },
    { id: 4, name: '역졸시스로', color: 'var(--archive-blue)' },
    { id: 5, name: '성장 거름', color: 'var(--archive-purple)' },
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
      const colors = [
        'var(--archive-pink)',
        'var(--archive-mint)',
        'var(--archive-yellow)',
        'var(--archive-blue)',
        'var(--archive-purple)',
        'var(--archive-peach)',
        'var(--archive-lavender)',
      ];
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
        className="fixed inset-0 bg-bg-overlay z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="bg-notebook-page rounded-xl w-[480px] max-h-[85vh] shadow-[var(--shadow-modal)]
            overflow-hidden font-['Nanum_Myeongjo'] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light flex-shrink-0">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-text-primary tracking-[0.5px]">{diary.title}</div>
              <div className="text-[10px] text-text-secondary tracking-[0.5px]">{diary.date}</div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
            >
              <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
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
                      ? 'fill-star-filled stroke-star-filled-stroke'
                      : 'fill-star-empty stroke-star-empty-stroke'
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
                className="w-full h-52 rounded-lg object-cover shadow-[var(--shadow-small)]
                  border border-border-card"
              />
            )}

            {/* Content */}
            <div className="py-3.5 px-4 bg-bg-beige-light rounded-lg
              text-xs text-text-strong leading-[1.8] min-h-[120px]"
            >
              {diary.content}
            </div>

            {/* Archive info if selected */}
            {selectedArchive && (
              <div className="flex items-center gap-2 py-2 px-3 bg-bg-hover rounded-lg">
                <Bookmark className="w-3.5 h-3.5 text-[var(--text-icon-muted)]" />
                <span className="text-[11px] text-text-primary">
                  아카이브: {selectedArchiveName}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center py-3.5 px-5 border-t border-border-light flex-shrink-0">
            <button
              onClick={handleBookmarkClick}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer
                transition-all duration-200 ${
                  selectedArchive
                    ? 'bg-bg-active hover:bg-bg-active-hover'
                    : 'bg-bg-hover hover:bg-bg-selected-hover'
                }`}
              title={selectedArchive ? '아카이브에서 제거' : '아카이브에 추가'}
            >
              <Bookmark
                className={`w-5 h-5 transition-all duration-200 ${
                  selectedArchive
                    ? 'fill-text-muted stroke-text-muted'
                    : 'fill-none stroke-text-dark-muted'
                }`}
                strokeWidth={1.8}
              />
            </button>

            <div className="flex gap-2">
              <button
                className="py-2 px-4 border border-border-medium bg-transparent rounded-md
                  cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-text-muted
                  transition-all duration-150 hover:bg-bg-hover"
              >
                수정
              </button>
              <button
                className="py-2 px-4 border border-border-danger bg-transparent rounded-md
                  cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-text-danger
                  transition-all duration-150 hover:bg-bg-danger-hover"
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
          className="fixed inset-0 bg-bg-overlay z-[600] flex items-center justify-center backdrop-blur-[2px]"
          onClick={() => setShowArchiveModal(false)}
        >
          <div
            className="bg-notebook-page rounded-xl w-[360px] shadow-[var(--shadow-modal)]
              overflow-hidden font-['Nanum_Myeongjo']"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light">
              <div className="text-sm text-text-primary tracking-[0.5px]">아카이브 선택</div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                  justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
              >
                <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
              </button>
            </div>

            {/* Body */}
            <div className="py-4 px-5 flex flex-col gap-2">
              {/* Add new archive section - at the top */}
              {isAddingArchive ? (
                <div className="w-full py-3 px-4 border rounded-lg
                  font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                  flex items-center gap-2.5 bg-bg-hover border-border-medium text-text-primary">
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
                        transition-all duration-150 hover:bg-bg-selected-hover flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-bg-selected-hover flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingArchive(true)}
                  className="w-full py-3 px-4 border rounded-lg cursor-pointer
                    font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                    flex items-center gap-2.5 bg-transparent border-border-medium text-text-primary hover:bg-bg-hover"
                >
                  <Plus className="w-4 h-4 text-text-muted" />
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
                        ? 'bg-bg-active border-border-strong text-text-heading'
                        : 'bg-transparent border-border-medium text-text-primary hover:bg-bg-hover'
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
