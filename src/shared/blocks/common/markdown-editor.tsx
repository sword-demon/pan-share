'use client';

import { useEffect, useRef } from 'react';
// @ts-ignore
import { OverType } from 'overtype';

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 400,
  showToolbar,
  onImageUpload,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showToolbar?: boolean;
  /** When provided, pasted or dropped images are uploaded via this callback; the returned URL is inserted as markdown image. */
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OverType | null>(null);
  const onImageUploadRef = useRef(onImageUpload);
  onImageUploadRef.current = onImageUpload;

  const insertImageMarkdownRef = useRef((url: string, alt = 'image') => {
    const instance = editorRef.current;
    if (!instance?.textarea) return;
    const ta = instance.textarea;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = instance.getValue();
    const markdown = `![${alt}](${url})`;
    const newText = text.slice(0, start) + markdown + text.slice(end);
    instance.setValue(newText);
    onChange(newText);
    ta.focus();
    ta.setSelectionRange(start + markdown.length, start + markdown.length);
  });
  insertImageMarkdownRef.current = (url: string, alt = 'image') => {
    const instance = editorRef.current;
    if (!instance?.textarea) return;
    const ta = instance.textarea;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = instance.getValue();
    const markdown = `![${alt}](${url})`;
    const newText = text.slice(0, start) + markdown + text.slice(end);
    instance.setValue(newText);
    onChange(newText);
    ta.focus();
    ta.setSelectionRange(start + markdown.length, start + markdown.length);
  };

  useEffect(() => {
    const [instance] = OverType.init(ref.current, {
      value,
      onChange,
      placeholder,
      minHeight,
      showToolbar,
    });
    editorRef.current = instance;

    if (onImageUploadRef.current && instance?.container) {
      const container = instance.container;

      const handlePaste = async (e: ClipboardEvent) => {
        const file = e.clipboardData?.files?.[0];
        if (!file?.type.startsWith('image/')) return;
        e.preventDefault();
        try {
          const url = await onImageUploadRef.current!(file);
          insertImageMarkdownRef.current(url, file.name || 'image');
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      };

      const handleDrop = async (e: DragEvent) => {
        const file = e.dataTransfer?.files?.[0];
        if (!file?.type.startsWith('image/')) return;
        e.preventDefault();
        try {
          const url = await onImageUploadRef.current!(file);
          insertImageMarkdownRef.current(url, file.name || 'image');
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      };

      container.addEventListener('paste', handlePaste);
      container.addEventListener('drop', handleDrop);

      return () => {
        container.removeEventListener('paste', handlePaste);
        container.removeEventListener('drop', handleDrop);
        editorRef.current?.destroy();
      };
    }

    return () => editorRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div
      className="overflow-hidden rounded-md border"
      ref={ref}
      style={{ height: '400px' }}
    />
  );
}
