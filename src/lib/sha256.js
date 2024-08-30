/**
 * @param {string | undefined} message
 */
async function sha256(message) {
	const msgBuffer = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}

/**
 * @param {{ toString: () => any; }} value
 * @param {{ toString: () => any; }} randomness
 */
export async function generateCommitment(value, randomness) {
	const data = value.toString() + randomness.toString();
	return sha256(data);
}
