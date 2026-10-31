// Stable sharing codes, not authentication secrets. See INVITATION_LINKS.md.
export const invitationLinks = {
  '4f6a2ae57f7d': { side: 'groom', invite: 'wedding' },
  'e7713c25d1c8': { side: 'groom', invite: 'reception' },
  '4083fa314b9e': { side: 'groom', invite: 'both' },
  '41c745e64ec8': { side: 'bride', invite: 'wedding' },
  'c12fbfce202e': { side: 'bride', invite: 'reception' },
  'b03f8bce7920': { side: 'bride', invite: 'both' },
};

export function resolveInvitation(search) {
  const params = new URLSearchParams(search);
  const codes = params.getAll('i');
  if (codes.length) {
    // A supplied code owns the selection; malformed codes must not fall back.
    if (codes.length !== 1 || !Object.hasOwn(invitationLinks, codes[0])) return null;
    return invitationLinks[codes[0]];
  }
  // Preserve already-shared links, including their original defaults and casing.
  const side = params.get('side')?.toLowerCase() === 'bride' ? 'bride' : 'groom';
  const requestedInvite = params.get('invite')?.toLowerCase();
  const invite = requestedInvite === 'wedding' || requestedInvite === 'reception'
    ? requestedInvite : 'both';
  return { side, invite };
}
