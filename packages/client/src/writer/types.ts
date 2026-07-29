export type WriterMode = '단어' | '문장' | '문서'

export type TextWriterMode = Extract<WriterMode, '단어' | '문장'>
