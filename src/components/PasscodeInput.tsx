import { useState, useRef, useEffect } from "react";

interface PasscodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  isLoading?: boolean;
}

export function PasscodeInput({ length = 6, onComplete, isLoading }: PasscodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Auto-focus next
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newCode.every(c => c !== "")) {
      onComplete(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().toUpperCase();
    const chars = pastedData.split("").filter(char => /^[A-Z0-9]$/.test(char)).slice(0, length);
    
    if (chars.length > 0) {
      const newCode = [...code];
      chars.forEach((char, i) => {
        newCode[i] = char;
      });
      setCode(newCode);
      
      const nextIndex = Math.min(chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (newCode.every(c => c !== "")) {
        onComplete(newCode.join(""));
      }
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
      {code.map((char, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={char}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          disabled={isLoading}
          className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl bg-gray-50 dark:bg-gray-900 text-center text-xl font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
