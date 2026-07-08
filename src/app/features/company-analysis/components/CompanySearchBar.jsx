import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';

const TYPING_SPEED_MS = 130;
const DELETING_SPEED_MS = 70;
const PAUSE_AFTER_TYPED_MS = 2600;
const PAUSE_AFTER_DELETED_MS = 500;

/** Types out each suggestion, pauses, deletes it, then moves to the next — paused entirely while `active` is false. */
function useTypewriter(words, active) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let timeoutId;
    let wordIndex = 0;

    function type(word, charIndex) {
      if (cancelled) return;
      setText(word.slice(0, charIndex));
      if (charIndex < word.length) {
        timeoutId = setTimeout(() => type(word, charIndex + 1), TYPING_SPEED_MS);
      } else {
        timeoutId = setTimeout(() => del(word, charIndex), PAUSE_AFTER_TYPED_MS);
      }
    }

    function del(word, charIndex) {
      if (cancelled) return;
      setText(word.slice(0, charIndex));
      if (charIndex > 0) {
        timeoutId = setTimeout(() => del(word, charIndex - 1), DELETING_SPEED_MS);
      } else {
        wordIndex = (wordIndex + 1) % words.length;
        timeoutId = setTimeout(() => type(words[wordIndex], 0), PAUSE_AFTER_DELETED_MS);
      }
    }

    type(words[wordIndex], 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [active, words]);

  return text;
}

/**
 * @param {{ value: string, onChange: (value: string) => void, inputRef?: import('react').RefObject<HTMLInputElement> }} props
 */
export function CompanySearchBar({ value, onChange, inputRef }) {
  const { t } = useLocale();
  const suggestions = t('company.grid.searchSuggestions');
  const [focused, setFocused] = useState(false);
  const fallbackRef = useRef(null);
  const resolvedRef = inputRef ?? fallbackRef;
  const typedSuggestion = useTypewriter(Array.isArray(suggestions) ? suggestions : [], !focused && !value);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== '/' || focused) return;
      const target = e.target;
      const isTyping = target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (isTyping) return;
      e.preventDefault();
      resolvedRef.current?.focus();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focused, resolvedRef]);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="group relative flex h-14 items-center gap-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 shadow-sm dark:shadow-none transition-all duration-300 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:shadow-lg focus-within:shadow-blue-500/10 dark:focus-within:shadow-blue-500/5 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20">
        <Search className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400" />
        <input
          ref={resolvedRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={typedSuggestion}
          className="w-full min-w-0 border-none bg-transparent text-base text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {!value && (
          <kbd className="hidden shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 sm:block">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
