const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WTM_COIN_IDS: Record<string, number> = {
  BTC: 1,
  LTC: 4,
  DOGE: 6,
  XMR: 101,
  ZEC: 166,
  ETC: 162,
  RVN: 234,
  ERGO: 340,
  CKB: 321,
  KAS: 352,
  DASH: 5,
  DCR: 152,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const coin = url.searchParams.get('coin');

    let wtmUrl: string;
    if (coin && WTM_COIN_IDS[coin.toUpperCase()]) {
      const id = WTM_COIN_IDS[coin.toUpperCase()];
      wtmUrl = `https://whattomine.com/coins/${id}.json?hr=1&p=0&fee=0&cost=0&cost_currency=USD`;
    } else {
      // Return all ASIC coins
      wtmUrl = 'https://whattomine.com/asic.json';
    }

    const res = await fetch(wtmUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `WhatToMine returned ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // cache 5 min
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
