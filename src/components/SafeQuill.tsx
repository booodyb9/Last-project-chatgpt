import type { CSSProperties } from 'react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  readOnly?: boolean;
};

export default function SafeQuill({ value = '', onChange, className = '', style, placeholder, readOnly }: Props) {
  return (
    <div className={`safe-rich-editor ${className}`} style={style} dir="rtl">
      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder || 'اكتب المحتوى هنا...'}
        readOnly={readOnly}
        className="w-full min-h-64 rounded-xl border border-slate-200 bg-white p-4 text-right leading-7 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-y"
      />
      <p className="mt-2 text-xs text-slate-500">محرر متوافق مع React 19 والجوال. يدعم حفظ النص وHTML الموجود بدون تعطل لوحة التحكم.</p>
    </div>
  );
}
