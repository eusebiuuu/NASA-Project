// const BASE_URL = 'http://localhost:8000/v1' (use only locally)
const BASE_URL = 'v1';

async function httpGetPlanets() {
  const response = await fetch(`${BASE_URL}/planets`);
  const planets = await response.json();
  console.log("Good");
  return planets;
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${BASE_URL}/launches`);
  const launches = await response.json();
  launches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
  return launches;
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${BASE_URL}/launches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(launch),
    });
  } catch (error) {
    return {
      ok: false,
    }
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return fetch(`${BASE_URL}/launches/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    return {
      ok: false,
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};