const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function sendAuthRequest(endpoint, data) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('No se pudo comunicar con la API. Revisá que el back esté activo en el puerto 8080 y que el front se ejecute con Vite.');
  }

  const responseText = await response.text();
  let result = {};
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || 'No se pudo completar la solicitud. Revisá tus datos e intentá de nuevo.');
  }

  if (typeof result.token !== 'string' || !result.token) {
    throw new Error('El servidor respondió sin un token de sesión.');
  }

  return result.token;
}

export function login(credentials) {
  return sendAuthRequest('login', credentials);
}

export function register(userData) {
  return sendAuthRequest('register', userData);
}
