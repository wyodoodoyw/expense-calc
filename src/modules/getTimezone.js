async function getTimezone(airportCode) {
  const baseUrl = `https://api.api-ninjas.com/v1/airports`;
  //?name=${airportCode}

  const url = new URL(baseUrl);
  const key = '82leBCJ5BgTlT5MkPlMYIjwbOEr4b20l3z2CqFdV';
  url.searchParams.set('iata', airportCode);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error, Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data[0].timezone);
    return data[0].timezone;
  } catch (e) {
    console.error(e);
  }
}

export default getTimezone;
