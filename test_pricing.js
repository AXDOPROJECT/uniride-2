// Manual test for the new pricing logic
function calculateUniridePrice(distanceKm) {
    if (distanceKm <= 5) return 1.50;
    const perKmRate = 0.10;
    const price = 1.50 + (distanceKm - 5) * perKmRate;
    return Number(price.toFixed(2));
}

const testCases = [
    { dist: 2, expected: 1.50 },
    { dist: 5, expected: 1.50 },
    { dist: 10, expected: 2.00 },
    { dist: 100, expected: 11.00 },
    { dist: 450, expected: 46.00 } // Paris to Lyon is ~450km
];

testCases.forEach(({ dist, expected }) => {
    const result = calculateUniridePrice(dist);
    console.log(`Distance: ${dist}km | Result: ${result}€ | Expected: ${expected}€ | ${result === expected ? 'PASS' : 'FAIL'}`);
});
