export function nativePageLayout(width: number, workspace: boolean) {
  const horizontalPadding = width >= 768 ? 24 : 16;
  return {
    horizontalPadding,
    maxWidth: workspace ? 1200 : 720,
  };
}

export function nativeColumnWidth(width: number, fontScale: number, minimum: number) {
  return width >= minimum * 2 + 16 && fontScale <= 1.3
    ? (width - 16) / 2
    : width;
}

export function nativeCalendarWidth(containerWidth: number) {
  return Math.max(336, containerWidth);
}
