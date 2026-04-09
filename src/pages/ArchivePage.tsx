import { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Star, MoreVertical } from 'lucide-react'
import { useArchive } from '../hook/useArchive'
import { hexToShadow } from '../lib/utils'
import type { Diary } from '../types/diary'
 
export function ArchivePage() {
  const { archives, selectedArchiveId, setSelectedArchiveId, diaries } = useArchive()
  const [showModal, setShowModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  useEffect(() => {
    if (openMenuId === null) return
    const handler = () => setOpenMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMenuId])

  function getArchiveName(): string {
    if (selectedArchiveId === null) return '전체'
    return archives.find(a => a.id === selectedArchiveId)?.name ?? '전체'
  }
 
  function handleDiaryClick(_entry: Diary) {
    // TODO: navigate to diary detail
  }
 
 
  return (
    <div
      className="flex w-full h-full font-['Nanum_Myeongjo']"
    >
      {/* Left page - Archives grid */}
      <div className="flex-1 flex flex-col py-3 px-4 pl-5 overflow-y-auto">
        <div className="text-[11px] tracking-[2px] text-[rgba(120,105,85,0.4)] uppercase text-center py-1 pb-2.5 flex-shrink-0">
          아카이브
        </div>
 
        <div className="grid grid-cols-3 gap-2.5 flex-1 content-start">
          {/* Add new button */}
          <button
            onClick={() => setShowModal(true)}
            className="relative border-none cursor-pointer font-['Nanum_Pen_Script'] aspect-square
              border-2 border-dashed border-[rgba(160,140,120,0.25)] rounded-sm flex flex-col items-center
              justify-center bg-[rgba(240,235,225,0.6)] transition-all duration-200
              hover:bg-[rgba(240,235,225,0.9)] hover:border-[rgba(140,120,90,0.35)]
              hover:shadow-[1px_2px_6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
          >
            <Plus className="w-7 h-7 text-[rgba(140,120,90,0.35)]" />
          </button>
 
          {/* Archive cards */}
          {archives.map((archive, index) => (
            <button
              key={archive.id}
              onClick={() => setSelectedArchiveId(archive.id)}
              className={`group relative border-none cursor-pointer font-['Nanum_Pen_Script'] aspect-square
                rounded-sm flex flex-col items-center justify-center gap-0.5 transition-all duration-200
                ${selectedArchiveId === archive.id
                  ? 'scale-105 outline outline-2 outline-[rgba(0,0,0,0.1)] z-[2]'
                  : 'hover:-translate-y-0.5 hover:scale-[1.03]'
                }`}
              style={{
                background: archive.color,
                boxShadow: selectedArchiveId === archive.id
                  ? `2px 4px 14px ${hexToShadow(archive.color)}`
                  : `1px 2px 5px ${hexToShadow(archive.color)}, inset 0 -1px 2px rgba(0,0,0,0.04)`,
                transform: index % 2 === 0 ? 'rotate(-0.8deg)' : 'rotate(1.2deg)',
              }}
            >
              {/* Tape effect */}
              <div
                className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-[30px] h-2 bg-[rgba(255,255,255,0.45)]
                  rounded-[1px] shadow-[0_0.5px_1px_rgba(0,0,0,0.06)]"
                style={{ transform: 'translateX(-50%) rotate(-1deg)' }}
              />
 
              <div className="text-[22px] text-[rgba(0,0,0,0.55)] leading-none">{archive.name}</div>
              <div className="text-[10px] text-[rgba(0,0,0,0.28)] tracking-wide">{archive.entryCount}개</div>
 
              {/* Menu icon - visible on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === archive.id ? null : archive.id) }}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center
                  rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150
                  bg-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.15)]"
              >
                <MoreVertical className="w-3 h-3 text-[rgba(0,0,0,0.45)]" />
              </button>
 
              {/* Dropdown menu */}
              {openMenuId === archive.id && (
                <div
                  className="absolute top-6 right-1 z-10 bg-[#fffdf7] rounded shadow-md
                    border border-[rgba(160,140,120,0.15)] py-1 min-w-[80px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="w-full text-left px-3 py-1.5 text-xs text-[rgba(60,45,30,0.7)]
                    hover:bg-[rgba(160,140,120,0.08)] font-['Nanum_Myeongjo']">
                    수정
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-[rgba(180,60,40,0.7)]
                    hover:bg-[rgba(160,140,120,0.08)] font-['Nanum_Myeongjo']">
                    삭제
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
 
      {/* Right page - Diary list */}
      <div className="flex-1 flex flex-col py-3.5 px-6 pl-7 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[rgba(160,140,120,0.12)] mb-1 flex-shrink-0">
          {selectedArchiveId !== null && (
            <button
              onClick={() => setSelectedArchiveId(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md border-none bg-transparent
                cursor-pointer text-[rgba(80,60,40,0.6)] hover:bg-[rgba(160,140,120,0.08)]
                transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="text-sm text-[rgba(70,55,35,0.65)] tracking-wide">
            {getArchiveName()}
          </div>
        </div>
 
        <div className="flex-1 overflow-y-auto">
          {diaries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-2.5 px-3 border-b border-[rgba(160,140,120,0.08)]
                cursor-pointer rounded-md transition-all duration-200 hover:bg-[rgba(160,140,120,0.06)]"
              onClick={() => handleDiaryClick(entry)}
            >
              {entry.thumbnailUrl
                ? (
                  <img
                    src={entry.thumbnailUrl}
                    alt={entry.writtenAt}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]
                      border border-[rgba(220,210,195,0.5)]"
                  />
                )
                : (
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
                    bg-[rgba(240,235,225,0.8)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]
                    border border-[rgba(220,210,195,0.5)] text-xl">
                    {entry.emoji}
                  </div>
                )
              }
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="text-[10px] text-[rgba(120,105,85,0.45)] tracking-[0.5px]">
                  {entry.writtenAt}
                </div>
                <div className="text-xs text-[rgba(60,45,30,0.7)] leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                  {entry.finalText || entry.writtenAt}
                </div>
                <div className="flex gap-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2 h-2 ${
                        i < entry.starRating
                          ? 'fill-[rgba(210,175,80,0.7)] stroke-[rgba(190,155,60,0.6)]'
                          : 'fill-none stroke-[rgba(180,160,120,0.4)]'
                      }`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Modal stub */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#fffdf7] rounded-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-['Nanum_Myeongjo'] text-sm text-[rgba(60,45,30,0.7)]">
              아카이브 추가 (추후 구현)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}