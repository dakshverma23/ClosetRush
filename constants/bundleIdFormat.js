const BUNDLE_ID_PREFIX = process.env.BUNDLE_ID_PREFIX || 'CR';

/**
 * Generates a Bundle ID.
 * Format: {PREFIX}-{13-digit timestamp}-{4-digit zero-padded sequence}
 * Example: CR-1718000000000-0001
 *
 * Change the BUNDLE_ID_PREFIX env var or the format string below to reconfigure.
 *
 * @param {number} sequenceNumber - A positive integer used to distinguish bundles built in the same batch
 * @returns {string} The generated Bundle ID
 */
const generateBundleId = (sequenceNumber) => {
  const ts = Date.now();
  const seq = String(sequenceNumber).padStart(4, '0');
  return `${BUNDLE_ID_PREFIX}-${ts}-${seq}`;
};

module.exports = { BUNDLE_ID_PREFIX, generateBundleId };
