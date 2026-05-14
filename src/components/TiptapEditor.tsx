import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
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
  readOnly?: boolean;
  onChange?: (html: string) => void;
  className?: string;
  content?: string;
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
      className={`w-6 h-6 flex items-center justify-center hover:bg-[var(--bg-hover-soft)]
        rounded transition-all duration-150 border-none cursor-pointer
        ${isActive ? "bg-[var(--bg-toolbar-active)] ring-1 ring-border-strong" : "bg-transparent"} ${className ?? ""}`}
    >
      <Icon
        className={`w-3.5 h-3.5 transition-colors duration-150 ${
          isActive ? "text-text-heading" : "text-[var(--text-editor-inactive)]"
        }`}
        strokeWidth={isActive ? (strokeWidth ?? 2.5) : (strokeWidth ?? 1.5)}
      />
    </button>
  );
}

export function TiptapEditor({
  placeholder,
  maxLength,
  showToolbar,
  readOnly = false,
  onChange = () => {},
  className = "",
  content,
}: TiptapEditorProps) {
  const editor = useEditor({
    editable: !readOnly,
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
          "font-['Nanum_Myeongjo'] text-[14px]",
          "text-[var(--text-input)] leading-[1.7]",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      fontSize: ctx.editor?.getAttributes("textStyle").fontSize ?? "12px",
      charCount: ctx.editor?.storage.characterCount?.characters() ?? 0,
    }),
  });

  useEffect(() => {
    if (content !== undefined && editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(
    () => () => {
      editor?.destroy();
    },
    [editor],
  );

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {showToolbar && (
        <div className="flex items-center gap-1 py-1.5 px-2.5 bg-bg-surface-muted rounded-md border border-[var(--border-subtle)]">
          <EditorToolbarButton
            icon={Bold}
            strokeWidth={2.5}
            isActive={editorState?.isBold ?? false}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <EditorToolbarButton
            icon={Italic}
            isActive={editorState?.isItalic ?? false}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <EditorToolbarButton
            icon={UnderlineIcon}
            isActive={editorState?.isUnderline ?? false}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <select
            value={editorState?.fontSize ?? "12px"}
            onChange={(e) => {
              editor
                ?.chain()
                .focus()
                .setMark("textStyle", { fontSize: e.target.value })
                .run();
            }}
            className="bg-transparent border-none outline-none text-[var(--text-input)] text-xs ml-1"
          >
            <option value="12px">12px</option>
            <option value="16px">16px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="30px">30px</option>
          </select>
          <div className="w-px h-4 bg-[var(--bg-muted-dot)] mx-0.5" />
          <EditorToolbarButton
            icon={List}
            isActive={editorState?.isBulletList ?? false}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <EditorToolbarButton
            icon={ListOrdered}
            isActive={editorState?.isOrderedList ?? false}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>
      )}

      <div className="relative overflow-hidden bg-bg-editor-panel rounded-lg border border-border-medium p-3.5 flex-1 flex flex-col">
        <div className="paper-texture absolute inset-0 pointer-events-none rounded-lg opacity-40" />
        <EditorContent editor={editor} className="relative z-10 flex-1 overflow-y-auto" />
        {maxLength !== undefined && (
          <div className="relative z-10 text-[12px] text-text-subtle mt-1.5 text-right">
            {editorState?.charCount ?? 0}/{maxLength}글자
          </div>
        )}
      </div>
    </div>
  );
}
