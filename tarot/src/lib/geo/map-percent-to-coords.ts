/** 将 GeoJourney 百分比坐标 (0–100) 转为 jsVectorMap 经纬度 [lng, lat] */
export function mapPercentToCoords(mapX: number, mapY: number): [number, number] {
  const lng = (mapX / 100) * 360 - 180;
  const lat = 90 - (mapY / 100) * 180;
  return [lng, lat];
}
