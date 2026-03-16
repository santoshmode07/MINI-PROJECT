const getRoutePoints = async (fromCoords, toCoords) => {
  try {
    const url =
      `http://router.project-osrm.org/route/v1/driving/` +
      `${fromCoords[0]},${fromCoords[1]};` +
      `${toCoords[0]},${toCoords[1]}` +
      `?overview=full&geometries=geojson&alternatives=true`;

    console.log(`[OSRM Test] Calling: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.log(`[OSRM Test] ❌ FAILED: No routes found.`);
      return [];
    }
    
    console.log(`[OSRM Test] ✅ SUCCESS: Found ${data.routes.length} routes.`);
    console.log(`[OSRM Test] First route has ${data.routes[0].geometry.coordinates.length} points.`);
    return data.routes[0].geometry.coordinates;
  } catch (error) {
    console.error(`[OSRM Test] 💥 ERROR: ${error.message}`);
    return [];
  }
};

const runTest = async () => {
  const from = [80.6682624, 16.5052416]; // Vijayawada
  const to = [83.3215602, 17.760167];    // Visakhapatnam
  await getRoutePoints(from, to);
};

runTest();
