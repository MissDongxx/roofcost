/**
 * Prompt templates for Zhipu GLM-4V Vision API
 * One prompt for each of the 12 photo types in the roofing inspection checklist
 */

/**
 * Get the vision analysis prompt for a specific photo type
 */
export function getZhipuVisionPrompt(photoType: string): string {
  const prompts: Record<string, string> = {
    // Roof surface photos
    north_slope: `分析这张屋顶北坡照片。请详细描述：
1. 屋面材质和状况（沥青瓦、金属瓦、陶瓦等）
2. 可见的损坏类型（缺失、开裂、老化、起泡、弯曲等）
3. 损坏的位置和大致范围
4. 严重程度评估（轻微/中等/严重）
5. 是否有积压、凹陷或结构问题

请用简洁的中文回答，3-5句话即可。`,

    south_slope: `分析这张屋顶南坡照片。南坡通常阳光照射更多，老化可能更快。请描述：
1. 屋面材质状况
2. 瓦片缺失、开裂或老化的情况
3. 有无光照损伤（褪色、变脆）
4. 排水情况
5. 其他可见问题

请用简洁的中文回答，3-5句话。`,

    east_slope: `分析这张屋顶东坡照片。请描述：
1. 屋面状况
2. 可见损坏
3. 严重程度

请用简洁的中文回答，3-5句话。`,

    west_slope: `分析这张屋顶西坡照片。西坡通常下午阳光强烈，热损伤可能明显。请描述：
1. 屋面状况
2. 热损伤迹象
3. 其他可见问题

请用简洁的中文回答，3-5句话。`,

    // Flashing photos
    flashing_chimney: `分析这张烟囱泛水照片。请重点关注：
1. 泛水金属是否完整、有无锈蚀或裂纹
2. 泛水与烟囱的接合处是否紧密
3. 泛水与屋面的连接是否完好
4. 密封胶/填缝剂状况
5. 有无渗水迹象（水渍、霉变）

请用简洁的中文回答，3-5句话。`,

    flashing_valley: `分析这张屋谷（天沟）泛水照片。屋谷是排水关键区域，请检查：
1. 泛水金属是否完整、有无锈蚀
2. 接缝是否紧密
3. 有无杂物堆积
4. 有无水损迹象
5. 泛水是否正确安装

请用简洁的中文回答，3-5句话。`,

    flashing_wall: `分析这张墙体/侧墙泛水照片。请关注：
1. 泛水与墙体的接合
2. 台阶泛水是否完整
3. 有无锈蚀或损坏
4. 密封状况
5. 渗水迹象

请用简洁的中文回答，3-5句话。`,

    flashing_skylight: `分析这天窗泛水照片。天窗是渗水高发区域，请检查：
1. 天窗周围泛水是否完整
2. 密封胶状况
3. 玻璃是否完好
4. 框架有无锈蚀
5. 有无渗水痕迹

请用简洁的中文回答，3-5句话。`,

    // Penetrations
    vent_pipes: `分析这张屋顶通风管照片。请检查：
1. 通风管根部泛水状况
2. 橡胶套是否老化、开裂
3. 管道本身是否完好
4. 与屋面连接处密封情况
5. 有无松动或缺失

请用简洁的中文回答，3-5句话。`,

    exhaust_fans: `分析这张排风扇/通风扇照片。请关注：
1. 扇叶是否完好
2. 外壳有无锈蚀或损坏
3. 与屋面连接处的泛水
4. 有无松动迹象
5. 排风口是否通畅

请用简洁的中文回答，3-5句话。`,

    // Trim and drainage
    fascia: `分析这张檐口板（fascia）照片。请描述：
1. 木板是否腐朽、变形或开裂
2. 油漆状况
3. 与屋面接合处是否完好
4. 有无水损迹象
5. 滴水檐（drip edge）状况

请用简洁的中文回答，3-5句话。`,

    soffit: `分析这张屋檐底板（soffit）照片。请检查：
1. 板材是否腐朽、变形或下垂
2. 通风口是否通畅
3. 有无虫害或鸟窝
4. 表面状况
5. 与墙体连接情况

请用简洁的中文回答，3-5句话。`,

    gutters: `分析这张排水沟（gutter）照片。排水系统很重要，请检查：
1. 沟体是否凹陷、变形或脱落
2. 有无杂物堵塞
3. 接头是否紧密
4. 下水口是否通畅
5. 有无锈蚀或渗水痕迹

请用简洁的中文回答，3-5句话。`,

    // Additional photo types
    ridge_cap: `分析这张屋脊盖顶照片。请关注：
1. 脊瓦是否完整、有无缺失
2. 盖顶是否开裂或松动
3. 脊通风（如果有）状况
4. 与屋面接合是否紧密
5. 密封状况

请用简洁的中文回答，3-5句话。`,

    detail_closeup: `分析这张屋顶特写照片。请详细描述：
1. 照片展示的具体部位
2. 可见的损坏或问题
3. 损坏的程度和范围
4. 可能的原因
5. 建议的修复方向

请用简洁的中文回答，3-5句话。`,
  };

  return prompts[photoType] || prompts.detail_closeup;
}

/**
 * System prompt for observation classification (GLM-4-Flash)
 */
export const CLASSIFICATION_SYSTEM_PROMPT = `你是一个屋顶损坏分类专家。请将AI Vision的描述转换为结构化的JSON格式。

有效的组件值（component）：
- shingle, shingles, roof_surface（屋面瓦片）
- flashing, chimney_flashing, valley_flashing, wall_flashing, step_flashing（泛水）
- vent_flashing, vent_pipe_flashing, pipe_boot（通风管泛水）
- fascia, fascia_board（檐口板）
- soffit（屋檐底板）
- gutter, downspout（排水沟）
- ridge_cap, ridge_vent（屋脊）
- skylight, roof_window（天窗）
- roof_deck, decking, sheathing（屋顶底板）

有效的损坏类型（damage）：
- missing, absent（缺失）
- cracked, broken, split（开裂/破碎）
- curled, cupped, warped（弯曲/变形）
- rusted, corroded（锈蚀）
- separated, loose, lifted（分离/松动）
- deteriorated, worn（老化/磨损）
- granule_loss, bare_spots（粒料流失）
- rotted, soft（腐朽）
- sagging（下垂）
- leaking, water_damage（渗水/水损）
- clogged, blocked（堵塞）

严重程度（severity）：
- low（轻微）
- moderate（中等）
- high（严重）
- critical（紧急）

只返回JSON，不要其他内容。输出格式：
{
  "component": "组件名称",
  "damage": "损坏类型",
  "severity": "严重程度",
  "location": "位置描述",
  "confidence": "high/medium/low"
}`;

/**
 * Prompt template for scope description generation (GLM-4-Plus)
 */
export function getScopeDescriptionPrompt(
  lineItem: string,
  observations: Array<{ damage: string; component: string; location?: string; severity?: string }>
): string {
  const observationText = observations
    .map((obs) => {
      const parts = [obs.damage, obs.component];
      if (obs.location) parts.push(`at ${obs.location}`);
      if (obs.severity) parts.push(`(${obs.severity} severity)`);
      return parts.join(' ');
    })
    .join('; ');

  return `Generate a professional roofing scope description based on the following:

Line Item: ${lineItem}

Observed Damage: ${observationText}

Requirements:
1. Use professional roofing terminology
2. Be concise (1-2 sentences)
3. Only describe what was observed, do not add assumptions
4. Write in English
5. Include location and severity if relevant

Example format:
"Replace damaged asphalt shingles on north slope with cracks and granule loss."

Please output only the description text, no additional explanation.`;
}
