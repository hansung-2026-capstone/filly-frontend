import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

interface TiptapEditorProps {
  placeholder?: string;
  maxLength?: number;
  showToolbar: boolean;
  onChange?: (html: string) => void;
  className?: string;
}

function EditorToolbarButton({
  icon,
  isActive = false,
  strokeWidth,
  onClick,
  className,
}: {
  icon: LucideIcon;
  isActive?: boolean;
  strokeWidth?: number;
  onClick?: () => void;
  className?: string;
}) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)]
        rounded transition-all duration-150 border-none bg-transparent cursor-pointer ${isActive ? "bg-[rgba(160,140,120,0.2)]" : ""} ${className ?? ""}`}
    >
      <Icon
        className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
        strokeWidth={strokeWidth ?? 2}
      />
    </button>
  );
}

export function TiptapEditor({
  placeholder,
  maxLength,
  showToolbar,
  onChange,
  className = "",
}: TiptapEditorProps) {
  const [selectedFontSize, setSelectedFontSize] = useState("12px");

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      CustomTextStyle,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      ...(maxLength !== undefined
        ? [CharacterCount.configure({ limit: maxLength })]
        : []),
    ],
    editorProps: {
      attributes: {
        spellcheck: "false",
        "data-gramm": "false",
        class: [
          "outline-none h-full",
          "font-['Nanum_Myeongjo'] text-[13px]",
          "text-[rgba(55,40,25,0.8)] leading-[1.7]",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      setSelectedFontSize(editor.getAttributes("textStyle").fontSize || "12px");
    },
  });

  useEffect(
    () => () => {
      editor?.destroy();
    },
    [],
  );

  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {showToolbar && (
        <div className="flex items-center gap-1 py-1.5 px-2.5 bg-[rgba(240,235,225,0.5)] rounded-md border border-[rgba(160,140,120,0.15)]">
          <EditorToolbarButton
            icon={Bold}
            strokeWidth={2.5}
            isActive={editor?.isActive("bold") ?? false}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <EditorToolbarButton
            icon={Italic}
            isActive={editor?.isActive("italic") ?? false}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <EditorToolbarButton
            icon={UnderlineIcon}
            isActive={editor?.isActive("underline") ?? false}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <select
            value={selectedFontSize}
            onChange={(e) => {
              setSelectedFontSize(e.target.value);
              editor
                ?.chain()
                .focus()
                .setMark("textStyle", { fontSize: e.target.value })
                .run();
            }}
            className="bg-transparent border-none outline-none text-[rgba(55,40,25,0.8)] text-xs ml-1"
          >
            <option value="12px">12px</option>
            <option value="16px">16px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="30px">30px</option>
          </select>
          <div className="w-px h-4 bg-[rgba(160,140,120,0.2)] mx-0.5" />
          <EditorToolbarButton
            icon={List}
            isActive={editor?.isActive("bulletList") ?? false}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <EditorToolbarButton
            icon={ListOrdered}
            isActive={editor?.isActive("orderedList") ?? false}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>
      )}

      <div className="bg-[rgba(255,253,247,0.8)] rounded-lg border border-[rgba(160,140,120,0.2)] p-3.5 flex-1 flex flex-col">
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        {maxLength !== undefined && (
          <div className="text-[9px] text-[rgba(120,100,80,0.4)] mt-1.5 text-right">
            {charCount}/{maxLength}글자
          </div>
        )}
      </div>
    </div>
  );
}
