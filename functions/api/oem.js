const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=UTF-8',
  'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function firstString(...values) {
  for (const value of values) {
    const candidate = Array.isArray(value)
      ? value.find((item) => typeof item === 'string' && item.trim())
      : value;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

function firstNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return null;
}

function dateOnly(...values) {
  const value = firstString(...values);
  const match = value.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : '';
}

function normalizeImage(image) {
  if (!image || typeof image.url !== 'string') return null;
  return { url: image.url, width: Number(image.width) || null, height: Number(image.height) || null };
}

function findImages(item) {
  const candidates = [item.images, item.image_list, item.photo_list, item.photos, item.gallery, item.image, item.photo];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map(normalizeImage).filter(Boolean);
    const image = normalizeImage(candidate);
    if (image) return [image];
  }
  return [];
}

function normalizeRecord(item) {
  const productType = firstString(item.product_type, item.productType, item.category, item.product) || '天然石製品';
  const customerType = firstString(item.customer_type, item.customerType, item.destination_type, item.customer_category) || '団体・法人様';
  const quantity = firstNumber(item.quantity, item.count, item.amount, item.number);
  const unit = firstString(item.unit, item.quantity_unit) || '個';
  const countText = quantity !== null ? `${quantity.toLocaleString('ja-JP')}${unit}` : '';

  return {
    id: String(item.id || ''),
    publicTitle: `${customerType}${productType}${countText ? ` ${countText}` : ''}`,
    productType,
    customerType,
    quantity,
    unit: quantity !== null ? unit : '',
    deliveredAt: dateOnly(item.delivered_at, item.deliveredAt, item.delivery_date, item.date),
    summary: firstString(item.summary, item.description, item.comment, item.body),
    images: findImages(item)
  };
}

export async function onRequestGet(context) {
  const { env, request, waitUntil } = context;
  const apiKey = env.MICROCMS_API_KEY || env.VITE_MICROCMS_API_KEY;
  if (!apiKey) return json({ message: 'microCMS連携の設定が完了していません。' }, 503);

  const requestUrl = new URL(request.url);
  const cache = caches.default;
  const cacheKey = new Request(requestUrl.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const endpoint = new URL('https://yamanami.microcms.io/api/v1/oem');
  endpoint.searchParams.set('limit', '100');
  endpoint.searchParams.set('orders', '-publishedAt');

  let upstream;
  try {
    upstream = await fetch(endpoint.toString(), { headers: { 'X-MICROCMS-API-KEY': apiKey } });
  } catch {
    return json({ message: '出荷実績の読み込みに失敗しました。' }, 502);
  }
  if (!upstream.ok) return json({ message: '出荷実績の読み込みに失敗しました。' }, 502);

  const data = await upstream.json();
  const records = Array.isArray(data.contents) ? data.contents.map(normalizeRecord).filter((record) => record.images.length) : [];
  const response = json({ contents: records, totalCount: records.length });
  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
