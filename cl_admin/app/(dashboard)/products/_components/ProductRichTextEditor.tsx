'use client';

import { useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, RemoveFormatting, Quote
} from 'lucide-react';

interface ProductRichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}

export default function ProductRichTextEditor({
  label = '📝 Mô tả chi tiết sản phẩm (Trình soạn thảo văn bản Word)',
  value,
  onChange
}: ProductRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execEditorCommand = (command: string, cmdValue: string | undefined = undefined) => {
    document.execCommand(command, false, cmdValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div>
      <label className="block text-xs font-mono font-bold uppercase mb-1">
        {label}
      </label>
      <div className="border-2 border-[#09090B] bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-[#09090B] bg-zinc-100 text-xs font-mono select-none">
          <button
            type="button"
            onClick={() => execEditorCommand('bold')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 font-bold px-2 shadow-[1px_1px_0px_0px_#09090B]"
            title="In đậm (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('italic')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 italic px-2 shadow-[1px_1px_0px_0px_#09090B]"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('underline')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 underline px-2 shadow-[1px_1px_0px_0px_#09090B]"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('strikeThrough')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 line-through px-2 shadow-[1px_1px_0px_0px_#09090B]"
            title="Gạch ngang"
          >
            <Strikethrough size={14} />
          </button>

          <span className="h-5 w-0.5 bg-zinc-400 mx-1" />

          <button
            type="button"
            onClick={() => execEditorCommand('formatBlock', 'h1')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 font-extrabold px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Tiêu đề H1"
          >
            <Heading1 size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('formatBlock', 'h2')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 font-bold px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Tiêu đề H2"
          >
            <Heading2 size={14} />
          </button>

          <span className="h-5 w-0.5 bg-zinc-400 mx-1" />

          <button
            type="button"
            onClick={() => execEditorCommand('insertUnorderedList')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Danh sách chấm"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('insertOrderedList')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Danh sách số"
          >
            <ListOrdered size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('formatBlock', 'blockquote')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Trích dẫn"
          >
            <Quote size={14} />
          </button>

          <span className="h-5 w-0.5 bg-zinc-400 mx-1" />

          <button
            type="button"
            onClick={() => execEditorCommand('justifyLeft')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Căn trái"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('justifyCenter')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Căn giữa"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand('justifyRight')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 px-1.5 shadow-[1px_1px_0px_0px_#09090B]"
            title="Căn phải"
          >
            <AlignRight size={14} />
          </button>

          <span className="h-5 w-0.5 bg-zinc-400 mx-1" />

          <button
            type="button"
            onClick={() => execEditorCommand('removeFormat')}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-200 text-rose-600 px-2 shadow-[1px_1px_0px_0px_#09090B]"
            title="Xóa định dạng"
          >
            <RemoveFormatting size={14} />
          </button>
        </div>

        {/* Editable Body */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          className="p-3 min-h-35 text-sm focus:outline-none bg-white font-sans overflow-y-auto max-h-60"
        />
      </div>
    </div>
  );
}
