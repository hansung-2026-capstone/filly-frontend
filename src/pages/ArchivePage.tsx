import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useArchive } from '../hook/useArchive'
import type { Diary } from '../types/diary'
import { hexToShadow } from '../lib/utils'
 
export function ArchivePage() {
  const { archives, selectedArchiveId, setSelectedArchiveId } = useArchive()
  const [showModal, setShowModal] = useState(false)
 
  return (
    <div
      className="flex w-full h-full font-['Nanum_Myeongjo']"
      onClick={() => {}}
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
            </button>
          ))}
        </div>
      </div>
 
      {/* Right page - Diary list */}
      <div className="flex-1 flex flex-col py-3.5 px-6 pl-7 gap-0 overflow-hidden">
        
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