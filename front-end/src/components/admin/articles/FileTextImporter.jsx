// src/components/admin/articles/FileTextImporter.jsx
import React, { useRef, useState } from 'react';
import { FileUp, CheckCircle, AlertCircle } from 'lucide-react';

const markdownToHtml = (markdown) => {
  if (!markdown) return '';

  let html = markdown
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Bullet lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

  // Paragraphs
  const blocks = html.split(/\n\s*\n/);
  return blocks
    .map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h2>') ||
        trimmed.startsWith('<h3>') ||
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('<blockquote>')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
};

const FileTextImporter = ({ onImport }) => {
  const fileInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'md'].includes(extension)) {
      setStatusMessage({
        type: 'error',
        text: 'لطفاً یک فایل متنی با پسوند .txt یا .md انتخاب کنید.',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result;
        let convertedHtml = '';

        if (extension === 'md') {
          convertedHtml = markdownToHtml(rawContent);
        } else {
          // Plain text to clean paragraphs
          convertedHtml = rawContent
            .split(/\n\s*\n/)
            .map((p) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
            .join('');
        }

        if (onImport) {
          onImport(convertedHtml);
        }

        setStatusMessage({
          type: 'success',
          text: `فایل «${file.name}» با موفقیت خوانده و وارد ویرایشگر شد.`,
        });

        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err) {
        console.error('Error parsing file:', err);
        setStatusMessage({
          type: 'error',
          text: 'خطا در پردازش محتوای فایل.',
        });
      }
    };

    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'خطا در بارگذاری فایل از دیسک سیستم.',
      });
    };

    reader.readAsText(file, 'UTF-8');

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all shadow-2xs"
        >
          <FileUp className="w-3.5 h-3.5" />
          ورود متن از فایل (.txt / .md)
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default FileTextImporter;
