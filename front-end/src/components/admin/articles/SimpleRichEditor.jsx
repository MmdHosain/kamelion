// src/components/admin/articles/SimpleRichEditor.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Eye,
  Code,
} from 'lucide-react';

const SimpleRichEditor = ({
  value = '',
  onChange,
  placeholder = 'متن کامل مقاله را اینجا بنویسید یا از دکمه ورود فایل استفاده کنید...',
  onUploadImage,
}) => {
  const editorRef = useRef(null);
  const [showCode, setShowCode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const updateWordCount = (text) => {
    if (!text) {
      setWordCount(0);
      return;
    }
    const clean = text.replace(/<[^>]*>/g, ' ').trim();
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  };

  // Sync external value changes into editor
  useEffect(() => {
    const currentVal = value || '';
    if (editorRef.current && editorRef.current.innerHTML !== currentVal) {
      editorRef.current.innerHTML = currentVal;
    }
    setHtmlContent(currentVal);
    updateWordCount(currentVal);
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    setHtmlContent(content);
    updateWordCount(content);
    if (onChange) onChange(content);
  };

  const executeCommand = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleHeading = (tag) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Check if the current block is already that heading tag; toggle back to <p> if so
    const selection = window.getSelection();
    let isAlreadyHeading = false;
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName && node.nodeName.toLowerCase() === tag.toLowerCase()) {
          isAlreadyHeading = true;
          break;
        }
        node = node.parentNode;
      }
    }

    const targetTag = isAlreadyHeading ? '<p>' : `<${tag}>`;
    try {
      document.execCommand('formatBlock', false, targetTag);
    } catch {
      document.execCommand('formatBlock', false, isAlreadyHeading ? 'p' : tag);
    }

    handleInput();
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    executeCommand('createLink', linkUrl);
    setLinkUrl('');
    setLinkModalOpen(false);
  };

  const handleInsertImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadImage) {
      try {
        const res = await onUploadImage(file);
        if (res?.url) {
          executeCommand('insertImage', res.url);
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    } else {
      const localUrl = URL.createObjectURL(file);
      executeCommand('insertImage', localUrl);
    }
  };

  // Toggle between visual mode and raw HTML mode without losing content
  const handleToggleMode = () => {
    if (showCode) {
      // Switching from Code to Visual
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      updateWordCount(htmlContent);
      if (onChange) onChange(htmlContent);
      setShowCode(false);
    } else {
      // Switching from Visual to Code
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : (htmlContent || '');
      setHtmlContent(currentHtml);
      updateWordCount(currentHtml);
      if (onChange) onChange(currentHtml);
      setShowCode(true);
    }
  };

  return (
    <div className="border border-primary/20 rounded-2xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-primary">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-primary/10 p-2 flex flex-wrap items-center gap-1 select-none">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading('h2')}
          title="تیتر سطح ۲ (H2)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer font-bold"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading('h3')}
          title="تیتر سطح ۳ (H3)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer font-bold"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('bold')}
          title="پررنگ (Bold)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('italic')}
          title="مایل (Italic)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('underline')}
          title="خط زیرین (Underline)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('insertUnorderedList')}
          title="لیست نشانه‌دار (Bullet)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('insertOrderedList')}
          title="لیست شماره‌دار (Numbered)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleHeading('blockquote')}
          title="نقل‌قول (Quote)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        {/* Link Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setLinkModalOpen(true)}
          title="درج پیوند (Link)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Inline Image Upload */}
        <label
          title="درج تصویر در متن"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer flex items-center justify-center"
        >
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInsertImage}
          />
        </label>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('undo')}
          title="برگشت به عقب (Undo)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand('redo')}
          title="حرکت به جلو (Redo)"
          className="p-2 rounded-lg hover:bg-white hover:text-primary transition-all text-slate-700 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="mr-auto flex items-center gap-2">
          {/* HTML / Visual Toggle */}
          <button
            type="button"
            onClick={handleToggleMode}
            title={showCode ? 'نمایش بصری' : 'نمایش کد HTML'}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary text-slate-600 transition-all font-bold cursor-pointer bg-white"
          >
            {showCode ? <Eye className="w-3.5 h-3.5 text-primary" /> : <Code className="w-3.5 h-3.5" />}
            {showCode ? 'بازگشت به ادیتور' : 'کد HTML'}
          </button>
        </div>
      </div>

      {/* Editor Body - Both remain in DOM to prevent unmount content loss */}
      <div className="relative min-h-[320px]">
        {/* Raw HTML Textarea */}
        <textarea
          dir="ltr"
          value={htmlContent}
          onChange={(e) => {
            const newCode = e.target.value;
            setHtmlContent(newCode);
            updateWordCount(newCode);
            if (onChange) onChange(newCode);
          }}
          className={`w-full min-h-[320px] p-5 font-mono text-xs text-slate-800 bg-slate-900/5 focus:outline-none resize-y ${
            showCode ? 'block' : 'hidden'
          }`}
          placeholder="کدهای HTML را اینجا مشاهده یا ویرایش کنید..."
        />

        {/* ContentEditable Visual Div */}
        <div
          ref={editorRef}
          contentEditable
          dir="auto"
          onInput={handleInput}
          data-placeholder={placeholder}
          className={`rich-text-content w-full min-h-[320px] p-5 focus:outline-none leading-relaxed font-sans text-base transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none ${
            showCode ? 'hidden' : 'block'
          }`}
        />
      </div>

      {/* Footer Info: Word count and reading time */}
      <div className="bg-slate-50 border-t border-primary/10 px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div>
          تعداد کلمات: <span className="font-bold text-slate-700">{wordCount}</span> کلمه
        </div>
        <div>
          تخمین زمان مطالعه:{' '}
          <span className="font-bold text-primary">
            {Math.max(1, Math.ceil(wordCount / 180))} دقیقه
          </span>
        </div>
      </div>

      {/* Link Dialog */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-primary/20 animate-scaleIn">
            <h4 className="text-sm font-bold text-slate-800 mb-3">درج پیوند (Link)</h4>
            <input
              type="url"
              dir="ltr"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold shadow-xs cursor-pointer"
              >
                ثبت پیوند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleRichEditor;
