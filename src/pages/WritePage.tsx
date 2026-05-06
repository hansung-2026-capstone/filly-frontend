import { Calendar } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { createDraft, getDiaries, saveDiary, updateDiary, type DiaryItem } from "../api/diary";
import { DatePickerModal } from "../components/DatePickerModal";
import { PhotoUploadSection } from "../components/PhotoUploadSection";
import { TiptapEditor } from "../components/TiptapEditor";
import { VoiceRecorderSection } from "../components/VoiceRecorderSection";
import { usePhotoUpload } from "../hook/usePhotoUpload";
import { useVoiceRecorder } from "../hook/useVoiceRecorder";
import {
  formatDateKey,
  formatKoreanDate,
  formatKoreanDateKey,
  isFutureDate,
  getKoreanDayLabel,
  getKoreanDayLabelFromKey,
} from "../lib/date";

const EMOJIS = ["😊", "😢", "😤", "😌", "😰", "🥰", "😴", "🤩"];
function getEditDiary(locationState: unknown) {
  return (locationState as { diary?: DiaryItem } | null)?.diary;
}

function appendPhotos(form: FormData, photos: { file: File }[]) {
  photos.forEach((photo) => form.append("images", photo.file));
}

export function WritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editDiary = getEditDiary(location.state);

  const [emoji, setEmoji] = useState<string | null>(editDiary?.emoji ?? EMOJIS[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDraftGenerating, setIsDraftGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shortText, setShortText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<string | undefined>(
    editDiary?.rawContent ?? undefined,
  );

  const aiPhotos = usePhotoUpload();
  const diaryPhotos = usePhotoUpload();
  const voiceRecorder = useVoiceRecorder();
  const dateLabel = editDiary
    ? formatKoreanDateKey(editDiary.writtenAt)
    : formatKoreanDate(selectedDate);
  const dayLabel = editDiary
    ? getKoreanDayLabelFromKey(editDiary.writtenAt)
    : getKoreanDayLabel(selectedDate);

  const handleGenerateDraft = async () => {
    if (isFutureDate(selectedDate)) {
      setValidationMessage("오늘 이후 날짜의 일기 초안은 만들 수 없어요.");
      return;
    }

    setValidationMessage(null);
    setIsDraftGenerating(true);
    try {
      const form = new FormData();

      if (shortText.trim()) form.append("content", shortText.trim());
      form.append("writtenAt", formatDateKey(selectedDate));
      appendPhotos(form, aiPhotos.photos);
      if (voiceRecorder.record) form.append("voice", voiceRecorder.record.file);

      const draft = await createDraft(form);
      setDraftContent(draft.generatedText);
      diaryPhotos.replacePhotos(aiPhotos.photos);
    } finally {
      setIsDraftGenerating(false);
    }
  };

  const handleSaveDiary = async () => {
    setValidationMessage(null);
    setIsSaving(true);
    try {
      if (editDiary) {
        await updateDiary(editDiary.id, {
          rawContent: finalText.trim() || undefined,
          emoji: emoji || undefined,
        });
      } else {
        const writtenAt = formatDateKey(selectedDate);

        if (isFutureDate(selectedDate)) {
          setValidationMessage("오늘 이후 날짜에는 일기를 작성할 수 없어요.");
          return;
        }

        let diaries: DiaryItem[];
        try {
          diaries = await getDiaries(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
          );
        } catch {
          setValidationMessage("기존 일기 확인에 실패했어요. 잠시 후 다시 시도해주세요.");
          return;
        }

        if (diaries.some((diary) => diary.writtenAt === writtenAt)) {
          setValidationMessage("이미 이 날짜에 작성한 일기가 있어요.");
          return;
        }

        const form = new FormData();
        const plainText = finalText.trim();
        if (plainText) form.append("rawContent", plainText);
        form.append("writtenAt", writtenAt);
        if (emoji) form.append("emoji", emoji);
        appendPhotos(form, diaryPhotos.photos);

        await saveDiary(form);
      }
      navigate("/");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo'] relative">
      {isSaving && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-page-loading z-20 gap-3">
          <div className="w-6 h-6 border-2 border-[var(--border-spinner)] border-t-[var(--border-spinner-active)] rounded-full animate-spin" />
          <span className="text-sm text-text-primary tracking-wide">
            {editDiary ? "일기 수정 중..." : "일기 작성 중..."}
          </span>
        </div>
      )}

      <div className={`flex-1 flex flex-col py-5 px-6 gap-5 overflow-y-auto${editDiary ? " opacity-40 pointer-events-none select-none" : ""}`}>
        <div className="pb-3 border-b border-[var(--border-subtle)]">
          <h2 className="text-base text-text-heading tracking-wide m-0 font-medium">
            {editDiary ? "수정 모드에서는 AI 기능 비활성" : "AI 작성 툴"}
          </h2>
        </div>

        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-sm text-text-primary tracking-[0.5px] m-0 font-medium">
            단문
          </h3>
          <TiptapEditor
            placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
            maxLength={100}
            showToolbar={false}
            className="flex-1"
            onChange={setShortText}
          />
        </div>

        <PhotoUploadSection title="사진" {...aiPhotos} />

        <div className="flex flex-col gap-2.5">
          <VoiceRecorderSection
            record={voiceRecorder.record}
            isRecording={voiceRecorder.isRecording}
            onToggle={voiceRecorder.toggle}
            onRemove={voiceRecorder.removeRecord}
          />
          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerateDraft}
              disabled={isDraftGenerating}
              className="py-2.5 px-8 bg-bg-strong-control text-notebook-page border-none rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-sm transition-all duration-150
                hover:bg-bg-strong-control-hover shadow-[var(--shadow-action-button)]
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              초안 생성
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col py-5 px-6 gap-5 overflow-y-auto relative">
        {isDraftGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-page-loading-soft)] z-10 gap-3">
            <div className="w-6 h-6 border-2 border-[var(--border-spinner)] border-t-[var(--border-spinner-active)] rounded-full animate-spin" />
            <span className="text-sm text-text-primary tracking-wide">
              AI 초안 만드는 중...
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary tracking-wide">{dateLabel}</span>
            <span className="text-sm text-[var(--text-soft-label)]">{dayLabel}</span>
          </div>
          {!editDiary && (
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent
                cursor-pointer text-[var(--text-icon-muted)] hover:bg-bg-hover transition-all duration-150"
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm text-text-primary tracking-[0.5px] m-0 font-medium">
            오늘의 기분 이모지
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((currentEmoji) => (
              <button
                key={currentEmoji}
                onClick={() => setEmoji(emoji === currentEmoji ? null : currentEmoji)}
                className={`w-10 h-10 text-xl rounded-lg border transition-all duration-150 cursor-pointer
                  ${emoji === currentEmoji
                    ? "bg-[var(--bg-muted-dot)] border-[var(--border-emotion-selected)] scale-110"
                    : "bg-bg-surface-muted border-[var(--border-subtle)] hover:bg-bg-upload-hover hover:scale-105"
                  }`}
              >
                {currentEmoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-sm text-text-primary tracking-[0.5px] m-0 font-medium">
            본문
          </h3>
          <TiptapEditor
            placeholder="AI가 생성한 초안이 여기에 표시됩니다..."
            maxLength={500}
            showToolbar
            className="flex-1"
            content={draftContent}
            onChange={setFinalText}
          />
        </div>

        {editDiary ? (
          editDiary.mediaUrls?.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-sm text-text-primary tracking-[0.5px] m-0 font-medium">사진</h3>
              <div className={`grid gap-1.5 ${editDiary.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {editDiary.mediaUrls.slice(0, 4).map((url) => (
                  <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-lg shadow-sm" />
                ))}
              </div>
              <p className="text-[11px] text-text-secondary m-0">사진은 수정할 수 없습니다.</p>
            </div>
          )
        ) : (
          <PhotoUploadSection title="사진" {...diaryPhotos} />
        )}

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSaveDiary}
            disabled={isSaving}
            className="py-2.5 px-8 bg-bg-strong-control text-notebook-page border-none rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-sm transition-all duration-150
                hover:bg-bg-strong-control-hover shadow-[var(--shadow-action-button)]
                disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {editDiary ? "일기 수정" : "일기 작성"}
          </button>
          {validationMessage && (
            <p className="m-0 px-3 py-2 rounded-md bg-[var(--bg-error)] text-[11px] text-[var(--text-error)]">
              {validationMessage}
            </p>
          )}
        </div>
      </div>

      <DatePickerModal
        isOpen={showDatePicker}
        selectedDate={selectedDate}
        maxDate={new Date()}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setValidationMessage(null);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </div>
  );
}
