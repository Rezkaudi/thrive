export function handlePasteCode(
  e: React.ClipboardEvent,
  verificationCode: string[],
  setVerificationCode: (code: string[]) => void,
  inputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>
) {
  e.preventDefault();
  const pasted = e.clipboardData.getData("text").trim();

  // Only digits (you can adjust regex for letters if needed)
  if (!/^\d+$/.test(pasted)) return;

  const digits = pasted.slice(0, verificationCode.length).split("");
  const newCode = [...verificationCode];

  digits.forEach((digit, i) => {
    newCode[i] = digit;
  });

  setVerificationCode(newCode);

  // Move focus to the last filled input (optional)
  const lastIndex = digits.length - 1;
  if (inputRefs?.current?.[lastIndex]) {
    inputRefs.current[lastIndex]?.focus();
  }
}
