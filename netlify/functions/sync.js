// Netlify Serverless Function for cross-device live order and rider sync

let globalStore = {
  orders: [],
  riders: ['yowas', 'onesphore', 'paul', 'fred', 'uzziah', 'valens'],
  lastUpdated: Date.now(),
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    try {
      const payload = JSON.parse(event.body || '{}');
      if (Array.isArray(payload.orders)) {
        globalStore.orders = payload.orders;
      }
      if (Array.isArray(payload.riders)) {
        globalStore.riders = payload.riders;
      }
      globalStore.lastUpdated = Date.now();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: globalStore,
        }),
      };
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: err.message }),
      };
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: globalStore,
    }),
  };
};
