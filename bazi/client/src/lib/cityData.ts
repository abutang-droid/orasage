/**
 * 城市坐标数据查询模块（内嵌版 + AI 匹配 + 海外兜底）
 *
 * 策略：
 *   1. 内嵌约 200 城精确匹配（O(1)，离线可用）
 *   2. 匹配失败时调用后端 AI 接口兜底查询坐标
 *   3. 输入看起来像海外地址（纯英文/拼音）时提示用户输入"国家+城市"格式
 */

export interface CityRecord {
  city: string;
  country: string;
  province: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
  pinyin?: string;
}

export interface CityCoords {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
}

// ── 内嵌城市数据（约 200 城）────────────────────────────────────────────
const CITY_DATA: CityRecord[] = [
  // ── 华北 ──
  { city: '北京', country: '中国', province: '北京', lng: 116.4074, lat: 39.9042, timezone: '+8', pinyin: 'BJ' },
  { city: '天津', country: '中国', province: '天津', lng: 117.1901, lat: 39.1256, timezone: '+8', pinyin: 'TJ' },
  { city: '石家庄', country: '中国', province: '河北', lng: 114.5149, lat: 38.0428, timezone: '+8', pinyin: 'SJZ' },
  { city: '唐山', country: '中国', province: '河北', lng: 118.1841, lat: 39.6304, timezone: '+8', pinyin: 'TS' },
  { city: '秦皇岛', country: '中国', province: '河北', lng: 119.6025, lat: 39.9338, timezone: '+8', pinyin: 'QHD' },
  { city: '邯郸', country: '中国', province: '河北', lng: 114.5322, lat: 36.6119, timezone: '+8', pinyin: 'HD' },
  { city: '张家口', country: '中国', province: '河北', lng: 114.8803, lat: 40.7686, timezone: '+8', pinyin: 'ZJK' },
  { city: '承德', country: '中国', province: '河北', lng: 117.9374, lat: 40.9686, timezone: '+8', pinyin: 'CD' },
  { city: '太原', country: '中国', province: '山西', lng: 112.5489, lat: 37.8706, timezone: '+8', pinyin: 'TY' },
  { city: '大同', country: '中国', province: '山西', lng: 113.2968, lat: 40.0930, timezone: '+8', pinyin: 'DT' },
  { city: '呼和浩特', country: '中国', province: '内蒙古', lng: 111.7491, lat: 40.8414, timezone: '+8', pinyin: 'HHHT' },
  { city: '包头', country: '中国', province: '内蒙古', lng: 109.8416, lat: 40.6520, timezone: '+8', pinyin: 'BT' },
  { city: '呼伦贝尔', country: '中国', province: '内蒙古', lng: 119.7545, lat: 49.2187, timezone: '+8', pinyin: 'HLBE' },
  { city: '通辽', country: '中国', province: '内蒙古', lng: 122.2650, lat: 43.6133, timezone: '+8', pinyin: 'TL' },

  // ── 东北 ──
  { city: '哈尔滨', country: '中国', province: '黑龙江', lng: 126.6424, lat: 45.7569, timezone: '+8', pinyin: 'HRB' },
  { city: '齐齐哈尔', country: '中国', province: '黑龙江', lng: 123.9597, lat: 47.3408, timezone: '+8', pinyin: 'QQHE' },
  { city: '牡丹江', country: '中国', province: '黑龙江', lng: 129.6155, lat: 44.5762, timezone: '+8', pinyin: 'MDJ' },
  { city: '长春', country: '中国', province: '吉林', lng: 125.3235, lat: 43.8171, timezone: '+8', pinyin: 'CC' },
  { city: '吉林市', country: '中国', province: '吉林', lng: 126.5478, lat: 43.8378, timezone: '+8', pinyin: 'JLS' },
  { city: '四平', country: '中国', province: '吉林', lng: 124.2230, lat: 43.1667, timezone: '+8', pinyin: 'SPP' },
  { city: '延吉', country: '中国', province: '吉林', lng: 129.5200, lat: 42.9018, timezone: '+8', pinyin: 'YJ' },
  { city: '沈阳', country: '中国', province: '辽宁', lng: 123.4328, lat: 41.8057, timezone: '+8', pinyin: 'SY' },
  { city: '大连', country: '中国', province: '辽宁', lng: 121.6147, lat: 38.9140, timezone: '+8', pinyin: 'DL' },
  { city: '鞍山', country: '中国', province: '辽宁', lng: 122.9796, lat: 41.1142, timezone: '+8', pinyin: 'AS' },
  { city: '抚顺', country: '中国', province: '辽宁', lng: 123.9696, lat: 41.9026, timezone: '+8', pinyin: 'FS' },
  { city: '丹东', country: '中国', province: '辽宁', lng: 124.3590, lat: 40.1264, timezone: '+8', pinyin: 'DD' },
  { city: '锦州', country: '中国', province: '辽宁', lng: 121.1456, lat: 41.1082, timezone: '+8', pinyin: 'JZ' },
  { city: '葫芦岛', country: '中国', province: '辽宁', lng: 120.8454, lat: 40.7168, timezone: '+8', pinyin: 'HLDS' },

  // ── 华东 ──
  { city: '上海', country: '中国', province: '上海', lng: 121.4737, lat: 31.2304, timezone: '+8', pinyin: 'SH' },
  { city: '南京', country: '中国', province: '江苏', lng: 118.7674, lat: 32.0415, timezone: '+8', pinyin: 'NJJ' },
  { city: '苏州', country: '中国', province: '江苏', lng: 120.6196, lat: 31.2989, timezone: '+8', pinyin: 'SZ' },
  { city: '无锡', country: '中国', province: '江苏', lng: 120.3118, lat: 31.4912, timezone: '+8', pinyin: 'WX' },
  { city: '常州', country: '中国', province: '江苏', lng: 119.9741, lat: 31.8122, timezone: '+8', pinyin: 'CZ' },
  { city: '徐州', country: '中国', province: '江苏', lng: 117.2848, lat: 34.2044, timezone: '+8', pinyin: 'XZ' },
  { city: '南通', country: '中国', province: '江苏', lng: 120.8961, lat: 31.9881, timezone: '+8', pinyin: 'NT' },
  { city: '扬州', country: '中国', province: '江苏', lng: 119.4210, lat: 32.3942, timezone: '+8', pinyin: 'YZ' },
  { city: '镇江', country: '中国', province: '江苏', lng: 119.4258, lat: 32.1869, timezone: '+8', pinyin: 'ZJ' },
  { city: '淮安', country: '中国', province: '江苏', lng: 119.0134, lat: 33.4033, timezone: '+8', pinyin: 'HA' },
  { city: '盐城', country: '中国', province: '江苏', lng: 120.1541, lat: 33.3821, timezone: '+8', pinyin: 'YC' },
  { city: '连云港', country: '中国', province: '江苏', lng: 119.2169, lat: 34.5965, timezone: '+8', pinyin: 'LYG' },
  { city: '杭州', country: '中国', province: '浙江', lng: 120.1550, lat: 30.2741, timezone: '+8', pinyin: 'HZ' },
  { city: '宁波', country: '中国', province: '浙江', lng: 121.5495, lat: 29.8683, timezone: '+8', pinyin: 'NB' },
  { city: '温州', country: '中国', province: '浙江', lng: 120.6994, lat: 27.9945, timezone: '+8', pinyin: 'WZ' },
  { city: '嘉兴', country: '中国', province: '浙江', lng: 120.7565, lat: 30.7467, timezone: '+8', pinyin: 'JX' },
  { city: '湖州', country: '中国', province: '浙江', lng: 120.0879, lat: 30.8697, timezone: '+8', pinyin: 'HZH' },
  { city: '绍兴', country: '中国', province: '浙江', lng: 120.5820, lat: 30.0381, timezone: '+8', pinyin: 'SX' },
  { city: '金华', country: '中国', province: '浙江', lng: 119.6477, lat: 29.0791, timezone: '+8', pinyin: 'JH' },
  { city: '衢州', country: '中国', province: '浙江', lng: 118.8620, lat: 28.9770, timezone: '+8', pinyin: 'QZ' },
  { city: '舟山', country: '中国', province: '浙江', lng: 122.2072, lat: 29.9857, timezone: '+8', pinyin: 'ZZ' },
  { city: '台州', country: '中国', province: '浙江', lng: 121.4200, lat: 28.6561, timezone: '+8', pinyin: 'TZ' },
  { city: '合肥', country: '中国', province: '安徽', lng: 117.2272, lat: 31.8206, timezone: '+8', pinyin: 'HF' },
  { city: '芜湖', country: '中国', province: '安徽', lng: 118.3755, lat: 31.3305, timezone: '+8', pinyin: 'WH' },
  { city: '蚌埠', country: '中国', province: '安徽', lng: 117.3582, lat: 32.9371, timezone: '+8', pinyin: 'BB' },
  { city: '阜阳', country: '中国', province: '安徽', lng: 115.8110, lat: 32.8379, timezone: '+8', pinyin: 'FY' },
  { city: '黄山', country: '中国', province: '安徽', lng: 118.3400, lat: 29.7130, timezone: '+8', pinyin: 'HS' },
  { city: '福州', country: '中国', province: '福建', lng: 119.2965, lat: 26.0745, timezone: '+8', pinyin: 'FZ' },
  { city: '厦门', country: '中国', province: '福建', lng: 118.0894, lat: 24.4798, timezone: '+8', pinyin: 'XM' },
  { city: '泉州', country: '中国', province: '福建', lng: 118.6757, lat: 24.9080, timezone: '+8', pinyin: 'Quanzhou' },
  { city: '漳州', country: '中国', province: '福建', lng: 117.6322, lat: 24.5130, timezone: '+8', pinyin: 'ZZF' },
  { city: '莆田', country: '中国', province: '福建', lng: 119.0150, lat: 25.4470, timezone: '+8', pinyin: 'FT' },
  { city: '南昌', country: '中国', province: '江西', lng: 115.8579, lat: 28.6829, timezone: '+8', pinyin: 'NC' },
  { city: '赣州', country: '中国', province: '江西', lng: 114.9335, lat: 25.8291, timezone: '+8', pinyin: 'GZ' },
  { city: '九江', country: '中国', province: '江西', lng: 115.9770, lat: 29.7080, timezone: '+8', pinyin: 'JJ' },
  { city: '景德镇', country: '中国', province: '江西', lng: 117.2125, lat: 29.3076, timezone: '+8', pinyin: 'JDZ' },

  // ── 华中 ──
  { city: '武汉', country: '中国', province: '湖北', lng: 114.3054, lat: 30.5931, timezone: '+8', pinyin: 'WUH' },
  { city: '宜昌', country: '中国', province: '湖北', lng: 111.2935, lat: 30.7012, timezone: '+8', pinyin: 'YIC' },
  { city: '襄阳', country: '中国', province: '湖北', lng: 112.1219, lat: 32.0071, timezone: '+8', pinyin: 'XY' },
  { city: '荆州', country: '中国', province: '湖北', lng: 112.2369, lat: 30.3240, timezone: '+8', pinyin: 'JZ' },
  { city: '黄石', country: '中国', province: '湖北', lng: 115.2250, lat: 30.2138, timezone: '+8', pinyin: 'HYS' },
  { city: '长沙', country: '中国', province: '湖南', lng: 112.9835, lat: 28.1941, timezone: '+8', pinyin: 'CS' },
  { city: '衡阳', country: '中国', province: '湖南', lng: 112.5970, lat: 26.8939, timezone: '+8', pinyin: 'HY' },
  { city: '岳阳', country: '中国', province: '湖南', lng: 113.1107, lat: 29.3697, timezone: '+8', pinyin: 'YUE' },
  { city: '常德', country: '中国', province: '湖南', lng: 111.6897, lat: 29.0336, timezone: '+8', pinyin: 'CDH' },
  { city: '张家界', country: '中国', province: '湖南', lng: 110.4639, lat: 29.1220, timezone: '+8', pinyin: 'ZJJ' },
  { city: '郑州', country: '中国', province: '河南', lng: 113.6253, lat: 34.7466, timezone: '+8', pinyin: 'ZZ' },
  { city: '洛阳', country: '中国', province: '河南', lng: 112.4366, lat: 34.6631, timezone: '+8', pinyin: 'LY' },
  { city: '开封', country: '中国', province: '河南', lng: 114.3495, lat: 34.7971, timezone: '+8', pinyin: 'KF' },
  { city: '南阳', country: '中国', province: '河南', lng: 112.5336, lat: 32.9990, timezone: '+8', pinyin: 'NY' },
  { city: '安阳', country: '中国', province: '河南', lng: 114.3610, lat: 36.1019, timezone: '+8', pinyin: 'AY' },

  // ── 华南 ──
  { city: '广州', country: '中国', province: '广东', lng: 113.2644, lat: 23.1291, timezone: '+8', pinyin: 'GZ' },
  { city: '深圳', country: '中国', province: '广东', lng: 114.0579, lat: 22.5431, timezone: '+8', pinyin: 'SZ' },
  { city: '珠海', country: '中国', province: '广东', lng: 113.5632, lat: 22.2710, timezone: '+8', pinyin: 'ZHU' },
  { city: '东莞', country: '中国', province: '广东', lng: 113.7518, lat: 23.0205, timezone: '+8', pinyin: 'DG' },
  { city: '佛山', country: '中国', province: '广东', lng: 113.1219, lat: 23.0218, timezone: '+8', pinyin: 'FS' },
  { city: '汕头', country: '中国', province: '广东', lng: 116.6814, lat: 23.3540, timezone: '+8', pinyin: 'ST' },
  { city: '湛江', country: '中国', province: '广东', lng: 110.3582, lat: 21.2701, timezone: '+8', pinyin: 'ZJ' },
  { city: '茂名', country: '中国', province: '广东', lng: 110.9254, lat: 21.6631, timezone: '+8', pinyin: 'MM' },
  { city: '惠州', country: '中国', province: '广东', lng: 114.4165, lat: 23.0774, timezone: '+8', pinyin: 'HZGD' },
  { city: '梅州', country: '中国', province: '广东', lng: 116.1179, lat: 24.2883, timezone: '+8', pinyin: 'MZ' },
  { city: '韶关', country: '中国', province: '广东', lng: 113.5904, lat: 24.8105, timezone: '+8', pinyin: 'SG' },
  { city: '南宁', country: '中国', province: '广西', lng: 108.3665, lat: 22.8170, timezone: '+8', pinyin: 'NN' },
  { city: '柳州', country: '中国', province: '广西', lng: 109.4117, lat: 24.2784, timezone: '+8', pinyin: 'Liuzhou' },
  { city: '桂林', country: '中国', province: '广西', lng: 110.2876, lat: 25.2736, timezone: '+8', pinyin: 'GL' },
  { city: '北海', country: '中国', province: '广西', lng: 109.1183, lat: 21.4826, timezone: '+8', pinyin: 'BH' },
  { city: '海口', country: '中国', province: '海南', lng: 110.3492, lat: 20.0174, timezone: '+8', pinyin: 'HK' },
  { city: '三亚', country: '中国', province: '海南', lng: 109.5090, lat: 18.2478, timezone: '+8', pinyin: 'SY' },

  // ── 西南 ──
  { city: '成都', country: '中国', province: '四川', lng: 104.0665, lat: 30.5723, timezone: '+8', pinyin: 'CD' },
  { city: '绵阳', country: '中国', province: '四川', lng: 104.7310, lat: 31.4710, timezone: '+8', pinyin: 'MY' },
  { city: '德阳', country: '中国', province: '四川', lng: 104.3978, lat: 31.1250, timezone: '+8', pinyin: 'DY' },
  { city: '南充', country: '中国', province: '四川', lng: 106.1084, lat: 30.8219, timezone: '+8', pinyin: 'NCSC' },
  { city: '泸州', country: '中国', province: '四川', lng: 105.4430, lat: 28.8718, timezone: '+8', pinyin: 'LZ' },
  { city: '宜宾', country: '中国', province: '四川', lng: 104.5572, lat: 28.7536, timezone: '+8', pinyin: 'YB' },
  { city: '贵阳', country: '中国', province: '贵州', lng: 106.6302, lat: 26.6470, timezone: '+8', pinyin: 'GY' },
  { city: '遵义', country: '中国', province: '贵州', lng: 106.9370, lat: 27.7108, timezone: '+8', pinyin: 'ZY' },
  { city: '昆明', country: '中国', province: '云南', lng: 102.7103, lat: 25.0406, timezone: '+8', pinyin: 'KM' },
  { city: '大理', country: '中国', province: '云南', lng: 100.2300, lat: 25.6069, timezone: '+8', pinyin: 'DL' },
  { city: '丽江', country: '中国', province: '云南', lng: 100.2270, lat: 26.8720, timezone: '+8', pinyin: 'LJ' },
  { city: '西双版纳', country: '中国', province: '云南', lng: 100.7976, lat: 21.9870, timezone: '+8', pinyin: 'XSBN' },
  { city: '腾冲', country: '中国', province: '云南', lng: 98.4996, lat: 25.2860, timezone: '+8', pinyin: 'TC' },
  { city: '拉萨', country: '中国', province: '西藏', lng: 91.1409, lat: 29.6456, timezone: '+8', pinyin: 'LS' },
  { city: '重庆', country: '中国', province: '重庆', lng: 106.5516, lat: 29.5630, timezone: '+8', pinyin: 'CQ' },
  { city: '万州', country: '中国', province: '重庆', lng: 108.3900, lat: 30.8090, timezone: '+8', pinyin: 'WZCQ' },

  // ── 西北 ──
  { city: '西安', country: '中国', province: '陕西', lng: 108.9398, lat: 34.3416, timezone: '+8', pinyin: 'XA' },
  { city: '宝鸡', country: '中国', province: '陕西', lng: 107.1476, lat: 34.3565, timezone: '+8', pinyin: 'BJSC' },
  { city: '咸阳', country: '中国', province: '陕西', lng: 108.7060, lat: 34.3372, timezone: '+8', pinyin: 'XYSC' },
  { city: '延安', country: '中国', province: '陕西', lng: 109.4076, lat: 36.4215, timezone: '+8', pinyin: 'YY' },
  { city: '榆林', country: '中国', province: '陕西', lng: 109.7297, lat: 38.2840, timezone: '+8', pinyin: 'YL' },
  { city: '兰州', country: '中国', province: '甘肃', lng: 103.8236, lat: 36.0580, timezone: '+8', pinyin: 'LZGS' },
  { city: '天水', country: '中国', province: '甘肃', lng: 105.7280, lat: 34.5769, timezone: '+8', pinyin: 'TS' },
  { city: '西宁', country: '中国', province: '青海', lng: 101.7782, lat: 36.6171, timezone: '+8', pinyin: 'XN' },
  { city: '银川', country: '中国', province: '宁夏', lng: 106.2782, lat: 38.4872, timezone: '+8', pinyin: 'YCND' },
  { city: '石嘴山', country: '中国', province: '宁夏', lng: 106.2628, lat: 39.0260, timezone: '+8', pinyin: 'SZS' },
  { city: '乌鲁木齐', country: '中国', province: '新疆', lng: 87.6168, lat: 43.8256, timezone: '+8', pinyin: 'WMQ' },
  { city: '喀什', country: '中国', province: '新疆', lng: 75.9898, lat: 39.4677, timezone: '+6', pinyin: 'KS' },
  { city: '阿克苏', country: '中国', province: '新疆', lng: 80.2630, lat: 41.1689, timezone: '+6', pinyin: 'AKS' },
  { city: '库尔勒', country: '中国', province: '新疆', lng: 86.1475, lat: 41.7664, timezone: '+6', pinyin: 'KELR' },

  // ── 海外 ──
  { city: '旧金山', country: '美国', province: '加利福尼亚', lng: -122.4194, lat: 37.7749, timezone: '-8', pinyin: 'SF', alias: ['圣弗朗西斯科', '三藩市'] },
  { city: '洛杉矶', country: '美国', province: '加利福尼亚', lng: -118.2437, lat: 34.0522, timezone: '-8', pinyin: 'LA' },
  { city: '纽约', country: '美国', province: '纽约州', lng: -74.0060, lat: 40.7128, timezone: '-5', pinyin: 'NYC' },
  { city: '芝加哥', country: '美国', province: '伊利诺伊', lng: -87.6298, lat: 41.8781, timezone: '-6', pinyin: 'CHI' },
  { city: '休斯顿', country: '美国', province: '德克萨斯', lng: -95.3698, lat: 29.7604, timezone: '-6', pinyin: 'HOU' },
  { city: '华盛顿', country: '美国', province: '哥伦比亚特区', lng: -77.0369, lat: 38.9072, timezone: '-5', pinyin: 'DC' },
  { city: '西雅图', country: '美国', province: '华盛顿州', lng: -122.3321, lat: 47.6062, timezone: '-8', pinyin: 'SEA' },
  { city: '拉斯维加斯', country: '美国', province: '内华达', lng: -115.1398, lat: 36.1699, timezone: '-8', pinyin: 'LV' },
  { city: '多伦多', country: '加拿大', province: '安大略', lng: -79.3832, lat: 43.6532, timezone: '-5', pinyin: 'TOR' },
  { city: '温哥华', country: '加拿大', province: '不列颠哥伦比亚', lng: -123.1216, lat: 49.2827, timezone: '-8', pinyin: 'VAN' },
  { city: '蒙特利尔', country: '加拿大', province: '魁北克', lng: -73.5673, lat: 45.5017, timezone: '-5', pinyin: 'MTL' },
  { city: '悉尼', country: '澳大利亚', province: '新南威尔士', lng: 151.2093, lat: -33.8688, timezone: '+10', pinyin: 'SYDAU' },
  { city: '墨尔本', country: '澳大利亚', province: '维多利亚', lng: 144.9631, lat: -37.8136, timezone: '+10', pinyin: 'MEL' },
  { city: '伦敦', country: '英国', province: '英格兰', lng: -0.1276, lat: 51.5074, timezone: '+0', pinyin: 'LDN' },
  { city: '东京', country: '日本', province: '关东', lng: 139.6917, lat: 35.6895, timezone: '+9', pinyin: 'TKY' },
  { city: '大阪', country: '日本', province: '关西', lng: 135.5023, lat: 34.6937, timezone: '+9', pinyin: 'OSA' },
  { city: '首尔', country: '韩国', province: '首都圈', lng: 126.9780, lat: 37.5665, timezone: '+9', pinyin: 'SEL' },
  { city: '新加坡', country: '新加坡', province: '新加坡', lng: 103.8198, lat: 1.3521, timezone: '+8', pinyin: 'SIN' },
  { city: '吉隆坡', country: '马来西亚', province: '联邦直辖区', lng: 101.6869, lat: 3.1390, timezone: '+8', pinyin: 'KUL' },
  { city: '曼谷', country: '泰国', province: '中部', lng: 100.5018, lat: 13.7563, timezone: '+7', pinyin: 'BKK' },
  { city: '河内', country: '越南', province: '北部', lng: 105.8542, lat: 21.0278, timezone: '+7', pinyin: 'HAN' },
  { city: '胡志明', country: '越南', province: '南部', lng: 106.6297, lat: 10.8231, timezone: '+7', pinyin: 'SGN' },
  { city: '巴黎', country: '法国', province: '法兰西岛', lng: 2.3522, lat: 48.8566, timezone: '+1', pinyin: 'PAR' },
  { city: '迪拜', country: '阿联酋', province: '迪拜', lng: 55.2708, lat: 25.2048, timezone: '+4', pinyin: 'DXB' },
];

// ── 缓存 ────────
let _cityData: CityRecord[] | null = CITY_DATA;
// AI 查询结果缓存：query → coords
const _aiCache = new Map<string, CityCoords | null>();

function isChinese(ch: string): boolean {
  return /[一-鿿]/.test(ch);
}

/** 检测是否看起来像纯英文/拼音输入（可能为国外城市） */
function looksNonChinese(query: string): boolean {
  return /^[A-Za-z\s,.-]+$/.test(query.trim()) && !/[一-鿿]/.test(query);
}

// ═══════════════════════════════════════════════════════════════════
// 本地匹配（与之前逻辑一致）
// ═══════════════════════════════════════════════════════════════════
function matchLocal(data: CityRecord[], q: string): CityRecord | null {
  let found = data.find(c => c.city === q);
  if (!found) found = data.find(c => c.alias?.includes(q));
  if (!found) found = data.find(c => c.city.includes(q));
  if (!found) {
    found = data.find(c => {
      if (!c.city || c.city.length < 2) return false;
      if (!q.includes(c.city)) return false;
      const idx = q.indexOf(c.city);
      const before = idx > 0 ? q[idx - 1] : '';
      const after = idx + c.city.length < q.length ? q[idx + c.city.length] : '';
      if (isChinese(before) || isChinese(after)) return false;
      return true;
    });
  }
  if (!found) found = data.find(c => c.alias?.some(a => a.includes(q) || q.includes(a)));
  if (!found && /^[A-Za-z]+$/.test(q)) {
    const upper = q.toUpperCase();
    found = data.find(c => c.pinyin === upper);
    if (!found) found = data.find(c => c.pinyin?.startsWith(upper));
  }
  return found || null;
}

// ═══════════════════════════════════════════════════════════════════
// AI 坐标查询（通过后端 tRPC 接口）
// ═══════════════════════════════════════════════════════════════════

// 缓存后端 trpc client 引用（由 Home.tsx 注入）
let _trpcClient: { bazi: { lookupCity: { mutate: (input: { query: string }) => Promise<{ city: string; country: string; lng: number; lat: number; timezone: string; province: string } | null> } } } | null = null;

export function setCityLookupTrpc(client: typeof _trpcClient) {
  _trpcClient = client;
}

async function aiLookupCity(query: string): Promise<CityCoords | null> {
  // 检查缓存
  if (_aiCache.has(query)) return _aiCache.get(query)!;

  if (!_trpcClient) {
    console.warn('[cityData] tRPC client 未注入，无法使用 AI 查询城市');
    _aiCache.set(query, null);
    return null;
  }

  try {
    const result = await _trpcClient.bazi.lookupCity.mutate({ query });
    if (result) {
      const coords: CityCoords = {
        city: result.city,
        country: result.country,
        province: result.province,
        lng: result.lng,
        lat: result.lat,
        timezone: result.timezone,
      };
      _aiCache.set(query, coords);
      return coords;
    }
    _aiCache.set(query, null);
    return null;
  } catch (err) {
    console.error('[cityData] AI 城市查询失败:', err);
    _aiCache.set(query, null);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 公开 API
// ═══════════════════════════════════════════════════════════════════

function ensureLoaded(): CityRecord[] {
  return _cityData!;
}

/**
 * 查询城市坐标
 * 流程：本地匹配 → AI 匹配
 * 海外提示：纯英文输入且未匹配到，提示用户输入国家+城市
 */
export async function getCityCoords(cityName: string): Promise<CityCoords | null> {
  if (!cityName) return null;

  // 1. 本地匹配
  const local = matchLocal(ensureLoaded(), cityName);
  if (local) {
    return {
      city: local.city,
      province: local.province,
      country: local.country,
      lng: local.lng,
      lat: local.lat,
      timezone: local.timezone || '+8',
    };
  }

  // 2. AI 匹配
  const aiResult = await aiLookupCity(cityName);
  if (aiResult) return aiResult;

  // 3. 兜底：如果是纯英文/拼音，提示用户
  if (looksNonChinese(cityName)) {
    console.warn('[cityData] 看起来是非中国城市，请使用"国家+城市"格式输入，如"日本东京"');
  }

  return null;
}

export function getCityCoordsSync(cityName: string): CityCoords | null {
  if (!cityName) return null;
  const found = matchLocal(ensureLoaded(), cityName);
  if (!found) return null;
  return { city: found.city, province: found.province, country: found.country, lng: found.lng, lat: found.lat, timezone: found.timezone || '+8' };
}

export function preloadCityData(): void { /* no-op */ }

export function getCityDataStatus(): { loaded: boolean; failed: boolean; errorMessage: string | null } {
  return {
    loaded: _cityData !== null && _cityData.length > 0,
    failed: false,
    errorMessage: null,
  };
}

export function getAllCities(): CityRecord[] {
  return _cityData ?? [];
}

/** 检查查询是否看起来像海外输入 */
export function checkLooksOverseas(query: string): boolean {
  return looksNonChinese(query);
}

export function searchCities(query: string, limit = 8): CityRecord[] {
  if (!query || !_cityData) return [];

  const q = query.trim();
  if (!q) return [];

  const qUpper = q.toUpperCase();
  const isAllAlpha = /^[A-Za-z]+$/.test(q);

  type Scored = { record: CityRecord; score: number };
  const scored: Scored[] = [];

  for (const c of _cityData) {
    let score = 0;
    const py = (c.pinyin || '').toUpperCase();

    if (isAllAlpha) {
      if (py === qUpper) score = 10;
      else if (py.startsWith(qUpper)) score = 8;
      else if (c.alias?.some(a => a.toLowerCase().startsWith(q.toLowerCase()))) score = 6;
      else if (c.alias?.some(a => a.toLowerCase().includes(q.toLowerCase()))) score = 3;
    } else {
      if (c.city === q) score = 10;
      else if (c.alias?.includes(q)) score = 9;
      else if (c.city.startsWith(q)) score = 7;
      else if (c.city.includes(q)) score = 5;
      else if (c.alias?.some(a => a.includes(q))) score = 4;
      else if (c.province?.includes(q)) score = 2;
    }

    if (score > 0) scored.push({ record: c, score });
  }

  scored.sort((a, b) => b.score - a.score || a.record.city.length - b.record.city.length);
  return scored.slice(0, limit).map(s => s.record);
}
