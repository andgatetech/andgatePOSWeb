'use client';

import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import React, { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    modules?: QuillOptions['modules'];
    formats?: QuillOptions['formats'];
    theme?: QuillOptions['theme'];
}

const normalizeHtml = (html: string) => (html === '<p><br></p>' ? '' : html);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className = '', modules, formats, theme = 'snow' }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorElementRef = useRef<HTMLElement | null>(null);
    const quillRef = useRef<QuillType | null>(null);
    const onChangeRef = useRef(onChange);
    const initialValueRef = useRef(value);
    const optionsRef = useRef({ formats, modules, placeholder, theme });

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        let isMounted = true;
        let textChangeHandler: (() => void) | null = null;
        const container = containerRef.current;

        const initializeEditor = async () => {
            if (!container || quillRef.current) {
                return;
            }

            const { default: Quill } = await import('quill');

            if (!isMounted || !containerRef.current) {
                return;
            }

            const editorContainer = document.createElement('div');
            container.appendChild(editorContainer);
            const { formats, modules, placeholder, theme } = optionsRef.current;

            const quill = new Quill(editorContainer, {
                theme,
                placeholder,
                modules,
                formats,
            });

            editorElementRef.current = editorContainer.querySelector('.ql-editor');
            quill.clipboard.dangerouslyPasteHTML(initialValueRef.current || '');

            textChangeHandler = () => {
                const nextValue = normalizeHtml(editorElementRef.current?.innerHTML || '');
                onChangeRef.current(nextValue);
            };

            quill.on('text-change', textChangeHandler);
            quillRef.current = quill;
        };

        initializeEditor();

        return () => {
            isMounted = false;

            if (quillRef.current && textChangeHandler) {
                quillRef.current.off('text-change', textChangeHandler);
            }

            quillRef.current = null;
            editorElementRef.current = null;

            if (container) {
                container.innerHTML = '';
            }
        };
    }, []);

    useEffect(() => {
        const quill = quillRef.current;
        const editorElement = editorElementRef.current;

        if (!quill || !editorElement) {
            initialValueRef.current = value;
            return;
        }

        const currentValue = normalizeHtml(editorElement.innerHTML);
        const nextValue = value || '';

        if (currentValue === nextValue) {
            return;
        }

        const selection = quill.getSelection();
        quill.clipboard.dangerouslyPasteHTML(nextValue);

        if (selection) {
            quill.setSelection(selection);
        }
    }, [value]);

    return <div ref={containerRef} className={`quill ${className}`.trim()} />;
};

export default RichTextEditor;
