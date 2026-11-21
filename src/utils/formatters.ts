export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatKoreanDateTime(isoOrString: string): { datePart: string; timePart: string } {
  if (!isoOrString) {
    return { datePart: '날짜 미상', timePart: '' };
  }

  // Handle already-formatted Korean date strings safely
  const parsed = new Date(isoOrString);
  if (Number.isNaN(parsed.getTime())) {
    const parts = isoOrString.split(' ');
    return {
      datePart: parts[0] || isoOrString,
      timePart: parts.slice(1).join(' '),
    };
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  const hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return {
    datePart: `${year}.${month}.${day}`,
    timePart: `${period} ${displayHour}:${minutes}`,
  };
}

export function getCurrentDateTimeLocalValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

/**
 * Reads an image file via FileReader and resizes/compresses it cleanly
 * so it displays sharply and stays well within Firestore's document size limit.
 */
export function readAndCompressImage(file: File, maxDimension = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('올바르지 않은 이미지 데이터입니다.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 처리하지 못했습니다.'));
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && result.length <= 350000) {
          resolve(result);
          return;
        }

        let currentDim = maxDimension;
        let quality = 0.75;
        let output = '';

        for (let attempt = 0; attempt < 4; attempt++) {
          const scale = Math.min(currentDim / width, currentDim / height, 1);
          const targetW = Math.max(1, Math.round(width * scale));
          const targetH = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('이미지 캔버스를 생성하지 못했습니다.'));
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          output = canvas.toDataURL('image/jpeg', quality);
          if (output.length <= 400000) {
            resolve(output);
            return;
          }
          currentDim = Math.round(currentDim * 0.75);
          quality = Math.max(0.45, quality - 0.12);
        }

        if (output.length <= 440000) {
          resolve(output);
        } else {
          reject(new Error('이미지 용량이 너무 큽니다. 다른 사진을 선택해 주세요.'));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
