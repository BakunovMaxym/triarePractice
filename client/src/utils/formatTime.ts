export const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Не задано';

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];
    if (days > 0) parts.push(`${days} дн.`);
    if (hours > 0) parts.push(`${hours} год.`);
    if (minutes > 0) parts.push(`${minutes} хв.`);
    if (secs > 0 && parts.length === 0) parts.push(`${secs} сек.`);

    return parts.join(' ');
  };