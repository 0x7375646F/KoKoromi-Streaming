const crypto = require('crypto');

// Anime-themed avatar options for DiceBear
const animeOptions = {
    // Different anime styles available in DiceBear
    styles: ['adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles', 'croodles-neutral', 'identicon', 'initials', 'micah', 'miniavs', 'personas'],
    
    // Anime-like color schemes
    colors: ['b6e3f4', 'c0aede', 'ffd5dc', 'ffdfbf', 'ffb3ba', 'ffc3a0', 'ffd93d', '6bcf7f', '4d91ff', 'ff6b6b', 'a8e6cf', 'dcedc1', 'ffd3b6', 'ffaaa5'],
    
    // Accessories for more anime-like appearance
    accessories: ['round', 'small', 'square', 'wayfarers'],
    
    // Hair styles
    hairStyles: ['long', 'short', 'eyelash', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'longHairBigHair', 'longHairBob', 'longHairCurly', 'longHairCurvy', 'longHairDreads', 'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairNotTooLong', 'longHairShavedSides', 'longHairMiaWallace', 'longHairStraight', 'longHairStraight2', 'longHairStraightStrand', 'shortHairDreads01', 'shortHairDreads02', 'shortHairFrizzle', 'shortHairShaggyMullet', 'shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortRound', 'shortHairShortWaved', 'shortHairSides', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart']
};

/**
 * Generate a random anime-themed avatar URL using DiceBear API
 * @param {string} seed - Optional seed for consistent avatars (default: random)
 * @returns {string} DiceBear avatar URL
 */
function generateAnimeAvatar(seed = null) {
    // Generate random seed if not provided
    if (!seed) {
        seed = crypto.randomBytes(16).toString('hex');
    }
    
    // Randomly select anime-like options
    const style = animeOptions.styles[Math.floor(Math.random() * animeOptions.styles.length)];
    const backgroundColor = animeOptions.colors[Math.floor(Math.random() * animeOptions.colors.length)];
    
    // Build the DiceBear URL with anime-like parameters
    const baseUrl = 'https://api.dicebear.com/7.x';
    const url = `${baseUrl}/${style}/svg?seed=${seed}&backgroundColor=${backgroundColor}`;
    
    return url;
}

/**
 * Generate a unique avatar for a user based on their username
 * @param {string} username - Username to generate avatar for
 * @returns {string} Unique DiceBear avatar URL
 */
function generateUserAvatar(username) {
    // Use username as seed for consistent avatars per user
    const seed = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    return generateAnimeAvatar(seed);
}

/**
 * Generate a completely random avatar (different each time)
 * @returns {string} Random DiceBear avatar URL
 */
function generateRandomAvatar() {
    return generateAnimeAvatar();
}

module.exports = {
    generateAnimeAvatar,
    generateUserAvatar,
    generateRandomAvatar
}; 