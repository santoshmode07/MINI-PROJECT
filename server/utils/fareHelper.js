// HAVERSINE FORMULA
// Calculates real distance between two GPS points
// Pure math — zero API cost — runs on your server
const haversineDistance = (point1, point2) => {
  if (!point1 || !point2 || point1.length < 2 || point2.length < 2) return 0;
  const R    = 6371;
  const dLat = (point2[1] - point1[1]) * Math.PI / 180;
  const dLon = (point2[0] - point1[0]) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1[1] * Math.PI / 180) *
    Math.cos(point2[1] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// PARTIAL FARE CALCULATION
// Passenger pays only for their portion of route
// Based on what % of total distance they travel
const calculatePartialFare = (
  fromCoords,    // ride start [lng, lat]
  toCoords,      // ride end [lng, lat]
  dropoffCoords, // passenger dropoff [lng, lat]
  fullPrice      // full ride price
) => {
  const totalDistance     = haversineDistance(fromCoords, toCoords);
  const passengerDistance = haversineDistance(fromCoords, dropoffCoords);
  
  if (totalDistance === 0) return fullPrice;
  
  const ratio = passengerDistance / totalDistance;

  // Round up to nearest rupee
  // Minimum fare is ₹10
  return Math.max(10, Math.ceil(fullPrice * ratio));
};

module.exports = { haversineDistance, calculatePartialFare };
