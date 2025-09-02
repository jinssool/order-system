// src/utils/hangulUtils.ts
const CONSONANTS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  
  // 한글 첫 글자의 초성을 반환하는 함수
  export const getFirstConsonant = (str: string): string | null => {
    if (!str) return null;
    const char = str[0];
    const code = char.charCodeAt(0);
  
    if (code >= 44032 && code <= 55203) { // 한글 음절 범위
      const consonantIndex = Math.floor((code - 44032) / 588);
      return CONSONANTS[consonantIndex];
    }
    // 한글 자음 자체일 경우 (ㄱ, ㄴ, ...)
    const consonantIndex = CONSONANTS.indexOf(char);
    if (consonantIndex !== -1) {
      return CONSONANTS[consonantIndex];
    }
  
    return null; // 한글이 아닐 경우
  };
  