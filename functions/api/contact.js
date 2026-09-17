const JSON_HEADERS = { 'Content-Type': 'application/json; charset=UTF-8' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 1ファイルあたり5MBまで
const MAX_FILES = 3;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 添付合計15MBまで（Resend側の上限に対する安全マージン）

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ ok: false, error: 'メール送信の設定が完了していません。時間をおいて再度お試しいただくか、お電話にてお問い合わせください。' }, 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: '送信内容を読み取れませんでした。' }, 400);
  }

  // ハニーポット：ボットは隠しフィールドまで埋めてくることが多いため、埋まっていたら静かに拒否
  if (form.get('website')) {
    return json({ ok: true });
  }

  const name = (form.get('name') || '').toString().trim();
  const email = (form.get('email') || '').toString().trim();
  const category = (form.get('category') || '').toString().trim();
  const message = (form.get('message') || '').toString().trim();
  const allowPublish = form.get('allow_publish') === 'yes';

  if (!name || !email || !category || !message) {
    return json({ ok: false, error: '必須項目が入力されていません。' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'メールアドレスの形式が正しくありません。' }, 400);
  }

  const files = form.getAll('photos').filter((f) => f && typeof f === 'object' && f.size > 0);

  if (files.length > MAX_FILES) {
    return json({ ok: false, error: `写真は${MAX_FILES}枚までにしてください。` }, 400);
  }
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return json({ ok: false, error: '添付ファイルの合計サイズが大きすぎます（15MBまで）。' }, 400);
  }
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      return json({ ok: false, error: `「${f.name}」のサイズが大きすぎます（1枚5MBまで）。` }, 400);
    }
    if (!f.type || !f.type.startsWith('image/')) {
      return json({ ok: false, error: '画像ファイルのみ添付できます。' }, 400);
    }
  }

  let attachments = [];
  try {
    attachments = await Promise.all(
      files.map(async (f) => ({
        filename: f.name || 'photo.jpg',
        content: await fileToBase64(f),
      }))
    );
  } catch {
    return json({ ok: false, error: '写真の読み込みに失敗しました。' }, 500);
  }

  const publishText = allowPublish ? '許可する' : '許可しない';
  const subject = `【お問い合わせ】${category}（${name}様）`;

  const textBody = `【お名前】\n${name}\n【メールアドレス】\n${email}\n【ご希望のカテゴリー】\n${category}\n【過去の加工一覧への画像掲載】\n${publishText}\n【お問い合わせ内容】\n${message}\n`;

  const htmlBody = `
    <p><strong>お名前</strong><br>${escapeHtml(name)}</p>
    <p><strong>メールアドレス</strong><br>${escapeHtml(email)}</p>
    <p><strong>ご希望のカテゴリー</strong><br>${escapeHtml(category)}</p>
    <p><strong>過去の加工一覧への画像掲載</strong><br>${escapeHtml(publishText)}</p>
    <p><strong>お問い合わせ内容</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const fromAddress = env.RESEND_FROM_ADDRESS || 'やまなみ銘石サイト <onboarding@resend.dev>';
  const toAddress = env.CONTACT_TO_ADDRESS || 'info@ishiya-san.com';

  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: email,
        subject,
        text: textBody,
        html: htmlBody,
        attachments: attachments.length ? attachments : undefined,
      }),
    });
  } catch {
    return json({ ok: false, error: '送信中にエラーが発生しました。時間をおいて再度お試しください。' }, 502);
  }

  if (!resendResponse.ok) {
    return json({ ok: false, error: '送信に失敗しました。時間をおいて再度お試しいただくか、お電話にてお問い合わせください。' }, 502);
  }

  return json({ ok: true });
}
